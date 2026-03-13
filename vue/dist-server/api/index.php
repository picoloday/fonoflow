<?php
/**
 * Gateway CI4 — redirige las peticiones /api/* al backend CodeIgniter
 * que está fuera del public_html.
 *
 * Estructura en el servidor:
 *   /home/user/ci4/public/index.php   ← CI4
 *   /home/user/public_html/api/index.php  ← este archivo
 */
$ci4Public = realpath(__DIR__ . '/../../ci4/public');

if (!$ci4Public || !file_exists($ci4Public . '/index.php')) {
    http_response_code(503);
    echo json_encode(['error' => 'Backend no disponible']);
    exit;
}

// Corregir SCRIPT_NAME para que CI4 no crea que está en /api/
$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['PHP_SELF']    = '/index.php';

chdir($ci4Public);
require $ci4Public . '/index.php';
