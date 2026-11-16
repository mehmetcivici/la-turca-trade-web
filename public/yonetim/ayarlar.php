<?php
declare(strict_types=1);
require __DIR__ . '/_lib/bootstrap.php';
require __DIR__ . '/_lib/layout.php';
$c = require_login();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $islem = $_POST['islem'] ?? '';
    if ($islem === 'sifre') {
        $old = (string) ($_POST['old'] ?? '');
        $new = (string) ($_POST['new'] ?? '');
        if (!password_verify($old, $c['pass'])) flash('Mevcut şifre hatalı.', 'err');
        elseif (mb_strlen($new) < 10) flash('Yeni şifre en az 10 karakter olmalı.', 'err');
        elseif ($new !== ($_POST['new2'] ?? '')) flash('Yeni şifreler aynı değil.', 'err');
        else { $c['pass'] = password_hash($new, PASSWORD_DEFAULT); save_config($c); flash('Şifre değiştirildi.'); }
    } elseif ($islem === 'genel') {
        $notify = trim((string) ($_POST['notify'] ?? ''));
        if ($notify !== '' && !filter_var($notify, FILTER_VALIDATE_EMAIL)) flash('E-posta geçersiz.', 'err');
        else { $c['notify'] = $notify; $c['auto_update'] = !empty($_POST['auto_update']); save_config($c); flash('Ayarlar kaydedildi.'); }
    } elseif ($islem === 'token') {
        $token = trim((string) ($_POST['token'] ?? ''));
        try {
            $info = (new GitHub($token, $c['repo'], $c['branch']))->repoInfo();
            if (empty($info['permissions']['push'])) throw new RuntimeException('Anahtarın yazma yetkisi yok.');
            $c['token'] = $token; save_config($c); flash('GitHub anahtarı güncellendi.');
        } catch (Throwable $e) { flash('Anahtar doğrulanamadı: ' . $e->getMessage(), 'err'); }
    }
    redirect('ayarlar.php');
}

page_start('Ayarlar', 'ayarlar', $c);
?>
<section class="cols">
  <form class="card form" method="post">
    <?= csrf_field() ?><input type="hidden" name="islem" value="genel">
    <h2>Genel</h2>
    <label>Talep bildirimlerinin gideceği e-posta<input type="email" name="notify" value="<?= h($c['notify'] ?? '') ?>"></label>
    <label class="check"><input type="checkbox" name="auto_update" value="1" <?= ($c['auto_update'] ?? true) ? 'checked' : '' ?>> Derleme bitince siteyi otomatik güncelle (panel açıkken)</label>
    <button class="btn primary">Kaydet</button>
  </form>
  <form class="card form" method="post">
    <?= csrf_field() ?><input type="hidden" name="islem" value="sifre">
    <h2>Şifre değiştir</h2>
    <label>Mevcut şifre<input type="password" name="old" required autocomplete="current-password"></label>
    <label>Yeni şifre<input type="password" name="new" required minlength="10" autocomplete="new-password"></label>
    <label>Yeni şifre tekrar<input type="password" name="new2" required minlength="10" autocomplete="new-password"></label>
    <button class="btn primary">Şifreyi değiştir</button>
  </form>
</section>
<section class="cols">
  <form class="card form" method="post">
    <?= csrf_field() ?><input type="hidden" name="islem" value="token">
    <h2>GitHub bağlantısı</h2>
    <p class="muted small">Depo: <b><?= h($c['repo']) ?></b> · Dal: <b><?= h($c['branch']) ?></b>. Anahtarın süresi dolarsa yenisini buraya girin.</p>
    <label>Yeni erişim anahtarı<input type="password" name="token" required autocomplete="off" placeholder="github_pat_…"></label>
    <button class="btn">Anahtarı güncelle</button>
  </form>
  <div class="card">
    <h2>Sunucu</h2>
    <ul class="checks"><?php foreach (env_checks() as $k => $ok): ?><li class="<?= $ok ? 'ok' : 'no' ?>"><?= $ok ? '✓' : '✗' ?> <?= h($k) ?></li><?php endforeach; ?></ul>
    <p class="muted small">PHP <?= h(PHP_VERSION) ?> · Yükleme sınırı <?= h(ini_get('upload_max_filesize')) ?> · Veri klasörü: <code><?= h(data_dir()) ?></code></p>
  </div>
</section>
<?php
page_end($c);
