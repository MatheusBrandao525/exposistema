<?php
require_once __DIR__ . '/../src/Core/Env.php';
require_once __DIR__ . '/../src/Core/Config.php';
require_once __DIR__ . '/../src/Core/Database.php';

use App\Core\Database;
use App\Core\Config;

Config::init();
$db = Database::getConnection();

echo "Iniciando sincronização de status de parcelas...\n";

// Buscar vendas pagas que tenham parcelas pendentes
$sql = "SELECT id FROM sales WHERE status = 'paid'";
$stmt = $db->query($sql);
$sales = $stmt->fetchAll();

$count = 0;
foreach ($sales as $sale) {
    $saleId = $sale['id'];
    
    // Atualizar parcelas pendentes para pagas se a venda estiver paga
    $updateStmt = $db->prepare("UPDATE sale_installments SET status = 'paid', paid_at = NOW() WHERE sale_id = ? AND status = 'pending'");
    $updateStmt->execute([$saleId]);
    
    $affected = $updateStmt->rowCount();
    if ($affected > 0) {
        echo "Venda #$saleId: $affected parcelas atualizadas para 'paid'.\n";
        $count += $affected;
    }
}

echo "Sincronização concluída. Total de parcelas corrigidas: $count\n";
