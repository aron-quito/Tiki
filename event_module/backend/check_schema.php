<?php
require 'config.php';
$stmt = $pdo->query("SHOW CREATE TABLE ORDERS");
$row = $stmt->fetch(PDO::FETCH_ASSOC);
echo $row['Create Table'] . "\n";
