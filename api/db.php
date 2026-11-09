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

        // Ensure feed tables exist and default seeds are populated
        try {
            $pdo->query("SELECT 1 FROM `feeds` LIMIT 1");
        } catch (Exception $e) {
            $schemaFile = __DIR__ . '/schema.sql';
            if (file_exists($schemaFile)) {
                $sql = file_get_contents($schemaFile);
                $pdo->exec($sql);
            }
        }

        try {
            $feedCount = (int)$pdo->query("SELECT COUNT(*) FROM `feeds`")->fetchColumn();
            if ($feedCount === 0) {
                $seedFile = __DIR__ . '/seed.sql';
                if (file_exists($seedFile)) {
                    $seedSql = file_get_contents($seedFile);
                    $pdo->exec($seedSql);
                }
            }
        } catch (Exception $e) {}

        // Ensure dm_pct exists in daily_feed_items
        try {
            $pdo->query("SELECT `dm_pct` FROM `daily_feed_items` LIMIT 1");
        } catch (Exception $e) {
            try {
                $pdo->exec("ALTER TABLE `daily_feed_items` ADD COLUMN `dm_pct` DECIMAL(6,2) NULL AFTER `amount_as_fed_kg`");
            } catch (Exception $ex) {}
        }

        // Migrate any By-product feed category to Concentrate
        try {
            $pdo->exec("UPDATE `feeds` SET `category` = 'Concentrate' WHERE `category` = 'By-product'");
        } catch (Exception $e) {}

        // Ensure users table exists with default admin and farmer accounts
        try {
            $pdo->query("SELECT 1 FROM `users` LIMIT 1");
        } catch (Exception $e) {
            try {
                $pdo->exec("CREATE TABLE IF NOT EXISTS `users` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `username` VARCHAR(50) NOT NULL UNIQUE,
                    `password` VARCHAR(255) NOT NULL,
                    `full_name` VARCHAR(100) NOT NULL,
                    `role` ENUM('admin', 'farmer') NOT NULL DEFAULT 'farmer',
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
            } catch (Exception $ex) {}
        }

        try {
            $userCount = (int)$pdo->query("SELECT COUNT(*) FROM `users`")->fetchColumn();
            if ($userCount === 0) {
                $uStmt = $pdo->prepare("INSERT INTO `users` (`username`, `password`, `full_name`, `role`) VALUES (?, ?, ?, ?)");
                $uStmt->execute(['admin', password_hash('admin123', PASSWORD_DEFAULT), 'Farm Administrator', 'admin']);
                $uStmt->execute(['farmer', password_hash('farmer123', PASSWORD_DEFAULT), 'Dairy Farmer / Operator', 'farmer']);
            }
        } catch (Exception $e) {}

        // Ensure reproductive_status enum allows Sold and Deceased
        try {
            $pdo->exec("ALTER TABLE `cows` MODIFY COLUMN `reproductive_status` VARCHAR(50) DEFAULT 'Open'");
        } catch (Exception $e) {}

        // Ensure feed stock columns exist in feeds table
        try {
            $pdo->query("SELECT `current_stock_kg` FROM `feeds` LIMIT 1");
        } catch (Exception $e) {
            try {
                $pdo->exec("ALTER TABLE `feeds` ADD COLUMN `current_stock_kg` DECIMAL(10,2) NOT NULL DEFAULT 500.00 AFTER `nel_mj`");
                $pdo->exec("ALTER TABLE `feeds` ADD COLUMN `min_stock_alert_kg` DECIMAL(10,2) NOT NULL DEFAULT 100.00 AFTER `current_stock_kg`");
                $pdo->exec("ALTER TABLE `feeds` ADD COLUMN `unit_cost` DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER `min_stock_alert_kg`");

                // Populate realistic initial stock values
                $pdo->exec("UPDATE `feeds` SET `current_stock_kg` = 1250.00, `min_stock_alert_kg` = 300.00, `unit_cost` = 45.00 WHERE `name` LIKE '%TMR%'");
                $pdo->exec("UPDATE `feeds` SET `current_stock_kg` = 450.00, `min_stock_alert_kg` = 150.00, `unit_cost` = 115.00 WHERE `name` LIKE '%Concentrate%'");
                $pdo->exec("UPDATE `feeds` SET `current_stock_kg` = 2800.00, `min_stock_alert_kg` = 500.00, `unit_cost` = 28.00 WHERE `name` LIKE '%Silage%'");
                $pdo->exec("UPDATE `feeds` SET `current_stock_kg` = 900.00, `min_stock_alert_kg` = 200.00, `unit_cost` = 15.00 WHERE `name` LIKE '%Grass%'");
                $pdo->exec("UPDATE `feeds` SET `current_stock_kg` = 380.00, `min_stock_alert_kg` = 100.00, `unit_cost` = 95.00 WHERE `name` LIKE '%Alfalfa%'");
                $pdo->exec("UPDATE `feeds` SET `current_stock_kg` = 180.00, `min_stock_alert_kg` = 100.00, `unit_cost` = 175.00 WHERE `name` LIKE '%Soybean%'");
                $pdo->exec("UPDATE `feeds` SET `current_stock_kg` = 90.00, `min_stock_alert_kg` = 100.00, `unit_cost` = 140.00 WHERE `name` LIKE '%Cottonseed%'");
            } catch (Exception $ex) {}
        }

        // Ensure feed_stock_transactions table exists
        try {
            $pdo->query("SELECT 1 FROM `feed_stock_transactions` LIMIT 1");
        } catch (Exception $e) {
            try {
                $pdo->exec("CREATE TABLE IF NOT EXISTS `feed_stock_transactions` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `feed_id` INT NOT NULL,
                    `type` ENUM('in', 'out', 'fed', 'adjustment') NOT NULL DEFAULT 'in',
                    `quantity_kg` DECIMAL(10,2) NOT NULL,
                    `previous_stock_kg` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                    `new_stock_kg` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                    `unit_cost` DECIMAL(10,2) NULL DEFAULT 0.00,
                    `total_cost` DECIMAL(10,2) NULL DEFAULT 0.00,
                    `transaction_date` DATE NOT NULL,
                    `notes` TEXT NULL,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (`feed_id`) REFERENCES `feeds`(`id`) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

                // Seed some initial purchase records
                $pdo->exec("INSERT INTO `feed_stock_transactions` (`feed_id`, `type`, `quantity_kg`, `previous_stock_kg`, `new_stock_kg`, `unit_cost`, `total_cost`, `transaction_date`, `notes`) VALUES
                (3, 'in', 3000.00, 0.00, 3000.00, 28.00, 84000.00, DATE_SUB(CURDATE(), INTERVAL 14 DAY), 'Bulk Maize Silage Bunker Harvest'),
                (1, 'in', 1500.00, 0.00, 1500.00, 45.00, 67500.00, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'Commercial Lactation TMR Mixed Batch'),
                (2, 'in', 500.00, 0.00, 500.00, 115.00, 57500.00, DATE_SUB(CURDATE(), INTERVAL 7 DAY), '10 Bags (50kg) Dairy Concentrate Pellets'),
                (4, 'in', 1000.00, 0.00, 1000.00, 15.00, 15000.00, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'Fresh Green Forage Harvest'),
                (5, 'in', 400.00, 0.00, 400.00, 95.00, 38000.00, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'Alfalfa Hay Bales'),
                (6, 'in', 200.00, 0.00, 200.00, 175.00, 35000.00, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'High Protein Soybean Meal Supplement'),
                (7, 'in', 100.00, 0.00, 100.00, 140.00, 14000.00, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Whole Fuzzy Cottonseed 2 Bags')");
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

// Calculate HS and BQ vaccination protocol schedule for a cow
function calculateCowVaccineSchedule($cow, $existingVaccinations = []): array {
    $dob = $cow['date_of_birth'] ?? null;
    if (!$dob) return ['hs' => [], 'bq' => []];

    $today = new DateTime(date('Y-m-d'));

    // Check for already administered HS doses
    $hsGivenPrimary = null;
    $hsGivenSecondary = null;
    $bqGivenPrimary = null;
    $bqGivenSecondary = null;

    foreach ($existingVaccinations as $v) {
        $name = strtolower($v['vaccine_name'] ?? '');
        if (strpos($name, 'hs') !== false || strpos($name, 'haemorrhagic') !== false) {
            if (strpos($name, 'primary') !== false) $hsGivenPrimary = $v;
            elseif (strpos($name, 'secondary') !== false) $hsGivenSecondary = $v;
        }
        if (strpos($name, 'bq') !== false || strpos($name, 'blackquarter') !== false) {
            if (strpos($name, 'primary') !== false) $bqGivenPrimary = $v;
            elseif (strpos($name, 'secondary') !== false) $bqGivenSecondary = $v;
        }
    }

    // 1. HS Vaccine Schedule
    // Primary: 4 months from DOB
    $hsPrimaryDate = date('Y-m-d', strtotime('+4 months', strtotime($dob)));
    // Secondary: 3 months from Primary (actual given date or scheduled)
    $hsBasePrimary = $hsGivenPrimary['date_given'] ?? $hsPrimaryDate;
    $hsSecondaryDate = date('Y-m-d', strtotime('+3 months', strtotime($hsBasePrimary)));
    $hsBaseSecondary = $hsGivenSecondary['date_given'] ?? $hsSecondaryDate;

    $hsSchedule = [];
    $hsSchedule[] = [
        'stage' => 'Primary',
        'vaccine_code' => 'HS',
        'vaccine_name' => 'HS Vaccine (Primary)',
        'due_date' => $hsPrimaryDate,
        'next_due_date' => $hsSecondaryDate,
        'treatment_type' => 'HS Protocol Primary',
        'description' => 'Primary dose at 4 months of age'
    ];
    $hsSchedule[] = [
        'stage' => 'Secondary',
        'vaccine_code' => 'HS',
        'vaccine_name' => 'HS Vaccine (Secondary Booster)',
        'due_date' => $hsSecondaryDate,
        'next_due_date' => date('Y-m-d', strtotime('+1 year', strtotime($hsBaseSecondary))),
        'treatment_type' => 'HS Secondary Booster',
        'description' => 'Secondary booster dose 3 months after primary'
    ];

    // Annual boosters: every 1 year starting from secondary
    $secDt = new DateTime($hsBaseSecondary);
    $diffYears = max(1, (int)$today->diff($secDt)->y + 1);
    for ($i = 1; $i <= $diffYears + 1; $i++) {
        $annDate = date('Y-m-d', strtotime("+{$i} year", strtotime($hsBaseSecondary)));
        $nextAnnDate = date('Y-m-d', strtotime("+".($i+1)." year", strtotime($hsBaseSecondary)));
        $yearNum = (int)date('Y', strtotime($annDate));
        $hsSchedule[] = [
            'stage' => "Annual {$i}",
            'vaccine_code' => 'HS',
            'vaccine_name' => "HS Vaccine (Annual Booster {$yearNum})",
            'due_date' => $annDate,
            'next_due_date' => $nextAnnDate,
            'treatment_type' => "HS Annual Booster {$yearNum}",
            'description' => "Annual booster dose every 1 year from secondary booster"
        ];
    }

    // 2. BQ Vaccine Schedule
    // Primary: 4 months from DOB
    $bqPrimaryDate = date('Y-m-d', strtotime('+4 months', strtotime($dob)));
    // Secondary: 13 months from Primary (actual given date or scheduled)
    $bqBasePrimary = $bqGivenPrimary['date_given'] ?? $bqPrimaryDate;
    $bqSecondaryDate = date('Y-m-d', strtotime('+13 months', strtotime($bqBasePrimary)));
    $bqBaseSecondary = $bqGivenSecondary['date_given'] ?? $bqSecondaryDate;

    $bqSchedule = [];
    $bqSchedule[] = [
        'stage' => 'Primary',
        'vaccine_code' => 'BQ',
        'vaccine_name' => 'BQ Vaccine (Primary)',
        'due_date' => $bqPrimaryDate,
        'next_due_date' => $bqSecondaryDate,
        'treatment_type' => 'BQ Protocol Primary',
        'description' => 'Primary dose at 4 months of age'
    ];
    $bqSchedule[] = [
        'stage' => 'Secondary',
        'vaccine_code' => 'BQ',
        'vaccine_name' => 'BQ Vaccine (Secondary Booster)',
        'due_date' => $bqSecondaryDate,
        'next_due_date' => date('Y-m-d', strtotime('+22 months', strtotime($bqBaseSecondary))),
        'treatment_type' => 'BQ Secondary Booster',
        'description' => 'Secondary booster dose 13 months after primary'
    ];

    // Periodic boosters: every 22 months starting from secondary
    $bqSecDt = new DateTime($bqBaseSecondary);
    $diffMonths = max(22, (int)($today->diff($bqSecDt)->m + ($today->diff($bqSecDt)->y * 12)));
    $numBoosters = max(2, (int)ceil($diffMonths / 22) + 1);
    for ($i = 1; $i <= $numBoosters; $i++) {
        $monthsAdd = 22 * $i;
        $nextMonthsAdd = 22 * ($i + 1);
        $periodicDate = date('Y-m-d', strtotime("+{$monthsAdd} months", strtotime($bqBaseSecondary)));
        $nextPeriodicDate = date('Y-m-d', strtotime("+{$nextMonthsAdd} months", strtotime($bqBaseSecondary)));
        $yearNum = (int)date('Y', strtotime($periodicDate));
        $bqSchedule[] = [
            'stage' => "Periodic {$i}",
            'vaccine_code' => 'BQ',
            'vaccine_name' => "BQ Vaccine (22-Month Booster {$yearNum})",
            'due_date' => $periodicDate,
            'next_due_date' => $nextPeriodicDate,
            'treatment_type' => "BQ 22-Month Booster {$yearNum}",
            'description' => "Periodic booster dose every 22 months from secondary booster"
        ];
    }

    // Evaluate statuses against existing records
    $evaluate = function(&$list) use ($existingVaccinations, $today) {
        foreach ($list as &$item) {
            $isGiven = false;
            $givenDate = null;
            foreach ($existingVaccinations as $v) {
                $vName = strtolower($v['vaccine_name'] ?? '');
                $vType = strtolower($v['treatment_type'] ?? '');
                if (strpos($vName, strtolower($item['vaccine_code'])) !== false || strpos($vType, strtolower($item['vaccine_code'])) !== false) {
                    if (strpos($vName, strtolower($item['stage'])) !== false ||
                        strpos($vType, strtolower($item['stage'])) !== false ||
                        abs(strtotime($v['date_given']) - strtotime($item['due_date'])) < 45 * 86400) {
                        $isGiven = true;
                        $givenDate = $v['date_given'];
                        break;
                    }
                }
            }

            $dueDt = new DateTime($item['due_date']);
            $daysDiff = (int)$today->diff($dueDt)->format('%r%a');

            $item['is_given'] = $isGiven;
            $item['date_given'] = $givenDate;
            $item['days_until_due'] = $daysDiff;

            if ($isGiven) {
                $item['status'] = 'Given';
                $item['badge_class'] = 'badge-green';
            } elseif ($daysDiff < 0) {
                $item['status'] = 'Overdue';
                $item['badge_class'] = 'badge-red';
            } elseif ($daysDiff <= 14) {
                $item['status'] = 'Due Soon';
                $item['badge_class'] = 'badge-teal';
            } else {
                $item['status'] = 'Upcoming';
                $item['badge_class'] = 'badge-slate';
            }
        }
    };

    $evaluate($hsSchedule);
    $evaluate($bqSchedule);

    return [
        'hs' => $hsSchedule,
        'bq' => $bqSchedule
    ];
}
