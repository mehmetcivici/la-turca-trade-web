<?php
/** İçerik düzenleme: JSON dosyalarını GitHub'dan okur, kaydedince tek commit olarak yazar. */
declare(strict_types=1);
require __DIR__ . '/_lib/bootstrap.php';
require __DIR__ . '/_lib/layout.php';
require __DIR__ . '/_lib/schema.php';
$c = require_login();

$key = (string) ($_GET['dosya'] ?? 'metin-tr');
if (!isset(ICERIK_DOSYALARI[$key])) { flash('Bilinmeyen içerik.', 'err'); redirect('./'); }
$def = ICERIK_DOSYALARI[$key];
$g = gh($c);

function json_pretty(mixed $v): string
{
    $s = json_encode($v, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    // PHP 4 boşluk girinti kullanır; depodaki biçimle (2 boşluk) uyumlu yap
    $s = preg_replace_callback('/^( +)/m', fn($m) => str_repeat(' ', intdiv(strlen($m[1]), 2)), $s);
    return $s . "\n";
}

function pick(object $o, ?array $only): object
{
    if (!$only) return $o;
    $out = new stdClass();
    foreach ($only as $k) if (property_exists($o, $k)) $out->$k = $o->$k;
    return $out;
}

// ---- Kaydet (JSON) ----
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $in = json_decode((string) file_get_contents('php://input'));
    if (!is_object($in) || !isset($in->data) || !is_object($in->data)) json_out(['ok' => false, 'error' => 'Geçersiz veri.'], 400);
    try {
        $cur = $g->getFile($def['path']);
        if (($in->sha ?? '') !== $cur['sha']) {
            json_out(['ok' => false, 'error' => 'Bu dosya siz düzenlerken başka biri tarafından değiştirildi. Sayfayı yenileyip tekrar deneyin (değişiklikleriniz kaybolacak).'], 409);
        }
        $full = json_decode($cur['content']);
        if (!is_object($full)) throw new RuntimeException('Mevcut dosya okunamadı.');
        $only = $def['only'] ?? null;
        $keys = $only ?: array_keys(get_object_vars($full));
        foreach ($keys as $k) {
            if (!property_exists($in->data, $k)) throw new RuntimeException("Eksik bölüm: $k");
            $full->$k = $in->data->$k;
        }
        $msg = 'Panel: ' . $def['title'] . (isset($def['lang']) ? ' (' . strtoupper($def['lang']) . ')' : '') . ' güncellendi';
        $sha = $g->commit([$def['path'] => json_pretty($full)], $msg);
        unset($_SESSION['durum_cache']);
        $new = $g->getFile($def['path']);
        json_out(['ok' => true, 'sha' => $new['sha'], 'commit' => substr($sha, 0, 7)]);
    } catch (Throwable $e) {
        json_out(['ok' => false, 'error' => $e->getMessage()], 500);
    }
}

// ---- Sayfa ----
$err = '';
$data = null; $ref = null; $sha = '';
try {
    $f = $g->getFile($def['path']);
    $sha = $f['sha'];
    $data = pick(json_decode($f['content']), $def['only'] ?? null);
    if (!empty($def['ref'])) $ref = json_decode($g->getFile($def['ref'])['content']);
} catch (Throwable $e) {
    $err = $e->getMessage();
}

$isText = str_starts_with($key, 'metin-');
page_start($def['title'], $def['active'] ?? 'metinler', $c);
?>
<?php if ($isText): ?>
  <nav class="tabs lang">
    <?php foreach (['tr' => 'Türkçe', 'es' => 'İspanyolca', 'pt' => 'Portekizce', 'en' => 'İngilizce'] as $l => $n): ?>
      <a href="?dosya=metin-<?= $l ?>" class="<?= $key === 'metin-' . $l ? 'on' : '' ?>"><?= $n ?></a>
    <?php endforeach; ?>
  </nav>
  <p class="muted small">Her dilin metinleri ayrıdır. Altında gri olarak <b><?= h($def['refLang']) ?></b> karşılığı gösterilir. Bölümleri açmak için başlıklara tıklayın.</p>
<?php elseif ($key === 'urunler'): ?>
  <p class="muted small">Yeni seri eklemek için listenin altındaki <b>+ Ekle</b> düğmesini kullanın. Ürün adları ve açıklamaları dört dilde girilir; boş bırakılan dilde İspanyolca metin gösterilir.</p>
<?php elseif ($key === 'kataloglar'): ?>
  <p class="muted small">Yeni katalog için PDF'i yükleyin; kapak görseli ayrı yüklenir (katalogun ilk sayfasının ekran görüntüsü yeterli).</p>
<?php endif; ?>

<?php if ($err): ?>
  <div class="flash err">İçerik okunamadı: <?= h($err) ?></div>
<?php else: ?>
  <div id="editor" class="editor"></div>
  <div class="savebar">
    <span id="dirty" class="muted">Değişiklik yok</span>
    <button id="save" class="btn primary" type="button" disabled>Kaydet ve yayınla</button>
  </div>
  <script>
    window.LTT_EDITOR = <?= json_encode([
        'data' => $data,
        'ref' => $ref ? pick($ref, $def['only'] ?? null) : null,
        'refLang' => $def['refLang'] ?? null,
        'sha' => $sha,
        'save' => 'icerik.php?dosya=' . rawurlencode($key),
        'upload' => 'yukle.php',
        'raw' => 'https://raw.githubusercontent.com/' . $c['repo'] . '/' . ($c['branch'] ?? 'main') . '/public',
        'hints' => editor_hints(),
        'openFirst' => !$isText,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP) ?>;
  </script>
  <script src="<?= h(panel_base()) ?>/assets/editor.js?v=1"></script>
<?php endif; ?>
<?php
page_end($c);
