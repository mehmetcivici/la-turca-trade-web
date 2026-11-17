<?php
/** Görsel / PDF yükleme: görselleri küçültüp WebP'ye çevirip depoya commit eder; PDF kataloglar yalnız sunucuya kaydedilir (GitHub'a gitmez). */
declare(strict_types=1);
require __DIR__ . '/_lib/bootstrap.php';
$c = require_login();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['ok' => false, 'error' => 'POST gerekli'], 405);
check_csrf();
@set_time_limit(300);
@ini_set('memory_limit', '512M');

function slug(string $s): string
{
    $s = strtr($s, ['ç' => 'c', 'Ç' => 'c', 'ğ' => 'g', 'Ğ' => 'g', 'ı' => 'i', 'İ' => 'i', 'ö' => 'o', 'Ö' => 'o', 'ş' => 's', 'Ş' => 's', 'ü' => 'u', 'Ü' => 'u', 'ñ' => 'n', 'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ã' => 'a', 'õ' => 'o', 'â' => 'a', 'ê' => 'e']);
    $s = strtolower(preg_replace('/[^A-Za-z0-9]+/', '-', $s));
    return trim(substr($s, 0, 60), '-') ?: 'dosya';
}

$errors = [
    UPLOAD_ERR_INI_SIZE => 'Dosya sunucunun yükleme sınırını aşıyor (' . ini_get('upload_max_filesize') . ').',
    UPLOAD_ERR_FORM_SIZE => 'Dosya çok büyük.',
    UPLOAD_ERR_PARTIAL => 'Yükleme yarıda kaldı, tekrar deneyin.',
    UPLOAD_ERR_NO_FILE => 'Dosya seçilmedi.',
];
$f = $_FILES['file'] ?? null;
if (!$f || $f['error'] !== UPLOAD_ERR_OK) json_out(['ok' => false, 'error' => $errors[$f['error'] ?? UPLOAD_ERR_NO_FILE] ?? 'Yükleme hatası.'], 400);

$kind = ($_POST['kind'] ?? 'image') === 'pdf' ? 'pdf' : 'image';
$bytes = (string) file_get_contents($f['tmp_name']);
$base = slug(pathinfo((string) $f['name'], PATHINFO_FILENAME));

try {
    if ($kind === 'pdf') {
        if (!str_starts_with($bytes, '%PDF')) throw new RuntimeException('Bu dosya PDF değil.');
        $dir = rtrim(SITE_ROOT, '/') . '/catalogs';
        if (!is_dir($dir) && !@mkdir($dir, 0755, true)) throw new RuntimeException('catalogs klasörü oluşturulamadı.');
        $dest = $dir . '/' . $base . '.pdf';
        $part = $dest . '.ltt-tmp';
        if (file_put_contents($part, $bytes) === false || !rename($part, $dest)) throw new RuntimeException('PDF sunucuya yazılamadı.');
        $pages = preg_match_all('#/Type\s*/Page(?!s)#', $bytes);
        json_out(['ok' => true, 'path' => '/catalogs/' . $base . '.pdf', 'sizeMb' => round(strlen($bytes) / 1e6, 1), 'pages' => $pages ?: null]);
    }
    if (!function_exists('imagecreatefromstring')) throw new RuntimeException('Sunucuda GD yok; görsel işlenemiyor.');
    $info = @getimagesizefromstring($bytes);
    if (!$info || !in_array($info[2], [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP], true)) throw new RuntimeException('Yalnızca JPG, PNG veya WebP yükleyin.');
    $img = imagecreatefromstring($bytes);
    if (!$img) throw new RuntimeException('Görsel okunamadı.');
    [$w, $h] = [imagesx($img), imagesy($img)];
    $max = 1600;
    if ($w > $max || $h > $max) {
        $r = min($max / $w, $max / $h);
        $nw = (int) round($w * $r); $nh = (int) round($h * $r);
        $dst = imagecreatetruecolor($nw, $nh);
        imagealphablending($dst, false); imagesavealpha($dst, true);
        imagecopyresampled($dst, $img, 0, 0, 0, 0, $nw, $nh, $w, $h);
        imagedestroy($img);
        $img = $dst; $w = $nw; $h = $nh;
    }
    ob_start();
    if (function_exists('imagewebp')) { imagewebp($img, null, 82); $ext = 'webp'; } else { imagejpeg($img, null, 85); $ext = 'jpg'; }
    $out = (string) ob_get_clean();
    imagedestroy($img);
    $name = $base . '-' . date('ymdHis') . '.' . $ext;
    $sha = gh($c)->commit(['public/img/uploads/' . $name => $out], 'Panel: görsel yüklendi (' . $name . ')');
    json_out(['ok' => true, 'path' => '/img/uploads/' . $name, 'w' => $w, 'h' => $h, 'commit' => substr($sha, 0, 7)]);
} catch (Throwable $e) {
    json_out(['ok' => false, 'error' => $e->getMessage()], 500);
}
