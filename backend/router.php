<?php

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file = __DIR__ . $uri;

if (file_exists($file) && is_file($file)) {
    return false; // serve the requested resource as-is.
}

require_once __DIR__ . '/index.php';
