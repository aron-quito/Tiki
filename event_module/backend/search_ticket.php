<?php
// backend/search_ticket.php

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
$query = $_GET['q'] ?? '';

if (!$event_id) {
    echo json_encode(['results' => []]);
    exit();
}

try {
    if (empty(trim($query))) {
        // Default to latest 10 tickets
        $sqlSearch = "
            SELECT 
                t.ticket_id, t.ticket_number, t.tickets_status, t.checked_in_at,
                tt.ticket_type_name, 
                c.email as customer_email, c.first_name, c.last_name,
                o.order_number, o.created_at as purchase_date
            FROM TICKETS t
            JOIN ORDERS o ON t.order_id = o.order_id
            JOIN CUSTOMERS c ON o.customer_id = c.customer_id
            JOIN TICKET_TYPES tt ON t.ticket_type_id = tt.ticket_type_id
            WHERE o.event_id = :event_id
            ORDER BY t.ticket_id DESC
            LIMIT 10
        ";
        $stmtSearch = $pdo->prepare($sqlSearch);
        $stmtSearch->execute([':event_id' => $event_id]);
    } else {
        // Search query
        $sqlSearch = "
            SELECT 
                t.ticket_id, t.ticket_number, t.tickets_status, t.checked_in_at,
                tt.ticket_type_name, 
                c.email as customer_email, c.first_name, c.last_name,
                o.order_number, o.created_at as purchase_date
            FROM TICKETS t
            JOIN ORDERS o ON t.order_id = o.order_id
            JOIN CUSTOMERS c ON o.customer_id = c.customer_id
            JOIN TICKET_TYPES tt ON t.ticket_type_id = tt.ticket_type_id
            WHERE o.event_id = :event_id
            AND (c.email LIKE :q1 OR o.order_number LIKE :q2 OR t.ticket_number LIKE :q3 OR c.first_name LIKE :q4 OR t.qr_code = :exact_q)
            LIMIT 20
        ";
        
        $stmtSearch = $pdo->prepare($sqlSearch);
        $searchParam = '%' . trim($query) . '%';
        $stmtSearch->execute([
            ':event_id' => $event_id,
            ':q1' => $searchParam,
            ':q2' => $searchParam,
            ':q3' => $searchParam,
            ':q4' => $searchParam,
            ':exact_q' => trim($query)
        ]);
    }
    
    $results = $stmtSearch->fetchAll();
    
    echo json_encode(['results' => $results]);
    
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en la búsqueda', 'details' => $e->getMessage()]);
}
?>
