<?php
/**
 * Yeni sürümü GitHub'dan otomatik çeker. Giriş gerektirmez; yalnızca resmî `yayin` dalındaki,
 * yüklü olandan yeni sürümleri kabul eder.
 *  - GitHub Actions derleme bitince çağırır:  /yonetim/otomatik.php?v=<sürüm>
 *  - Hostinger zamanlanmış görev (cron):     php /…/public_html/yonetim/otomatik.php
 */
declare(strict_types=1);
require __DIR__ . '/_lib/paths.php';
require __DIR__ . '/_lib/github.php';
require __DIR__ . '/_lib/deploy.php';
@ini_set('display_errors', '0');

$cli = PHP_SAPI === 'cli';
function cevap(array $d, int $code = 200): never
{
    global $cli;
    if ($cli) { echo date('c') . ' ' . json_encode($d, JSON_UNESCAPED_UNICODE) . "\n"; exit($code >= 400 ? 1 : 0); }
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Robots-Tag: noindex');
    echo json_encode($d, JSON_UNESCAPED_UNICODE);
    exit;
}

$c = config();
if (empty($c['auto_pull'])) cevap(['ok' => true, 'durum' => 'Otomatik güncelleme kapalı (panel → Sürümler).']);

// Sık çağrılara karşı sınır (web: 20 sn)
$stamp = data_dir() . '/otomatik.son';
if (!$cli && is_file($stamp) && time() - filemtime($stamp) < 20) cevap(['ok' => false, 'durum' => 'Çok sık istek, biraz sonra tekrar deneyin.'], 429);
@touch($stamp);

$v = $cli ? (string) ($argv[1] ?? '') : (string) ($_GET['v'] ?? '');
try {
    if ($v !== '' && !preg_match('/^[0-9a-f]{40}$/', $v)) cevap(['ok' => false, 'durum' => 'Geçersiz sürüm.'], 400);
    if ($v === '') {
        $v = reader($c)->branchSha('yayin');
        if (!$v) cevap(['ok' => false, 'durum' => 'GitHub\'da yayın sürümü bulunamadı.'], 502);
    }
    $r = deploy_version($c, $v, $cli ? 'zamanlanmış görev' : 'GitHub', true);
    if (isset($r['skipped'])) cevap(['ok' => true, 'durum' => $r['skipped']]);
    cevap(['ok' => true, 'durum' => 'Site güncellendi.', 'surum' => $r['surum']['kisa'] ?? '', 'dosya' => $r['files']]);
} catch (Throwable $e) {
    cevap(['ok' => false, 'durum' => $e->getMessage()], $e->getCode() === 409 ? 409 : 500);
}
