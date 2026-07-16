<?php
// backend/get_dashboard_stats.php

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
    // Total Ingresos y Tickets Vendidos
    $sqlStats = "
        SELECT 
            (SELECT COALESCE(SUM(o2.total_amount), 0) FROM ORDERS o2 JOIN EVENTS e2 ON o2.event_id = e2.event_id WHERE e2.organizer_id = :org_id_1 AND o2.order_status = 'confirmed') as total_revenue,
            (SELECT COALESCE(SUM(oi2.quantity), 0) FROM ORDER_ITEMS oi2 JOIN ORDERS o3 ON oi2.order_id = o3.order_id JOIN EVENTS e3 ON o3.event_id = e3.event_id WHERE e3.organizer_id = :org_id_2 AND o3.order_status = 'confirmed') as total_tickets_sold
    ";
    
    $stmtStats = $pdo->prepare($sqlStats);
    $stmtStats->execute([':org_id_1' => $organizer_id, ':org_id_2' => $organizer_id]);
    $stats = $stmtStats->fetch();

    // Real Attendance Calculation
    // Total sold vs Total checked in
    $sqlAttendance = "
        SELECT 
            COUNT(t.ticket_id) as total_sold,
            SUM(CASE WHEN t.checked_in_at IS NOT NULL THEN 1 ELSE 0 END) as total_checked_in
        FROM TICKETS t
        JOIN ORDERS o ON t.order_id = o.order_id
        JOIN EVENTS e ON o.event_id = e.event_id
        WHERE e.organizer_id = :organizer_id AND o.order_status = 'confirmed'
    ";
    $stmtAtt = $pdo->prepare($sqlAttendance);
    $stmtAtt->execute([':organizer_id' => $organizer_id]);
    $attData = $stmtAtt->fetch();
    
    $total_sold = (int)$attData['total_sold'];
    $total_checked_in = (int)$attData['total_checked_in'];
    $average_attendance = $total_sold > 0 ? round(($total_checked_in / $total_sold) * 100, 1) : 0;
    
    // Obtenemos los últimos 5 eventos para una tabla de resumen rápido (Ventas por Evento)
    $sqlEvents = "
        SELECT 
            e.event_id, e.title, 
            (SELECT COALESCE(SUM(quantity), 0) FROM ORDER_ITEMS oi JOIN ORDERS o ON oi.order_id = o.order_id WHERE o.event_id = e.event_id AND o.order_status = 'confirmed') as tickets_sold,
            (SELECT COALESCE(SUM(total_capacity), 0) FROM CATEGORIES WHERE event_id = e.event_id) as total_capacity
        FROM EVENTS e
        WHERE e.organizer_id = :organizer_id
        ORDER BY e.created_at DESC LIMIT 5
    ";
    $stmtEvents = $pdo->prepare($sqlEvents);
    $stmtEvents->execute([':organizer_id' => $organizer_id]);
    $recentEvents = $stmtEvents->fetchAll();

    echo json_encode([
        'total_revenue' => (float)$stats['total_revenue'],
        'total_tickets_sold' => (int)$stats['total_tickets_sold'],
        'average_attendance' => $average_attendance,
        'conversion_rate' => 0, // Placeholder as page views aren't tracked
        'recent_events_progress' => $recentEvents
    ]);
    
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener estadísticas', 'details' => $e->getMessage()]);
}
?>
