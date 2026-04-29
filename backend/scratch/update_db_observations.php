<?php
require_once __DIR__ . '/../src/Core/Env.php';
require_once __DIR__ . '/../src/Core/Config.php';
require_once __DIR__ . '/../src/Core/Database.php';

use App\Core\Database;

try {
    $db = Database::getConnection();
    
    // Add observations column to sales table
    $db->exec("ALTER TABLE sales ADD COLUMN observations TEXT DEFAULT NULL AFTER payment_method");
    
    echo "Database updated successfully (added observations to sales)!";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
