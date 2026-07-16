<?php
require_once 'config.php';

try {
    // Disable foreign key checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");

    // Truncate tables to reset auto-increment and delete all data
    $pdo->exec("TRUNCATE TABLE TICKETS;");
    $pdo->exec("TRUNCATE TABLE ORDER_ITEMS;");
    $pdo->exec("TRUNCATE TABLE ORDERS;");
    $pdo->exec("TRUNCATE TABLE TICKET_TYPES;");
    $pdo->exec("TRUNCATE TABLE SALE_STAGES;");
    $pdo->exec("TRUNCATE TABLE CATEGORIES;");
    $pdo->exec("TRUNCATE TABLE EVENTS;");

    // Enable foreign key checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");

    echo "¡Todos los eventos han sido eliminados y el ID se ha reiniciado a 1!\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
