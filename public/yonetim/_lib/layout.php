<?php
/** Panel sayfa iskeleti. */
declare(strict_types=1);

function page_start(string $title, string $active = '', ?array $c = null, bool $bare = false): void
{
    $base = panel_base();
    $new = 0;
    if ($c) {
        try { require_once __DIR__ . '/db.php'; $new = talep_sayilari()['yeni'] ?? 0; } catch (Throwable) {}
    }
    $nav = [
        'panel' => ['index.php', 'Genel bakış', 'M3 12l9-8 9 8M5 10v10h14V10'],
        'talepler' => ['talepler.php', 'Talepler', 'M4 6h16v12H4zM4 7l8 6 8-6'],
        'urunler' => ['icerik.php?dosya=urunler', 'Ürünler', 'M3 7l9-4 9 4-9 4zM3 7v10l9 4 9-4V7M12 11v10'],
        'kataloglar' => ['icerik.php?dosya=kataloglar', 'Kataloglar', 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7'],
        'metinler' => ['icerik.php?dosya=metin-tr', 'Site metinleri', 'M4 6h16M4 12h10M4 18h16'],
        'iletisim' => ['icerik.php?dosya=iletisim', 'İletişim bilgileri', 'M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2'],
        'ayarlar' => ['ayarlar.php', 'Ayarlar', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1-2-4-2 1-2-2V4h-4v2L9 8 7 7 5 11l2 1v2l-2 1 2 4 2-1 2 2v2h4v-2l2-2 2 1 2-4-2-1z'],
    ];
    ?><!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title><?= h($title) ?> · La Turca Trade Panel</title>
<link rel="icon" href="<?= h(site_base()) ?>/icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="<?= h($base) ?>/assets/admin.css?v=1">
</head>
<body class="<?= $bare ? 'bare' : '' ?>">
<?php if (!$bare): ?>
<aside class="side">
  <a class="brand" href="<?= h($base) ?>/">
    <img src="<?= h(site_base()) ?>/brand/lt-acik.png" alt="">
    <span><b>LA TURCA</b><small>Yönetim paneli</small></span>
  </a>
  <nav>
    <?php foreach ($nav as $key => [$href, $label, $icon]): ?>
      <a href="<?= h($base . '/' . $href) ?>" class="<?= $active === $key ? 'on' : '' ?>">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="<?= $icon ?>"/></svg>
        <span><?= h($label) ?></span>
        <?php if ($key === 'talepler' && $new > 0): ?><em class="badge"><?= $new ?></em><?php endif; ?>
      </a>
    <?php endforeach; ?>
  </nav>
  <div class="side-foot">
    <a href="<?= h(site_base()) ?>/tr/" target="_blank" rel="noopener">Siteyi görüntüle ↗</a>
    <a href="<?= h($base) ?>/cikis.php">Çıkış yap</a>
  </div>
</aside>
<main class="main">
  <header class="top">
    <button class="menu-btn" type="button" onclick="document.body.classList.toggle('nav-open')" aria-label="Menü">☰</button>
    <h1><?= h($title) ?></h1>
    <div id="pubstate" class="pill" title="Sitenin yayın durumu">Yayın durumu…</div>
  </header>
  <?php $f = flash(); if ($f): ?><div class="flash <?= h($f['type']) ?>"><?= h($f['msg']) ?></div><?php endif; ?>
<?php else: ?>
<main class="bare-main">
<?php endif;
}

function page_end(?array $c = null, bool $bare = false): void
{
    $cfg = [
        'base' => panel_base(),
        'site' => site_base(),
        'csrf' => csrf_token(),
        'autoUpdate' => (bool) ($c['auto_update'] ?? true),
    ];
    ?>
</main>
<?php if (!$bare): ?>
<div id="toast" class="toast" hidden></div>
<script>window.LTT_PANEL = <?= json_encode($cfg, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>;</script>
<script src="<?= h(panel_base()) ?>/assets/admin.js?v=1"></script>
<?php endif; ?>
</body>
</html>
<?php
}
