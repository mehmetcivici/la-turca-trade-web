<?php
/** `yayin` dalındaki hazır derlemeyi indirip public_html'e açar. */
declare(strict_types=1);
require __DIR__ . '/_lib/bootstrap.php';
$c = require_login();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['ok' => false, 'error' => 'POST gerekli'], 405);
check_csrf();
@set_time_limit(600);
@ini_set('memory_limit', '512M');

$lock = fopen(data_dir() . '/yayin.lock', 'c');
if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) json_out(['ok' => false, 'error' => 'Güncelleme zaten sürüyor.'], 409);

try {
    if (!class_exists('ZipArchive')) throw new RuntimeException('Sunucuda ZipArchive yok.');
    $g = gh($c);
    $sha = $g->branchSha('yayin');
    if (!$sha) throw new RuntimeException('Henüz hazır bir yayın sürümü yok (yayin dalı bulunamadı).');
    $tmp = tempnam(sys_get_temp_dir(), 'ltt');
    $g->downloadZip('yayin', $tmp);
    $zip = new ZipArchive();
    if ($zip->open($tmp) !== true) throw new RuntimeException('Yayın paketi açılamadı.');
    $root = rtrim(SITE_ROOT, '/');
    $n = 0;
    for ($i = 0; $i < $zip->numFiles; $i++) {
        $name = $zip->getNameIndex($i);
        $rel = preg_replace('#^[^/]+/#', '', $name); // GitHub'ın eklediği üst klasörü at
        if ($rel === '' || str_contains($rel, '..') || str_starts_with($rel, 'yonetim/_veri')) continue;
        $dest = $root . '/' . $rel;
        if (str_ends_with($name, '/')) { if (!is_dir($dest)) @mkdir($dest, 0755, true); continue; }
        if (!is_dir(dirname($dest))) @mkdir(dirname($dest), 0755, true);
        $data = $zip->getFromIndex($i);
        if ($data === false) continue;
        // Değişmeyen dosyayı yeniden yazma
        if (is_file($dest) && filesize($dest) === strlen($data) && md5_file($dest) === md5($data)) continue;
        $part = $dest . '.ltt-tmp';
        if (file_put_contents($part, $data) === false || !rename($part, $dest)) throw new RuntimeException('Yazılamadı: ' . $rel);
        $n++;
    }
    $zip->close();
    @unlink($tmp);
    if (function_exists('opcache_reset')) @opcache_reset();
    file_put_contents(data_dir() . '/yayin.json', json_encode(['sha' => $sha, 'at' => date('c'), 'files' => $n]), LOCK_EX);
    unset($_SESSION['durum_cache']);
    json_out(['ok' => true, 'sha' => $sha, 'files' => $n]);
} catch (Throwable $e) {
    json_out(['ok' => false, 'error' => $e->getMessage()], 500);
} finally {
    if ($lock) { flock($lock, LOCK_UN); fclose($lock); }
}
