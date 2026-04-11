<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Database;
use Exception;

class SaleController extends Controller
{
    private $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function index(): void
    {
        $sql = "SELECT 
                    s.*, 
                    s.negotiated_price as total_price,
                    c.name as client_name, 
                    u.name as seller_name, 
                    u.seller_function as seller_function,
                    GROUP_CONCAT(t.name) as item_types_raw
                FROM sales s
                JOIN clients c ON s.client_id = c.id
                JOIN users u ON s.user_id = u.id
                LEFT JOIN sale_items si ON si.sale_id = s.id
                LEFT JOIN ad_spaces asp ON si.ad_space_id = asp.id
                LEFT JOIN ad_space_types t ON asp.ad_space_type_id = t.id
                GROUP BY s.id
                ORDER BY s.created_at DESC";
        $stmt = $this->db->query($sql);
        $sales = $stmt->fetchAll();
        
        foreach ($sales as &$sale) {
            $sale['item_types'] = $sale['item_types_raw'] ? explode(',', $sale['item_types_raw']) : [];
            unset($sale['item_types_raw']);
        }
        
        $this->jsonResponse($sales);
    }

    public function store(): void
    {
        $data = $this->getPostData();
        $this->db->beginTransaction();
        
        try {
            $sql = "INSERT INTO sales (event_id, client_id, user_id, negotiated_price, status, payment_method, purchase_date) VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                $data['event_id'] ?? 1,
                $data['client_id'],
                $data['user_id'] ?? 1,
                $data['total_price'],
                'pending',
                $data['payment_method'] ?? 'pending',
                date('Y-m-d')
            ]);
            $sale_id = $this->db->lastInsertId();

            $item_stmt = $this->db->prepare("INSERT INTO sale_items (sale_id, ad_space_id, item_price, quantity) VALUES (?, ?, ?, ?)");
            $update_space = $this->db->prepare("UPDATE ad_spaces SET status = 'sold' WHERE id = ?");

            foreach ($data['items'] as $item) {
                $item_stmt->execute([$sale_id, $item['id'], $item['price'], $item['quantity'] ?? 1]);
                $update_space->execute([$item['id']]);
            }

            $this->db->commit();

            // Gerar parcela automática para a venda
            $this->db->prepare("INSERT INTO sale_installments (sale_id, installment_number, amount, due_date, status) VALUES (?, 1, ?, ?, ?)")
                 ->execute([$sale_id, $data['total_price'], date('Y-m-d'), 'pending']);

            $this->jsonResponse(['success' => true, 'id' => $sale_id]);
        } catch (Exception $e) {
            $this->db->rollBack();
            $this->jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function show(int $id): void
    {
        $stmt = $this->db->prepare("SELECT s.*, s.negotiated_price as total_price, c.name as client_name, u.name as seller_name FROM sales s JOIN clients c ON s.client_id = c.id JOIN users u ON s.user_id = u.id WHERE s.id = ?");
        $stmt->execute([$id]);
        $sale = $stmt->fetch();
        if ($sale) {
            $item_stmt = $this->db->prepare("SELECT si.*, asp.name as item_name FROM sale_items si JOIN ad_spaces asp ON si.ad_space_id = asp.id WHERE si.sale_id = ?");
            $item_stmt->execute([$id]);
            $sale['items'] = $item_stmt->fetchAll();
            $this->jsonResponse($sale);
        } else {
            $this->jsonResponse(['error' => 'Venda não encontrada'], 404);
        }
    }
}
