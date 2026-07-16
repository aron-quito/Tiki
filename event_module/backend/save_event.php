<?php
// backend/save_event.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

$user = get_auth_user();
if (!$user || $user['role'] !== 'organizer') {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit();
}

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Cuerpo JSON inválido.']);
    exit();
}

// Force the organizer_id to be the one from the token
$input['organizer_id'] = $user['id'];

$isDraft = ($input['event_status'] ?? 'draft') === 'draft';
$errors = [];

if (empty($input['title'])) $errors[] = 'El título del evento es requerido.';
if (empty($input['organizer_id'])) $errors[] = 'El ID del organizador es requerido.';

if (!$isDraft) {
    if (empty($input['slug'])) $errors[] = 'El slug es requerido para publicar.';
    if (empty($input['event_date_start'])) $errors[] = 'La fecha de inicio es requerida.';
    if (empty($input['event_date_end'])) $errors[] = 'La fecha de fin es requerida.';
    
    if (empty($input['categories']) || !is_array($input['categories'])) {
        $errors[] = 'Debe proporcionar al menos una categoría de ticket para publicar.';
    }
    if (empty($input['sale_stages']) || !is_array($input['sale_stages'])) {
        $errors[] = 'Debe proporcionar al menos una fase de venta para publicar.';
    }
    if (empty($input['ticket_types']) || !is_array($input['ticket_types'])) {
        $errors[] = 'Debe proporcionar al menos un tipo de ticket para publicar.';
    }
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['error' => 'Validación de datos fallida.', 'details' => $errors]);
    exit();
}

try {
    $pdo->beginTransaction();

    $eventId = $input['event_id'] ?? null;
    $slug = $input['slug'] ?: uniqid('draft-'); 

    if ($eventId) {
        // ACTUALIZAR
        $sqlEvent = "UPDATE EVENTS SET 
                        title = :title, slug = :slug, venue_name = :venue_name, 
                        venue_address = :venue_address, city = :city, country = :country, 
                        event_date_start = :event_date_start, event_date_end = :event_date_end, 
                        cover_image_url = :cover_image_url, banner_image_url = :banner_image_url, 
                        global_capacity = :global_capacity, has_shared_capacity = :has_shared_capacity,
                        event_topic = :event_topic, event_status = :event_status, is_featured = :is_featured
                     WHERE event_id = :event_id AND organizer_id = :organizer_id";
                     
        $stmtEvent = $pdo->prepare($sqlEvent);
        $stmtEvent->execute([
            ':title' => $input['title'],
            ':slug' => $slug,
            ':venue_name' => $input['venue_name'] ?? '',
            ':venue_address' => $input['venue_address'] ?? '',
            ':city' => $input['city'] ?? '',
            ':country' => $input['country'] ?? 'Peru',
            ':event_date_start' => $input['event_date_start'] ?: '2000-01-01 00:00:00',
            ':event_date_end' => $input['event_date_end'] ?: '2000-01-01 00:00:00',
            ':cover_image_url' => $input['cover_image_url'] ?? '',
            ':banner_image_url' => $input['banner_image_url'] ?? '',
            ':global_capacity' => $input['global_capacity'] ?? null,
            ':has_shared_capacity' => $input['has_shared_capacity'] ? 1 : 0,
            ':event_topic' => $input['event_topic'] ?? null,
            ':event_status' => $input['event_status'] ?? 'draft',
            ':is_featured' => (isset($input['is_featured']) && $input['is_featured'] !== '') ? (int)$input['is_featured'] : 0,
            ':event_id' => $eventId,
            ':organizer_id' => $input['organizer_id']
        ]);

        // Borrar dependencias antiguas
        $pdo->prepare("DELETE FROM TICKET_TYPES WHERE category_id IN (SELECT category_id FROM CATEGORIES WHERE event_id = ?)")->execute([$eventId]);
        $pdo->prepare("DELETE FROM SALE_STAGES WHERE event_id = ?")->execute([$eventId]);
        $pdo->prepare("DELETE FROM CATEGORIES WHERE event_id = ?")->execute([$eventId]);

    } else {
        // INSERTAR
        $sqlEvent = "INSERT INTO EVENTS (
                organizer_id, title, venue_name, venue_address, city, country, 
                event_date_start, event_date_end, cover_image_url, banner_image_url, 
                global_capacity, has_shared_capacity, event_topic, event_status, is_featured, slug
            ) VALUES (
                :organizer_id, :title, :venue_name, :venue_address, :city, :country, 
                :event_date_start, :event_date_end, :cover_image_url, :banner_image_url, 
                :global_capacity, :has_shared_capacity, :event_topic, :event_status, :is_featured, :slug
            )";
            
        $stmtEvent = $pdo->prepare($sqlEvent);
        $stmtEvent->execute([
            ':organizer_id' => $input['organizer_id'],
            ':title' => $input['title'],
            ':venue_name' => $input['venue_name'] ?? '',
            ':venue_address' => $input['venue_address'] ?? '',
            ':city' => $input['city'] ?? '',
            ':country' => $input['country'] ?? 'Peru',
            ':event_date_start' => $input['event_date_start'] ?: '2000-01-01 00:00:00',
            ':event_date_end' => $input['event_date_end'] ?: '2000-01-01 00:00:00',
            ':cover_image_url' => $input['cover_image_url'] ?? '',
            ':banner_image_url' => $input['banner_image_url'] ?? '',
            ':global_capacity' => $input['global_capacity'] ?? null,
            ':has_shared_capacity' => $input['has_shared_capacity'] ? 1 : 0,
            ':event_topic' => $input['event_topic'] ?? null,
            ':event_status' => $input['event_status'] ?? 'draft',
            ':is_featured' => (isset($input['is_featured']) && $input['is_featured'] !== '') ? (int)$input['is_featured'] : 0,
            ':slug' => $slug,
        ]);
        $eventId = $pdo->lastInsertId();
    }

    $categoryMap = [];
    if (!empty($input['categories'])) {
        $stmtCat = $pdo->prepare("INSERT INTO CATEGORIES (event_id, category_name, total_capacity, has_shared_stages) VALUES (:event_id, :category_name, :total_capacity, :has_shared_stages)");
        foreach ($input['categories'] as $cat) {
            $stmtCat->execute([
                ':event_id' => $eventId,
                ':category_name' => $cat['category_name'],
                ':total_capacity' => $cat['total_capacity'] ?: 0,
                ':has_shared_stages' => $cat['has_shared_stages'] ? 1 : 0
            ]);
            $categoryMap[$cat['temp_id'] ?? $cat['category_name']] = $pdo->lastInsertId();
        }
    }

    $stageMap = [];
    if (!empty($input['sale_stages'])) {
        $stmtStage = $pdo->prepare("INSERT INTO SALE_STAGES (event_id, stage_name, sale_stage_date_start, sale_stage_date_end) VALUES (:event_id, :stage_name, :start, :end)");
        foreach ($input['sale_stages'] as $stg) {
            $stmtStage->execute([
                ':event_id' => $eventId,
                ':stage_name' => $stg['stage_name'],
                ':start' => $stg['sale_stage_date_start'] ?: '2000-01-01 00:00:00',
                ':end' => $stg['sale_stage_date_end'] ?: '2000-01-01 00:00:00'
            ]);
            $stageMap[$stg['temp_id'] ?? $stg['stage_name']] = $pdo->lastInsertId();
        }
    }

    if (!empty($input['ticket_types'])) {
        $stmtTT = $pdo->prepare("INSERT INTO TICKET_TYPES (category_id, sale_stage_id, ticket_type_name, ticket_type_description, price, currency, quantity_total, sale_start_date, sale_end_date, min_per_order, max_per_order, ticket_type_status) VALUES (:category_id, :sale_stage_id, :name, :desc, :price, :currency, :qty, :start, :end, :min, :max, :status)");
        foreach ($input['ticket_types'] as $tt) {
            $catId = $categoryMap[$tt['category_ref'] ?? $tt['category_name']] ?? null;
            $stgId = $stageMap[$tt['stage_ref'] ?? $tt['stage_name']] ?? null;
            
            if ($catId && $stgId) {
                $stmtTT->execute([
                    ':category_id' => $catId,
                    ':sale_stage_id' => $stgId,
                    ':name' => $tt['ticket_type_name'],
                    ':desc' => $tt['ticket_type_description'] ?? '',
                    ':price' => $tt['price'] ?: 0,
                    ':currency' => $tt['currency'] ?? 'USD',
                    ':qty' => $tt['quantity_total'] ?: 0,
                    ':start' => $tt['sale_start_date'] ?: '2000-01-01 00:00:00',
                    ':end' => $tt['sale_end_date'] ?: '2000-01-01 00:00:00',
                    ':min' => $tt['min_per_order'] ?: 1,
                    ':max' => $tt['max_per_order'] ?: 10,
                    ':status' => $tt['ticket_type_status'] ?? 'active'
                ]);
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
        echo json_encode(['error' => 'Error de unicidad (slug u otro campo repetido).']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error BD.', 'details' => $e->getMessage()]);
    }
}
?>
