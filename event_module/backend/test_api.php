<?php
require 'config.php';
$_SERVER['REQUEST_METHOD'] = 'POST';

// Mock get_auth_user
function get_auth_user_mock() {
    return ['id' => 1, 'role' => 'organizer'];
}

// Modify remove_attendance.php locally to use the mock
$code = file_get_contents('remove_attendance.php');
$code = str_replace('get_auth_user()', 'get_auth_user_mock()', $code);
// Remove header calls and config.php include
$code = preg_replace('/header\(.*?\);/', '', $code);
$code = str_replace("require_once 'config.php';", '', $code);

file_put_contents('remove_attendance_mocked.php', $code);

$input = json_encode(['event_id' => 3, 'ticket_id' => 1]);
file_put_contents('php://input', $input);

ob_start();
include 'remove_attendance_mocked.php';
$out = ob_get_clean();
echo "\nOUTPUT: $out\n";
