<?php
// backend/confirm_purchase.php
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

$orderId = $input['order_id'] ?? null;
$paymentRef = $input['payment_reference'] ?? 'SIMULATED-' . time();

if (!$orderId) {
    http_response_code(400);
    echo json_encode(['error' => 'ID de orden requerido']);
    exit();
}

try {
    $pdo->beginTransaction();
    
    // 1. Validar que la orden pertenece al usuario, está pendiente y no ha expirado
    $stmtCheck = $pdo->prepare("SELECT * FROM ORDERS WHERE order_id = ? AND customer_id = ? FOR UPDATE");
    $stmtCheck->execute([$orderId, $user['id']]);
    $order = $stmtCheck->fetch(PDO::FETCH_ASSOC);
    
    if (!$order) {
        throw new Exception("Orden no encontrada.");
    }
    
    if ($order['order_status'] !== 'pending') {
        throw new Exception("La orden ya no está pendiente (estado actual: {$order['order_status']}).");
    }
    
    // Verificar si expiró
    $expiresAtTime = strtotime($order['expires_at']);
    if (time() > $expiresAtTime) {
        // Expiró, cancelarla
        $pdo->prepare("UPDATE ORDERS SET order_status = 'expired' WHERE order_id = ?")->execute([$orderId]);
        $pdo->commit();
        http_response_code(400);
        echo json_encode(['error' => 'El tiempo de reserva ha expirado. Orden cancelada.']);
        exit();
    }
    
    // 2. Marcar como confirmada
    $stmtUpdate = $pdo->prepare("UPDATE ORDERS 
                                 SET order_status = 'confirmed', 
                                     payment_status = 'paid', 
                                     payment_reference = ?, 
                                     confirmed_at = NOW() 
                                 WHERE order_id = ?");
    $stmtUpdate->execute([$paymentRef, $orderId]);
    
    // 3. Generar los TICKETS
    // Get all items in the order
    $stmtItems = $pdo->prepare("SELECT * FROM ORDER_ITEMS WHERE order_id = ?");
    $stmtItems->execute([$orderId]);
    $items = $stmtItems->fetchAll(PDO::FETCH_ASSOC);
    
    $stmtInsertTicket = $pdo->prepare("INSERT INTO TICKETS (ticket_type_id, order_id, ticket_number, qr_code, qr_code_image_url, transferred_to_customer_id, transferred_to_event_id) VALUES (?, ?, ?, ?, '', ?, ?)");
    $stmtUpdateSold = $pdo->prepare("UPDATE TICKET_TYPES SET quantity_sold = quantity_sold + ? WHERE ticket_type_id = ?");
    
    foreach ($items as $item) {
        $qty = $item['quantity'];
        $ttId = $item['ticket_type_id'];
        
        for ($i = 0; $i < $qty; $i++) {
            $ticketNumber = 'TKT-' . $orderId . '-' . $ttId . '-' . strtoupper(substr(md5(uniqid()), 0, 6));
            $qrCode = 'QR-' . $ticketNumber; // In a real app, generate base64 image or just store the string to be encoded by the frontend
            $stmtInsertTicket->execute([$ttId, $orderId, $ticketNumber, $qrCode, $user['id'], $order['event_id']]);
        }
        
        // Update stats
        $stmtUpdateSold->execute([$qty, $ttId]);
    }
    
    $pdo->commit();
    
    echo json_encode([
        'message' => 'Compra confirmada exitosamente.',
        'order_number' => $order['order_number']
    ]);

} catch (\Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Error al confirmar compra', 'details' => $e->getMessage()]);
}
?>
