<?php
require_once __DIR__ . '/../src/Core/Env.php';
require_once __DIR__ . '/../src/Core/Config.php';
require_once __DIR__ . '/../src/Core/Database.php';

use App\Core\Database;

try {
    $db = Database::getConnection();
    
    // Add is_partner to clients
    $db->exec("ALTER TABLE clients ADD COLUMN is_partner BOOLEAN DEFAULT FALSE");
    echo "Added is_partner column to clients table.\n";
    
    // Add allows_discount to ad_spaces (default TRUE, but FALSE for Patrocinio Master)
    $db->exec("ALTER TABLE ad_spaces ADD COLUMN allows_discount BOOLEAN DEFAULT TRUE");
    echo "Added allows_discount column to ad_spaces table.\n";
    
    // Update Patrocinio Master to not allow discount
    $db->exec("UPDATE ad_spaces SET allows_discount = FALSE WHERE name LIKE '%PATROCINADORES MASTER%'");
    echo "Updated 'PATROCINADORES MASTER' to not allow discounts.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
