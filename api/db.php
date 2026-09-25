<?php
// api/db.php - Database connection and automatic initializer

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function getDb(): PDO {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $host = '127.0.0.1';
    $port = 3306;
    $user = 'root';
    $pass = '';
    $dbname = 'farm_management';

    try {
        // 1. First connect to MySQL server
        $pdoServer = new PDO("mysql:host={$host};port={$port};charset=utf8mb4", $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);

        // Check if database exists
        $stmt = $pdoServer->query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '{$dbname}'");
        $exists = $stmt->fetch();

        if (!$exists) {
            $pdoServer->exec("CREATE DATABASE `{$dbname}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        }

        // 2. Connect to the database
        $pdo = new PDO("mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4", $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);

        // 3. Ensure tables exist
        $checkTable = $pdo->query("SHOW TABLES LIKE 'cows'");
        if ($checkTable->rowCount() === 0) {
            $schemaFile = __DIR__ . '/schema.sql';
            if (file_exists($schemaFile)) {
                $sql = file_get_contents($schemaFile);
                $pdo->exec($sql);
            }

            $seedFile = __DIR__ . '/seed.sql';
            if (file_exists($seedFile)) {
                $seedSql = file_get_contents($seedFile);
                $pdo->exec($seedSql);
            }
        }

        // Ensure gender column exists
        try {
            $pdo->query("SELECT `gender` FROM `cows` LIMIT 1");
        } catch (Exception $e) {
            try {
                $pdo->exec("ALTER TABLE `cows` ADD COLUMN `gender` ENUM('Female', 'Male') NOT NULL DEFAULT 'Female' AFTER `breed`");
            } catch (Exception $ex) {}
        }

        return $pdo;
    } catch (PDOException $e) {
        jsonResponse([
            'error' => 'Database connection failed: ' . $e->getMessage(),
            'hint' => 'Please make sure MySQL is running in your XAMPP control panel.'
        ], 500);
        exit;
    }
}

function jsonResponse($data, int $statusCode = 200): void {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

function getJsonInput(): array {
    $raw = file_get_contents('php://input');
    if (empty($raw)) {
        return $_POST;
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : $_POST;
}

// Auto-calculate age from date of birth
function calculateAgeString($dob): string {
    if (!$dob) return 'Unknown';
    $birth = new DateTime($dob);
    $now = new DateTime();
    $diff = $now->diff($birth);
    if ($diff->y > 0) {
        return $diff->y . ' yr' . ($diff->y > 1 ? 's ' : ' ') . ($diff->m > 0 ? $diff->m . ' mo' : '');
    }
    return $diff->m . ' months';
}
