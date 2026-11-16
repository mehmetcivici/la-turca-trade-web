<?php
/** Panelden sürüm yükleme. sha verilmezse en yeni sürüm yüklenir ve otomatik güncelleme yeniden açılır. */
declare(strict_types=1);
require __DIR__ . '/_lib/bootstrap.php';
$c = require_login();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['ok' => false, 'error' => 'POST gerekli'], 405);
check_csrf();

try {
    $g = gh($c, false);
    $latest = $g->branchSha('yayin');
    $sha = trim((string) ($_POST['sha'] ?? ''));
    if ($sha === '') $sha = (string) $latest;
    if ($sha === '') throw new RuntimeException('GitHub\'da yayın sürümü bulunamadı.');
    $pin = $sha !== $latest; // en yeni değilse: eski sürüme dönüş → otomatik güncellemeyi durdur
    $r = deploy_version($c, $sha, 'panel', false, $pin);
    if (!$pin && !empty(deployed()['pinned'])) {
        // Aynı sürüm zaten yüklüyse yalnızca sabitlemeyi kaldır
        $d = deployed(); $d['pinned'] = false;
        file_put_contents(data_dir() . '/yayin.json', json_encode($d, JSON_UNESCAPED_UNICODE), LOCK_EX);
    }
    unset($_SESSION['durum_cache']);
    json_out(['ok' => true, 'sha' => $sha, 'files' => $r['files'] ?? 0, 'pinned' => $pin, 'note' => $r['skipped'] ?? null]);
} catch (Throwable $e) {
    json_out(['ok' => false, 'error' => $e->getMessage()], $e->getCode() === 409 ? 409 : 500);
}
