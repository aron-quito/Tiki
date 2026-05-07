<?php
// backend/create_event.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuración de base de datos
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido. Utilice POST.']);
    exit();
}

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Cuerpo de solicitud JSON inválido.']);
    exit();
}

// Validaciones del Evento
$errors = [];
if (empty($input['title'])) $errors[] = 'El título del evento es requerido.';
if (empty($input['slug'])) $errors[] = 'El slug es requerido.';
if (empty($input['event_date_start'])) $errors[] = 'La fecha de inicio es requerida.';
if (empty($input['event_date_end'])) $errors[] = 'La fecha de fin es requerida.';
if (empty($input['company_id'])) $errors[] = 'El ID de la empresa (company_id) es requerido.';

// Validaciones de Tickets
if (empty($input['ticket_tiers']) || !is_array($input['ticket_tiers'])) {
    $errors[] = 'Debe proporcionar al menos una categoría de ticket.';
} else {
    foreach ($input['ticket_tiers'] as $index => $tier) {
        if (empty($tier['name'])) $errors[] = "El nombre del ticket en la posición $index es requerido.";
        if (!isset($tier['capacity']) || $tier['capacity'] < 1) $errors[] = "El aforo del ticket '{$tier['name']}' debe ser mayor a 0.";
        
        if (empty($tier['phases']) || !is_array($tier['phases'])) {
            $errors[] = "El ticket '{$tier['name']}' debe tener al menos una fase de precio.";
        } else {
            foreach ($tier['phases'] as $pIndex => $phase) {
                if (empty($phase['phase_name'])) $errors[] = "Falta el nombre de la fase en el ticket '{$tier['name']}'.";
                if (!isset($phase['price']) || $phase['price'] < 0) $errors[] = "Precio inválido en fase de '{$tier['name']}'.";
                if (empty($phase['start_date'])) $errors[] = "Falta fecha de inicio en fase de '{$tier['name']}'.";
                if (empty($phase['end_date'])) $errors[] = "Falta fecha límite en fase de '{$tier['name']}'.";
            }
        }
    }
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['error' => 'Validación de datos fallida.', 'details' => $errors]);
    exit();
}

// Iniciar Transacción
try {
    $pdo->beginTransaction();

    // 1. Insertar Evento
    $sqlEvent = "INSERT INTO events (
            title, slug, description, category, 
            event_date_start, event_date_end, venue_name, 
            venue_address, city, country, banner_image, 
            company_id, status
        ) VALUES (
            :title, :slug, :description, :category, 
            :event_date_start, :event_date_end, :venue_name, 
            :venue_address, :city, :country, :banner_image, 
            :company_id, :status
        )";
        
    $stmtEvent = $pdo->prepare($sqlEvent);
    $stmtEvent->execute([
        ':title' => $input['title'],
        ':slug' => $input['slug'],
        ':description' => $input['description'] ?? null,
        ':category' => $input['category'] ?? null,
        ':event_date_start' => $input['event_date_start'],
        ':event_date_end' => $input['event_date_end'],
        ':venue_name' => $input['venue_name'] ?? null,
        ':venue_address' => $input['venue_address'] ?? null,
        ':city' => $input['city'] ?? null,
        ':country' => $input['country'] ?? null,
        ':banner_image' => $input['banner_image'] ?? null,
        ':company_id' => $input['company_id'],
        ':status' => $input['status'] ?? 'draft',
    ]);
    
    $eventId = $pdo->lastInsertId();

    // 2. Insertar Categorías de Tickets
    $sqlTier = "INSERT INTO ticket_tiers (event_id, name, capacity) VALUES (:event_id, :name, :capacity)";
    $stmtTier = $pdo->prepare($sqlTier);

    // 3. Insertar Fases de Precios
    $sqlPhase = "INSERT INTO ticket_pricing_phases (ticket_tier_id, phase_name, price, start_date, end_date) 
                 VALUES (:ticket_tier_id, :phase_name, :price, :start_date, :end_date)";
    $stmtPhase = $pdo->prepare($sqlPhase);

    foreach ($input['ticket_tiers'] as $tier) {
        $stmtTier->execute([
            ':event_id' => $eventId,
            ':name' => $tier['name'],
            ':capacity' => $tier['capacity']
        ]);
        $tierId = $pdo->lastInsertId();

        foreach ($tier['phases'] as $phase) {
            $stmtPhase->execute([
                ':ticket_tier_id' => $tierId,
                ':phase_name' => $phase['phase_name'],
                ':price' => $phase['price'],
                ':start_date' => $phase['start_date'],
                ':end_date' => $phase['end_date']
            ]);
        }
    }

    // Confirmar todas las inserciones
    $pdo->commit();
    
    http_response_code(201);
    echo json_encode([
        'message' => 'Evento y tickets creados exitosamente.',
        'event_id' => $eventId
    ]);

} catch (\PDOException $e) {
    // Si hay cualquier error, revertimos todo
    $pdo->rollBack();
    
    if ($e->getCode() == 23000) {
        http_response_code(400);
        echo json_encode(['error' => 'El slug proporcionado ya está en uso.']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error de base de datos al crear el evento.', 'details' => $e->getMessage()]);
    }
}
?>
