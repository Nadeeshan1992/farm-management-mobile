<?php
// api/alerts.php - Unified Farm Notifications & Alerts Center
require_once __DIR__ . '/db.php';
$db = getDb();

$category = $_GET['category'] ?? 'all';
$alerts = [];

// 1. Possible Heat (Yellow Alerts)
$heats = $db->query("
    SELECT h.id, h.cow_id, h.detection_date, h.detection_time, h.status, h.notes,
           c.tag_number, c.name, c.breed
    FROM heat_records h 
    JOIN cows c ON h.cow_id = c.id
    WHERE h.status = 'Possible Heat'
    ORDER BY h.detection_date DESC, h.detection_time DESC
")->fetchAll();

foreach ($heats as $h) {
    $alerts[] = [
        'category' => 'possible_heat',
        'badge' => 'Possible Heat',
        'badge_class' => 'badge-yellow',
        'cow_id' => $h['cow_id'],
        'tag_number' => $h['tag_number'],
        'title' => "Possible Heat: Cow {$h['tag_number']} ({$h['name']})",
        'message' => "Observed on {$h['detection_date']} at " . substr($h['detection_time'], 0, 5) . ". Note: " . ($h['notes'] ?: 'Signs of estrus detected.'),
        'action_label' => 'Log AI Breeding',
        'action_type' => 'breeding',
        'date' => $h['detection_date']
    ];
}

// 2. AI / Breeding Reminder (Red Alerts)
$aiReminders = $db->query("
    SELECT h.id, h.cow_id, h.detection_date, h.detection_time, h.notes,
           c.tag_number, c.name, c.breed
    FROM heat_records h 
    JOIN cows c ON h.cow_id = c.id
    WHERE h.status = 'AI Reminder'
    ORDER BY h.detection_date DESC
")->fetchAll();

foreach ($aiReminders as $a) {
    $alerts[] = [
        'category' => 'ai_breeding_reminder',
        'badge' => 'AI Due (Red)',
        'badge_class' => 'badge-red',
        'cow_id' => $a['cow_id'],
        'tag_number' => $a['tag_number'],
        'title' => "AI Breeding Reminder: Cow {$a['tag_number']} ({$a['name']})",
        'message' => "Recommended Breeding window active! Inseminate within 12-18 hours of estrus.",
        'action_label' => 'Perform AI Now',
        'action_type' => 'breeding',
        'date' => $a['detection_date']
    ];
}

// 3. Pregnancy Check Reminder
$pregChecks = $db->query("
    SELECT a.id, a.cow_id, a.ai_date, a.pregnancy_check_date, a.ai_technician,
           c.tag_number, c.name
    FROM ai_records a 
    JOIN cows c ON a.cow_id = c.id
    WHERE a.pregnancy_result = 'Pending'
    ORDER BY a.pregnancy_check_date ASC
")->fetchAll();

foreach ($pregChecks as $p) {
    $alerts[] = [
        'category' => 'pregnancy_check',
        'badge' => 'Pregnancy Check Due',
        'badge_class' => 'badge-blue',
        'cow_id' => $p['cow_id'],
        'tag_number' => $p['tag_number'],
        'title' => "Cow ID {$p['tag_number']} - Pregnancy check due",
        'message' => "Inseminated on {$p['ai_date']} by {$p['ai_technician']}. Vet pregnancy test is due ({$p['pregnancy_check_date']}).",
        'action_label' => 'Confirm Result',
        'action_type' => 'confirm_preg',
        'ai_id' => $p['id'],
        'date' => $p['pregnancy_check_date']
    ];
}

// 4. Expected Calving Reminder
$calvings = $db->query("
    SELECT a.id, a.cow_id, a.expected_calving_date, a.ai_date,
           c.tag_number, c.name, DATEDIFF(a.expected_calving_date, CURDATE()) as days_left
    FROM ai_records a 
    JOIN cows c ON a.cow_id = c.id
    WHERE a.pregnancy_result = 'Positive' 
    AND a.actual_calving_date IS NULL
    AND a.expected_calving_date <= DATE_ADD(CURDATE(), INTERVAL 21 DAY)
    ORDER BY a.expected_calving_date ASC
")->fetchAll();

foreach ($calvings as $calv) {
    $alerts[] = [
        'category' => 'expected_calving',
        'badge' => 'Calving Approaching',
        'badge_class' => 'badge-purple',
        'cow_id' => $calv['cow_id'],
        'tag_number' => $calv['tag_number'],
        'title' => "Cow ID {$calv['tag_number']} - Expected calving approaching",
        'message' => "Due in {$calv['days_left']} days on {$calv['expected_calving_date']}. Move cow to maternity stall.",
        'action_label' => 'Record Calving',
        'action_type' => 'calving',
        'date' => $calv['expected_calving_date']
    ];
}

// 5. Vaccination Reminder
$vaxes = $db->query("
    SELECT v.id, v.cow_id, v.vaccine_name, v.next_vaccination_date, v.status,
           c.tag_number, c.name
    FROM vaccination_records v 
    JOIN cows c ON v.cow_id = c.id
    WHERE v.status IN ('Due', 'Overdue') 
    OR v.next_vaccination_date <= DATE_ADD(CURDATE(), INTERVAL 14 DAY)
    ORDER BY v.next_vaccination_date ASC
")->fetchAll();

foreach ($vaxes as $v) {
    $alerts[] = [
        'category' => 'vaccination',
        'badge' => 'Vaccination Due',
        'badge_class' => 'badge-teal',
        'cow_id' => $v['cow_id'],
        'tag_number' => $v['tag_number'],
        'title' => "Vaccination due for Cow ID {$v['tag_number']}.",
        'message' => "Schedule {$v['vaccine_name']} injection before {$v['next_vaccination_date']}.",
        'action_label' => 'Record Dose',
        'action_type' => 'vaccine',
        'date' => $v['next_vaccination_date']
    ];
}

// 6. Treatment Follow-Up
$treatments = $db->query("
    SELECT h.id, h.cow_id, h.disease, h.start_date, h.end_date, h.veterinary_visit, h.recovery_status,
           c.tag_number, c.name
    FROM health_records h 
    JOIN cows c ON h.cow_id = c.id
    WHERE h.recovery_status IN ('Active', 'In Treatment')
    ORDER BY h.record_date DESC
")->fetchAll();

foreach ($treatments as $t) {
    $alerts[] = [
        'category' => 'treatment_follow_up',
        'badge' => 'Treatment Follow-up',
        'badge_class' => 'badge-orange',
        'cow_id' => $t['cow_id'],
        'tag_number' => $t['tag_number'],
        'title' => "Treatment Follow-up: Cow {$t['tag_number']} ({$t['disease']})",
        'message' => "Ongoing care since {$t['start_date']}. Vet: {$t['veterinary_visit']}. Status: {$t['recovery_status']}.",
        'action_label' => 'Update Status',
        'action_type' => 'health',
        'record_id' => $t['id'],
        'date' => $t['start_date']
    ];
}

// 7. Unusual Milk Decrease (>15% Drop)
$milkDrops = $db->query("
    SELECT m.id, m.cow_id, m.record_date, m.morning_yield, m.evening_yield, m.total_yield, m.yesterday_yield, m.drop_percentage,
           c.tag_number, c.name
    FROM milk_records m 
    JOIN cows c ON m.cow_id = c.id
    WHERE m.drop_percentage >= 15.0
    ORDER BY m.record_date DESC
")->fetchAll();

foreach ($milkDrops as $m) {
    $alerts[] = [
        'category' => 'milk_decrease',
        'badge' => 'Unusual Milk Drop',
        'badge_class' => 'badge-red',
        'cow_id' => $m['cow_id'],
        'tag_number' => $m['tag_number'],
        'title' => "Unusual milk decrease: Cow {$m['tag_number']} ({$m['name']})",
        'message' => "Yesterday: {$m['yesterday_yield']} L -> Today: {$m['total_yield']} L (Decreased by {$m['drop_percentage']}%). Possible mastitis or heat stress.",
        'action_label' => 'Check Health',
        'action_type' => 'health_check',
        'date' => $m['record_date']
    ];
}

if ($category !== 'all') {
    $alerts = array_values(array_filter($alerts, function($a) use ($category) {
        return $a['category'] === $category;
    }));
}

jsonResponse([
    'total_alerts' => count($alerts),
    'alerts' => $alerts
]);
