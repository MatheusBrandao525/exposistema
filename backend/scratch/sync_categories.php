<?php
require_once __DIR__ . '/src/Core/Env.php';
require_once __DIR__ . '/src/Core/Config.php';
require_once __DIR__ . '/src/Core/Database.php';

use App\Core\Database;

try {
    $db = Database::getConnection();
    
    // Ajustando os nomes das categorias para baterem com as permissões da Amanda
    $db->exec("UPDATE ad_space_types SET name = 'Camarote' WHERE name = 'Camarotes'");
    $db->exec("UPDATE ad_space_types SET name = 'Mesas de rodapé' WHERE name = 'Mesas'");
    $db->exec("UPDATE ad_space_types SET name = 'Banner Digital' WHERE name = 'Publicidade Digital'");
    
    echo "Categorias sincronizadas com as permissões dos vendedores!\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
