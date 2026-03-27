<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Database;

class TypeController extends Controller
{
    private $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function index(): void
    {
        $stmt = $this->db->query("SELECT * FROM ad_space_types");
        $this->jsonResponse($stmt->fetchAll());
    }

    public function store(): void
    {
        $data = $this->getPostData();
        $this->db->prepare("INSERT INTO ad_space_types (name) VALUES (?)")->execute([$data['name']]);
        $this->jsonResponse(['success' => true, 'id' => $this->db->lastInsertId()]);
    }

    public function delete(int $id): void
    {
        $this->db->prepare("DELETE FROM ad_space_types WHERE id = ?")->execute([$id]);
        $this->jsonResponse(['success' => true]);
    }
}
