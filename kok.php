<?php
/**
 * Kök adres (/): ziyaretçiyi ana dile (/es/) kalıcı yönlendirir; Google'ın doğrulama robotuna
 * doğrulama etiketli kök sayfayı gösterir. Yanıt CDN'de önbelleğe alınmaz (robot istisnası her seferinde çalışsın).
 */
declare(strict_types=1);
header('Cache-Control: no-store, max-age=0');
header('Vary: User-Agent');
$ua = (string) ($_SERVER['HTTP_USER_AGENT'] ?? '');
if (stripos($ua, 'Google-Site-Verification') !== false && is_file(__DIR__ . '/index.html')) {
    header('Content-Type: text/html; charset=utf-8');
    header('X-Robots-Tag: noindex');
    readfile(__DIR__ . '/index.html');
    exit;
}
header('Location: /es/', true, 301);
