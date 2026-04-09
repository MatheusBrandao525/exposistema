require_once __DIR__ . '/src/Core/Env.php';
require_once __DIR__ . '/src/Core/Config.php';

App\Core\Config::init();

header('Access-Control-Allow-Origin: ' . App\Core\Config::getCorsOrigin());
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

// Simple PSR-4 Autoloader
spl_autoload_register(function ($class) {
    if (class_exists($class)) return;
    
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
use App\Core\Config;

$router = new Router();

// Define Routes
$router->add('GET', '/', 'HomeController@index');

// Auth
$router->add('POST', '/login', 'UserController@login');

// Protected Routes (Clients)
$router->add('GET', '/clients', 'ClientController@index', true);
$router->add('POST', '/clients', 'ClientController@store', true);
$router->add('PUT', '/clients/{id}', 'ClientController@update', true);
$router->add('DELETE', '/clients/{id}', 'ClientController@delete', true);
$router->add('GET', '/clients/search', 'ClientController@search', true);

// Protected Routes (Spaces)
$router->add('GET', '/spaces', 'SpaceController@index', true);
$router->add('POST', '/spaces', 'SpaceController@store', true);
$router->add('PUT', '/spaces/{id}', 'SpaceController@update', true);
$router->add('DELETE', '/spaces/{id}', 'SpaceController@delete', true);
$router->add('GET', '/spaces/search', 'SpaceController@search', true);

// Protected Routes (Sales)
$router->add('GET', '/sales', 'SaleController@index', true);
$router->add('POST', '/sales', 'SaleController@store', true);
$router->add('GET', '/sales/{id}', 'SaleController@show', true);

// Users
$router->add('GET', '/users', 'UserController@index', true);
$router->add('POST', '/users', 'UserController@store', true);
$router->add('PUT', '/users/{id}', 'UserController@update', true);
$router->add('DELETE', '/users/{id}', 'UserController@delete', true);

// Settings
$router->add('GET', '/settings', 'SettingController@index', true);
$router->add('POST', '/settings', 'SettingController@store', true);

// Types
$router->add('GET', '/types', 'TypeController@index', true);
$router->add('POST', '/types', 'TypeController@store', true);
$router->add('DELETE', '/types/{id}', 'TypeController@delete', true);

// Stats
$router->add('GET', '/stats', 'HomeController@stats', true);

$router->handle();
