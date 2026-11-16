<?php
declare(strict_types=1);
require __DIR__ . '/_lib/bootstrap.php';
require __DIR__ . '/_lib/layout.php';

$c = config();
if (!$c) redirect(panel_base() . '/kurulum.php');
if (!empty($_SESSION['user']) && $_SESSION['user'] === $c['user']) redirect(panel_base() . '/');

/** Basit kaba kuvvet koruması: IP başına 15 dakikada 6 hatalı deneme. */
$attFile = data_dir() . '/giris-denemeleri.json';
$ip = $_SERVER['REMOTE_ADDR'] ?? '0';
$att = is_file($attFile) ? (json_decode((string) file_get_contents($attFile), true) ?: []) : [];
$now = time();
$att = array_filter($att, fn($a) => $now - ($a['t'] ?? 0) < 900);
$fails = count(array_filter($att, fn($a) => ($a['ip'] ?? '') === $ip));
$err = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    if ($fails >= 6) {
        $err = 'Çok fazla hatalı deneme. 15 dakika sonra tekrar deneyin.';
    } else {
        $u = trim((string) ($_POST['user'] ?? ''));
        $p = (string) ($_POST['pass'] ?? '');
        if (hash_equals($c['user'], $u) && password_verify($p, $c['pass'])) {
            session_regenerate_id(true);
            $_SESSION['user'] = $c['user'];
            $_SESSION['seen'] = time();
            $att = array_filter($att, fn($a) => ($a['ip'] ?? '') !== $ip);
            file_put_contents($attFile, json_encode(array_values($att)), LOCK_EX);
            redirect(panel_base() . '/');
        }
        $att[] = ['ip' => $ip, 't' => $now];
        file_put_contents($attFile, json_encode(array_values($att)), LOCK_EX);
        usleep(400000);
        $err = 'Kullanıcı adı veya şifre hatalı.';
    }
}

page_start('Giriş', '', null, true);
$f = flash();
?>
<div class="auth">
  <img class="auth-logo" src="<?= h(site_base()) ?>/brand/lt-lacivert.png" alt="La Turca Trade">
  <h1>Yönetim paneli</h1>
  <?php if ($f): ?><div class="flash <?= h($f['type']) ?>"><?= h($f['msg']) ?></div><?php endif; ?>
  <?php if ($err): ?><div class="flash err"><?= h($err) ?></div><?php endif; ?>
  <form method="post" class="form">
    <?= csrf_field() ?>
    <label>Kullanıcı adı<input name="user" required autofocus autocomplete="username"></label>
    <label>Şifre<input type="password" name="pass" required autocomplete="current-password"></label>
    <button class="btn primary" type="submit">Giriş yap</button>
  </form>
  <p class="muted small center"><a href="<?= h(site_base()) ?>/tr/">← Siteye dön</a></p>
</div>
<?php
page_end(null, true);
