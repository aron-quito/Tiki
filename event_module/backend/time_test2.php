<?php
require 'config.php';
$stmt = $pdo->query("SELECT @@global.time_zone, @@session.time_zone");
print_r($stmt->fetch(PDO::FETCH_ASSOC));
echo "PHP date_default_timezone_get(): " . date_default_timezone_get() . "\n";
