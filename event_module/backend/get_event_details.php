<?php
// backend/get_event_details.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = '127.0.0.1';
$db   = 'my_database'; 
$user = 'db_user';     
$pass = 'db_pass';     
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión.']);
    exit();
}

$eventId = $_GET['id'] ?? null;
$companyId = $_GET['company_id'] ?? 1;

if (!$eventId) {
    http_response_code(400);
    echo json_encode(['error' => 'ID de evento requerido.']);
    exit();
}

try {
    // 1. Obtener Evento
    $stmt = $pdo->prepare("SELECT * FROM events WHERE id = ? AND company_id = ?");
    $stmt->execute([$eventId, $companyId]);
    $event = $stmt->fetch();
    
    if (!$event) {
        http_response_code(404);
        echo json_encode(['error' => 'Evento no encontrado.']);
        exit();
    }
    
    // 2. Obtener Categorías de Tickets
    $stmtTiers = $pdo->prepare("SELECT * FROM ticket_tiers WHERE event_id = ?");
    $stmtTiers->execute([$eventId]);
    $tiers = $stmtTiers->fetchAll();
    
    // 3. Obtener Fases para cada categoría
    $stmtPhases = $pdo->prepare("SELECT * FROM ticket_pricing_phases WHERE ticket_tier_id = ?");
    
    foreach ($tiers as &$tier) {
        $stmtPhases->execute([$tier['id']]);
        $tier['phases'] = $stmtPhases->fetchAll();
    }
    
    $event['ticket_tiers'] = $tiers;
    
    echo json_encode($event);
    
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener datos.']);
}
?>
