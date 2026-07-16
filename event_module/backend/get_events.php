<?php
// backend/get_events.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

$user = get_auth_user();
if (!$user || $user['role'] !== 'organizer') {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit();
}

$organizer_id = $user['id'];

try {
    $sql = "SELECT event_id, title, event_date_start, event_date_end, venue_name, city, created_at, 
            CASE 
                WHEN event_status = 'published' AND event_date_end < NOW() THEN 'completed'
                ELSE event_status
            END as status
            FROM EVENTS 
            WHERE organizer_id = :organizer_id 
            ORDER BY created_at DESC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':organizer_id' => $organizer_id]);
    $events = $stmt->fetchAll();
    
    foreach ($events as &$event) {
        $sqlTiers = "SELECT SUM(total_capacity) as total_capacity FROM CATEGORIES WHERE event_id = :event_id";
        $stmtTiers = $pdo->prepare($sqlTiers);
        $stmtTiers->execute([':event_id' => $event['event_id']]);
        $tierInfo = $stmtTiers->fetch();
        $event['total_capacity'] = $tierInfo['total_capacity'] ?? 0;
    }
    
    echo json_encode(['events' => $events]);
    
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener eventos.', 'details' => $e->getMessage()]);
}
?>
