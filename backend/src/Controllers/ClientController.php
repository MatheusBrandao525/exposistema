<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Database;

class ClientController extends Controller
{
    private $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function index(): void
    {
        $stmt = $this->db->query("SELECT * FROM clients ORDER BY name ASC");
        $this->jsonResponse($stmt->fetchAll());
    }

    public function store(): void
    {
        $data = $this->getPostData();
        $sql = "INSERT INTO clients (name, phone, company, email) VALUES (?, ?, ?, ?)";
        $this->db->prepare($sql)->execute([
            $data['name'], 
            $data['phone'] ?? null, 
            $data['company'] ?? null, 
            $data['email'] ?? null
        ]);
        $this->jsonResponse(['success' => true, 'id' => $this->db->lastInsertId()]);
    }

    public function update(int $id): void
    {
        $data = $this->getPostData();
        $sql = "UPDATE clients SET name = ?, phone = ?, company = ?, email = ? WHERE id = ?";
        $this->db->prepare($sql)->execute([
            $data['name'], 
            $data['phone'], 
            $data['company'], 
            $data['email'], 
            $id
        ]);
        $this->jsonResponse(['success' => true]);
    }

    public function delete(int $id): void
    {
        $this->db->prepare("DELETE FROM clients WHERE id = ?")->execute([$id]);
        $this->jsonResponse(['success' => true]);
    }

    public function search(): void
    {
        $q = $_GET['q'] ?? '';
        $stmt = $this->db->prepare("SELECT * FROM clients WHERE name LIKE ? OR company LIKE ? LIMIT 10");
        $stmt->execute(["%$q%", "%$q%"]);
        $this->jsonResponse($stmt->fetchAll());
    }
}
