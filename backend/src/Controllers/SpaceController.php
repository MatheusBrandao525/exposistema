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
        $data = $this->getPostData();
        $sql = "INSERT INTO ad_spaces (event_id, ad_space_type_id, name, base_price, status) VALUES (?, ?, ?, ?, ?)";
        $this->db->prepare($sql)->execute([
            1, 
            $data['ad_space_type_id'], 
            $data['name'], 
            $data['base_price'], 
            'available'
        ]);
        $this->jsonResponse(['success' => true, 'id' => $this->db->lastInsertId()]);
    }

    public function update(int $id): void
    {
        $data = $this->getPostData();
        $sql = "UPDATE ad_spaces SET name = ?, ad_space_type_id = ?, base_price = ?, status = ? WHERE id = ?";
        $this->db->prepare($sql)->execute([
            $data['name'], 
            $data['ad_space_type_id'], 
            $data['base_price'], 
            $data['status'], 
            $id
        ]);
        $this->jsonResponse(['success' => true]);
    }

    public function delete(int $id): void
    {
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
}
