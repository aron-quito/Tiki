<?php
require 'config.php';
$php_time = time();
$stmt = $pdo->query("SELECT UNIX_TIMESTAMP(NOW()), UNIX_TIMESTAMP(DATE_ADD(NOW(), INTERVAL 1 MINUTE))");
$row = $stmt->fetch(PDO::FETCH_NUM);
echo "PHP time: " . $php_time . "\n";
echo "MySQL time: " . $row[0] . "\n";
echo "MySQL +1m: " . $row[1] . "\n";
