<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Database;

class HomeController extends Controller
{
    public function index(): void
    {
        $this->jsonResponse([
            'message' => 'ExpoSistema Professional API is running!',
            'version' => '2.0.0',
            'status' => 'success'
        ]);
    }

    public function stats(): void
    {
        $db = Database::getConnection();
        $revenue = $db->query("SELECT SUM(negotiated_price) FROM sales WHERE status = 'paid'")->fetchColumn() ?: 0;
        $count = $db->query("SELECT COUNT(*) FROM sales WHERE status IN ('paid', 'pending')")->fetchColumn() ?: 0;
        $clients = $db->query("SELECT COUNT(*) FROM clients")->fetchColumn() ?: 0;
        $spaces = $db->query("SELECT COUNT(*) FROM ad_spaces WHERE status = 'available'")->fetchColumn() ?: 0;
        
        $this->jsonResponse([
            'total_revenue' => $revenue,
            'total_sales' => $count,
            'total_clients' => $clients,
            'available_spaces' => $spaces
        ]);
    }
}
