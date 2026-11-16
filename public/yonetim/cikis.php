<?php
declare(strict_types=1);
require __DIR__ . '/_lib/bootstrap.php';
$_SESSION = [];
session_destroy();
redirect(panel_base() . '/giris.php');
