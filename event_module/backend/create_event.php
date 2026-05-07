<?php
// backend/create_event.php

// Permitir solicitudes CORS (Ajustar en producción para dominios específicos)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Manejo de la solicitud OPTIONS para CORS pre-flight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuración de la base de datos
$host = '127.0.0.1';
$db   = 'my_database'; // Cambiar por el nombre de tu base de datos
$user = 'db_user';     // Cambiar por tu usuario
$pass = 'db_pass';     // Cambiar por tu contraseña
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

// Conexión usando PDO
try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos.']);
    exit();
}

// Solo permitir solicitudes POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido. Utilice POST.']);
    exit();
}

// Obtener datos del cuerpo de la solicitud JSON
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Cuerpo de solicitud JSON inválido.']);
    exit();
}

// Validaciones básicas requeridas
$errors = [];
if (empty($input['title'])) $errors[] = 'El título es requerido.';
if (empty($input['slug'])) $errors[] = 'El slug es requerido.';
if (empty($input['event_date_start'])) $errors[] = 'La fecha de inicio es requerida.';
if (empty($input['event_date_end'])) $errors[] = 'La fecha de fin es requerida.';
if (empty($input['organizer_id'])) $errors[] = 'El ID del organizador es requerido.';

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['error' => 'Validación de datos fallida.', 'details' => $errors]);
    exit();
}

// Inserción en la base de datos usando sentencias preparadas (Prepared Statements) para prevenir inyecciones SQL
$sql = "INSERT INTO events (
            title, slug, description, category, 
            event_date_start, event_date_end, venue_name, 
            venue_address, city, country, banner_image, 
            organizer_id, status
        ) VALUES (
            :title, :slug, :description, :category, 
            :event_date_start, :event_date_end, :venue_name, 
            :venue_address, :city, :country, :banner_image, 
            :organizer_id, :status
        )";

try {
    $stmt = $pdo->prepare($sql);
    
    // Ejecutar la consulta con los valores, asignando null o valores por defecto a los opcionales
    $stmt->execute([
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
        ':organizer_id' => $input['organizer_id'],
        ':status' => $input['status'] ?? 'draft',
    ]);
    
    $newId = $pdo->lastInsertId();
    
    // Respuesta de éxito (201 Created)
    http_response_code(201);
    echo json_encode([
        'message' => 'Evento creado exitosamente.',
        'event_id' => $newId
    ]);

} catch (\PDOException $e) {
    // Manejo de error para slug duplicado (violación de índice único, código SQLSTATE 23000)
    if ($e->getCode() == 23000) {
        http_response_code(400);
        echo json_encode(['error' => 'El slug proporcionado ya está en uso.']);
    } else {
        http_response_code(500);
        // En producción no se debe mostrar $e->getMessage() directamente
        echo json_encode(['error' => 'Error al crear el evento.', 'details' => $e->getMessage()]);
    }
}
