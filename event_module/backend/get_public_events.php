<?php
// backend/get_public_events.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

$search = $_GET['q'] ?? '';
$topic = $_GET['topic'] ?? '';

try {
    $sql = "SELECT event_id, title, slug, event_topic, event_date_start, event_date_end, venue_name, city, cover_image_url
            FROM EVENTS
            WHERE event_status = 'published'";
            
    $params = [];
    
    if ($search) {
        $sql .= " AND (title LIKE ? OR city LIKE ? OR venue_name LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    
    if ($topic) {
        $sql .= " AND event_topic = ?";
        $params[] = $topic;
    }
    
    $sql .= " ORDER BY event_date_start ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Opcional: Para cada evento podríamos traer el precio mínimo si quisiéramos mostrarlo en la tarjeta, pero omitámoslo por simplicidad.
    
    http_response_code(200);
    echo json_encode(['events' => $events]);
    
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error BD', 'details' => $e->getMessage()]);
}
?>
