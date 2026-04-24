<?php
require_once __DIR__ . '/../src/Core/Env.php';
require_once __DIR__ . '/../src/Core/Config.php';
require_once __DIR__ . '/../src/Core/Database.php';

use App\Core\Database;

try {
    $db = Database::getConnection();
    
    // Expand role column to support 'treasurer' and others
    $db->exec("ALTER TABLE users MODIFY COLUMN role VARCHAR(20) DEFAULT 'seller'");
    
    // Also ensure seller_function is large enough for multiple functions
    $db->exec("ALTER TABLE users MODIFY COLUMN seller_function VARCHAR(255) DEFAULT NULL");
    
    echo "Database updated successfully!";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
