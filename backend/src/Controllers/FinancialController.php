<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Database;

class FinancialController extends Controller
{
    private $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function index(): void
    {
        $sql = "SELECT 
                    i.*, 
                    s.negotiated_price as total_sale_price,
                    s.purchase_date as sale_date,
                    u.name as seller_name,
                    u.id as seller_id,
                    c.name as client_name,
                    c.company as client_company,
                    (SELECT GROUP_CONCAT(DISTINCT t.name) FROM ad_space_types t JOIN ad_spaces asp ON t.id = asp.ad_space_type_id JOIN sale_items si ON asp.id = si.ad_space_id WHERE si.sale_id = s.id) as category_names_raw,
                    (SELECT GROUP_CONCAT(DISTINCT t.id) FROM ad_space_types t JOIN ad_spaces asp ON t.id = asp.ad_space_type_id JOIN sale_items si ON asp.id = si.ad_space_id WHERE si.sale_id = s.id) as category_ids_raw
                FROM sale_installments i
                JOIN sales s ON i.sale_id = s.id
                JOIN clients c ON s.client_id = c.id
                LEFT JOIN users u ON s.user_id = u.id
                ORDER BY i.due_date ASC";
        
        $stmt = $this->db->query($sql);
        $results = $stmt->fetchAll();
        
        foreach ($results as &$row) {
            $row['categories'] = $row['category_names_raw'] ? explode(',', $row['category_names_raw']) : [];
            $row['category_ids'] = $row['category_ids_raw'] ? explode(',', $row['category_ids_raw']) : [];
            unset($row['category_names_raw']);
            unset($row['category_ids_raw']);
        }
        
        $this->jsonResponse($results);
    }

    public function updateStatus(int $id): void
    {
        $data = $this->getPostData();
        $status = $data['status']; // 'paid' or 'pending'
        $paidAt = ($status === 'paid') ? date('Y-m-d H:i:s') : null;

        $sql = "UPDATE sale_installments SET status = ?, paid_at = ? WHERE id = ?";
        $this->db->prepare($sql)->execute([$status, $paidAt, $id]);

        // Se todas as parcelas da venda forem pagas, atualizar status da venda para 'paid'
        $stmt = $this->db->prepare("SELECT sale_id FROM sale_installments WHERE id = ?");
        $stmt->execute([$id]);
        $saleId = $stmt->fetchColumn();

        $stmt = $this->db->prepare("SELECT count(*) FROM sale_installments WHERE sale_id = ? AND status = 'pending'");
        $stmt->execute([$saleId]);
        $pendingCount = $stmt->fetchColumn();

        if ($pendingCount == 0) {
            $this->db->prepare("UPDATE sales SET status = 'paid' WHERE id = ?")->execute([$saleId]);
        } else {
            $this->db->prepare("UPDATE sales SET status = 'pending' WHERE id = ?")->execute([$saleId]);
        }

        $this->jsonResponse(['success' => true]);
    }

    public function stats(): void
    {
        $stats = [];
        
        // Total Recebido
        $stats['total_paid'] = $this->db->query("SELECT SUM(amount) FROM sale_installments WHERE status = 'paid'")->fetchColumn() ?: 0;
        
        // Total Pendente
        $stats['total_pending'] = $this->db->query("SELECT SUM(amount) FROM sale_installments WHERE status = 'pending' AND due_date >= CURDATE()")->fetchColumn() ?: 0;
        
        // Total Atrasado
        $stats['total_overdue'] = $this->db->query("SELECT SUM(amount) FROM sale_installments WHERE status = 'pending' AND due_date < CURDATE()")->fetchColumn() ?: 0;
        
        // Lucro Livre Arrecadado (descontando as taxas de cartão das vendas liquidadas)
        $stats['total_net_profit'] = $this->db->query("SELECT SUM(negotiated_price - card_fee_amount) FROM sales WHERE status = 'paid'")->fetchColumn() ?: 0;
        
        // Fluxo mensal (últimos 6 meses)
        $sql = "SELECT 
                    DATE_FORMAT(due_date, '%Y-%m') as month,
                    SUM(amount) as total
                FROM sale_installments
                GROUP BY month
                ORDER BY month DESC
                LIMIT 6";
        $stats['monthly_flow'] = $this->db->query($sql)->fetchAll();

        $this->jsonResponse($stats);
    }
}
