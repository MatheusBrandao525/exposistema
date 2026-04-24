<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Database;

class SpaceController extends Controller
{
    private $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function index(): void
    {
        $stmt = $this->db->query("SELECT s.*, t.name as type_name FROM ad_spaces s LEFT JOIN ad_space_types t ON s.ad_space_type_id = t.id");
        $this->jsonResponse($stmt->fetchAll());
    }

    public function store(): void
    {
        \App\Core\Auth::checkRole(['admin']);
        $data = $this->getPostData();
        $sql = "INSERT INTO ad_spaces (event_id, ad_space_type_id, name, base_price, status, allows_discount) VALUES (?, ?, ?, ?, ?, ?)";
        $this->db->prepare($sql)->execute([
            1, 
            $data['ad_space_type_id'], 
            $data['name'], 
            $data['base_price'], 
            'available',
            $data['allows_discount'] ?? true
        ]);
        $this->jsonResponse(['success' => true, 'id' => $this->db->lastInsertId()]);
    }

    public function update(int $id): void
    {
        \App\Core\Auth::checkRole(['admin']);
        $data = $this->getPostData();
        $sql = "UPDATE ad_spaces SET name = ?, ad_space_type_id = ?, base_price = ?, status = ?, allows_discount = ? WHERE id = ?";
        $this->db->prepare($sql)->execute([
            $data['name'], 
            $data['ad_space_type_id'], 
            $data['base_price'], 
            $data['status'], 
            $data['allows_discount'] ?? true,
            $id
        ]);
        $this->jsonResponse(['success' => true]);
    }

    public function delete(int $id): void
    {
        \App\Core\Auth::checkRole(['admin']);
        $this->db->prepare("DELETE FROM ad_spaces WHERE id = ?")->execute([$id]);
        $this->jsonResponse(['success' => true]);
    }

    public function search(): void
    {
        $q = $_GET['q'] ?? '';
        $stmt = $this->db->prepare("SELECT s.*, t.name as type_name FROM ad_spaces s LEFT JOIN ad_space_types t ON s.ad_space_type_id = t.id WHERE (s.name LIKE ? OR t.name LIKE ?) AND s.status = 'available' LIMIT 20");
        $stmt->execute(["%$q%", "%$q%"]);
        $this->jsonResponse($stmt->fetchAll());
    }

    public function getBookingDetails(int $id): void
    {
        $sql = "SELECT 
                    s.id as sale_id,
                    s.purchase_date,
                    s.status as payment_status,
                    c.name as client_name,
                    c.company as client_company,
                    u.name as seller_name,
                    si.item_price as negotiated_price
                FROM sale_items si
                JOIN sales s ON si.sale_id = s.id
                JOIN clients c ON s.client_id = c.id
                JOIN users u ON s.user_id = u.id
                WHERE si.ad_space_id = ?
                ORDER BY s.created_at DESC
                LIMIT 1";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        $details = $stmt->fetch();
        
        if ($details) {
            $this->jsonResponse($details);
        } else {
            $this->jsonResponse(['error' => 'Nenhuma reserva encontrada para este espaço.'], 404);
        }
    }
}
