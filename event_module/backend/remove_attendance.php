<?php
// backend/remove_attendance.php

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
if (!$user || $user['role'] !== 'organizer') {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
$ticket_id = $data['ticket_id'] ?? null;
$event_id = $data['event_id'] ?? null;

if (!$ticket_id || !$event_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos incompletos']);
    exit();
}

try {
    // 1. Verificar propiedad del evento
    $stmtEv = $pdo->prepare("SELECT event_status FROM EVENTS WHERE event_id = ? AND organizer_id = ?");
    $stmtEv->execute([$event_id, $user['id']]);
    if (!$stmtEv->fetch()) {
        http_response_code(403);
        echo json_encode(['error' => 'Evento no encontrado o acceso denegado.']);
        exit();
    }

    // 2. Buscar ticket y verificar que esté checked in
    $sqlT = "
        SELECT t.ticket_id, t.checked_in_at
        FROM TICKETS t
        JOIN ORDERS o ON t.order_id = o.order_id
        WHERE t.ticket_id = :ticket_id AND o.event_id = :event_id
    ";
    $stmtT = $pdo->prepare($sqlT);
    $stmtT->execute([':ticket_id' => $ticket_id, ':event_id' => $event_id]);
    $ticket = $stmtT->fetch();

    if (!$ticket) {
        http_response_code(404);
        echo json_encode(['error' => 'Ticket no encontrado.']);
        exit();
    }

    if ($ticket['checked_in_at'] === null) {
        http_response_code(400);
        echo json_encode(['error' => 'El ticket no tiene asistencia registrada.']);
        exit();
    }

    // 3. Remover asistencia
    $pdo->beginTransaction();

    $stmtUpdate = $pdo->prepare("UPDATE TICKETS SET checked_in_at = NULL, checked_in_by = NULL WHERE ticket_id = :ticket_id");
    $stmtUpdate->execute([':ticket_id' => $ticket['ticket_id']]);

    // 4. Log
    $stmtLog = $pdo->prepare("INSERT INTO ATTENDANCE_LOGS (event_id, ticket_id, action_type, performed_by) VALUES (?, ?, 'check_in_removed', ?)");
    $stmtLog->execute([$event_id, $ticket['ticket_id'], $user['id']]);

    $pdo->commit();

    echo json_encode(['success' => true, 'message' => 'Asistencia anulada correctamente.']);

} catch (\Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Error al anular asistencia', 'details' => $e->getMessage()]);
}
?>
