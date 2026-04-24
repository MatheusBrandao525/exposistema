<?php
require_once __DIR__ . '/../src/Core/Env.php';
require_once __DIR__ . '/../src/Core/Config.php';
require_once __DIR__ . '/../src/Core/Database.php';

use App\Core\Database;

try {
    $db = Database::getConnection();
    
    echo "--- AD SPACE TYPES ---\n";
    $types = $db->query("SELECT * FROM ad_space_types")->fetchAll();
    foreach ($types as $type) {
        echo "ID: {$type['id']} | Name: {$type['name']}\n";
    }
    
    echo "\n--- CURRENT AD SPACES (first 5) ---\n";
    $spaces = $db->query("SELECT * FROM ad_spaces LIMIT 5")->fetchAll();
    foreach ($spaces as $space) {
        echo "ID: {$space['id']} | Name: {$space['name']} | Price: {$space['base_price']}\n";
    }

    echo "\n--- EVENTS ---\n";
    $events = $db->query("SELECT * FROM events")->fetchAll();
    foreach ($events as $event) {
        echo "ID: {$event['id']} | Name: {$event['name']}\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
