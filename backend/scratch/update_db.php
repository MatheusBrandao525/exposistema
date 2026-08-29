<?php
/**
 * SCRIPT DE ATUALIZAÇÃO DO BANCO DE DADOS EM PRODUÇÃO
 * Executado via rota /api/update-db-schema-2026
 */

use App\Core\Database;

header('Content-Type: text/plain; charset=utf-8');

try {
    $db = Database::getConnection();
    echo "Iniciando atualização do banco de dados...\n\n";

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

    // 2a. Atualizar Tabela de Espaços (Adicionar controls_stock e stock_qty)
    try {
        $db->exec("ALTER TABLE ad_spaces ADD COLUMN controls_stock BOOLEAN DEFAULT FALSE");
        echo "[OK] Coluna 'controls_stock' adicionada à tabela 'ad_spaces'.\n";
    } catch (Exception $e) {
        echo "[INFO] Coluna 'controls_stock' já existe ou erro ignorado.\n";
    }

    try {
        $db->exec("ALTER TABLE ad_spaces ADD COLUMN stock_qty INT DEFAULT 0");
        echo "[OK] Coluna 'stock_qty' adicionada à tabela 'ad_spaces'.\n";
    } catch (Exception $e) {
        echo "[INFO] Coluna 'stock_qty' já existe ou erro ignorado.\n";
    }

    // 3. Atualizar Tabela de Vendas (Adicionar card_brand)
    try {
        $db->exec("ALTER TABLE sales ADD COLUMN card_brand VARCHAR(50) NULL");
        echo "[OK] Coluna 'card_brand' adicionada à tabela 'sales'.\n";
    } catch (Exception $e) {
        echo "[INFO] Coluna 'card_brand' já existe ou erro ignorado.\n";
    }

    // 4. Atualizar Tabela de Vendas (Adicionar card_fee_rate)
    try {
        $db->exec("ALTER TABLE sales ADD COLUMN card_fee_rate DECIMAL(5,2) NULL DEFAULT 0.00");
        echo "[OK] Coluna 'card_fee_rate' adicionada à tabela 'sales'.\n";
    } catch (Exception $e) {
        echo "[INFO] Coluna 'card_fee_rate' já existe ou erro ignorado.\n";
    }

    // 5. Atualizar Tabela de Vendas (Adicionar card_fee_amount)
    try {
        $db->exec("ALTER TABLE sales ADD COLUMN card_fee_amount DECIMAL(12,2) NULL DEFAULT 0.00");
        echo "[OK] Coluna 'card_fee_amount' adicionada à tabela 'sales'.\n";
    } catch (Exception $e) {
        echo "[INFO] Coluna 'card_fee_amount' já existe ou erro ignorado.\n";
    }

    echo "\nAtualização concluída com sucesso!";

} catch (Exception $e) {
    echo "\nERRO DURANTE A ATUALIZAÇÃO: " . $e->getMessage();
}
