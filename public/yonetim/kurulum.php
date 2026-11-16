<?php
/** İlk kurulum: yönetici hesabı + GitHub bağlantısı. Ayar dosyası varsa çalışmaz. */
declare(strict_types=1);
require __DIR__ . '/_lib/bootstrap.php';
require __DIR__ . '/_lib/layout.php';

if (config()) redirect(panel_base() . '/giris.php');

$err = [];
$v = [
    'user' => trim((string) ($_POST['user'] ?? 'admin')),
    'repo' => trim((string) ($_POST['repo'] ?? 'mehmetcivici/la-turca-trade-web')),
    'branch' => trim((string) ($_POST['branch'] ?? 'main')),
    'notify' => trim((string) ($_POST['notify'] ?? 'info@laturcatrade.com')),
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $pass = (string) ($_POST['pass'] ?? '');
    $token = trim((string) ($_POST['token'] ?? ''));
    if (!preg_match('/^[\p{L}0-9_.@-]{3,40}$/u', $v['user'])) $err[] = 'Kullanıcı adı 3–40 karakter olmalı (harf, rakam, . _ - @).';
    if (mb_strlen($pass) < 10) $err[] = 'Şifre en az 10 karakter olmalı.';
    if ($pass !== (string) ($_POST['pass2'] ?? '')) $err[] = 'Şifreler aynı değil.';
    if (!preg_match('#^[\w.-]+/[\w.-]+$#', $v['repo'])) $err[] = 'Depo "kullanıcı/depo" biçiminde olmalı.';
    if ($v['notify'] !== '' && !filter_var($v['notify'], FILTER_VALIDATE_EMAIL)) $err[] = 'Bildirim e-postası geçersiz.';
    if ($token === '') $err[] = 'GitHub erişim anahtarı gerekli.';
    if (!$err) {
        try {
            $info = (new GitHub($token, $v['repo'], $v['branch']))->repoInfo();
            // Güvenlik: yalnızca depoya yazma yetkisi olan anahtar paneli kurabilir.
            if (empty($info['permissions']['push'])) $err[] = 'Bu anahtarın depoya yazma (Contents: Read and write) yetkisi yok.';
        } catch (Throwable $e) {
            $err[] = 'GitHub bağlantısı kurulamadı: ' . $e->getMessage();
        }
    }
    if (!$err) {
        save_config([
            'user' => $v['user'],
            'pass' => password_hash($pass, PASSWORD_DEFAULT),
            'token' => $token,
            'repo' => $v['repo'],
            'branch' => $v['branch'],
            'notify' => $v['notify'],
            'auto_update' => true,
            'created' => date('c'),
        ]);
        flash('Kurulum tamamlandı. Şimdi giriş yapabilirsiniz.');
        redirect(panel_base() . '/giris.php');
    }
}

page_start('Kurulum', '', null, true);
?>
<div class="auth wide">
  <img class="auth-logo" src="<?= h(site_base()) ?>/brand/lt-lacivert.png" alt="La Turca Trade">
  <h1>Yönetim paneli kurulumu</h1>
  <p class="muted">Bu sayfa yalnızca bir kez açılır. Yönetici hesabını oluşturun ve paneli GitHub deposuna bağlayın.</p>
  <?php foreach ($err as $e): ?><div class="flash err"><?= h($e) ?></div><?php endforeach; ?>
  <form method="post" class="form">
    <?= csrf_field() ?>
    <fieldset>
      <legend>Yönetici hesabı</legend>
      <label>Kullanıcı adı<input name="user" value="<?= h($v['user']) ?>" required autocomplete="username"></label>
      <div class="row2">
        <label>Şifre (en az 10 karakter)<input type="password" name="pass" required minlength="10" autocomplete="new-password"></label>
        <label>Şifre tekrar<input type="password" name="pass2" required minlength="10" autocomplete="new-password"></label>
      </div>
      <label>Talep bildirimlerinin gideceği e-posta<input type="email" name="notify" value="<?= h($v['notify']) ?>"></label>
    </fieldset>
    <fieldset>
      <legend>GitHub bağlantısı</legend>
      <p class="muted small">Panel değişiklikleri GitHub'daki site deposuna kaydeder; site oradan otomatik derlenir.
        <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">Yeni ince ayarlı (fine-grained) anahtar oluşturun</a>:
        Repository access → yalnızca bu depo; Permissions → <b>Contents: Read and write</b>, <b>Actions: Read-only</b>.</p>
      <label>Erişim anahtarı (token)<input type="password" name="token" required autocomplete="off" placeholder="github_pat_…"></label>
      <div class="row2">
        <label>Depo<input name="repo" value="<?= h($v['repo']) ?>" required></label>
        <label>Dal<input name="branch" value="<?= h($v['branch']) ?>" required></label>
      </div>
    </fieldset>
    <fieldset>
      <legend>Sunucu kontrolü</legend>
      <ul class="checks">
        <?php foreach (env_checks() as $k => $ok): ?><li class="<?= $ok ? 'ok' : 'no' ?>"><?= $ok ? '✓' : '✗' ?> <?= h($k) ?></li><?php endforeach; ?>
      </ul>
    </fieldset>
    <button class="btn primary" type="submit">Kurulumu tamamla</button>
  </form>
</div>
<?php
page_end(null, true);
