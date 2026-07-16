<?php
// backend/register_attendance.php

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
$ticket_identifier = $data['ticket_identifier'] ?? ''; // Puede ser el ticket_number o el qr_code
$event_id = $data['event_id'] ?? null;

if (!$ticket_identifier || !$event_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos incompletos']);
    exit();
}

try {
    // 1. Verificar si el evento pertenece al organizador y está publicado
    $stmtEv = $pdo->prepare("SELECT event_status FROM EVENTS WHERE event_id = ? AND organizer_id = ?");
    $stmtEv->execute([$event_id, $user['id']]);
    $event = $stmtEv->fetch();
    
    if (!$event) {
        http_response_code(403);
        echo json_encode(['error' => 'Evento no encontrado o acceso denegado.']);
        exit();
    }
    if ($event['event_status'] !== 'published') {
        http_response_code(400);
        echo json_encode(['error' => 'La asistencia solo puede registrarse en eventos publicados.']);
        exit();
    }

    // 2. Buscar el ticket
    $sqlT = "
        SELECT t.ticket_id, t.tickets_status, t.checked_in_at, o.order_status
        FROM TICKETS t
        JOIN ORDERS o ON t.order_id = o.order_id
        WHERE o.event_id = :event_id 
        AND (t.qr_code = :identifier1 OR t.ticket_number = :identifier2)
    ";
    $stmtT = $pdo->prepare($sqlT);
    $stmtT->execute([':event_id' => $event_id, ':identifier1' => $ticket_identifier, ':identifier2' => $ticket_identifier]);
    $ticket = $stmtT->fetch();

    if (!$ticket) {
        http_response_code(404);
        echo json_encode(['error' => 'Ticket no encontrado para este evento.']);
        exit();
    }

    if ($ticket['order_status'] !== 'confirmed') {
        http_response_code(400);
        echo json_encode(['error' => 'La orden de este ticket no está confirmada (estado: ' . $ticket['order_status'] . ')']);
        exit();
    }

    if ($ticket['tickets_status'] !== 'valid') {
        http_response_code(400);
        echo json_encode(['error' => 'Este ticket no es válido (estado: ' . $ticket['tickets_status'] . ')']);
        exit();
    }

    if ($ticket['checked_in_at'] !== null) {
        http_response_code(400);
        echo json_encode(['error' => 'El ticket ya fue ingresado el ' . $ticket['checked_in_at']]);
        exit();
    }

    // 3. Registrar asistencia
    $pdo->beginTransaction();

    $stmtUpdate = $pdo->prepare("UPDATE TICKETS SET checked_in_at = NOW(), checked_in_by = :user_name WHERE ticket_id = :ticket_id");
    $stmtUpdate->execute([':user_name' => $user['email'] ?? 'organizador', ':ticket_id' => $ticket['ticket_id']]);

    // 4. Log
    $stmtLog = $pdo->prepare("INSERT INTO ATTENDANCE_LOGS (event_id, ticket_id, action_type, performed_by) VALUES (?, ?, 'checked_in', ?)");
    $stmtLog->execute([$event_id, $ticket['ticket_id'], $user['id']]);

    $pdo->commit();

    echo json_encode(['success' => true, 'message' => 'Asistencia registrada correctamente.']);

} catch (\Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Error al registrar asistencia', 'details' => $e->getMessage()]);
}
?>
