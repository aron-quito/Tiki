<?php
require 'config.php';
$token = generate_jwt(['id' => 1, 'role' => 'organizer']);
echo $token;
