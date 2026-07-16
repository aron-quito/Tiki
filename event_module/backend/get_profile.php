<?php
require_once 'config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

    $session = get_auth_user();
    
    if (!$session) {
        http_response_code(401);
        echo json_encode(['error' => 'Token inválido o expirado']);
        exit();
    }

    $userId = $session['id'];
    $role = $session['role'];
    
    try {
        if ($role === 'customer') {
            $stmt = $pdo->prepare("SELECT email, nickname, phone_number, profile_image_url, national_id, foreigners_identity_card, birthday, first_name, last_name FROM CUSTOMERS WHERE customer_id = :id");
        } elseif ($role === 'organizer') {
            $stmt = $pdo->prepare("SELECT email, nickname, phone_number, profile_image_url, ruc, company_name, trade_name, corporate_phone_number FROM ORGANIZERS WHERE organizer_id = :id");
        } else {
            http_response_code(403);
            echo json_encode(['error' => 'Rol no soportado']);
            exit();
        }

        $stmt->execute([':id' => $userId]);
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$profile) {
            http_response_code(404);
            echo json_encode(['error' => 'Usuario no encontrado']);
            exit();
        }
        
        $profile['role'] = $role;

        echo json_encode(['profile' => $profile]);

    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error de servidor: ' . $e->getMessage()]);
    }
