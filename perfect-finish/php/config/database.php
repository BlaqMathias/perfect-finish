<?php
// =============================================================
//  PERFECT FINISH — Database Configuration
//  File: php/config/database.php
//
//  ⚠️  Edit the four constants below to match your hosting.
//  On cPanel shared hosting these are typically found under:
//  cPanel → MySQL Databases
// =============================================================

define('DB_HOST', 'localhost');
define('DB_NAME', 'perfect_finish');
define('DB_USER', 'root');          // replace with your DB username
define('DB_PASS', '');              // replace with your DB password
define('DB_CHARSET', 'utf8mb4');

// Business WhatsApp number (international format, no + or spaces)
define('WA_NUMBER', '2347084657676');

// Size multipliers — must match the data-mult values in index.html
define('SIZE_MULTIPLIERS', [
    '30ml'  => 1.0,
    '50ml'  => 1.5,
    '100ml' => 2.2,
]);

/**
 * Returns a PDO connection instance.
 * Throws a PDOException on failure (caught in each API file).
 */
function getDB(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;dbname=%s;charset=%s',
            DB_HOST,
            DB_NAME,
            DB_CHARSET
        );

        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }

    return $pdo;
}
