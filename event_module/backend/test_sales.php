<?php
require 'config.php';
$event_id = 1; // Assuming event_id 1
$sqlTickets = "
        SELECT 
            tt.ticket_type_id, tt.ticket_type_name, tt.price, tt.quantity_total,
            COALESCE(SUM(oi.quantity), 0) as quantity_sold,
            COALESCE(SUM(oi.subtotal), 0) as revenue,
            (SELECT COUNT(*) FROM TICKETS t JOIN ORDERS o2 ON t.order_id = o2.order_id WHERE t.ticket_type_id = tt.ticket_type_id AND o2.event_id = :event_id AND t.checked_in_at IS NOT NULL) as quantity_checked_in
        FROM TICKET_TYPES tt
        JOIN CATEGORIES c ON tt.category_id = c.category_id
        LEFT JOIN ORDER_ITEMS oi ON tt.ticket_type_id = oi.ticket_type_id
        LEFT JOIN ORDERS o ON oi.order_id = o.order_id AND o.order_status = 'confirmed'
        WHERE c.event_id = :event_id
        GROUP BY tt.ticket_type_id, tt.ticket_type_name, tt.price, tt.quantity_total
    ";
$stmt = $pdo->prepare($sqlTickets);
$stmt->execute([':event_id' => $event_id]);
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
