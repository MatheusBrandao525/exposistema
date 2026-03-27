<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

// Simple PSR-4 Autoloader
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $base_dir = __DIR__ . '/src/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

use App\Core\Router;

$router = new Router();

// Define Routes
$router->add('GET', '/', 'HomeController@index');

// Clients
$router->add('GET', '/clients', 'ClientController@index');
$router->add('POST', '/clients', 'ClientController@store');
$router->add('PUT', '/clients/{id}', 'ClientController@update');
$router->add('DELETE', '/clients/{id}', 'ClientController@delete');
$router->add('GET', '/clients/search', 'ClientController@search');

// Spaces
$router->add('GET', '/spaces', 'SpaceController@index');
$router->add('POST', '/spaces', 'SpaceController@store');
$router->add('PUT', '/spaces/{id}', 'SpaceController@update');
$router->add('DELETE', '/spaces/{id}', 'SpaceController@delete');
$router->add('GET', '/spaces/search', 'SpaceController@search');

// Sales
$router->add('GET', '/sales', 'SaleController@index');
$router->add('POST', '/sales', 'SaleController@store');
$router->add('GET', '/sales/{id}', 'SaleController@show');

// Users
$router->add('GET', '/users', 'UserController@index');
$router->add('POST', '/users', 'UserController@store');
$router->add('PUT', '/users/{id}', 'UserController@update');
$router->add('DELETE', '/users/{id}', 'UserController@delete');
$router->add('POST', '/login', 'UserController@login');

// Settings
$router->add('GET', '/settings', 'SettingController@index');
$router->add('POST', '/settings', 'SettingController@store');

// Types
$router->add('GET', '/types', 'TypeController@index');
$router->add('POST', '/types', 'TypeController@store');
$router->add('DELETE', '/types/{id}', 'TypeController@delete');

// Stats
$router->add('GET', '/stats', 'HomeController@stats');

$router->handle();
