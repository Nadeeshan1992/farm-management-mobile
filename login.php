<?php
// login.php - Dedicated Farm Login Page
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (isset($_GET['logout'])) {
    $_SESSION['user'] = null;
    unset($_SESSION['user']);
    session_destroy();
}

include __DIR__ . '/login.html';
