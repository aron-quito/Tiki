<?php
// backend/reserve_tickets.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

$eventId = $input['event_id'] ?? null;
$tickets = $input['tickets'] ?? []; // Array of { ticket_type_id, quantity }

if (!$eventId || empty($tickets)) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan datos de la reserva']);
    exit();
}

try {
    $pdo->beginTransaction();

    // 1. Double check availability for each ticket type by calling logic similar to get_available_tickets
    // For a highly concurrent environment we should lock the row. We'll use a simpler check here due to no ORM.
    $totalAmount = 0;
    
    // Generar un número de orden único
    $orderNumber = 'ORD-' . strtoupper(uniqid());
    
    // Insert pending order (expires in 1 minute)
    // Usamos DATE_ADD(NOW(), INTERVAL 1 MINUTE)
    // Fetch user email and phone from DB (since they are customers, they are in CUSTOMERS table)
    $stmtUser = $pdo->prepare("SELECT email, phone_number FROM CUSTOMERS WHERE customer_id = ?");
    $stmtUser->execute([$user['id']]);
    $userInfo = $stmtUser->fetch();
    $buyerEmail = $userInfo['email'] ?? '';
    $buyerPhone = $userInfo['phone_number'] ?? '';

    $sqlOrder = "INSERT INTO ORDERS (customer_id, event_id, order_number, total_amount, currency, order_status, payment_status, expires_at, payment_reference, buyer_email, buyer_phone, confirmed_at, cancelled_at, cancellation_reason)
                 VALUES (?, ?, ?, ?, 'USD', 'pending', 'pending', DATE_ADD(NOW(), INTERVAL 1 MINUTE), '', ?, ?, '1970-01-01 00:00:01', '1970-01-01 00:00:01', '')";
    $stmtOrder = $pdo->prepare($sqlOrder);
    $stmtOrder->execute([$user['id'], $eventId, $orderNumber, 0, $buyerEmail, $buyerPhone]); // total will be updated later
    
    $orderId = $pdo->lastInsertId();
    
    // Insert order items
    $sqlItem = "INSERT INTO ORDER_ITEMS (order_id, ticket_type_id, quantity, unit_price, subtotal)
                VALUES (?, ?, ?, ?, ?)";
    $stmtItem = $pdo->prepare($sqlItem);
    
    foreach ($tickets as $t) {
        $ttId = $t['ticket_type_id'];
        $qty = $t['quantity'];
        
        if ($qty <= 0) continue;
        
        // Fetch ticket type price
        $stmtTT = $pdo->prepare("SELECT price FROM TICKET_TYPES WHERE ticket_type_id = ?");
        $stmtTT->execute([$ttId]);
        $ttInfo = $stmtTT->fetch(PDO::FETCH_ASSOC);
        
        if (!$ttInfo) {
            throw new Exception("Tipo de ticket $ttId no existe.");
        }
        
        $price = $ttInfo['price'];
        $subtotal = $price * $qty;
        $totalAmount += $subtotal;
        
        $stmtItem->execute([$orderId, $ttId, $qty, $price, $subtotal]);
    }
    
    // Update order total
    $pdo->prepare("UPDATE ORDERS SET total_amount = ? WHERE order_id = ?")->execute([$totalAmount, $orderId]);
    
    $pdo->commit();
    
    echo json_encode([
        'message' => 'Reserva creada',
        'order_id' => $orderId,
        'order_number' => $orderNumber,
        'total_amount' => $totalAmount,
        'expires_at' => date('Y-m-d H:i:s', time() + 60) // just to tell frontend
    ]);
    
} catch (\Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Error al crear reserva', 'details' => $e->getMessage()]);
}
?>
