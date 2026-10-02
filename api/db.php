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
    $diffMonths = max(22, (int)($today->diff($secDt)->m + ($today->diff($secDt)->y * 12)));
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
