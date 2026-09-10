<?php
// api/vaccines.php - Vaccination Records & Due Alerts
require_once __DIR__ . '/db.php';
$db = getDb();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $cowId = isset($_GET['cow_id']) ? (int)$_GET['cow_id'] : 0;
    $dueOnly = isset($_GET['due_only']) ? (bool)$_GET['due_only'] : false;

    $query = "
        SELECT v.*, c.tag_number, c.name, c.breed,
               DATEDIFF(v.next_vaccination_date, CURDATE()) as days_until_due
        FROM vaccination_records v 
        JOIN cows c ON v.cow_id = c.id 
        WHERE 1=1
    ";
    $params = [];

    if ($cowId > 0) {
        $query .= " AND v.cow_id = ?";
        $params[] = $cowId;
    }

    if ($dueOnly) {
        $query .= " AND (v.status IN ('Due', 'Overdue') OR v.next_vaccination_date <= DATE_ADD(CURDATE(), INTERVAL 14 DAY))";
    }

    $query .= " ORDER BY v.next_vaccination_date ASC, v.id DESC";
    $stmt = $db->prepare($query);
    $stmt->execute($params);

    $records = $stmt->fetchAll();
    foreach ($records as &$rec) {
        if ($rec['days_until_due'] < 0) {
            $rec['status'] = 'Overdue';
        } elseif ($rec['days_until_due'] <= 7) {
            $rec['status'] = 'Due';
        }
    }

    jsonResponse(['vaccinations' => $records]);
}

if ($method === 'POST') {
    $data = getJsonInput();

    $cowId = (int)($data['cow_id'] ?? 0);
    $vaccineName = trim($data['vaccine_name'] ?? '');
    $dateGiven = trim($data['date_given'] ?? date('Y-m-d'));
    $nextDate = trim($data['next_vaccination_date'] ?? date('Y-m-d', strtotime("$dateGiven +180 days")));
    $treatmentType = trim($data['treatment_type'] ?? 'Routine Vaccination');
    $followUpDate = !empty($data['follow_up_date']) ? trim($data['follow_up_date']) : null;
    $status = trim($data['status'] ?? 'Given');

    if ($cowId <= 0 || empty($vaccineName)) {
        jsonResponse(['error' => 'Cow and Vaccine Name are required.'], 422);
    }

    $insert = $db->prepare("
        INSERT INTO vaccination_records (cow_id, vaccine_name, date_given, next_vaccination_date, treatment_type, follow_up_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $insert->execute([$cowId, $vaccineName, $dateGiven, $nextDate, $treatmentType, $followUpDate, $status]);

    jsonResponse(['message' => 'Vaccination recorded successfully!'], 201);
}
