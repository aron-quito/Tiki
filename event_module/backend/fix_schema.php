<?php
require 'config.php';
try {
    // MySQL 5.6+ allows changing the column without dropping data
    // We remove the ON UPDATE CURRENT_TIMESTAMP behavior
    $pdo->exec("ALTER TABLE ORDERS MODIFY expires_at TIMESTAMP NULL");
    $pdo->exec("ALTER TABLE ORDERS MODIFY confirmed_at TIMESTAMP NULL");
    $pdo->exec("ALTER TABLE ORDERS MODIFY cancelled_at TIMESTAMP NULL");
    echo "Table ALTER successful.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
