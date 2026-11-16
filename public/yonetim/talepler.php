<?php
declare(strict_types=1);
require __DIR__ . '/_lib/bootstrap.php';
require __DIR__ . '/_lib/layout.php';
require __DIR__ . '/_lib/db.php';
$c = require_login();

// CSV dışa aktarma
if (isset($_GET['csv'])) {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="talepler-' . date('Y-m-d') . '.csv"');
    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF");
    fputcsv($out, ['No', 'Tarih', 'Durum', 'Firma', 'Ad soyad', 'E-posta', 'Telefon', 'Ülke', 'Firma türü', 'İlgi', 'Mesaj', 'Dil', 'Not'], ';');
    foreach (talepler('hepsi') as $t) {
        fputcsv($out, [$t['id'], tarih($t['created_at']), TALEP_DURUMLARI[$t['status']] ?? $t['status'], $t['company'], $t['name'], $t['email'], $t['phone'], $t['country'], $t['type'], $t['interest'], $t['message'], $t['lang'], $t['note']], ';');
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $id = (int) ($_POST['id'] ?? 0);
    if (($_POST['islem'] ?? '') === 'sil') {
        talep_sil($id);
        flash('Talep silindi.');
        redirect('talepler.php');
    }
    talep_guncelle($id, (string) ($_POST['status'] ?? 'okundu'), trim((string) ($_POST['note'] ?? '')));
    flash('Talep güncellendi.');
    redirect('talepler.php?id=' . $id);
}

$id = (int) ($_GET['id'] ?? 0);
if ($id) {
    $t = talep($id);
    if (!$t) { flash('Talep bulunamadı.', 'err'); redirect('talepler.php'); }
    if ($t['status'] === 'yeni') { talep_guncelle($id, 'okundu', (string) $t['note']); $t['status'] = 'okundu'; }
    $wa = preg_replace('/\D+/', '', (string) $t['phone']);
    $subject = rawurlencode('La Turca Trade — ' . ($t['company'] ?: $t['name']));
    page_start('Talep #' . $id, 'talepler', $c);
    ?>
    <p><a href="talepler.php">← Tüm talepler</a></p>
    <section class="cols">
      <div class="card">
        <div class="card-h"><h2><?= h($t['company'] ?: '—') ?></h2><time><?= h(tarih($t['created_at'])) ?></time></div>
        <dl class="dl">
          <dt>Ad soyad</dt><dd><?= h($t['name']) ?></dd>
          <dt>E-posta</dt><dd><a href="mailto:<?= h($t['email']) ?>?subject=<?= $subject ?>"><?= h($t['email']) ?></a></dd>
          <dt>Telefon</dt><dd><?= h($t['phone'] ?: '—') ?><?php if (strlen($wa) >= 8): ?> · <a href="https://wa.me/<?= h($wa) ?>" target="_blank" rel="noopener">WhatsApp</a><?php endif; ?></dd>
          <dt>Ülke</dt><dd><?= h($t['country']) ?></dd>
          <dt>Firma türü</dt><dd><?= h($t['type']) ?></dd>
          <dt>İlgilendiği</dt><dd><?= h($t['interest'] ?: '—') ?></dd>
          <dt>Site dili</dt><dd><?= h(strtoupper((string) $t['lang'])) ?> · <span class="muted"><?= h($t['page']) ?></span></dd>
        </dl>
        <h3 class="mt">Mesaj</h3>
        <div class="msg"><?= nl2br(h($t['message'] ?: '—')) ?></div>
        <p class="mt"><a class="btn primary" href="mailto:<?= h($t['email']) ?>?subject=<?= $subject ?>">E-postayla yanıtla</a></p>
      </div>
      <form class="card form" method="post">
        <?= csrf_field() ?>
        <input type="hidden" name="id" value="<?= $id ?>">
        <h2>Takip</h2>
        <label>Durum
          <select name="status"><?php foreach (TALEP_DURUMLARI as $k => $l): ?><option value="<?= $k ?>" <?= $t['status'] === $k ? 'selected' : '' ?>><?= h($l) ?></option><?php endforeach; ?></select>
        </label>
        <label>Notlarınız (yalnızca panelde görünür)<textarea name="note" rows="6"><?= h($t['note']) ?></textarea></label>
        <button class="btn primary" type="submit">Kaydet</button>
        <button class="btn danger" type="submit" name="islem" value="sil" onclick="return confirm('Bu talep kalıcı olarak silinsin mi?')">Sil</button>
      </form>
    </section>
    <?php
    page_end($c);
    exit;
}

$durum = (string) ($_GET['durum'] ?? '');
$ara = trim((string) ($_GET['ara'] ?? ''));
$say = talep_sayilari();
$list = talepler($durum, $ara);
page_start('Talepler', 'talepler', $c);
?>
<div class="toolbar">
  <nav class="tabs">
    <a href="talepler.php" class="<?= $durum === '' ? 'on' : '' ?>">Aktif</a>
    <?php foreach (TALEP_DURUMLARI as $k => $l): ?>
      <a href="?durum=<?= $k ?>" class="<?= $durum === $k ? 'on' : '' ?>"><?= h($l) ?> <em><?= (int) $say[$k] ?></em></a>
    <?php endforeach; ?>
  </nav>
  <form class="search"><input type="hidden" name="durum" value="<?= h($durum) ?>"><input name="ara" value="<?= h($ara) ?>" placeholder="Firma, kişi, ülke, mesaj…"><button class="btn">Ara</button></form>
  <a class="btn" href="?csv=1">Excel (CSV) indir</a>
</div>
<div class="card flush">
  <?php if (!$list): ?><p class="muted pad">Bu görünümde talep yok.</p><?php else: ?>
  <table class="table">
    <thead><tr><th>Tarih</th><th>Firma</th><th>Kişi</th><th>Ülke</th><th>İlgi</th><th>Durum</th></tr></thead>
    <tbody>
      <?php foreach ($list as $t): ?>
        <tr class="<?= $t['status'] === 'yeni' ? 'new' : '' ?>" onclick="location.href='talepler.php?id=<?= (int) $t['id'] ?>'">
          <td><?= h(tarih($t['created_at'])) ?></td>
          <td><a href="talepler.php?id=<?= (int) $t['id'] ?>"><b><?= h($t['company']) ?></b></a></td>
          <td><?= h($t['name']) ?></td>
          <td><?= h($t['country']) ?></td>
          <td><?= h($t['interest']) ?></td>
          <td><span class="tag <?= h($t['status']) ?>"><?= h(TALEP_DURUMLARI[$t['status']] ?? $t['status']) ?></span></td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
  <?php endif; ?>
</div>
<?php
page_end($c);
