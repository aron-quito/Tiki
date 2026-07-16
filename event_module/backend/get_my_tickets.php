<?php
// backend/get_my_tickets.php
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
if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit();
}

try {
    // Buscar órdenes confirmadas de este cliente
    $sql = "SELECT t.ticket_id, t.ticket_number, t.qr_code, 
                   tt.ticket_type_name, tt.price,
                   o.order_number, o.confirmed_at,
                   e.title as event_title, e.event_date_start, e.venue_name, e.city, e.cover_image_url
            FROM TICKETS t
            JOIN ORDERS o ON t.order_id = o.order_id
            JOIN TICKET_TYPES tt ON t.ticket_type_id = tt.ticket_type_id
            JOIN EVENTS e ON o.event_id = e.event_id
            WHERE o.customer_id = ? AND o.order_status = 'confirmed'
            ORDER BY e.event_date_start ASC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$user['id']]);
    $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['tickets' => $tickets]);
    
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener entradas', 'details' => $e->getMessage()]);
}
?>
