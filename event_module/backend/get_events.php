<?php
// backend/get_events.php

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
    echo json_encode(['error' => 'Error de conexión a la base de datos.']);
    exit();
}

// Suponiendo que la compañía actual tiene ID 1 (puedes pasarlo por parámetro en el futuro)
$company_id = $_GET['company_id'] ?? 1;

try {
    $sql = "SELECT id, title, event_date_start, event_date_end, venue_name, city, created_at, 
            CASE 
                WHEN status = 'published' AND event_date_end < NOW() THEN 'completed'
                ELSE status
            END as status
            FROM events 
            WHERE company_id = :company_id 
            ORDER BY created_at DESC";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':company_id' => $company_id]);
    $events = $stmt->fetchAll();
    
    // Obtener contadores de tickets para cada evento (para mostrar estadísticas)
    foreach ($events as &$event) {
        $sqlTiers = "SELECT SUM(capacity) as total_capacity FROM ticket_tiers WHERE event_id = :event_id";
        $stmtTiers = $pdo->prepare($sqlTiers);
        $stmtTiers->execute([':event_id' => $event['id']]);
        $tierInfo = $stmtTiers->fetch();
        $event['total_capacity'] = $tierInfo['total_capacity'] ?? 0;
    }
    
    echo json_encode(['events' => $events]);
    
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener eventos.']);
}
?>
