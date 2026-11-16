<?php
/** Sürümler: GitHub'daki yayın geçmişi, eski sürüme dönüş, otomatik güncelleme ayarı. */
declare(strict_types=1);
require __DIR__ . '/_lib/bootstrap.php';
require __DIR__ . '/_lib/layout.php';
$c = require_login();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $c['auto_pull'] = !empty($_POST['auto_pull']);
    save_config($c);
    flash($c['auto_pull'] ? 'Otomatik güncelleme açık.' : 'Otomatik güncelleme kapatıldı.');
    redirect('surumler.php');
}

$err = '';
$list = [];
try { $list = gh($c, false)->versions(25); } catch (Throwable $e) { $err = $e->getMessage(); }
$dep = deployed();
$hist = deploy_history(10);
$cron = 'php ' . SITE_ROOT . '/yonetim/otomatik.php';
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$hook = $scheme . '://' . ($_SERVER['HTTP_HOST'] ?? 'laturcatrade.com') . panel_base() . '/otomatik.php';

page_start('Sürümler', 'surumler', $c);
?>
<section class="cols">
  <div class="card">
    <h2>Otomatik güncelleme</h2>
    <p class="muted small">GitHub'da yeni bir sürüm derlendiğinde site onu kendiliğinden çeker: derleme biter bitmez GitHub sunucuya haber verir;
      ayrıca zamanlanmış görev kuruluysa birkaç dakikada bir kontrol edilir. Panel açık olması gerekmez.</p>
    <?php if (!empty($dep['pinned'])): ?>
      <div class="flash warnbox">Eski bir sürüm sabitlendi; otomatik güncelleme bu yüzden duraklatıldı.
        <button class="btn sm" type="button" data-deploy="">En yeni sürüme dön ve otomatiği aç</button></div>
    <?php endif; ?>
    <form method="post" class="form">
      <?= csrf_field() ?>
      <label class="check"><input type="checkbox" name="auto_pull" value="1" <?= !empty($c['auto_pull']) ? 'checked' : '' ?> onchange="this.form.submit()"> Yeni sürümleri GitHub'dan otomatik çek</label>
    </form>
    <h3 class="mt">Zamanlanmış görev (önerilir, bir kez)</h3>
    <p class="muted small">Hostinger hPanel → Gelişmiş → <b>Cron Jobs</b> → "Özel" → her 15 dakikada bir, komut:</p>
    <pre class="code"><?= h($cron) ?></pre>
    <p class="muted small">GitHub'ın haber verdiği adres: <code><?= h($hook) ?></code></p>
  </div>
  <div class="card">
    <h2>Sitede yüklü sürüm</h2>
    <?php if ($dep): ?>
      <dl class="dl">
        <dt>Sürüm</dt><dd><span class="mono"><?= h(substr((string) $dep['sha'], 0, 7)) ?></span> <?= !empty($dep['pinned']) ? '<span class="tag yeni">sabit</span>' : '' ?></dd>
        <dt>Değişiklik</dt><dd><?= h($dep['surum']['mesaj'] ?? '—') ?></dd>
        <dt>Yüklenme</dt><dd><?= h(tarih((string) $dep['at'])) ?> · <?= h((string) ($dep['kaynak'] ?? '')) ?></dd>
      </dl>
    <?php else: ?>
      <p class="muted">Henüz panelden sürüm yüklenmedi (site elle yüklenen paketle çalışıyor).</p>
    <?php endif; ?>
    <h3 class="mt">Son yüklemeler</h3>
    <ul class="list compact">
      <?php foreach ($hist as $hh): ?>
        <li><span class="mono"><?= h(substr((string) $hh['sha'], 0, 7)) ?></span> <?= h($hh['surum']['mesaj'] ?? '') ?> <time><?= h(tarih((string) $hh['at'])) ?> · <?= h((string) ($hh['kaynak'] ?? '')) ?></time></li>
      <?php endforeach; ?>
      <?php if (!$hist): ?><li class="muted">Kayıt yok.</li><?php endif; ?>
    </ul>
  </div>
</section>

<div class="card flush">
  <div class="card-h pad" style="margin:0"><h2>GitHub'daki sürümler</h2><span class="muted small">En yeni üstte</span></div>
  <?php if ($err): ?><p class="flash err" style="margin:0 22px 22px"><?= h($err) ?></p><?php endif; ?>
  <table class="table">
    <thead><tr><th>Sürüm</th><th>Değişiklik</th><th>Tarih</th><th></th></tr></thead>
    <tbody>
    <?php foreach ($list as $i => $v): $isCur = ($dep['sha'] ?? '') === $v['sha']; ?>
      <tr class="<?= $isCur ? 'new' : '' ?>" style="cursor:default">
        <td><span class="mono"><?= h(substr($v['sha'], 0, 7)) ?></span> <?= $i === 0 ? '<span class="tag yanitlandi">en yeni</span>' : '' ?></td>
        <td><?= h(preg_replace('/^Sürüm [0-9a-f]{7}: /u', '', $v['message'])) ?></td>
        <td><?= h(tarih($v['date'])) ?></td>
        <td style="text-align:right">
          <?php if ($isCur): ?><span class="tag">yüklü</span>
          <?php else: ?><button class="btn sm" type="button" data-deploy="<?= h($v['sha']) ?>"><?= $i === 0 ? 'Yükle' : 'Bu sürüme dön' ?></button><?php endif; ?>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</div>
<script>
document.querySelectorAll("[data-deploy]").forEach((b) => b.addEventListener("click", async () => {
  const sha = b.dataset.deploy;
  if (sha && !confirm("Site bu sürüme döndürülsün mü? Otomatik güncelleme, en yeni sürüme dönene kadar duraklatılır.")) return;
  document.querySelectorAll("[data-deploy]").forEach((x) => (x.disabled = true));
  b.textContent = "Yükleniyor…";
  const fd = new FormData(); fd.append("sha", sha); fd.append("csrf", LTT_PANEL.csrf);
  try {
    const r = await fetch("guncelle.php", { method: "POST", body: fd, headers: { Accept: "application/json", "X-CSRF": LTT_PANEL.csrf } });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error);
    location.reload();
  } catch (e) { alert("Yüklenemedi: " + e.message); location.reload(); }
}));
</script>
<?php
page_end($c);
