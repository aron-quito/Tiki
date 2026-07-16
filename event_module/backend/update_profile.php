<?php
require_once 'config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos inválidos']);
    exit();
}

try {
    $pdo->beginTransaction();

    $session = get_auth_user();

    if (!$session) {
        $pdo->rollBack();
        http_response_code(401);
        echo json_encode(['error' => 'Token inválido o expirado']);
        exit();
    }

    $userId = $session['id'];
    $role = $session['role'];

    if ($role === 'customer') {
        $sql = "UPDATE CUSTOMERS SET 
            nickname = :nickname,
            phone_number = :phone_number,
            profile_image_url = :profile_image_url,
            national_id = :national_id,
            foreigners_identity_card = :foreigners_identity_card,
            birthday = :birthday,
            first_name = :first_name,
            last_name = :last_name,
            updated_at = CURRENT_TIMESTAMP
            WHERE customer_id = :id";
            
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':nickname' => $input['nickname'] ?? '',
            ':phone_number' => $input['phone_number'] ?? '',
            ':profile_image_url' => $input['profile_image_url'] ?? '',
            ':national_id' => $input['national_id'] ?? '',
            ':foreigners_identity_card' => $input['foreigners_identity_card'] ?? '',
            ':birthday' => !empty($input['birthday']) ? $input['birthday'] : null,
            ':first_name' => $input['first_name'] ?? '',
            ':last_name' => $input['last_name'] ?? '',
            ':id' => $userId
        ]);
        
    } elseif ($role === 'organizer') {
        $sql = "UPDATE ORGANIZERS SET 
            nickname = :nickname,
            phone_number = :phone_number,
            profile_image_url = :profile_image_url,
            ruc = :ruc,
            company_name = :company_name,
            trade_name = :trade_name,
            corporate_phone_number = :corporate_phone_number,
            updated_at = CURRENT_TIMESTAMP
            WHERE organizer_id = :id";
            
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':nickname' => $input['nickname'] ?? '',
            ':phone_number' => $input['phone_number'] ?? '',
            ':profile_image_url' => $input['profile_image_url'] ?? '',
            ':ruc' => $input['ruc'] ?? '',
            ':company_name' => $input['company_name'] ?? '',
            ':trade_name' => $input['trade_name'] ?? '',
            ':corporate_phone_number' => $input['corporate_phone_number'] ?? '',
            ':id' => $userId
        ]);
        
    } else {
        $pdo->rollBack();
        http_response_code(403);
        echo json_encode(['error' => 'Rol no soportado']);
        exit();
    }

    $pdo->commit();
    echo json_encode(['message' => 'Perfil actualizado exitosamente']);

} catch (\PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    if ($e->getCode() == 23000) {
        echo json_encode(['error' => 'Ya existe un usuario con esa identificación (RUC/DNI)']);
    } else {
        echo json_encode(['error' => 'Error de servidor: ' . $e->getMessage()]);
    }
}
