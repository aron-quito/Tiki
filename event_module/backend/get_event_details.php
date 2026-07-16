<?php
// backend/get_event_details.php

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
// Authentication is optional. Public users can view published events. Organizers can view their own drafts.
$organizerId = ($user && $user['role'] === 'organizer') ? $user['id'] : null;
$eventId = $_GET['event_id'] ?? ($_GET['id'] ?? null);

if (!$eventId) {
    http_response_code(400);
    echo json_encode(['error' => 'ID de evento requerido.']);
    exit();
}

try {
    // 1. Obtener Evento
    if ($organizerId) {
        $stmt = $pdo->prepare("SELECT event_id, title, venue_name, venue_address, city, country, event_date_start, event_date_end, cover_image_url, banner_image_url, global_capacity, has_shared_capacity, event_topic, event_status, is_featured, slug FROM EVENTS WHERE event_id = ? AND organizer_id = ?");
        $stmt->execute([$eventId, $organizerId]);
    } else {
        $stmt = $pdo->prepare("SELECT event_id, title, venue_name, venue_address, city, country, event_date_start, event_date_end, cover_image_url, banner_image_url, global_capacity, has_shared_capacity, event_topic, event_status, is_featured, slug FROM EVENTS WHERE event_id = ? AND event_status = 'published'");
        $stmt->execute([$eventId]);
    }
    $event = $stmt->fetch();
    
    if (!$event) {
        http_response_code(404);
        echo json_encode(['error' => 'Evento no encontrado.']);
        exit();
    }
    
    // 2. Obtener Categorías
    $stmtCat = $pdo->prepare("SELECT category_id, category_name, total_capacity, has_shared_stages FROM CATEGORIES WHERE event_id = ?");
    $stmtCat->execute([$eventId]);
    $event['categories'] = $stmtCat->fetchAll();
    
    // 3. Obtener Fases de Venta
    $stmtStages = $pdo->prepare("SELECT * FROM SALE_STAGES WHERE event_id = ?");
    $stmtStages->execute([$eventId]);
    $event['sale_stages'] = $stmtStages->fetchAll();

    // 4. Obtener Tipos de Ticket
    $stmtTickets = $pdo->prepare("SELECT TICKET_TYPES.* FROM TICKET_TYPES 
                                  JOIN CATEGORIES ON TICKET_TYPES.category_id = CATEGORIES.category_id 
                                  WHERE CATEGORIES.event_id = ?");
    $stmtTickets->execute([$eventId]);
    $event['ticket_types'] = $stmtTickets->fetchAll();
    
    echo json_encode($event);
    
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener datos.', 'details' => $e->getMessage()]);
}
?>
