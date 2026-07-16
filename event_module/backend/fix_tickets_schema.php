<?php
require 'config.php';
try {
    $pdo->exec("ALTER TABLE TICKETS MODIFY checked_in_at TIMESTAMP NULL DEFAULT NULL");
    echo "Fixed checked_in_at in TICKETS.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
