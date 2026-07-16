<?php
// backend/get_sales_analysis.php

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

$event_id = $_GET['event_id'] ?? null;
if (!$event_id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID de evento requerido.']);
    exit();
}

try {
    // Verificar que el evento pertenece al organizador
    $stmtCheck = $pdo->prepare("SELECT title FROM EVENTS WHERE event_id = ? AND organizer_id = ?");
    $stmtCheck->execute([$event_id, $user['id']]);
    $eventInfo = $stmtCheck->fetch();
    
    if (!$eventInfo) {
        http_response_code(403);
        echo json_encode(['error' => 'Evento no encontrado o no te pertenece.']);
        exit();
    }

    // Análisis por tipo de ticket
    $sqlTickets = "
        SELECT 
            tt.ticket_type_id, tt.ticket_type_name, tt.price, tt.quantity_total,
            SUM(CASE WHEN o.order_status = 'confirmed' THEN oi.quantity ELSE 0 END) as quantity_sold,
            SUM(CASE WHEN o.order_status = 'confirmed' THEN oi.subtotal ELSE 0 END) as revenue,
            (SELECT COUNT(*) FROM TICKETS t JOIN ORDERS o2 ON t.order_id = o2.order_id WHERE t.ticket_type_id = tt.ticket_type_id AND o2.event_id = :event_id_2 AND t.checked_in_at IS NOT NULL) as quantity_checked_in
        FROM TICKET_TYPES tt
        JOIN CATEGORIES c ON tt.category_id = c.category_id
        LEFT JOIN ORDER_ITEMS oi ON tt.ticket_type_id = oi.ticket_type_id
        LEFT JOIN ORDERS o ON oi.order_id = o.order_id
        WHERE c.event_id = :event_id_1
        GROUP BY tt.ticket_type_id, tt.ticket_type_name, tt.price, tt.quantity_total
    ";
    
    $stmtTickets = $pdo->prepare($sqlTickets);
    $stmtTickets->execute([':event_id_1' => $event_id, ':event_id_2' => $event_id]);
    $ticket_analysis = $stmtTickets->fetchAll();

    // Total General del Evento
    $total_revenue = 0;
    $total_sold = 0;
    $total_capacity = 0;
    $total_checked_in = 0;
    foreach($ticket_analysis as $t) {
        $total_revenue += (float)$t['revenue'];
        $total_sold += (int)$t['quantity_sold'];
        $total_capacity += (int)$t['quantity_total'];
        $total_checked_in += (int)$t['quantity_checked_in'];
    }

    echo json_encode([
        'event_title' => $eventInfo['title'],
        'total_revenue' => $total_revenue,
        'total_sold' => $total_sold,
        'total_capacity' => $total_capacity,
        'total_checked_in' => $total_checked_in,
        'ticket_types' => $ticket_analysis
    ]);
    
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener análisis de ventas', 'details' => $e->getMessage()]);
}
?>
