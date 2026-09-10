<?php
// api/thi.php - Heat Stress Monitoring & THI (Temperature Humidity Index)
require_once __DIR__ . '/db.php';
$db = getDb();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function calculateTHI(float $tempC, float $humidity): array {
    // THI = (0.8 * T) + (RH/100 * (T - 14.4)) + 46.4
    $thi = round((0.8 * $tempC) + (($humidity / 100) * ($tempC - 14.4)) + 46.4, 1);
    
    if ($thi < 72) {
        $level = 'Normal';
        $advice = 'Comfort zone. Optimal milk production and cow activity.';
        $color = 'success';
    } elseif ($thi <= 78) {
        $level = 'Mild Stress';
        $advice = 'Mild heat stress. Cows reduce intake slightly. Provide ample cool water and airflow.';
        $color = 'warning';
    } elseif ($thi <= 88) {
        $level = 'Moderate Stress';
        $advice = 'Moderate stress. Milk drop expected. Turn on barn fans and misting systems immediately.';
        $color = 'danger';
    } else {
        $level = 'Severe Stress';
        $advice = 'Severe heat danger! Heavy panting and critical milk loss. Immediate active cooling required.';
        $color = 'emergency';
    }

    return [
        'thi' => $thi,
        'level' => $level,
        'advice' => $advice,
        'color' => $color
    ];
}

if ($method === 'GET') {
    // Return latest THI records
    $records = $db->query("SELECT * FROM thi_records ORDER BY recorded_at DESC LIMIT 20")->fetchAll();
    
    // Default current reading
    $latest = !empty($records) ? $records[0] : null;

    jsonResponse([
        'latest' => $latest,
        'history' => $records
    ]);
}

if ($method === 'POST') {
    $data = getJsonInput();
    $temp = (float)($data['temperature'] ?? 28.0);
    $humidity = (float)($data['humidity'] ?? 65.0);
    $notes = trim($data['notes'] ?? '');

    $res = calculateTHI($temp, $humidity);

    $insert = $db->prepare("
        INSERT INTO thi_records (recorded_at, temperature, humidity, thi_value, stress_level, notes)
        VALUES (NOW(), ?, ?, ?, ?, ?)
    ");
    $insert->execute([$temp, $humidity, $res['thi'], $res['level'], $notes]);

    jsonResponse([
        'message' => 'THI reading recorded successfully!',
        'temperature' => $temp,
        'humidity' => $humidity,
        'thi' => $res['thi'],
        'stress_level' => $res['level'],
        'advisory' => $res['advice'],
        'color' => $res['color']
    ], 201);
}
