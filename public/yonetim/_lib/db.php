<?php
/** Gelen talepler: SQLite (ltt-data/talepler.sqlite). */
declare(strict_types=1);
require_once __DIR__ . '/paths.php';

function db(): PDO
{
    static $pdo = null;
    if ($pdo) return $pdo;
    $pdo = new PDO('sqlite:' . data_dir() . '/talepler.sqlite');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec("CREATE TABLE IF NOT EXISTS talepler (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT NOT NULL,
        name TEXT, company TEXT, email TEXT, phone TEXT, country TEXT,
        type TEXT, interest TEXT, message TEXT, lang TEXT, page TEXT, ip TEXT,
        status TEXT NOT NULL DEFAULT 'yeni',
        note TEXT DEFAULT ''
    )");
    return $pdo;
}

const TALEP_DURUMLARI = [
    'yeni' => 'Yeni',
    'okundu' => 'Okundu',
    'yanitlandi' => 'Yanıtlandı',
    'arsiv' => 'Arşiv',
];

function talep_ekle(array $t): int
{
    $st = db()->prepare('INSERT INTO talepler (created_at,name,company,email,phone,country,type,interest,message,lang,page,ip)
        VALUES (:created_at,:name,:company,:email,:phone,:country,:type,:interest,:message,:lang,:page,:ip)');
    $st->execute([
        ':created_at' => date('c'),
        ':name' => $t['name'] ?? '', ':company' => $t['company'] ?? '', ':email' => $t['email'] ?? '',
        ':phone' => $t['phone'] ?? '', ':country' => $t['country'] ?? '', ':type' => $t['type'] ?? '',
        ':interest' => $t['interest'] ?? '', ':message' => $t['message'] ?? '', ':lang' => $t['lang'] ?? '',
        ':page' => $t['page'] ?? '', ':ip' => $t['ip'] ?? '',
    ]);
    return (int) db()->lastInsertId();
}

function talepler(string $durum = '', string $ara = ''): array
{
    $sql = 'SELECT * FROM talepler WHERE 1=1';
    $p = [];
    if ($durum !== '' && isset(TALEP_DURUMLARI[$durum])) { $sql .= ' AND status = :s'; $p[':s'] = $durum; }
    elseif ($durum === '') { $sql .= " AND status != 'arsiv'"; }
    if ($ara !== '') {
        $sql .= ' AND (name LIKE :q OR company LIKE :q OR email LIKE :q OR country LIKE :q OR message LIKE :q)';
        $p[':q'] = '%' . $ara . '%';
    }
    $sql .= ' ORDER BY id DESC LIMIT 500';
    $st = db()->prepare($sql);
    $st->execute($p);
    return $st->fetchAll();
}

function talep(int $id): ?array
{
    $st = db()->prepare('SELECT * FROM talepler WHERE id = ?');
    $st->execute([$id]);
    return $st->fetch() ?: null;
}

function talep_guncelle(int $id, string $status, string $note): void
{
    if (!isset(TALEP_DURUMLARI[$status])) $status = 'okundu';
    db()->prepare('UPDATE talepler SET status = ?, note = ? WHERE id = ?')->execute([$status, $note, $id]);
}

function talep_sil(int $id): void
{
    db()->prepare('DELETE FROM talepler WHERE id = ?')->execute([$id]);
}

function talep_sayilari(): array
{
    $out = array_fill_keys(array_keys(TALEP_DURUMLARI), 0);
    foreach (db()->query('SELECT status, COUNT(*) n FROM talepler GROUP BY status') as $r) $out[$r['status']] = (int) $r['n'];
    $out['son30'] = (int) db()->query("SELECT COUNT(*) FROM talepler WHERE created_at >= '" . date('c', time() - 30 * 86400) . "'")->fetchColumn();
    return $out;
}
