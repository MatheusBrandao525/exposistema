<?php
require_once __DIR__ . '/../src/Core/Env.php';
require_once __DIR__ . '/../src/Core/Config.php';
require_once __DIR__ . '/../src/Core/Database.php';

use App\Core\Database;

try {
    $db = Database::getConnection();
    
    // 1. Ensure type 5 exists for Sponsorship/Fees
    $stmt = $db->prepare("SELECT id FROM ad_space_types WHERE id = 5");
    $stmt->execute();
    if (!$stmt->fetch()) {
        $db->exec("INSERT INTO ad_space_types (id, name) VALUES (5, 'Patrocínio e Taxas')");
        echo "Created type 5: Patrocínio e Taxas\n";
    }

    $event_id = 1; // EXPOVALE 2026

    $items = [
        ['name' => 'MURO EXTERNO', 'price' => 1000.00, 'type' => 4],
        ['name' => 'MURO INTERNO', 'price' => 1000.00, 'type' => 4],
        ['name' => 'ADESIVO BAR DO SALAO', 'price' => 2500.00, 'type' => 4],
        ['name' => 'EITAO DO SALAO', 'price' => 3000.00, 'type' => 4],
        ['name' => 'MURO DO BANHEIRO', 'price' => 1500.00, 'type' => 4],
        ['name' => 'ADESIVO AO LADO DO CAMARIM', 'price' => 1200.00, 'type' => 4],
        ['name' => 'ADESIVO EITAO CONCURSO LEITEIRO', 'price' => 1500.00, 'type' => 4],
        ['name' => 'ADESIVO MURO FRENTE DO SALAO', 'price' => 1000.00, 'type' => 4],
        ['name' => 'BANNERS PORTAL DA ENTRADA DO DECK', 'price' => 2000.00, 'type' => 4],
        ['name' => 'PORTEIRA DENTRO DA ARENA', 'price' => 10000.00, 'type' => 4],
        ['name' => 'VT DE LED', 'price' => 1000.00, 'type' => 4],
        ['name' => 'LOCUÇÃO DE PALCO', 'price' => 1500.00, 'type' => 4],
        ['name' => 'LOCUÇÃO DE PALCO E VT DE LED', 'price' => 2250.00, 'type' => 4],
        ['name' => 'TESTEIRA DE LED', 'price' => 3000.00, 'type' => 4],
        ['name' => 'LOCUÇÃO E TESTEIRA DE LED E VT', 'price' => 5000.00, 'type' => 4],
        ['name' => 'CAMAROTE', 'price' => 3000.00, 'type' => 2],
        ['name' => 'MESA DO RODAPE', 'price' => 1200.00, 'type' => 3],
        ['name' => 'CURRAL PARA EXPOSITORES DE BOIS', 'price' => 1500.00, 'type' => 1],
        ['name' => 'ESPAÇO DE EXPOSITORES', 'price' => 1000.00, 'type' => 1],
        ['name' => 'TENDAS PARA EXPOSITORES 10X10', 'price' => 3000.00, 'type' => 1],
        ['name' => 'TENDAS PARA EXPOSITORES 5X5', 'price' => 1000.00, 'type' => 1],
        ['name' => 'ANUIDADE DOS SOCIOS', 'price' => 800.00, 'type' => 5],
        ['name' => 'ADESAO DE SOCIOS', 'price' => 1500.00, 'type' => 5],
        ['name' => 'PATROCINADORES MASTER', 'price' => 20000.00, 'type' => 5],
        ['name' => 'PRATIBANDA DO BANHEIRO SOCIAL', 'price' => 2000.00, 'type' => 4],
    ];

    $sql = "INSERT INTO ad_spaces (event_id, ad_space_type_id, name, base_price, status) VALUES (?, ?, ?, ?, 'available')";
    $stmt = $db->prepare($sql);

    foreach ($items as $item) {
        // Check if item already exists to avoid exact duplicates
        $check = $db->prepare("SELECT id FROM ad_spaces WHERE name = ? AND event_id = ?");
        $check->execute([$item['name'], $event_id]);
        if (!$check->fetch()) {
            $stmt->execute([$event_id, $item['type'], $item['name'], $item['price']]);
            echo "Inserted: {$item['name']} - R$ " . number_format($item['price'], 2, ',', '.') . "\n";
        } else {
            echo "Skipped (already exists): {$item['name']}\n";
        }
    }

    echo "\nAll items processed successfully!\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
