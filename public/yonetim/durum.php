<?php
/** Yayın durumu (JSON): son derleme, yayına hazır sürüm, sitede yüklü sürüm. Anahtarsız da çalışır. */
declare(strict_types=1);
require __DIR__ . '/_lib/bootstrap.php';
$c = require_login();

$cache = $_SESSION['durum_cache'] ?? null;
if ($cache && time() - $cache['t'] < 8 && empty($_GET['taze'])) json_out($cache['d']);

try {
    $g = gh($c, false);
    $run = $g->latestRun();
    $ready = $g->branchSha('yayin');
} catch (Throwable $e) {
    json_out(['ok' => false, 'state' => 'error', 'label' => 'GitHub\'a ulaşılamıyor', 'error' => $e->getMessage()]);
}
$dep = deployed();
$state = 'live';
$label = 'Site güncel';
if ($run && $run['status'] !== 'completed') {
    $state = 'building';
    $label = 'Değişiklikler derleniyor…';
} elseif ($run && $run['conclusion'] !== 'success' && $run['conclusion'] !== 'cancelled') {
    $state = 'failed';
    $label = 'Derleme hatası';
} elseif (!empty($dep['pinned'])) {
    $state = 'pinned';
    $label = 'Eski sürüm sabit';
} elseif ($ready && ($dep['sha'] ?? '') !== $ready) {
    $state = 'ready';
    $label = 'Yeni sürüm hazır';
}
$d = ['ok' => true, 'state' => $state, 'label' => $label, 'run' => $run, 'ready' => $ready, 'deployed' => $dep];
$_SESSION['durum_cache'] = ['t' => time(), 'd' => $d];
json_out($d);
