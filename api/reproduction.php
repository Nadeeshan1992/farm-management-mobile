<?php
// api/reproduction.php - Heat Detection, AI Breeding, Pregnancy Monitoring & Calving
require_once __DIR__ . '/db.php';
$db = getDb();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? 'list';

if ($method === 'GET') {
    if ($action === 'heats') {
        // List heat detection records
        $stmt = $db->query("
            SELECT h.*, c.tag_number, c.name, c.breed, c.parity 
            FROM heat_records h 
            JOIN cows c ON h.cow_id = c.id 
            ORDER BY h.detection_date DESC, h.detection_time DESC
        ");
        jsonResponse(['heats' => $stmt->fetchAll()]);
    }

    if ($action === 'ai') {
        // List AI / Breeding records with pregnancy calculations
        $stmt = $db->query("
            SELECT a.*, c.tag_number, c.name, c.breed,
                   DATEDIFF(CURDATE(), a.ai_date) as days_since_ai,
                   CASE 
                       WHEN a.pregnancy_result = 'Positive' THEN DATEDIFF(CURDATE(), a.ai_date)
                       ELSE 0 
                   END as days_pregnant,
                   DATEDIFF(a.expected_calving_date, CURDATE()) as days_to_calving
            FROM ai_records a 
            JOIN cows c ON a.cow_id = c.id 
            ORDER BY a.ai_date DESC
        ");
        $records = $stmt->fetchAll();
        jsonResponse(['ai_records' => $records]);
    }

    if ($action === 'pregnant') {
        // Pregnant cows monitoring
        $stmt = $db->query("
            SELECT a.*, c.tag_number, c.name, c.breed,
                   DATEDIFF(CURDATE(), a.ai_date) as days_pregnant,
                   DATEDIFF(a.expected_calving_date, CURDATE()) as days_to_calving,
                   ROUND((DATEDIFF(CURDATE(), a.ai_date) / 283.0) * 100, 1) as gestation_progress_pct
            FROM ai_records a 
            JOIN cows c ON a.cow_id = c.id 
            WHERE a.pregnancy_result = 'Positive' 
            AND (a.actual_calving_date IS NULL)
            ORDER BY a.expected_calving_date ASC
        ");
        jsonResponse(['pregnant_cows' => $stmt->fetchAll()]);
    }

    if ($action === 'calvings') {
        // List calving records
        $stmt = $db->query("
            SELECT cl.*, c.tag_number as mother_tag, c.name as mother_name, c.breed as mother_breed 
            FROM calving_records cl 
            JOIN cows c ON cl.cow_id = c.id 
            ORDER BY cl.calving_date DESC
        ");
        jsonResponse(['calvings' => $stmt->fetchAll()]);
    }

    // Default overview
    jsonResponse([
        'message' => 'Reproduction API active. Use ?action=heats, ?action=ai, ?action=pregnant, or ?action=calvings'
    ]);
}

if ($method === 'POST') {
    $data = getJsonInput();

    // 1. Log Heat Observation
    if ($action === 'log_heat') {
        $cowId = (int)($data['cow_id'] ?? 0);
        $date = trim($data['detection_date'] ?? date('Y-m-d'));
        $time = trim($data['detection_time'] ?? date('H:i:s'));
        $status = trim($data['status'] ?? 'Possible Heat'); // 'Possible Heat' or 'AI Reminder'
        $notes = trim($data['notes'] ?? '');

        if ($cowId <= 0) {
            jsonResponse(['error' => 'Please select a cow.'], 422);
        }

        // Check previous heat date
        $prevHeatStmt = $db->prepare("
            SELECT detection_date FROM heat_records 
            WHERE cow_id = ? AND detection_date < ? 
            ORDER BY detection_date DESC LIMIT 1
        ");
        $prevHeatStmt->execute([$cowId, $date]);
        $prevHeat = $prevHeatStmt->fetch();

        $prevHeatDate = $prevHeat ? $prevHeat['detection_date'] : null;
        $interEstrusInterval = null;
        if ($prevHeatDate) {
            $d1 = new DateTime($prevHeatDate);
            $d2 = new DateTime($date);
            $interEstrusInterval = $d1->diff($d2)->days;
        }

        $insert = $db->prepare("
            INSERT INTO heat_records (cow_id, detection_date, detection_time, status, previous_heat_date, inter_estrus_interval, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $insert->execute([$cowId, $date, $time, $status, $prevHeatDate, $interEstrusInterval, $notes]);

        // Update cow reproductive status to 'In heat'
        $updateCow = $db->prepare("UPDATE cows SET reproductive_status = 'In heat' WHERE id = ?");
        $updateCow->execute([$cowId]);

        jsonResponse([
            'message' => 'Heat event logged successfully!',
            'status' => $status,
            'badge_color' => $status === 'AI Reminder' ? 'red' : 'yellow',
            'inter_estrus_interval' => $interEstrusInterval
        ], 201);
    }

    // 2. Log AI (Artificial Insemination) Service
    if ($action === 'log_ai') {
        $cowId = (int)($data['cow_id'] ?? 0);
        $heatDate = trim($data['heat_date'] ?? date('Y-m-d'));
        $aiDate = trim($data['ai_date'] ?? date('Y-m-d'));
        $serviceNumber = (int)($data['service_number'] ?? 1);
        $technician = trim($data['ai_technician'] ?? '');
        $bullSemenId = trim($data['bull_semen_id'] ?? '');
        $pregCheckDate = trim($data['pregnancy_check_date'] ?? date('Y-m-d', strtotime("$aiDate +45 days")));
        $pregResult = trim($data['pregnancy_result'] ?? 'Pending');
        $problems = trim($data['reproductive_problems'] ?? '');

        if ($cowId <= 0 || empty($technician)) {
            jsonResponse(['error' => 'Cow and AI Technician are required.'], 422);
        }

        // Expected calving date is standard 283 days gestation for cattle
        $expectedCalvingDate = date('Y-m-d', strtotime("$aiDate +283 days"));

        $insert = $db->prepare("
            INSERT INTO ai_records (cow_id, heat_date, ai_date, service_number, ai_technician, bull_semen_id, pregnancy_check_date, pregnancy_result, expected_calving_date, reproductive_problems)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $insert->execute([$cowId, $heatDate, $aiDate, $serviceNumber, $technician, $bullSemenId, $pregCheckDate, $pregResult, $expectedCalvingDate, $problems]);

        if ($pregResult === 'Positive') {
            $db->prepare("UPDATE cows SET reproductive_status = 'Pregnant' WHERE id = ?")->execute([$cowId]);
        }

        jsonResponse([
            'message' => 'AI breeding record saved!',
            'expected_calving_date' => $expectedCalvingDate,
            'pregnancy_check_date' => $pregCheckDate
        ], 201);
    }

    // 3. Confirm Pregnancy Status
    if ($action === 'confirm_pregnancy') {
        $aiRecordId = (int)($data['ai_id'] ?? 0);
        $result = trim($data['pregnancy_result'] ?? 'Positive'); // 'Positive' or 'Negative'

        if ($aiRecordId <= 0) {
            jsonResponse(['error' => 'AI Record ID required.'], 422);
        }

        $stmt = $db->prepare("SELECT cow_id, ai_date FROM ai_records WHERE id = ?");
        $stmt->execute([$aiRecordId]);
        $record = $stmt->fetch();

        if (!$record) {
            jsonResponse(['error' => 'AI Record not found.'], 404);
        }

        $update = $db->prepare("
            UPDATE ai_records SET pregnancy_result = ?, pregnancy_check_date = CURDATE() WHERE id = ?
        ");
        $update->execute([$result, $aiRecordId]);

        $newStatus = ($result === 'Positive') ? 'Pregnant' : 'Open';
        $db->prepare("UPDATE cows SET reproductive_status = ? WHERE id = ?")->execute([$newStatus, $record['cow_id']]);

        jsonResponse([
            'message' => "Pregnancy confirmed as: {$result}. Cow status updated to '{$newStatus}'."
        ]);
    }

    // 4. Log Calving Event
    if ($action === 'log_calving') {
        $cowId = (int)($data['cow_id'] ?? 0);
        $calvingDate = trim($data['calving_date'] ?? date('Y-m-d'));
        $calvingType = trim($data['calving_type'] ?? 'Normal');
        $calfTag = trim($data['calf_tag_number'] ?? '');
        $calfSex = trim($data['calf_sex'] ?? 'Heifer');
        $birthWeight = !empty($data['birth_weight']) ? (float)$data['birth_weight'] : null;
        $problems = trim($data['post_calving_problems'] ?? 'None');

        if ($cowId <= 0 || empty($calfTag)) {
            jsonResponse(['error' => 'Mother Cow and Calf Tag Number are required.'], 422);
        }

        // Get mother info
        $motherStmt = $db->prepare("SELECT * FROM cows WHERE id = ?");
        $motherStmt->execute([$cowId]);
        $mother = $motherStmt->fetch();

        // Calculate calving interval from previous calving
        $prevCalvStmt = $db->prepare("SELECT calving_date FROM calving_records WHERE cow_id = ? ORDER BY calving_date DESC LIMIT 1");
        $prevCalvStmt->execute([$cowId]);
        $prevCalv = $prevCalvStmt->fetch();
        $calvingInterval = null;
        if ($prevCalv) {
            $d1 = new DateTime($prevCalv['calving_date']);
            $d2 = new DateTime($calvingDate);
            $calvingInterval = $d1->diff($d2)->days;
        }

        // Insert calving record
        $insertCalv = $db->prepare("
            INSERT INTO calving_records (cow_id, calving_date, calving_type, calf_tag_number, calf_sex, birth_weight, post_calving_problems)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $insertCalv->execute([$cowId, $calvingDate, $calvingType, $calfTag, $calfSex, $birthWeight, $problems]);

        // Update mother cow: parity + 1, reproductive_status = 'Fresh'
        $updateMother = $db->prepare("
            UPDATE cows SET parity = parity + 1, reproductive_status = 'Fresh' WHERE id = ?
        ");
        $updateMother->execute([$cowId]);

        // Mark latest AI record as actual calving date
        $updateAi = $db->prepare("
            UPDATE ai_records SET actual_calving_date = ?, calving_interval = ? 
            WHERE cow_id = ? AND pregnancy_result = 'Positive' AND actual_calving_date IS NULL
            ORDER BY ai_date DESC LIMIT 1
        ");
        $updateAi->execute([$calvingDate, $calvingInterval, $cowId]);

        // Automatically register the new calf into herd if tag doesn't exist
        $checkCalf = $db->prepare("SELECT id FROM cows WHERE tag_number = ?");
        $checkCalf->execute([$calfTag]);
        if (!$checkCalf->fetch()) {
            $calfName = "Calf of {$mother['name']}";
            $calfBreed = $mother['breed'];
            $insertCalf = $db->prepare("
                INSERT INTO cows (tag_number, name, breed, date_of_birth, source, parity, reproductive_status, photo_url)
                VALUES (?, ?, ?, ?, 'born on farm', 0, 'Open', 'assets/calf_default.jpg')
            ");
            $insertCalf->execute([$calfTag, $calfName, $calfBreed, $calvingDate]);
        }

        jsonResponse([
            'message' => 'Calving recorded successfully! Mother status updated to Fresh, and newborn calf registered.',
            'calf_tag' => $calfTag,
            'calving_interval' => $calvingInterval
        ], 201);
    }
}
