<?php
require 'config.php';
$stmt = $pdo->query("SELECT NOW()");
echo "MySQL time: " . $stmt->fetchColumn() . "\n";
