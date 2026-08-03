<?php
/**
 * SCRIPT DE ATUALIZAÇÃO DO BANCO DE DADOS - PRODUÇÃO
 * Este script deve ser executado uma única vez após o deploy.
 */

require_once __DIR__ . '/src/Core/Env.php';
require_once __DIR__ . '/src/Core/Config.php';
require_once __DIR__ . '/src/Core/Database.php';

use App\Core\Database;

header('Content-Type: text/plain');

try {
    $db = Database::getConnection();
    echo "Iniciando atualização...\n\n";

    // 1. Atualizar Tabela de Clientes (Adicionar is_partner)
    try {
        $db->exec("ALTER TABLE clients ADD COLUMN is_partner BOOLEAN DEFAULT FALSE");
        echo "[OK] Coluna 'is_partner' adicionada à tabela 'clients'.\n";
    } catch (Exception $e) {
        echo "[INFO] Coluna 'is_partner' já existe ou erro ignorado.\n";
    }

    // 2. Atualizar Tabela de Espaços (Adicionar allows_discount)
    try {
        $db->exec("ALTER TABLE ad_spaces ADD COLUMN allows_discount BOOLEAN DEFAULT TRUE");
        echo "[OK] Coluna 'allows_discount' adicionada à tabela 'ad_spaces'.\n";
    } catch (Exception $e) {
        echo "[INFO] Coluna 'allows_discount' já existe ou erro ignorado.\n";
    }

    // 2b. Atualizar Tabela de Vendas (Adicionar card_brand, card_fee_rate, card_fee_amount)
    try {
        $db->exec("ALTER TABLE sales ADD COLUMN card_brand VARCHAR(50) NULL");
        echo "[OK] Coluna 'card_brand' adicionada à tabela 'sales'.\n";
    } catch (Exception $e) {
        echo "[INFO] Coluna 'card_brand' já existe ou erro ignorado.\n";
    }

    try {
        $db->exec("ALTER TABLE sales ADD COLUMN card_fee_rate DECIMAL(5,2) NULL DEFAULT 0.00");
        echo "[OK] Coluna 'card_fee_rate' adicionada à tabela 'sales'.\n";
    } catch (Exception $e) {
        echo "[INFO] Coluna 'card_fee_rate' já existe ou erro ignorado.\n";
    }

    try {
        $db->exec("ALTER TABLE sales ADD COLUMN card_fee_amount DECIMAL(12,2) NULL DEFAULT 0.00");
        echo "[OK] Coluna 'card_fee_amount' adicionada à tabela 'sales'.\n";
    } catch (Exception $e) {
        echo "[INFO] Coluna 'card_fee_amount' já existe ou erro ignorado.\n";
    }


    // 3. Criar Tipo de Espaço 5 (Patrocínio e Taxas)
    $stmt = $db->prepare("SELECT id FROM ad_space_types WHERE id = 5");
    $stmt->execute();
    if (!$stmt->fetch()) {
        $db->exec("INSERT INTO ad_space_types (id, name) VALUES (5, 'Patrocínio e Taxas')");
        echo "[OK] Tipo de espaço 'Patrocínio e Taxas' criado.\n";
    }

    // 4. Cadastrar Novos Itens
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

    $sqlInsert = "INSERT INTO ad_spaces (event_id, ad_space_type_id, name, base_price, status, allows_discount) VALUES (?, ?, ?, ?, 'available', ?)";
    $stmtInsert = $db->prepare($sqlInsert);

    foreach ($items as $item) {
        $check = $db->prepare("SELECT id FROM ad_spaces WHERE name = ? AND event_id = ?");
        $check->execute([$item['name'], $event_id]);
        if (!$check->fetch()) {
            $allowDisc = ($item['name'] === 'PATROCINADORES MASTER') ? 0 : 1;
            $stmtInsert->execute([$event_id, $item['type'], $item['name'], $item['price'], $allowDisc]);
            echo "[OK] Item inserido: {$item['name']}\n";
        } else {
            echo "[SKIP] Item já existe: {$item['name']}\n";
        }
    }

    // 5. Atualizar Tabela de Usuários (Adicionar username)
    try {
        $db->exec("ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE NULL");
        echo "[OK] Coluna 'username' adicionada à tabela 'users'.\n";
    } catch (Exception $e) {
        echo "[INFO] Coluna 'username' já existe ou erro ignorado.\n";
    }

    try {
        $db->exec("UPDATE users SET username = SUBSTRING_INDEX(email, '@', 1) WHERE username IS NULL");
        echo "[OK] Nomes de usuário provisórios gerados para os usuários existentes.\n";
    } catch (Exception $e) {
        echo "[INFO] Não foi possível gerar nomes de usuário provisórios: " . $e->getMessage() . "\n";
    }

    echo "\nAtualização concluída com sucesso!";
    echo "\nIMPORTANTE: APAGUE este arquivo do servidor por segurança.";

} catch (Exception $e) {
    echo "\nERRO DURANTE A ATUALIZAÇÃO: " . $e->getMessage();
}
