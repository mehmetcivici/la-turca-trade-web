<?php
/** Sürüm yükleme: GitHub'daki `yayin` dalından bir sürümü indirip public_html'e açar. */
declare(strict_types=1);
if (realpath((string) ($_SERVER['SCRIPT_FILENAME'] ?? '')) === __FILE__) { http_response_code(404); exit; }
require_once __DIR__ . '/paths.php';
require_once __DIR__ . '/github.php';

/** Sitede yüklü sürüm bilgisi. */
function deployed(): array
{
    $f = data_dir() . '/yayin.json';
    return is_file($f) ? (json_decode((string) file_get_contents($f), true) ?: []) : [];
}

/** Son yüklemeler (en yeni önce). */
function deploy_history(int $n = 12): array
{
    $f = data_dir() . '/yayin-gecmisi.jsonl';
    if (!is_file($f)) return [];
    $lines = array_slice(file($f, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [], -$n);
    return array_reverse(array_values(array_filter(array_map(fn($l) => json_decode($l, true), $lines))));
}

function reader(array $c): GitHub
{
    return new GitHub((string) ($c['token'] ?? ''), $c['repo'], $c['branch'] ?? 'main');
}

/**
 * Bir yayın sürümünü indirir ve siteye açar.
 * @param bool $auto  Otomatik çekme: sabitlenmiş sürümü ve daha eski sürümleri atlar.
 * @param bool $pin   Elle eski sürüme dönüş: otomatik güncellemeyi duraklatır.
 */
function deploy_version(array $c, string $sha, string $kaynak, bool $auto, bool $pin = false): array
{
    if (!preg_match('/^[0-9a-f]{40}$/', $sha)) throw new RuntimeException('Geçersiz sürüm kimliği.');
    if (!class_exists('ZipArchive')) throw new RuntimeException('Sunucuda ZipArchive yok.');
    @set_time_limit(600);
    @ini_set('memory_limit', '512M');

    $lock = fopen(data_dir() . '/yayin.lock', 'c');
    if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) throw new RuntimeException('Başka bir güncelleme sürüyor, biraz sonra tekrar deneyin.', 409);
    $tmp = tempnam(sys_get_temp_dir(), 'ltt');
    try {
        $cur = deployed();
        if ($auto && !empty($cur['pinned'])) return ['skipped' => 'Sabitlenmiş sürüm var; otomatik güncelleme duraklatıldı.'];
        if (($cur['sha'] ?? '') === $sha && !$pin) return ['skipped' => 'Bu sürüm zaten yüklü.', 'sha' => $sha];

        reader($c)->downloadZip($sha, $tmp);
        $zip = new ZipArchive();
        if ($zip->open($tmp) !== true) throw new RuntimeException('Sürüm paketi açılamadı.');
        $first = (string) $zip->getNameIndex(0);
        $prefix = substr($first, 0, (int) strpos($first, '/') + 1);
        $surum = json_decode((string) $zip->getFromName($prefix . 'surum.json'), true);
        if (!is_array($surum) || ($surum['kanal'] ?? '') !== 'yayin' || $zip->locateName($prefix . 'index.html') === false) {
            throw new RuntimeException('Bu paket bir yayın sürümü değil.');
        }
        // Otomatik çekme siteyi asla daha eski bir sürüme döndürmez
        if ($auto && !empty($cur['surum']['tarih']) && strcmp((string) $surum['tarih'], (string) $cur['surum']['tarih']) < 0) {
            return ['skipped' => 'Gelen sürüm yüklü olandan eski.'];
        }

        $root = rtrim(SITE_ROOT, '/');
        $n = 0;
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = (string) $zip->getNameIndex($i);
            $rel = substr($name, strlen($prefix));
            if ($rel === '' || $rel === false || str_contains($rel, '..') || str_starts_with($rel, 'yonetim/_veri')) continue;
            $dest = $root . '/' . $rel;
            if (str_ends_with($name, '/')) { if (!is_dir($dest)) @mkdir($dest, 0755, true); continue; }
            if (!is_dir(dirname($dest))) @mkdir(dirname($dest), 0755, true);
            $data = $zip->getFromIndex($i);
            if ($data === false) continue;
            if (is_file($dest) && filesize($dest) === strlen($data) && md5_file($dest) === md5($data)) continue;
            $part = $dest . '.ltt-tmp';
            if (file_put_contents($part, $data) === false || !rename($part, $dest)) throw new RuntimeException('Yazılamadı: ' . $rel);
            $n++;
        }
        // PDF kataloglar GitHub Pages'ten sunuluyor ve pakette yok: sunucuda kalan eski PDF'leri kaldır
        // (özgün üretici kataloglarında üreticinin iletişim bilgileri var, yayında kalmamalı)
        if ($zip->locateName($prefix . 'catalogs/') === false) {
            foreach (glob($root . '/catalogs/*.pdf') ?: [] as $eski) { if (@unlink($eski)) $n++; }
        }
        $zip->close();
        if (function_exists('opcache_reset')) @opcache_reset();

        $info = ['sha' => $sha, 'at' => date('c'), 'files' => $n, 'surum' => $surum, 'pinned' => $pin, 'kaynak' => $kaynak];
        file_put_contents(data_dir() . '/yayin.json', json_encode($info, JSON_UNESCAPED_UNICODE), LOCK_EX);
        file_put_contents(data_dir() . '/yayin-gecmisi.jsonl', json_encode($info, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);
        return $info;
    } finally {
        @unlink($tmp);
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}
