<?php
/** Panel sayfalarının ortak başlangıcı: oturum, CSRF, giriş kontrolü, yardımcılar. */
declare(strict_types=1);
if (realpath((string) ($_SERVER['SCRIPT_FILENAME'] ?? '')) === __FILE__) { http_response_code(404); exit; }
require_once __DIR__ . '/paths.php';
require_once __DIR__ . '/github.php';

// Uyarılar JSON yanıtlarını bozmasın: ekrana değil kayda yaz
@ini_set('display_errors', '0');
@ini_set('log_errors', '1');
mb_internal_encoding('UTF-8');
date_default_timezone_set('Europe/Istanbul');
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('Cache-Control: no-store');

$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
session_name('ltt_panel');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? '/yonetim/x'), '/') . '/',
    'secure' => $https,
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_start();

/** Panelin web adresi (ör. /yonetim) */
function panel_base(): string
{
    return rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? '/yonetim/index.php'), '/');
}

/** Sitenin kök adresi (panelin bir üstü). */
function site_base(): string
{
    return rtrim(dirname(panel_base()), '/');
}

function h(?string $s): string
{
    return htmlspecialchars((string) $s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="csrf" value="' . h(csrf_token()) . '">';
}

function check_csrf(): void
{
    $t = $_POST['csrf'] ?? $_SERVER['HTTP_X_CSRF'] ?? '';
    if (!is_string($t) || !hash_equals(csrf_token(), $t)) {
        http_response_code(400);
        if (wants_json()) json_out(['ok' => false, 'error' => 'Oturum süresi doldu. Sayfayı yenileyin.'], 400);
        exit('Oturum süresi doldu. Sayfayı yenileyip tekrar deneyin.');
    }
}

function wants_json(): bool
{
    return str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') || !empty($_SERVER['HTTP_X_CSRF']);
}

function json_out(array $data, int $code = 200): never
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function redirect(string $to): never
{
    header('Location: ' . $to);
    exit;
}

function flash(?string $msg = null, string $type = 'ok'): ?array
{
    if ($msg !== null) { $_SESSION['flash'] = ['msg' => $msg, 'type' => $type]; return null; }
    $f = $_SESSION['flash'] ?? null;
    unset($_SESSION['flash']);
    return $f;
}

function require_login(): array
{
    $c = config();
    if (!$c) redirect(panel_base() . '/kurulum.php');
    if (empty($_SESSION['user']) || ($_SESSION['user'] !== ($c['user'] ?? null))) {
        if (wants_json()) json_out(['ok' => false, 'error' => 'Oturum kapandı, yeniden giriş yapın.'], 401);
        redirect(panel_base() . '/giris.php');
    }
    // 8 saat hareketsizlikte oturumu kapat
    if (isset($_SESSION['seen']) && time() - $_SESSION['seen'] > 8 * 3600) {
        session_destroy();
        redirect(panel_base() . '/giris.php');
    }
    $_SESSION['seen'] = time();
    return $c;
}

function gh(array $c): GitHub
{
    return new GitHub($c['token'], $c['repo'], $c['branch'] ?? 'main');
}

function deployed(): array
{
    $f = data_dir() . '/yayin.json';
    return is_file($f) ? (json_decode((string) file_get_contents($f), true) ?: []) : [];
}

function env_checks(): array
{
    return [
        'PHP 8.1+' => version_compare(PHP_VERSION, '8.1', '>='),
        'cURL' => function_exists('curl_init'),
        'ZipArchive' => class_exists('ZipArchive'),
        'GD (görsel işleme)' => function_exists('imagecreatetruecolor'),
        'WebP desteği' => function_exists('imagewebp'),
        'SQLite (PDO)' => in_array('sqlite', PDO::getAvailableDrivers(), true),
        'Veri klasörü yazılabilir' => is_writable(data_dir()),
        'Site klasörü yazılabilir' => is_writable(SITE_ROOT),
    ];
}

function tarih(string $iso): string
{
    $t = strtotime($iso);
    return $t ? date('d.m.Y H:i', $t) : $iso;
}
