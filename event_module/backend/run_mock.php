<?php
require_once 'config.php';
$sql = file_get_contents('../db/mock_events.sql');
try {
    $pdo->exec($sql);
    echo "SQL script executed successfully.\n";
} catch (PDOException $e) {
    echo "Error executing SQL script: " . $e->getMessage() . "\n";
}
?>
