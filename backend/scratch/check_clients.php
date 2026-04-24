<?php
require_once __DIR__ . '/../src/Core/Env.php';
require_once __DIR__ . '/../src/Core/Config.php';
require_once __DIR__ . '/../src/Core/Database.php';

use App\Core\Database;

try {
    $db = Database::getConnection();
    
    echo "--- CLIENTS TABLE ---\n";
    $stmt = $db->query("DESCRIBE clients");
    while ($row = $stmt->fetch()) {
        echo "{$row['Field']} - {$row['Type']}\n";
    }

    echo "\n--- SAMPLE CLIENTS ---\n";
    $clients = $db->query("SELECT * FROM clients LIMIT 5")->fetchAll();
    foreach ($clients as $client) {
        print_r($client);
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
