<?php
// backend/config.php

$host = getenv('DB_HOST') ?: '127.0.0.1';
$db   = getenv('DB_NAME') ?: 'my_database'; 
$user = getenv('DB_USER') ?: 'db_user';     
$pass = getenv('DB_PASS') ?: 'db_pass';     
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

define('JWT_SECRET', 'super_secret_key_for_this_app_12345');

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
}

function generate_jwt($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['iat'] = time();
    $payload['exp'] = time() + (86400); // 1 day expiration
    $payload_json = json_encode($payload);
    
    $base64UrlHeader = base64url_encode($header);
    $base64UrlPayload = base64url_encode($payload_json);
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = base64url_encode($signature);
    
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verify_jwt($jwt) {
    $tokenParts = explode('.', $jwt);
    if(count($tokenParts) != 3) return false;
    
    $header = base64url_decode($tokenParts[0]);
    $payload = base64url_decode($tokenParts[1]);
    $signature_provided = $tokenParts[2];
    
    $payload_arr = json_decode($payload, true);
    if(!$payload_arr || !isset($payload_arr['exp']) || $payload_arr['exp'] < time()) {
        return false; // Expired or invalid
    }
    
    $base64UrlHeader = base64url_encode($header);
    $base64UrlPayload = base64url_encode($payload);
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = base64url_encode($signature);
    
    if ($base64UrlSignature === $signature_provided) {
        return $payload_arr;
    }
    return false;
}

function get_auth_user() {
    $authHeader = '';
    
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        if (isset($requestHeaders['Authorization'])) {
            $authHeader = trim($requestHeaders['Authorization']);
        } elseif (isset($requestHeaders['authorization'])) {
            $authHeader = trim($requestHeaders['authorization']);
        }
    }
    
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $jwt = $matches[1];
        return verify_jwt($jwt);
    }
    return false;
}
?>
