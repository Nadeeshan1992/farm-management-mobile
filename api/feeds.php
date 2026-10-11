<?php
// api/feeds.php - Dairy Feed Nutrient Calculation Module API
require_once __DIR__ . '/db.php';
$db = getDb();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $action = $_GET['action'] ?? '';

    // 1. Get single ingredient
    if ($action === 'get_ingredient') {
        $id = (int)($_GET['id'] ?? 0);
        $stmt = $db->prepare("SELECT * FROM feeds WHERE id = ?");
        $stmt->execute([$id]);
        $feed = $stmt->fetch();
        if (!$feed) {
            jsonResponse(['error' => 'Feed ingredient not found'], 404);
        }
        jsonResponse($feed);
    }

    // 2. Get single feed log with breakdown items
    if ($action === 'get_log') {
        $id = (int)($_GET['id'] ?? 0);
        $stmt = $db->prepare("
            SELECT l.*, c.tag_number, c.name as cow_name, c.breed 
            FROM daily_feed_logs l 
            JOIN cows c ON l.cow_id = c.id 
            WHERE l.id = ?
        ");
        $stmt->execute([$id]);
        $log = $stmt->fetch();
        if (!$log) {
            jsonResponse(['error' => 'Feed log not found'], 404);
        }

        $itemStmt = $db->prepare("SELECT * FROM daily_feed_items WHERE feed_log_id = ? ORDER BY id ASC");
        $itemStmt->execute([$id]);
        $log['items'] = $itemStmt->fetchAll();

        jsonResponse($log);
    }

    // 3. List logs with optional cow_id or date filter
    if ($action === 'list_logs') {
        $cowId = isset($_GET['cow_id']) ? (int)$_GET['cow_id'] : 0;
        $date = trim($_GET['date'] ?? '');
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;

        $query = "
            SELECT l.*, c.tag_number, c.name as cow_name, c.breed 
            FROM daily_feed_logs l 
            JOIN cows c ON l.cow_id = c.id 
            WHERE 1=1
        ";
        $params = [];

        if ($cowId > 0) {
            $query .= " AND l.cow_id = ?";
            $params[] = $cowId;
        }

        if (!empty($date)) {
            $query .= " AND l.log_date = ?";
            $params[] = $date;
        }

        $query .= " ORDER BY l.log_date DESC, l.id DESC LIMIT " . (int)$limit;
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $logs = $stmt->fetchAll();

        // Attach items for each log if requested
        if (isset($_GET['with_items']) && $_GET['with_items'] == '1') {
            foreach ($logs as &$log) {
                $iStmt = $db->prepare("SELECT * FROM daily_feed_items WHERE feed_log_id = ? ORDER BY id ASC");
                $iStmt->execute([$log['id']]);
                $log['items'] = $iStmt->fetchAll();
            }
        }

        jsonResponse(['logs' => $logs]);
    }

    // 4. Default or list_ingredients: list all feed ingredients & recent logs
    $feedStmt = $db->query("SELECT * FROM feeds ORDER BY category ASC, name ASC");
    $feeds = $feedStmt->fetchAll();

    if ($action === 'list_ingredients') {
        jsonResponse(['feeds' => $feeds]);
    }

    // Default dashboard response
    $recentStmt = $db->query("
        SELECT l.*, c.tag_number, c.name as cow_name, c.breed 
        FROM daily_feed_logs l 
        JOIN cows c ON l.cow_id = c.id 
        ORDER BY l.log_date DESC, l.id DESC LIMIT 10
    ");
    $recentLogs = $recentStmt->fetchAll();

    jsonResponse([
        'feeds' => $feeds,
        'recent_logs' => $recentLogs
    ]);
}

if ($method === 'POST') {
    $data = getJsonInput();
    $action = $data['action'] ?? ($_GET['action'] ?? 'save_log');

    // 1. Save / Update Feed Ingredient
    if ($action === 'save_ingredient') {
        $id = (int)($data['id'] ?? 0);
        $name = trim($data['name'] ?? '');
        $category = trim($data['category'] ?? 'Forage / TMR');
        $dmPct = (float)($data['dm_pct'] ?? 0);
        $cpPct = (float)($data['cp_pct'] ?? 0);
        $fatPct = (float)($data['fat_pct'] ?? 0);
        $fiberPct = (float)($data['fiber_pct'] ?? 0);
        $ndfPct = (float)($data['ndf_pct'] ?? 0);
        $adfPct = (float)($data['adf_pct'] ?? 0);
        $starchPct = (float)($data['starch_pct'] ?? 0);
        $sugarPct = (float)($data['sugar_pct'] ?? 0);
        $ashPct = (float)($data['ash_pct'] ?? 0);
        $caPct = (float)($data['ca_pct'] ?? 0);
        $pPct = (float)($data['p_pct'] ?? 0);
        $mgPct = (float)($data['mg_pct'] ?? 0);
        $kPct = (float)($data['k_pct'] ?? 0);
        $naPct = (float)($data['na_pct'] ?? 0);
        $sPct = (float)($data['s_pct'] ?? 0);
        $meMj = (float)($data['me_mj'] ?? 0);
        $nelMj = (float)($data['nel_mj'] ?? 0);
        $notes = trim($data['notes'] ?? '');

        if (empty($name)) {
            jsonResponse(['error' => 'Feed name is required.'], 422);
        }
        if ($dmPct <= 0 || $dmPct > 100) {
            jsonResponse(['error' => 'Dry Matter (DM %) must be between 0.1% and 100%.'], 422);
        }

        if ($id > 0) {
            // Check uniqueness for other rows
            $chk = $db->prepare("SELECT id FROM feeds WHERE name = ? AND id != ?");
            $chk->execute([$name, $id]);
            if ($chk->fetch()) {
                jsonResponse(['error' => "A feed named '{$name}' already exists."], 422);
            }

            $upd = $db->prepare("
                UPDATE feeds SET 
                    name = ?, category = ?, dm_pct = ?, cp_pct = ?, fat_pct = ?, 
                    fiber_pct = ?, ndf_pct = ?, adf_pct = ?, starch_pct = ?, sugar_pct = ?, 
                    ash_pct = ?, ca_pct = ?, p_pct = ?, mg_pct = ?, k_pct = ?, 
                    na_pct = ?, s_pct = ?, me_mj = ?, nel_mj = ?, notes = ?
                WHERE id = ?
            ");
            $upd->execute([
                $name, $category, $dmPct, $cpPct, $fatPct, 
                $fiberPct, $ndfPct, $adfPct, $starchPct, $sugarPct, 
                $ashPct, $caPct, $pPct, $mgPct, $kPct, 
                $naPct, $sPct, $meMj, $nelMj, $notes, $id
            ]);
            $feedId = $id;
            $msg = 'Feed ingredient updated successfully.';
        } else {
            // Insert
            $chk = $db->prepare("SELECT id FROM feeds WHERE name = ?");
            $chk->execute([$name]);
            if ($chk->fetch()) {
                jsonResponse(['error' => "A feed named '{$name}' already exists."], 422);
            }

            $ins = $db->prepare("
                INSERT INTO feeds (
                    name, category, dm_pct, cp_pct, fat_pct, 
                    fiber_pct, ndf_pct, adf_pct, starch_pct, sugar_pct, 
                    ash_pct, ca_pct, p_pct, mg_pct, k_pct, 
                    na_pct, s_pct, me_mj, nel_mj, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $ins->execute([
                $name, $category, $dmPct, $cpPct, $fatPct, 
                $fiberPct, $ndfPct, $adfPct, $starchPct, $sugarPct, 
                $ashPct, $caPct, $pPct, $mgPct, $kPct, 
                $naPct, $sPct, $meMj, $nelMj, $notes
            ]);
            $feedId = (int)$db->lastInsertId();
            $msg = 'Feed ingredient added successfully.';
        }

        $resStmt = $db->prepare("SELECT * FROM feeds WHERE id = ?");
        $resStmt->execute([$feedId]);
        jsonResponse(['success' => true, 'message' => $msg, 'feed' => $resStmt->fetch()]);
    }

    // 2. Delete Feed Ingredient
    if ($action === 'delete_ingredient') {
        $id = (int)($data['id'] ?? 0);
        if ($id <= 0) {
            jsonResponse(['error' => 'Invalid feed ingredient ID.'], 422);
        }
        $del = $db->prepare("DELETE FROM feeds WHERE id = ?");
        $del->execute([$id]);
        jsonResponse(['success' => true, 'message' => 'Feed ingredient deleted successfully.']);
    }

    // 3. Delete Daily Feed Log
    if ($action === 'delete_log') {
        $id = (int)($data['id'] ?? 0);
        if ($id <= 0) {
            jsonResponse(['error' => 'Invalid log ID.'], 422);
        }
        $del = $db->prepare("DELETE FROM daily_feed_logs WHERE id = ?");
        $del->execute([$id]);
        jsonResponse(['success' => true, 'message' => 'Daily feed log deleted successfully.']);
    }

    // 4. Save Daily Feed Log & Perform Nutrient Calculations
    if ($action === 'save_log') {
        $logId = (int)($data['id'] ?? 0);
        $cowId = (int)($data['cow_id'] ?? 0);
        $logDate = trim($data['log_date'] ?? date('Y-m-d'));
        $notes = trim($data['notes'] ?? '');
        $items = $data['items'] ?? [];

        if ($cowId <= 0) {
            jsonResponse(['error' => 'Please select a cow.'], 422);
        }
        if (empty($logDate)) {
            $logDate = date('Y-m-d');
        }
        if (empty($items) || !is_array($items)) {
            jsonResponse(['error' => 'Please add at least one feed item with a valid quantity.'], 422);
        }

        // Fetch feed nutritional compositions from DB
        $allFeedsStmt = $db->query("SELECT * FROM feeds");
        $feedLibrary = [];
        while ($row = $allFeedsStmt->fetch()) {
            $feedLibrary[$row['id']] = $row;
            $feedLibrary[strtolower($row['name'])] = $row;
        }

        // Calculation accumulators
        $totalAsFed = 0.0;
        $totalDm = 0.0;
        $totalCp = 0.0;
        $totalFat = 0.0;
        $totalFiber = 0.0;
        $totalNdf = 0.0;
        $totalAdf = 0.0;
        $totalStarch = 0.0;
        $totalSugar = 0.0;
        $totalAsh = 0.0;
        $totalCa = 0.0;
        $totalP = 0.0;
        $totalMg = 0.0;
        $totalK = 0.0;
        $totalNa = 0.0;
        $totalS = 0.0;
        $totalMe = 0.0;
        $totalNel = 0.0;

        $processedItems = [];

        foreach ($items as $item) {
            $feedId = !empty($item['feed_id']) ? (int)$item['feed_id'] : null;
            $amountAsFed = (float)($item['amount_as_fed_kg'] ?? 0);

            if ($amountAsFed <= 0) {
                continue; // Skip zero/negative rows
            }

            // Find composition
            $feedData = null;
            if ($feedId && isset($feedLibrary[$feedId])) {
                $feedData = $feedLibrary[$feedId];
            } elseif (!empty($item['feed_name']) && isset($feedLibrary[strtolower(trim($item['feed_name']))])) {
                $feedData = $feedLibrary[strtolower(trim($item['feed_name']))];
                $feedId = (int)$feedData['id'];
            }

            $feedName = $feedData ? $feedData['name'] : trim($item['feed_name'] ?? 'Custom Feed');
            // Farmer-entered DM% takes priority, falling back to database feed DM%
            $dmPct = (isset($item['dm_pct']) && is_numeric($item['dm_pct']) && (float)$item['dm_pct'] > 0)
                ? (float)$item['dm_pct']
                : ($feedData ? (float)$feedData['dm_pct'] : 90.0);
            $cpPct = $feedData ? (float)$feedData['cp_pct'] : (float)($item['cp_pct'] ?? 0.0);
            $fatPct = $feedData ? (float)$feedData['fat_pct'] : (float)($item['fat_pct'] ?? 0.0);
            $fiberPct = $feedData ? (float)$feedData['fiber_pct'] : (float)($item['fiber_pct'] ?? 0.0);
            $ndfPct = $feedData ? (float)$feedData['ndf_pct'] : (float)($item['ndf_pct'] ?? 0.0);
            $adfPct = $feedData ? (float)$feedData['adf_pct'] : (float)($item['adf_pct'] ?? 0.0);
            $starchPct = $feedData ? (float)$feedData['starch_pct'] : (float)($item['starch_pct'] ?? 0.0);
            $sugarPct = $feedData ? (float)$feedData['sugar_pct'] : (float)($item['sugar_pct'] ?? 0.0);
            $ashPct = $feedData ? (float)$feedData['ash_pct'] : (float)($item['ash_pct'] ?? 0.0);
            $caPct = $feedData ? (float)$feedData['ca_pct'] : (float)($item['ca_pct'] ?? 0.0);
            $pPct = $feedData ? (float)$feedData['p_pct'] : (float)($item['p_pct'] ?? 0.0);
            $mgPct = $feedData ? (float)$feedData['mg_pct'] : (float)($item['mg_pct'] ?? 0.0);
            $kPct = $feedData ? (float)$feedData['k_pct'] : (float)($item['k_pct'] ?? 0.0);
            $naPct = $feedData ? (float)$feedData['na_pct'] : (float)($item['na_pct'] ?? 0.0);
            $sPct = $feedData ? (float)$feedData['s_pct'] : (float)($item['s_pct'] ?? 0.0);
            $meMj = $feedData ? (float)$feedData['me_mj'] : (float)($item['me_mj'] ?? 0.0);
            $nelMj = $feedData ? (float)$feedData['nel_mj'] : (float)($item['nel_mj'] ?? 0.0);

            // Calculations:
            // 1. Dry Matter Intake (kg) = Feed Amount * DM% / 100
            $dmIntakeKg = round($amountAsFed * ($dmPct / 100), 3);

            // 2. Nutrients (% DM): Intake (kg) = DM Intake * Nutrient% / 100
            $cpIntakeKg = round($dmIntakeKg * ($cpPct / 100), 3);
            $fatIntakeKg = round($dmIntakeKg * ($fatPct / 100), 3);
            $fiberIntakeKg = round($dmIntakeKg * ($fiberPct / 100), 3);
            $ndfIntakeKg = round($dmIntakeKg * ($ndfPct / 100), 3);
            $adfIntakeKg = round($dmIntakeKg * ($adfPct / 100), 3);
            $starchIntakeKg = round($dmIntakeKg * ($starchPct / 100), 3);
            $sugarIntakeKg = round($dmIntakeKg * ($sugarPct / 100), 3);
            $ashIntakeKg = round($dmIntakeKg * ($ashPct / 100), 3);

            // 3. Minerals (Ca, P, Mg, K, Na, S): Mineral Intake (g) = DM Intake * Mineral% / 100 * 1000
            $caIntakeG = round($dmIntakeKg * ($caPct / 100) * 1000, 2);
            $pIntakeG = round($dmIntakeKg * ($pPct / 100) * 1000, 2);
            $mgIntakeG = round($dmIntakeKg * ($mgPct / 100) * 1000, 2);
            $kIntakeG = round($dmIntakeKg * ($kPct / 100) * 1000, 2);
            $naIntakeG = round($dmIntakeKg * ($naPct / 100) * 1000, 2);
            $sIntakeG = round($dmIntakeKg * ($sPct / 100) * 1000, 2);

            // 4. Energy (ME, NEL): Intake (MJ) = DM Intake * Energy (MJ/kg DM)
            $meIntakeMj = round($dmIntakeKg * $meMj, 2);
            $nelIntakeMj = round($dmIntakeKg * $nelMj, 2);

            // Accumulate
            $totalAsFed += $amountAsFed;
            $totalDm += $dmIntakeKg;
            $totalCp += $cpIntakeKg;
            $totalFat += $fatIntakeKg;
            $totalFiber += $fiberIntakeKg;
            $totalNdf += $ndfIntakeKg;
            $totalAdf += $adfIntakeKg;
            $totalStarch += $starchIntakeKg;
            $totalSugar += $sugarIntakeKg;
            $totalAsh += $ashIntakeKg;
            $totalCa += $caIntakeG;
            $totalP += $pIntakeG;
            $totalMg += $mgIntakeG;
            $totalK += $kIntakeG;
            $totalNa += $naIntakeG;
            $totalS += $sIntakeG;
            $totalMe += $meIntakeMj;
            $totalNel += $nelIntakeMj;

            $processedItems[] = [
                'feed_id' => $feedId,
                'feed_name' => $feedName,
                'amount_as_fed_kg' => round($amountAsFed, 2),
                'dm_pct' => round($dmPct, 2),
                'dm_intake_kg' => round($dmIntakeKg, 2),
                'cp_intake_kg' => round($cpIntakeKg, 3),
                'fat_intake_kg' => round($fatIntakeKg, 3),
                'fiber_intake_kg' => round($fiberIntakeKg, 3),
                'ndf_intake_kg' => round($ndfIntakeKg, 3),
                'adf_intake_kg' => round($adfIntakeKg, 3),
                'starch_intake_kg' => round($starchIntakeKg, 3),
                'sugar_intake_kg' => round($sugarIntakeKg, 3),
                'ash_intake_kg' => round($ashIntakeKg, 3),
                'ca_intake_g' => round($caIntakeG, 2),
                'p_intake_g' => round($pIntakeG, 2),
                'mg_intake_g' => round($mgIntakeG, 2),
                'k_intake_g' => round($kIntakeG, 2),
                'na_intake_g' => round($naIntakeG, 2),
                's_intake_g' => round($sIntakeG, 2),
                'me_intake_mj' => round($meIntakeMj, 2),
                'nel_intake_mj' => round($nelIntakeMj, 2)
            ];
        }

        if (empty($processedItems)) {
            jsonResponse(['error' => 'Please enter valid non-zero amounts for feeds.'], 422);
        }

        // Database transaction
        $db->beginTransaction();
        try {
            if ($logId > 0) {
                // Update existing
                $upd = $db->prepare("
                    UPDATE daily_feed_logs SET 
                        cow_id = ?, log_date = ?, 
                        total_as_fed_kg = ?, total_dm_kg = ?, total_cp_kg = ?, total_fat_kg = ?, 
                        total_fiber_kg = ?, total_ndf_kg = ?, total_adf_kg = ?, total_starch_kg = ?, 
                        total_sugar_kg = ?, total_ash_kg = ?, total_ca_g = ?, total_p_g = ?, 
                        total_mg_g = ?, total_k_g = ?, total_na_g = ?, total_s_g = ?, 
                        total_me_mj = ?, total_nel_mj = ?, notes = ?
                    WHERE id = ?
                ");
                $upd->execute([
                    $cowId, $logDate,
                    round($totalAsFed, 2), round($totalDm, 2), round($totalCp, 3), round($totalFat, 3),
                    round($totalFiber, 3), round($totalNdf, 3), round($totalAdf, 3), round($totalStarch, 3),
                    round($totalSugar, 3), round($totalAsh, 3), round($totalCa, 2), round($totalP, 2),
                    round($totalMg, 2), round($totalK, 2), round($totalNa, 2), round($totalS, 2),
                    round($totalMe, 2), round($totalNel, 2), $notes, $logId
                ]);

                // Clear previous line items
                $delItems = $db->prepare("DELETE FROM daily_feed_items WHERE feed_log_id = ?");
                $delItems->execute([$logId]);
                $savedLogId = $logId;
            } else {
                // Insert new
                $ins = $db->prepare("
                    INSERT INTO daily_feed_logs (
                        cow_id, log_date, total_as_fed_kg, total_dm_kg, total_cp_kg, total_fat_kg, 
                        total_fiber_kg, total_ndf_kg, total_adf_kg, total_starch_kg, total_sugar_kg, 
                        total_ash_kg, total_ca_g, total_p_g, total_mg_g, total_k_g, total_na_g, 
                        total_s_g, total_me_mj, total_nel_mj, notes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $ins->execute([
                    $cowId, $logDate,
                    round($totalAsFed, 2), round($totalDm, 2), round($totalCp, 3), round($totalFat, 3),
                    round($totalFiber, 3), round($totalNdf, 3), round($totalAdf, 3), round($totalStarch, 3),
                    round($totalSugar, 3), round($totalAsh, 3), round($totalCa, 2), round($totalP, 2),
                    round($totalMg, 2), round($totalK, 2), round($totalNa, 2), round($totalS, 2),
                    round($totalMe, 2), round($totalNel, 2), $notes
                ]);
                $savedLogId = (int)$db->lastInsertId();
            }

            // Insert line items
            $itemIns = $db->prepare("
                INSERT INTO daily_feed_items (
                    feed_log_id, feed_id, feed_name, amount_as_fed_kg, dm_pct, dm_intake_kg, 
                    cp_intake_kg, fat_intake_kg, fiber_intake_kg, ndf_intake_kg, adf_intake_kg, 
                    starch_intake_kg, sugar_intake_kg, ash_intake_kg, ca_intake_g, p_intake_g, 
                    mg_intake_g, k_intake_g, na_intake_g, s_intake_g, me_intake_mj, nel_intake_mj
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");

            foreach ($processedItems as $pi) {
                $itemIns->execute([
                    $savedLogId, $pi['feed_id'], $pi['feed_name'], $pi['amount_as_fed_kg'], $pi['dm_pct'], $pi['dm_intake_kg'],
                    $pi['cp_intake_kg'], $pi['fat_intake_kg'], $pi['fiber_intake_kg'], $pi['ndf_intake_kg'], $pi['adf_intake_kg'],
                    $pi['starch_intake_kg'], $pi['sugar_intake_kg'], $pi['ash_intake_kg'], $pi['ca_intake_g'], $pi['p_intake_g'],
                    $pi['mg_intake_g'], $pi['k_intake_g'], $pi['na_intake_g'], $pi['s_intake_g'], $pi['me_intake_mj'], $pi['nel_intake_mj']
                ]);
            }

            $db->commit();

            // Fetch newly saved log with items
            $fetchStmt = $db->prepare("
                SELECT l.*, c.tag_number, c.name as cow_name, c.breed 
                FROM daily_feed_logs l 
                JOIN cows c ON l.cow_id = c.id 
                WHERE l.id = ?
            ");
            $fetchStmt->execute([$savedLogId]);
            $savedRecord = $fetchStmt->fetch();

            $fetchItems = $db->prepare("SELECT * FROM daily_feed_items WHERE feed_log_id = ? ORDER BY id ASC");
            $fetchItems->execute([$savedLogId]);
            $savedRecord['items'] = $fetchItems->fetchAll();

            jsonResponse([
                'success' => true,
                'message' => 'Daily feed ration calculated and saved successfully.',
                'log' => $savedRecord
            ]);

        } catch (Exception $e) {
            $db->rollBack();
            jsonResponse(['error' => 'Failed to save feed log: ' . $e->getMessage()], 500);
        }
    }

    jsonResponse(['error' => 'Unknown action.'], 400);
}
