<?php
// backend/auth.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!$input || !isset($input['action'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Petición inválida']);
    exit();
}

$action = $input['action'];

if ($action === 'login') {
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $role = $input['role'] ?? 'customer'; // 'customer' or 'organizer'
    
    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email y contraseña son requeridos']);
        exit();
    }
    
    if ($role === 'organizer') {
        $stmt = $pdo->prepare("SELECT organizer_id as id, email, password_hash, nickname, company_name FROM ORGANIZERS WHERE email = ?");
    } else {
        $stmt = $pdo->prepare("SELECT customer_id as id, email, password_hash, nickname, first_name FROM CUSTOMERS WHERE email = ?");
    }
    
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($password, $user['password_hash'])) {
        $payload = [
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $role,
            'name' => $role === 'organizer' ? $user['company_name'] : $user['first_name']
        ];
        
        $token = generate_jwt($payload);
        echo json_encode([
            'message' => 'Login exitoso',
            'token' => $token,
            'user' => $payload
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Credenciales incorrectas']);
    }

} elseif ($action === 'register') {
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $role = $input['role'] ?? 'customer';
    
    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email y contraseña son requeridos']);
        exit();
    }
    
    $hash = password_hash($password, PASSWORD_BCRYPT);
    $nickname = $input['nickname'] ?? explode('@', $email)[0];
    $phone_number = $input['phone_number'] ?? '';
    
    try {
        if ($role === 'organizer') {
            $ruc = !empty($input['ruc']) ? $input['ruc'] : 'R-' . time(); // Ensure unique RUC to avoid 23000
            $company_name = $input['company_name'] ?? '';
            $trade_name = $input['trade_name'] ?? $company_name;
            $corp_phone = $input['corporate_phone_number'] ?? $phone_number;
            
            $stmt = $pdo->prepare("INSERT INTO ORGANIZERS (email, password_hash, nickname, phone_number, profile_image_url, ruc, company_name, trade_name, corporate_phone_number) 
                                   VALUES (?, ?, ?, ?, '', ?, ?, ?, ?)");
            $stmt->execute([$email, $hash, $nickname, $phone_number, $ruc, $company_name, $trade_name, $corp_phone]);
        } else {
            $first_name = $input['first_name'] ?? '';
            $last_name = $input['last_name'] ?? '';
            // Make sure these fit in VARCHAR(15). time() is 10 chars.
            $national_id = !empty($input['national_id']) ? $input['national_id'] : 'D-' . time();
            $foreign_id = !empty($input['foreigners_identity_card']) ? $input['foreigners_identity_card'] : 'E-' . time();
            $birthday = !empty($input['birthday']) ? $input['birthday'] : '2000-01-01';

            $stmt = $pdo->prepare("INSERT INTO CUSTOMERS (email, password_hash, nickname, phone_number, profile_image_url, national_id, foreigners_identity_card, birthday, first_name, last_name) 
                                   VALUES (?, ?, ?, ?, '', ?, ?, ?, ?, ?)");
            $stmt->execute([$email, $hash, $nickname, $phone_number, $national_id, $foreign_id, $birthday, $first_name, $last_name]);
        }
        
        echo json_encode(['message' => 'Registro exitoso. Ya puedes iniciar sesión.']);
    } catch (\PDOException $e) {
        if ($e->getCode() == 23000) {
            http_response_code(400);
            echo json_encode(['error' => 'El correo u otro dato único (como DNI o RUC) ya está registrado.']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Error al registrar', 'details' => $e->getMessage()]);
        }
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Acción no válida']);
}
?>
