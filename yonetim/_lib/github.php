<?php
/** GitHub REST API: içerik okuma, tek commit'te çok dosya yazma, derleme durumu, yayın paketi indirme. */
declare(strict_types=1);
if (realpath((string) ($_SERVER['SCRIPT_FILENAME'] ?? '')) === __FILE__) { http_response_code(404); exit; }

final class GitHub
{
    public function __construct(private string $token, private string $repo, private string $branch = 'main') {}

    /** @return array{0:int,1:mixed} */
    public function req(string $method, string $path, ?array $body = null, int $timeout = 60): array
    {
        $ch = curl_init('https://api.github.com' . $path);
        $headers = [
            'Accept: application/vnd.github+json',
            'X-GitHub-Api-Version: 2022-11-28',
            'User-Agent: LaTurcaTrade-Panel',
        ];
        // Anahtar yoksa herkese açık depo anonim okunur (saatte 60 istek sınırı)
        if ($this->token !== '') $headers[] = 'Authorization: Bearer ' . $this->token;
        if ($body !== null) $headers[] = 'Content-Type: application/json';
        curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => $timeout,
            CURLOPT_CONNECTTIMEOUT => 15,
        ]);
        if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body, JSON_UNESCAPED_SLASHES));
        $raw = curl_exec($ch);
        if ($raw === false) {
            $err = curl_error($ch);
            throw new RuntimeException('GitHub bağlantı hatası: ' . $err);
        }
        $code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        return [$code, json_decode((string) $raw, true)];
    }

    private function ok(array $r, string $what)
    {
        [$code, $data] = $r;
        if ($code >= 200 && $code < 300) return $data;
        $msg = is_array($data) && isset($data['message']) ? $data['message'] : 'HTTP ' . $code;
        throw new RuntimeException("GitHub ($what): $msg");
    }

    public function repoInfo(): array
    {
        return $this->ok($this->req('GET', "/repos/{$this->repo}"), 'depo');
    }

    /** @return array{content:string, sha:string} */
    public function getFile(string $path, ?string $ref = null): array
    {
        $ref = $ref ?? $this->branch;
        $d = $this->ok($this->req('GET', "/repos/{$this->repo}/contents/" . str_replace('%2F', '/', rawurlencode($path)) . '?ref=' . rawurlencode($ref)), $path);
        $content = isset($d['content']) && $d['content'] !== '' ? base64_decode($d['content']) : null;
        if ($content === null) {
            // 1 MB üstü dosyalar: blob API
            $b = $this->ok($this->req('GET', "/repos/{$this->repo}/git/blobs/{$d['sha']}"), 'blob');
            $content = base64_decode($b['content']);
        }
        return ['content' => $content, 'sha' => $d['sha']];
    }

    public function branchSha(string $branch): ?string
    {
        [$code, $d] = $this->req('GET', "/repos/{$this->repo}/git/ref/heads/" . rawurlencode($branch));
        return $code === 200 ? ($d['object']['sha'] ?? null) : null;
    }

    /**
     * Birden çok dosyayı tek commit olarak yazar.
     * @param array<string,string> $files depo yolu => dosya içeriği (ikili olabilir)
     */
    public function commit(array $files, string $message): string
    {
        $head = $this->ok($this->req('GET', "/repos/{$this->repo}/git/ref/heads/{$this->branch}"), 'dal');
        $parent = $head['object']['sha'];
        $commit = $this->ok($this->req('GET', "/repos/{$this->repo}/git/commits/$parent"), 'commit');
        $tree = [];
        foreach ($files as $path => $bytes) {
            $blob = $this->ok($this->req('POST', "/repos/{$this->repo}/git/blobs", ['content' => base64_encode($bytes), 'encoding' => 'base64'], 300), 'blob');
            $tree[] = ['path' => ltrim($path, '/'), 'mode' => '100644', 'type' => 'blob', 'sha' => $blob['sha']];
        }
        $newTree = $this->ok($this->req('POST', "/repos/{$this->repo}/git/trees", ['base_tree' => $commit['tree']['sha'], 'tree' => $tree]), 'ağaç');
        $new = $this->ok($this->req('POST', "/repos/{$this->repo}/git/commits", ['message' => $message, 'tree' => $newTree['sha'], 'parents' => [$parent]]), 'commit');
        $this->ok($this->req('PATCH', "/repos/{$this->repo}/git/refs/heads/{$this->branch}", ['sha' => $new['sha']]), 'dal güncelleme');
        return $new['sha'];
    }

    public function latestRun(): ?array
    {
        [$code, $d] = $this->req('GET', "/repos/{$this->repo}/actions/runs?branch=" . rawurlencode($this->branch) . '&per_page=1', null, 20);
        if ($code !== 200 || empty($d['workflow_runs'])) return null;
        $r = $d['workflow_runs'][0];
        return [
            'status' => $r['status'],
            'conclusion' => $r['conclusion'],
            'sha' => $r['head_sha'],
            'message' => strtok((string) ($r['head_commit']['message'] ?? ''), "\n"),
            'created_at' => $r['created_at'],
            'url' => $r['html_url'],
        ];
    }

    public function recentCommits(int $n = 6): array
    {
        [$code, $d] = $this->req('GET', "/repos/{$this->repo}/commits?sha=" . rawurlencode($this->branch) . "&per_page=$n", null, 20);
        if ($code !== 200 || !is_array($d)) return [];
        return array_map(fn($c) => [
            'sha' => substr($c['sha'], 0, 7),
            'message' => strtok((string) $c['commit']['message'], "\n"),
            'date' => $c['commit']['author']['date'] ?? '',
        ], $d);
    }

    /** Bir dalın / commit'in zip arşivini dosyaya indirir (anahtarsız: codeload, sınırsız). */
    public function downloadZip(string $ref, string $dest): void
    {
        $fp = fopen($dest, 'wb');
        if ($this->token !== '') {
            $url = "https://api.github.com/repos/{$this->repo}/zipball/" . rawurlencode($ref);
            $headers = ['Authorization: Bearer ' . $this->token, 'User-Agent: LaTurcaTrade-Panel', 'Accept: application/vnd.github+json'];
        } else {
            $url = "https://codeload.github.com/{$this->repo}/zip/" . rawurlencode($ref);
            $headers = ['User-Agent: LaTurcaTrade-Panel'];
        }
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_FILE => $fp,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 600,
            CURLOPT_CONNECTTIMEOUT => 20,
        ]);
        $ok = curl_exec($ch);
        $code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        fclose($fp);
        if (!$ok || $code !== 200) throw new RuntimeException('Sürüm paketi indirilemedi (HTTP ' . $code . ').');
    }

    /** Yayın dalındaki sürümler (en yeni önce). */
    public function versions(int $n = 20): array
    {
        [$code, $d] = $this->req('GET', "/repos/{$this->repo}/commits?sha=yayin&per_page=$n", null, 20);
        if ($code !== 200 || !is_array($d)) {
            $msg = is_array($d) && isset($d['message']) ? $d['message'] : 'HTTP ' . $code;
            throw new RuntimeException('Sürümler alınamadı: ' . $msg);
        }
        return array_map(fn($c) => [
            'sha' => $c['sha'],
            'message' => strtok((string) $c['commit']['message'], "\n"),
            'date' => $c['commit']['committer']['date'] ?? ($c['commit']['author']['date'] ?? ''),
        ], $d);
    }
}
