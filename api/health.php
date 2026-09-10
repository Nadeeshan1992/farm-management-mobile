<?php
// api/health.php - Disease, Treatments, & Veterinary Care Records
require_once __DIR__ . '/db.php';
$db = getDb();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $cowId = isset($_GET['cow_id']) ? (int)$_GET['cow_id'] : 0;
    $status = $_GET['status'] ?? '';

    $query = "
        SELECT h.*, c.tag_number, c.name, c.breed 
        FROM health_records h 
        JOIN cows c ON h.cow_id = c.id 
        WHERE 1=1
    ";
    $params = [];

    if ($cowId > 0) {
        $query .= " AND h.cow_id = ?";
        $params[] = $cowId;
    }

    if (!empty($status)) {
        $query .= " AND h.recovery_status = ?";
        $params[] = $status;
    }

    $query .= " ORDER BY h.record_date DESC, h.id DESC";
    $stmt = $db->prepare($query);
    $stmt->execute($params);

    jsonResponse(['health_records' => $stmt->fetchAll()]);
}

if ($method === 'POST') {
    $data = getJsonInput();

    $cowId = (int)($data['cow_id'] ?? 0);
    $recordDate = trim($data['record_date'] ?? date('Y-m-d'));
    $disease = trim($data['disease'] ?? '');
    $symptoms = trim($data['symptoms'] ?? '');
    $treatment = trim($data['treatment'] ?? '');
    $medicine = trim($data['medicine'] ?? '');
    $dosage = trim($data['dosage'] ?? '');
    $startDate = trim($data['start_date'] ?? date('Y-m-d'));
    $endDate = !empty($data['end_date']) ? trim($data['end_date']) : null;
    $vetVisit = trim($data['veterinary_visit'] ?? '');
    $recoveryStatus = trim($data['recovery_status'] ?? 'Active');
    $notes = trim($data['notes'] ?? '');

    if ($cowId <= 0 || empty($disease) || empty($treatment)) {
        jsonResponse(['error' => 'Cow, Disease, and Treatment are required fields.'], 422);
    }

    $insert = $db->prepare("
        INSERT INTO health_records (cow_id, record_date, disease, symptoms, treatment, medicine, dosage, start_date, end_date, veterinary_visit, recovery_status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $insert->execute([$cowId, $recordDate, $disease, $symptoms, $treatment, $medicine, $dosage, $startDate, $endDate, $vetVisit, $recoveryStatus, $notes]);

    jsonResponse(['message' => 'Health & treatment record added successfully!'], 201);
}

if ($method === 'PUT') {
    $data = getJsonInput();
    $id = (int)($data['id'] ?? 0);
    $status = trim($data['recovery_status'] ?? 'Recovered');
    $notes = trim($data['notes'] ?? '');

    if ($id <= 0) {
        jsonResponse(['error' => 'Record ID required.'], 422);
    }

    $update = $db->prepare("
        UPDATE health_records 
        SET recovery_status = ?, notes = CONCAT(COALESCE(notes, ''), '\n', ?) 
        WHERE id = ?
    ");
    $update->execute([$status, $notes, $id]);

    jsonResponse(['message' => 'Recovery status updated!']);
}
