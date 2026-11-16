<?php
/**
 * La Turca Trade yönetim paneli — yollar ve ayar dosyası.
 * Veriler (ayarlar, talepler) web klasörünün DIŞINDA tutulur: public_html'in bir üstünde "ltt-data".
 */
declare(strict_types=1);
if (realpath((string) ($_SERVER['SCRIPT_FILENAME'] ?? '')) === __FILE__) { http_response_code(404); exit; }

date_default_timezone_set('Europe/Istanbul');

if (!defined('SITE_ROOT')) {
    define('SITE_ROOT', dirname(__DIR__, 2)); // public_html
}

function data_dir(): string
{
    static $dir = null;
    if ($dir !== null) return $dir;
    $cand = dirname(SITE_ROOT) . '/ltt-data';
    if (!is_dir($cand)) @mkdir($cand, 0700, true);
    if (is_dir($cand) && is_writable($cand)) return $dir = $cand;
    // Yedek: web klasörü içinde, erişime kapalı klasör
    $alt = SITE_ROOT . '/yonetim/_veri';
    if (!is_dir($alt)) @mkdir($alt, 0700, true);
    @file_put_contents($alt . '/.htaccess', "Require all denied\n<IfModule !mod_authz_core.c>\n  Deny from all\n</IfModule>\n");
    return $dir = $alt;
}

/** Ayarlar. Ayar dosyası yoksa varsayılanlar (_lib/defaults.php) kullanılır. */
function config(): array
{
    require_once __DIR__ . '/defaults.php';
    $f = data_dir() . '/config.php';
    if (!is_file($f)) return default_config();
    $c = require $f;
    return is_array($c) ? array_merge(default_config(), $c) : default_config();
}

function save_config(array $c): void
{
    $f = data_dir() . '/config.php';
    file_put_contents($f, "<?php\nreturn " . var_export($c, true) . ";\n", LOCK_EX);
    @chmod($f, 0600);
    if (function_exists('opcache_invalidate')) @opcache_invalidate($f, true);
}
