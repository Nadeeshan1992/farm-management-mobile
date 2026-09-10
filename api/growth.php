<?php
// api/growth.php - Weight & Growth Management (ADG Calculator)
require_once __DIR__ . '/db.php';
$db = getDb();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $cowId = isset($_GET['cow_id']) ? (int)$_GET['cow_id'] : 0;
    
    $query = "
        SELECT g.*, c.tag_number, c.name, c.breed 
        FROM growth_records g 
        JOIN cows c ON g.cow_id = c.id 
        WHERE 1=1
    ";
    $params = [];
    if ($cowId > 0) {
        $query .= " AND g.cow_id = ?";
        $params[] = $cowId;
    }
    $query .= " ORDER BY g.record_date DESC, g.id DESC";

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    jsonResponse(['growth_records' => $stmt->fetchAll()]);
}

if ($method === 'POST') {
    $data = getJsonInput();

    $cowId = (int)($data['cow_id'] ?? 0);
    $recordDate = trim($data['record_date'] ?? date('Y-m-d'));
    $weight = (float)($data['weight'] ?? 0.0);

    if ($cowId <= 0 || $weight <= 0) {
        jsonResponse(['error' => 'Cow and valid weight are required.'], 422);
    }

    // Get cow DOB to calculate age in months
    $cowStmt = $db->prepare("SELECT date_of_birth FROM cows WHERE id = ?");
    $cowStmt->execute([$cowId]);
    $cow = $cowStmt->fetch();

    $dob = new DateTime($cow['date_of_birth']);
    $recDate = new DateTime($recordDate);
    $diff = $dob->diff($recDate);
    $ageMonths = ($diff->y * 12) + $diff->m;

    // Fetch previous weight record to calculate gain & ADG
    $prevStmt = $db->prepare("SELECT record_date, weight FROM growth_records WHERE cow_id = ? AND record_date < ? ORDER BY record_date DESC LIMIT 1");
    $prevStmt->execute([$cowId, $recordDate]);
    $prev = $prevStmt->fetch();

    $weightGain = 0.0;
    $growthRate = 0.0;

    if ($prev) {
        $prevDate = new DateTime($prev['record_date']);
        $daysBetween = max(1, $prevDate->diff($recDate)->days);
        $weightGain = round($weight - (float)$prev['weight'], 2);
        $growthRate = round($weightGain / $daysBetween, 2); // kg/day
    }

    $insert = $db->prepare("
        INSERT INTO growth_records (cow_id, record_date, weight, age_months, weight_gain, growth_rate)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $insert->execute([$cowId, $recordDate, $weight, $ageMonths, $weightGain, $growthRate]);

    jsonResponse([
        'message' => 'Weight record logged!',
        'weight' => $weight,
        'age_months' => $ageMonths,
        'weight_gain' => $weightGain,
        'daily_gain' => $growthRate
    ], 201);
}
