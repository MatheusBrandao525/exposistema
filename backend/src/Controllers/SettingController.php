<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Database;

class SettingController extends Controller
{
    private $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function index(): void
    {
        $stmt = $this->db->query("SELECT * FROM settings");
        $results = $stmt->fetchAll(\PDO::FETCH_KEY_PAIR);
        $this->jsonResponse($results);
    }

    public function store(): void
    {
        \App\Core\Auth::checkRole(['admin']);
        $data = $this->getPostData();
        foreach($data as $key => $value) {
            $this->db->prepare("INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?")->execute([$key, $value, $value]);
        }
        $this->jsonResponse(['success' => true]);
    }
}
