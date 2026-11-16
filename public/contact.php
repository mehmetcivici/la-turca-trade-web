<?php
/**
 * La Turca Trade — iletişim formu işleyicisi (cPanel / PHP 7.4+).
 * Formdan gelen talebi aşağıdaki adrese e-posta olarak gönderir.
 * ALICI ve GONDEREN adreslerini cPanel'de açtığınız e-posta hesabıyla değiştirin.
 */
declare(strict_types=1);

const ALICI = 'info@laturcatrade.com';          // talepler bu adrese gelir (panel ayarlarındaki adres önceliklidir)
const GONDEREN = 'info@laturcatrade.com';       // aynı alan adında, Hostinger'de açılmış bir adres olmalı

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function out(int $code, array $body): void {
    http_response_code($code);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(405, ['ok' => false]);

// Bot tuzağı: gizli alan doluysa sessizce "başarılı" dön.
if (!empty($_POST['website'])) out(200, ['ok' => true]);

function clean(string $k, int $max = 200): string {
    $v = trim((string)($_POST[$k] ?? ''));
    $v = str_replace(["\r", "\0"], '', $v);
    return mb_substr($v, 0, $max);
}

$name    = clean('name');
$company = clean('company');
$email   = clean('email');
$phone   = clean('phone', 60);
$country = clean('country', 80);
$type    = clean('type', 80);
$message = clean('message', 5000);
$lang    = clean('lang', 5);
$page    = clean('page', 200);
$interest = isset($_POST['interest']) ? implode(', ', array_map(fn($x) => mb_substr((string)$x, 0, 40), (array)$_POST['interest'])) : '';

if ($name === '' || $company === '' || $country === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($_POST['consent'])) {
    out(422, ['ok' => false]);
}

// Basit hız sınırı: aynı IP'den 60 sn içinde ikinci geçerli gönderim reddedilir.
$ip = $_SERVER['REMOTE_ADDR'] ?? '0';
$lock = sys_get_temp_dir() . '/ltt_' . md5($ip);
if (is_file($lock) && time() - filemtime($lock) < 60) out(429, ['ok' => false]);
@touch($lock);

// Talebi yönetim paneline kaydet (yonetim/_lib/db.php → ltt-data/talepler.sqlite)
$alici = ALICI;
try {
    require_once __DIR__ . '/yonetim/_lib/db.php';
    talep_ekle(compact('name', 'company', 'email', 'phone', 'country', 'type', 'interest', 'message', 'lang', 'page', 'ip'));
    $cfg = config();
    if (!empty($cfg['notify']) && filter_var($cfg['notify'], FILTER_VALIDATE_EMAIL)) $alici = $cfg['notify'];
    $saved = true;
} catch (Throwable $e) {
    $saved = false;
    error_log('LTT talep kaydedilemedi: ' . $e->getMessage());
}

$subject = 'Web talebi: ' . $company . ' (' . $country . ')';
$body = "Ad soyad: $name\nFirma: $company\nÜlke: $country\nE-posta: $email\nTelefon: $phone\nFirma türü: $type\nİlgi: $interest\nDil: $lang\nSayfa: $page\n\nMesaj:\n$message\n";

$headers = [
    'From: La Turca Trade <' . GONDEREN . '>',
    'Reply-To: ' . str_replace(["\n", "\r"], '', $email),
    'Content-Type: text/plain; charset=UTF-8',
    'MIME-Version: 1.0',
];

$mailed = @mail($alici, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("\r\n", $headers), '-f' . GONDEREN);
// Panele kaydedildiyse e-posta gitmese de ziyaretçiye başarı dönülür
$ok = $saved || $mailed;
out($ok ? 200 : 500, ['ok' => $ok]);
