<?php
/**
 * Varsayılan giriş bilgileri. Ayar dosyası (ltt-data/config.php) yokken kullanılır.
 * Şifrenin kendisi depoda YOKTUR; yalnızca bcrypt özeti tutulur. İlk girişten sonra
 * Ayarlar sayfasından şifreyi değiştirmeniz önerilir.
 */
declare(strict_types=1);
if (realpath((string) ($_SERVER['SCRIPT_FILENAME'] ?? '')) === __FILE__) { http_response_code(404); exit; }

function default_config(): array
{
    return [
        'user' => 'admin',
        'pass' => '$2y$12$uYSoRVndpk3Nkdb1mi9vE.GPDdomcxMgyxFcPEvFQVNzfZNcLOM/6',
        'default_pass' => true,
        'token' => '',
        'repo' => 'mehmetcivici/la-turca-trade-web',
        'branch' => 'main',
        'notify' => 'info@laturcatrade.com',
        'auto_update' => true,
        'auto_pull' => true,
    ];
}
