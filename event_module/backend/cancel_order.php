<?php
// backend/cancel_order.php

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

$input = json_decode(file_get_contents('php://input'), true);
$orderId = $input['order_id'] ?? null;

if (!$orderId) {
    http_response_code(400);
    echo json_encode(['error' => 'Falta el ID de la orden']);
    exit();
}

try {
    // Verify the order belongs to this user and is still pending
    $stmt = $pdo->prepare("SELECT order_id, order_status FROM ORDERS WHERE order_id = :order_id AND customer_id = :customer_id");
    $stmt->execute([':order_id' => $orderId, ':customer_id' => $user['id']]);
    $order = $stmt->fetch();

    if (!$order) {
        http_response_code(404);
        echo json_encode(['error' => 'Orden no encontrada']);
        exit();
    }

    if ($order['order_status'] !== 'pending') {
        http_response_code(400);
        echo json_encode(['error' => 'Esta orden ya no puede ser cancelada (estado: ' . $order['order_status'] . ')']);
        exit();
    }

    // Cancel the order
    $stmtUpdate = $pdo->prepare("UPDATE ORDERS SET order_status = 'cancelled', cancelled_at = NOW(), cancellation_reason = 'Cancelado por el usuario' WHERE order_id = :order_id");
    $stmtUpdate->execute([':order_id' => $orderId]);

    echo json_encode(['message' => 'Orden cancelada exitosamente']);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al cancelar la orden', 'details' => $e->getMessage()]);
}
?>
