<?php
require 'config.php';
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS ATTENDANCE_LOGS (
        log_id INT NOT NULL AUTO_INCREMENT,
        event_id INT NOT NULL,
        ticket_id INT NOT NULL,
        action_type VARCHAR(50) NOT NULL,
        performed_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (log_id)
    )");
    echo "ATTENDANCE_LOGS table created successfully.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
