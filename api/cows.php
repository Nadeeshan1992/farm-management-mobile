<?php
// api/cows.php - Animal Profile & Registration CRUD
require_once __DIR__ . '/db.php';
$db = getDb();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if ($id > 0) {
        // Fetch single cow with full details
        $stmt = $db->prepare("SELECT * FROM cows WHERE id = ?");
        $stmt->execute([$id]);
        $cow = $stmt->fetch();
        
        if (!$cow) {
            jsonResponse(['error' => 'Cow not found'], 404);
        }

        $cow['age_display'] = calculateAgeString($cow['date_of_birth']);

        // Attach recent milk records
        $milkStmt = $db->prepare("SELECT * FROM milk_records WHERE cow_id = ? ORDER BY record_date DESC LIMIT 10");
        $milkStmt->execute([$id]);
        $cow['milk_history'] = $milkStmt->fetchAll();

        // Attach heat records
        $heatStmt = $db->prepare("SELECT * FROM heat_records WHERE cow_id = ? ORDER BY detection_date DESC LIMIT 10");
        $heatStmt->execute([$id]);
        $cow['heat_history'] = $heatStmt->fetchAll();

        // Attach AI records
        $aiStmt = $db->prepare("SELECT * FROM ai_records WHERE cow_id = ? ORDER BY ai_date DESC LIMIT 10");
        $aiStmt->execute([$id]);
        $cow['ai_history'] = $aiStmt->fetchAll();

        // Attach health records
        $healthStmt = $db->prepare("SELECT * FROM health_records WHERE cow_id = ? ORDER BY record_date DESC LIMIT 10");
        $healthStmt->execute([$id]);
        $cow['health_history'] = $healthStmt->fetchAll();

        // Attach vaccination records
        $vaxStmt = $db->prepare("SELECT * FROM vaccination_records WHERE cow_id = ? ORDER BY next_vaccination_date DESC LIMIT 10");
        $vaxStmt->execute([$id]);
        $cow['vaccination_history'] = $vaxStmt->fetchAll();

        // Attach calvings
        $calvStmt = $db->prepare("SELECT * FROM calving_records WHERE cow_id = ? ORDER BY calving_date DESC");
        $calvStmt->execute([$id]);
        $cow['calving_history'] = $calvStmt->fetchAll();

        jsonResponse($cow);
    }

    // List cows with search, gender, and status filtering
    $status = $_GET['status'] ?? '';
    $gender = $_GET['gender'] ?? '';
    $search = $_GET['search'] ?? '';

    $query = "SELECT c.*, 
        (SELECT ROUND(AVG(m.total_yield), 1) FROM milk_records m WHERE m.cow_id = c.id) as avg_daily_milk,
        (SELECT m.total_yield FROM milk_records m WHERE m.cow_id = c.id ORDER BY m.record_date DESC LIMIT 1) as latest_milk,
        (SELECT m.drop_percentage FROM milk_records m WHERE m.cow_id = c.id ORDER BY m.record_date DESC LIMIT 1) as latest_drop_pct
        FROM cows c WHERE 1=1";
    $params = [];

    if (!empty($gender) && $gender !== 'All') {
        $query .= " AND c.gender = ?";
        $params[] = $gender;
    }

    if (!empty($status) && $status !== 'All') {
        if ($status === 'Female' || $status === 'Male') {
            $query .= " AND c.gender = ?";
            $params[] = $status;
        } elseif ($status === 'Born' || $status === 'born on farm') {
            $query .= " AND c.source LIKE '%born%'";
        } elseif ($status === 'Purchased' || $status === 'purchased') {
            $query .= " AND c.source LIKE '%purchas%'";
        } else {
            $query .= " AND c.reproductive_status = ?";
            $params[] = $status;
        }
    }

    if (!empty($search)) {
        $query .= " AND (c.tag_number LIKE ? OR c.name LIKE ? OR c.breed LIKE ?)";
        $params[] = "%{$search}%";
        $params[] = "%{$search}%";
        $params[] = "%{$search}%";
    }

    $query .= " ORDER BY c.id ASC";
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $cows = $stmt->fetchAll();

    foreach ($cows as &$c) {
        $c['gender'] = $c['gender'] ?? 'Female';
        $c['age_display'] = calculateAgeString($c['date_of_birth']);
    }

    jsonResponse(['cows' => $cows, 'count' => count($cows)]);
}

if ($method === 'POST') {
    $data = getJsonInput();
    
    $tagNumber = trim($data['tag_number'] ?? '');
    $name = trim($data['name'] ?? '');
    $breed = trim($data['breed'] ?? 'Holstein Friesian');
    $gender = trim($data['gender'] ?? 'Female');
    $dob = trim($data['date_of_birth'] ?? date('Y-m-d'));
    $source = trim($data['source'] ?? 'born on farm');
    $parity = (int)($data['parity'] ?? 0);
    $status = trim($data['reproductive_status'] ?? ($gender === 'Male' ? 'Breeding Sire' : 'Open'));
    $photoUrl = trim($data['photo_url'] ?? 'assets/cow_default.jpg');

    if (empty($tagNumber) || empty($name)) {
        jsonResponse(['error' => 'Animal ID / Tag Number and Name are required.'], 422);
    }

    // Check duplicate tag
    $dupCheck = $db->prepare("SELECT id FROM cows WHERE tag_number = ?");
    $dupCheck->execute([$tagNumber]);
    if ($dupCheck->fetch()) {
        jsonResponse(['error' => "Tag Number '{$tagNumber}' already exists."], 409);
    }

    $insert = $db->prepare("
        INSERT INTO cows (tag_number, name, breed, gender, date_of_birth, source, parity, reproductive_status, photo_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $insert->execute([$tagNumber, $name, $breed, $gender, $dob, $source, $parity, $status, $photoUrl]);
    $newId = (int)$db->lastInsertId();

    jsonResponse([
        'message' => 'Animal registered successfully!',
        'cow_id' => $newId,
        'tag_number' => $tagNumber
    ], 201);
}

if ($method === 'PUT') {
    $data = getJsonInput();
    $id = (int)($data['id'] ?? 0);

    if ($id <= 0) {
        jsonResponse(['error' => 'Valid Cow ID is required for update.'], 422);
    }

    $update = $db->prepare("
        UPDATE cows SET 
            name = ?, 
            breed = ?, 
            gender = ?,
            date_of_birth = ?, 
            source = ?, 
            parity = ?, 
            reproductive_status = ?,
            photo_url = COALESCE(?, photo_url)
        WHERE id = ?
    ");
    $update->execute([
        $data['name'],
        $data['breed'],
        $data['gender'] ?? 'Female',
        $data['date_of_birth'],
        $data['source'],
        (int)$data['parity'],
        $data['reproductive_status'],
        $data['photo_url'] ?? null,
        $id
    ]);

    jsonResponse(['message' => 'Cow details updated successfully!']);
}

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($id <= 0) {
        jsonResponse(['error' => 'Valid Cow ID required.'], 422);
    }

    $del = $db->prepare("DELETE FROM cows WHERE id = ?");
    $del->execute([$id]);

    jsonResponse(['message' => 'Cow profile removed successfully.']);
}
