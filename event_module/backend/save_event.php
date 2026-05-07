<?php
// backend/save_event.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Cuerpo JSON inválido.']);
    exit();
}

$isDraft = ($input['status'] ?? 'draft') === 'draft';
$errors = [];

// Si es Draft, relajamos las validaciones. Solo requerimos un título y un slug mínimo.
if (empty($input['title'])) $errors[] = 'El título del evento es requerido.';
if (empty($input['company_id'])) $errors[] = 'El ID de la empresa es requerido.';

// Si se intenta publicar, aplicamos todas las reglas estrictas
if (!$isDraft) {
    if (empty($input['slug'])) $errors[] = 'El slug es requerido para publicar.';
    if (empty($input['event_date_start'])) $errors[] = 'La fecha de inicio es requerida.';
    if (empty($input['event_date_end'])) $errors[] = 'La fecha de fin es requerida.';
    
    if (empty($input['ticket_tiers']) || !is_array($input['ticket_tiers'])) {
        $errors[] = 'Debe proporcionar al menos una categoría de ticket para publicar.';
    } else {
        foreach ($input['ticket_tiers'] as $index => $tier) {
            if (empty($tier['name'])) $errors[] = "El nombre del ticket es requerido.";
            if (empty($tier['capacity']) || $tier['capacity'] < 1) $errors[] = "Aforo requerido en ticket '{$tier['name']}'.";
            
            if (empty($tier['phases']) || !is_array($tier['phases'])) {
                $errors[] = "El ticket '{$tier['name']}' debe tener al menos una fase de precio.";
            } else {
                foreach ($tier['phases'] as $phase) {
                    if (empty($phase['phase_name'])) $errors[] = "Falta el nombre de la fase.";
                    if (!isset($phase['price'])) $errors[] = "Precio inválido.";
                    if (empty($phase['start_date'])) $errors[] = "Falta fecha de inicio en preventa.";
                    if (empty($phase['end_date'])) $errors[] = "Falta fecha límite en preventa.";
                }
            }
        }
    }
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['error' => 'Validación de datos fallida.', 'details' => $errors]);
    exit();
}

try {
    $pdo->beginTransaction();

    $eventId = $input['id'] ?? null;
    $slug = $input['slug'] ?: uniqid('draft-'); // Si no hay slug, inventar uno

    if ($eventId) {
        // ACTUALIZAR (Solo si está en draft, si está publicado no deberíamos permitir muchas ediciones, pero aquí lo actualizamos)
        $sqlEvent = "UPDATE events SET 
                        title = :title, slug = :slug, description = :description, category = :category, 
                        event_date_start = :event_date_start, event_date_end = :event_date_end, 
                        venue_name = :venue_name, venue_address = :venue_address, city = :city, 
                        country = :country, banner_image = :banner_image, status = :status
                     WHERE id = :id AND company_id = :company_id";
                     
        $stmtEvent = $pdo->prepare($sqlEvent);
        $stmtEvent->execute([
            ':title' => $input['title'],
            ':slug' => $slug,
            ':description' => $input['description'] ?? null,
            ':category' => $input['category'] ?? null,
            ':event_date_start' => $input['event_date_start'] ?: null,
            ':event_date_end' => $input['event_date_end'] ?: null,
            ':venue_name' => $input['venue_name'] ?? null,
            ':venue_address' => $input['venue_address'] ?? null,
            ':city' => $input['city'] ?? null,
            ':country' => $input['country'] ?? null,
            ':banner_image' => $input['banner_image'] ?? null,
            ':status' => $input['status'],
            ':id' => $eventId,
            ':company_id' => $input['company_id']
        ]);

        // Borrar tickets antiguos (ON DELETE CASCADE borrará las phases)
        $stmtDel = $pdo->prepare("DELETE FROM ticket_tiers WHERE event_id = ?");
        $stmtDel->execute([$eventId]);

    } else {
        // INSERTAR
        $sqlEvent = "INSERT INTO events (
                title, slug, description, category, event_date_start, event_date_end, 
                venue_name, venue_address, city, country, banner_image, company_id, status
            ) VALUES (
                :title, :slug, :description, :category, :event_date_start, :event_date_end, 
                :venue_name, :venue_address, :city, :country, :banner_image, :company_id, :status
            )";
            
        $stmtEvent = $pdo->prepare($sqlEvent);
        $stmtEvent->execute([
            ':title' => $input['title'],
            ':slug' => $slug,
            ':description' => $input['description'] ?? null,
            ':category' => $input['category'] ?? null,
            ':event_date_start' => $input['event_date_start'] ?: null,
            ':event_date_end' => $input['event_date_end'] ?: null,
            ':venue_name' => $input['venue_name'] ?? null,
            ':venue_address' => $input['venue_address'] ?? null,
            ':city' => $input['city'] ?? null,
            ':country' => $input['country'] ?? null,
            ':banner_image' => $input['banner_image'] ?? null,
            ':company_id' => $input['company_id'],
            ':status' => $input['status'],
        ]);
        $eventId = $pdo->lastInsertId();
    }

    // Insertar Tickets y Fases
    if (!empty($input['ticket_tiers'])) {
        $sqlTier = "INSERT INTO ticket_tiers (event_id, name, capacity) VALUES (:event_id, :name, :capacity)";
        $stmtTier = $pdo->prepare($sqlTier);

        $sqlPhase = "INSERT INTO ticket_pricing_phases (ticket_tier_id, phase_name, price, start_date, end_date) 
                     VALUES (:ticket_tier_id, :phase_name, :price, :start_date, :end_date)";
        $stmtPhase = $pdo->prepare($sqlPhase);

        foreach ($input['ticket_tiers'] as $tier) {
            $stmtTier->execute([
                ':event_id' => $eventId,
                ':name' => $tier['name'],
                ':capacity' => $tier['capacity'] ?: 0
            ]);
            $tierId = $pdo->lastInsertId();

            if (!empty($tier['phases'])) {
                foreach ($tier['phases'] as $phase) {
                    $stmtPhase->execute([
                        ':ticket_tier_id' => $tierId,
                        ':phase_name' => $phase['phase_name'],
                        ':price' => $phase['price'] ?: 0,
                        ':start_date' => $phase['start_date'] ?: null,
                        ':end_date' => $phase['end_date'] ?: null
                    ]);
                }
            }
        }
    }

    $pdo->commit();
    http_response_code(201);
    echo json_encode(['message' => 'Guardado exitosamente.', 'event_id' => $eventId]);

} catch (\PDOException $e) {
    $pdo->rollBack();
    if ($e->getCode() == 23000) {
        http_response_code(400);
        echo json_encode(['error' => 'El slug ya está en uso.']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error BD.', 'details' => $e->getMessage()]);
    }
}
?>
