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

    // 6. Cadastrar/Atualizar Lista de Sócios
    try {
        $partners = [
            ['name' => 'ADEMAR PEREIRA DE OLIVEIRA', 'cpf' => '212.213.596-49'],
            ['name' => 'ADRIANO JOSE REPISO LOPES', 'cpf' => '010.314.512-50'],
            ['name' => 'AGILMAR PASITO', 'cpf' => '975.427.092-91'],
            ['name' => 'AGNIELDE BENICI ADORNO', 'cpf' => '009.428.022-33'],
            ['name' => 'AILSON ANTÔNIO PEREIRA', 'cpf' => '271.866.602-15'],
            ['name' => 'AILSON WILHYAN CECCON PEREIRA', 'cpf' => '002.947.552-09'],
            ['name' => 'ALESSANDRO CESAR DA SILVA', 'cpf' => '604.142.192-87'],
            ['name' => 'ALESSANDRO RODRIGUES VIEIRA', 'cpf' => '004.913.352-70'],
            ['name' => 'AMANDA DOS SANTOS SOUZA', 'cpf' => '011.248.912-50'],
            ['name' => 'ANDERSON R MACHADO', 'cpf' => '014.123.062-21'],
            ['name' => 'ANDRE GRANDO', 'cpf' => '849.953.272-15'],
            ['name' => 'ANGELO DOS SANTOS FALCAO CLEMENTE', 'cpf' => '827.995.632-87'],
            ['name' => 'ANTONIO DE ALMEIDA', 'cpf' => '303.007.709-87'],
            ['name' => 'BRUNO CHAGAS DOS SANTOS', 'cpf' => '024.812.572-94'],
            ['name' => 'CARISMAR OTAVIO BARROS DE SOUZA', 'cpf' => '808.978.787-87'],
            ['name' => 'CARISVALDO PEREIRA DE SOUZA', 'cpf' => '087.187.417-20'],
            ['name' => 'CARLOS HENRIQUE DA SILVA', 'cpf' => '038.503.802-03'],
            ['name' => 'CARLOS OBADIAS VIEIRA PEREIRA', 'cpf' => '955.185.172-20'],
            ['name' => 'CHARLES EIJI ROSSO', 'cpf' => '010.437.239-78'],
            ['name' => 'CLAUDIA DIONE LAZZARIN PEREIRA', 'cpf' => '469.558.872-20'],
            ['name' => 'CRISTIANE GOULART', 'cpf' => '330.406.278-56'],
            ['name' => 'DARLAN DE PAULA', 'cpf' => '422.008.302-20'],
            ['name' => 'DOUGLAS ARAUJO ROBERTO', 'cpf' => '025.502.262-08'],
            ['name' => 'EDER PEREIRA DA CRUZ', 'cpf' => '410.269.261-49'],
            ['name' => 'EDNO ROGERIO CARDOSO', 'cpf' => '575.391.382-20'],
            ['name' => 'EDSON MARCELINO DA SILVA', 'cpf' => '649.055.942-00'],
            ['name' => 'ELIEL ROBSON DOS SANTOS', 'cpf' => '873.226.682-00'],
            ['name' => 'EMERSON CARLOS DA SILVA', 'cpf' => '312.179.742-53'],
            ['name' => 'EMERSON GONÇALVES NIZA', 'cpf' => '386.943.362-00'],
            ['name' => 'EMERSON GONÇALVES NIZA JUNIOR', 'cpf' => '811.595.952-91'],
            ['name' => 'EMERSON RAUPP ARAUJO FERMIANO', 'cpf' => '040.551.412-38'],
            ['name' => 'ERNANDO SANTOS MARTINS', 'cpf' => '415.821.281-20'],
            ['name' => 'EVANDRO LUIZ DALLE LASTE', 'cpf' => '595.413.002-78'],
            ['name' => 'FABRICIA UCHAKI DA SILVA', 'cpf' => '584.645.732-00'],
            ['name' => 'FAGNER POSSA', 'cpf' => '997.985.902-44'],
            ['name' => 'FERNANDO SCHERER', 'cpf' => '896.767.262-49'],
            ['name' => 'GEDEON DA COSTA PAULA', 'cpf' => '002.260.962-89'],
            ['name' => 'GIBSON PEREIRA OTONI', 'cpf' => '027.911.602-05'],
            ['name' => 'GLECIDES ANTONIO CARVALHO BORBA', 'cpf' => '946.718.421-49'],
            ['name' => 'IDALINA STRELOW', 'cpf' => '560.515.652-72'],
            ['name' => 'ILSON PARRÃO PARRÃO', 'cpf' => '174.111.491-87'],
            ['name' => 'JEFERSON JOÃO ZILES', 'cpf' => '565.142.802-00'],
            ['name' => 'JOÃO EWERSON GOMES GENELHUD', 'cpf' => '445.765.738-70'],
            ['name' => 'JOAO PEDRO PIRES CAETANO', 'cpf' => '050.258.972-89'],
            ['name' => 'JOCIMAR CARLOS SEEP', 'cpf' => '558.612.882-91'],
            ['name' => 'JONATHAN WILLIAN SOUZA ZEMKE', 'cpf' => '064.643.692-96'],
            ['name' => 'JORGITO OLIVEIRA TEIXEIRA', 'cpf' => '627.827.701-87'],
            ['name' => 'JORSIMAR RODRIGUES DE CASTRO', 'cpf' => '658.496.122-20'],
            ['name' => 'JOSE ALEXANDRE DA LAMARTA', 'cpf' => '520.179.902-72'],
            ['name' => 'JUCELIA LILLIAN DE PAULA', 'cpf' => '036.869.446-18'],
            ['name' => 'JULIANO CORDEIRO DE SOUZA', 'cpf' => '019.611.342-33'],
            ['name' => 'JULIO CEZAR FELIX', 'cpf' => '804.608.442-53'],
            ['name' => 'LARI MARQUETTI', 'cpf' => '395.456.609-53'],
            ['name' => 'LUCILO CANI', 'cpf' => '577.347.987-72'],
            ['name' => 'LUIZ CARLOS DE SOUSA', 'cpf' => '485.672.132-15'],
            ['name' => 'LUIZ TEIXEIRA DE AGUIAR', 'cpf' => '326.209.932-53'],
            ['name' => 'MARCELO TALLES PARRÃO', 'cpf' => '008.972.002-41'],
            ['name' => 'MARCOS DE ARAUJO ROCHA', 'cpf' => '565.752.622-87'],
            ['name' => 'MAURO ADRIANO DE SOUZA', 'cpf' => '473.700.416-20'],
            ['name' => 'MOACIR JOSÉ BALDISSERA', 'cpf' => '146.511.819-53'],
            ['name' => 'MOISES RAMOS DOS SANTOS', 'cpf' => '642.425.011-53'],
            ['name' => 'NELSON POLITA', 'cpf' => '581.040.209-78'],
            ['name' => 'NIRQUERSON GRANDO', 'cpf' => '934.882.032-04'],
            ['name' => 'OBERDA PLENTZ', 'cpf' => '741.464.839-72'],
            ['name' => 'OCLIDES THOMAZ ERLICH', 'cpf' => '799.381.672-68'],
            ['name' => 'ODITON DOUGLAS PEREIRA', 'cpf' => '303.648.681-04'],
            ['name' => 'PABLO TAVARES INACIO SILVEIRA', 'cpf' => '899.006.502-04'],
            ['name' => 'RAIMUNDO JOSE DE SOUZA NETO', 'cpf' => '106.944.472-34'],
            ['name' => 'RODRIGO BALDISSERA', 'cpf' => '385.954.512-49'],
            ['name' => 'RONIERI CARRARO DE SOUZA', 'cpf' => '031.502.902-10'],
            ['name' => 'SAMUEL BARBOSA CAVALCANTE', 'cpf' => '639.032.022-15'],
            ['name' => 'SOLIVAN JULIO DE ANDRADE', 'cpf' => '028.785.719-08'],
            ['name' => 'TALIS ROBERTO SIMONATO', 'cpf' => '826.710.012-15'],
            ['name' => 'TIAGO SILVA LEMOS', 'cpf' => '802.413.282-68'],
            ['name' => 'UILIAN AMARAL FIGUEIREDO', 'cpf' => '004.208.872-02'],
            ['name' => 'VANDERLI ANTONIO PAGOTO JUNIOR', 'cpf' => '818.942.602-87'],
            ['name' => 'VICENTE MATTOS ANTONELLI', 'cpf' => '049.326.702-65'],
            ['name' => 'VILMAR OGRODOWCZYK', 'cpf' => '555.129.259-20'],
        ];

        $stmtCheck = $db->prepare("SELECT id, is_partner FROM clients WHERE document = ?");
        $stmtInsert = $db->prepare("INSERT INTO clients (name, is_partner, is_company, document) VALUES (?, 1, 0, ?)");
        $stmtUpdate = $db->prepare("UPDATE clients SET is_partner = 1 WHERE id = ?");

        echo "\nCadastrando/Atualizando sócios...\n";
        $inserted = 0;
        $updated = 0;
        $skipped = 0;

        foreach ($partners as $partner) {
            $stmtCheck->execute([$partner['cpf']]);
            $existing = $stmtCheck->fetch();
            if ($existing) {
                if (!$existing['is_partner']) {
                    $stmtUpdate->execute([$existing['id']]);
                    $updated++;
                } else {
                    $skipped++;
                }
            } else {
                $stmtInsert->execute([$partner['name'], $partner['cpf']]);
                $inserted++;
            }
        }
        echo "[OK] Sócios processados: $inserted inseridos, $updated atualizados, $skipped pulados.\n";
    } catch (Exception $e) {
        echo "[ERRO] Erro ao cadastrar sócios: " . $e->getMessage() . "\n";
    }

    echo "\nAtualização concluída com sucesso!";
    echo "\nIMPORTANTE: APAGUE este arquivo do servidor por segurança.";

} catch (Exception $e) {
    echo "\nERRO DURANTE A ATUALIZAÇÃO: " . $e->getMessage();
}
