<?php
declare(strict_types=1);
require __DIR__ . '/_lib/bootstrap.php';
require __DIR__ . '/_lib/layout.php';
require __DIR__ . '/_lib/db.php';
$c = require_login();

$say = ['yeni' => 0, 'okundu' => 0, 'yanitlandi' => 0, 'arsiv' => 0, 'son30' => 0];
$son = [];
$dbErr = '';
try { $say = talep_sayilari(); $son = array_slice(talepler(), 0, 5); } catch (Throwable $e) { $dbErr = $e->getMessage(); }
$commits = [];
try { $commits = gh($c)->recentCommits(6); } catch (Throwable) {}
$dep = deployed();

page_start('Genel bakış', 'panel', $c);
?>
<section class="grid4">
  <a class="stat" href="talepler.php?durum=yeni"><b><?= (int) $say['yeni'] ?></b><span>Yeni talep</span></a>
  <a class="stat" href="talepler.php"><b><?= (int) $say['son30'] ?></b><span>Son 30 günde talep</span></a>
  <div class="stat"><b id="pubLabel">…</b><span>Site durumu</span></div>
  <div class="stat"><b><?= $dep ? h(tarih($dep['at'])) : '—' ?></b><span>Son güncelleme</span></div>
</section>

<section class="cols">
  <div class="card">
    <div class="card-h"><h2>Son talepler</h2><a href="talepler.php">Tümü →</a></div>
    <?php if ($dbErr): ?><p class="flash err">Talep veritabanı açılamadı: <?= h($dbErr) ?></p><?php endif; ?>
    <?php if (!$son): ?><p class="muted">Henüz talep yok. Sitedeki iletişim formundan gelenler burada listelenir.</p><?php endif; ?>
    <ul class="list">
      <?php foreach ($son as $t): ?>
        <li><a href="talepler.php?id=<?= (int) $t['id'] ?>">
          <span class="dot <?= h($t['status']) ?>"></span>
          <b><?= h($t['company'] ?: $t['name']) ?></b> <span class="muted">· <?= h($t['country']) ?></span>
          <time><?= h(tarih($t['created_at'])) ?></time>
        </a></li>
      <?php endforeach; ?>
    </ul>
  </div>
  <div class="card">
    <div class="card-h"><h2>Yayın</h2></div>
    <p class="muted small">Panelde kaydettiğiniz değişiklikler önce derlenir (1–3 dk), ardından siteye aktarılır.</p>
    <div id="pubBox" class="pub"><span class="pill">Kontrol ediliyor…</span></div>
    <button id="pubNow" class="btn" type="button" hidden>Siteyi şimdi güncelle</button>
    <h3 class="mt">Son değişiklikler</h3>
    <ul class="list compact">
      <?php foreach ($commits as $cm): ?>
        <li><span class="mono"><?= h($cm['sha']) ?></span> <?= h($cm['message']) ?> <time><?= h(tarih($cm['date'])) ?></time></li>
      <?php endforeach; ?>
    </ul>
  </div>
</section>

<section class="quick">
  <a class="card q" href="icerik.php?dosya=urunler"><b>Ürünler</b><span>Seri ekle, düzenle, fotoğraf yükle</span></a>
  <a class="card q" href="icerik.php?dosya=kataloglar"><b>Kataloglar</b><span>Yeni PDF yükle, kapak değiştir</span></a>
  <a class="card q" href="icerik.php?dosya=metin-tr"><b>Site metinleri</b><span>4 dilde tüm yazılar</span></a>
  <a class="card q" href="icerik.php?dosya=iletisim"><b>İletişim bilgileri</b><span>E-posta, telefon, WhatsApp</span></a>
</section>
<?php
page_end($c);
