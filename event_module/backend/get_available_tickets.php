<?php
// backend/get_available_tickets.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

$eventId = $_GET['event_id'] ?? null;
if (!$eventId) {
    http_response_code(400);
    echo json_encode(['error' => 'event_id es requerido']);
    exit();
}

try {
    // 1. Get basic event capacities
    $stmt = $pdo->prepare("SELECT global_capacity, has_shared_capacity FROM EVENTS WHERE event_id = ? AND event_status = 'published'");
    $stmt->execute([$eventId]);
    $event = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$event) {
        http_response_code(404);
        echo json_encode(['error' => 'Evento no encontrado o no publicado.']);
        exit();
    }
    
    // 2. Get active tickets sold/reserved per ticket_type_id
    // An order is active if it's confirmed, or if it's pending and not expired.
    $sqlSold = "SELECT oi.ticket_type_id, SUM(oi.quantity) as sold_qty 
                FROM ORDER_ITEMS oi
                JOIN ORDERS o ON oi.order_id = o.order_id
                WHERE o.event_id = ? 
                  AND (o.order_status = 'confirmed' OR (o.order_status = 'pending' AND o.expires_at > NOW()))
                GROUP BY oi.ticket_type_id";
    $stmtSold = $pdo->prepare($sqlSold);
    $stmtSold->execute([$eventId]);
    $soldByTicketType = [];
    while ($row = $stmtSold->fetch(PDO::FETCH_ASSOC)) {
        $soldByTicketType[$row['ticket_type_id']] = (int)$row['sold_qty'];
    }
    
    // 3. Get ticket types and categories
    $stmtTickets = $pdo->prepare("SELECT tt.*, c.total_capacity as category_capacity, c.has_shared_stages 
                                  FROM TICKET_TYPES tt
                                  JOIN CATEGORIES c ON tt.category_id = c.category_id
                                  WHERE c.event_id = ?");
    $stmtTickets->execute([$eventId]);
    $ticketTypes = $stmtTickets->fetchAll(PDO::FETCH_ASSOC);
    
    // 4. Calculate available quantities
    // If has_shared_capacity is true, the entire event shares global_capacity.
    // If has_shared_stages is true, the category shares category_capacity across its stages.
    // Otherwise, each ticket_type limits itself by quantity_total.
    
    $globalSold = 0;
    $categorySold = [];
    
    foreach ($ticketTypes as $tt) {
        $qty = $soldByTicketType[$tt['ticket_type_id']] ?? 0;
        $globalSold += $qty;
        
        $catId = $tt['category_id'];
        if (!isset($categorySold[$catId])) $categorySold[$catId] = 0;
        $categorySold[$catId] += $qty;
    }
    
    $globalAvailable = $event['global_capacity'] ? max(0, $event['global_capacity'] - $globalSold) : null;
    
    $resultTickets = [];
    
    foreach ($ticketTypes as $tt) {
        $catId = $tt['category_id'];
        $soldThisType = $soldByTicketType[$tt['ticket_type_id']] ?? 0;
        
        $available = PHP_INT_MAX;
        
        // 1. Ticket Type specific limit (if not shared stages)
        if (!$tt['has_shared_stages']) {
            $available = min($available, $tt['quantity_total'] - $soldThisType);
        }
        
        // 2. Category specific limit (if not shared capacity)
        if (!$event['has_shared_capacity']) {
            $catAvail = $tt['category_capacity'] - $categorySold[$catId];
            $available = min($available, $catAvail);
        }
        
        // 3. Global limit (if shared capacity)
        if ($event['has_shared_capacity'] && $globalAvailable !== null) {
            $available = min($available, $globalAvailable);
        }
        
        // Ensure non-negative
        $available = max(0, $available);
        
        // If it's still PHP_INT_MAX, it means no limits were applied
        if ($available === PHP_INT_MAX) {
            $available = 999999;
        }
        
        $tt['available_quantity'] = $available;
        $resultTickets[] = $tt;
    }
    
    echo json_encode([
        'event_id' => $eventId,
        'global_available' => $globalAvailable,
        'tickets' => $resultTickets
    ]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener aforo.', 'details' => $e->getMessage()]);
}
?>
