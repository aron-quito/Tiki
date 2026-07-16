<?php
require 'config.php';
$event_id = 1; // Assuming event_id 1
$ticket_id = 1; // Assuming ticket_id 1
$user_id = 1;

try {
    $pdo->beginTransaction();
    $stmtUpdate = $pdo->prepare("UPDATE TICKETS SET checked_in_at = NULL, checked_in_by = NULL WHERE ticket_id = :ticket_id");
    $stmtUpdate->execute([':ticket_id' => $ticket_id]);

    $stmtLog = $pdo->prepare("INSERT INTO ATTENDANCE_LOGS (event_id, ticket_id, action_type, performed_by) VALUES (?, ?, 'check_in_removed', ?)");
    $stmtLog->execute([$event_id, $ticket_id, $user_id]);
    $pdo->commit();
    echo "Success";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
