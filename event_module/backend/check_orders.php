<?php
require 'config.php';
$stmt = $pdo->query("SELECT order_id, created_at, expires_at, order_status FROM ORDERS ORDER BY order_id DESC LIMIT 1");
print_r($stmt->fetch(PDO::FETCH_ASSOC));
