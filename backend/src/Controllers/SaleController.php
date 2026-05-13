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
                    SUM(asp.base_price) as original_price,
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
        $user = \App\Core\Auth::getUser();
        if (!$user || $user['role'] !== 'seller') {
            $this->jsonResponse(['success' => false, 'error' => 'Apenas vendedores podem realizar vendas.'], 403);
            return;
        }

        $data = $this->getPostData();
        $this->db->beginTransaction();
        
        try {
            $status = in_array($data['status'] ?? '', ['paid', 'pending']) ? $data['status'] : 'pending';
            
            $sql = "INSERT INTO sales (event_id, client_id, user_id, negotiated_price, status, payment_method, observations, purchase_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                $data['event_id'] ?? 1,
                $data['client_id'],
                $data['user_id'] ?? 1,
                $data['total_price'],
                $status,
                $data['payment_method'] ?? 'pix',
                $data['observations'] ?? null,
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
                 ->execute([$sale_id, $data['total_price'], date('Y-m-d'), $status]);

            // Enviar email automático
            $client_stmt = $this->db->prepare("SELECT name, email FROM clients WHERE id = ?");
            $client_stmt->execute([$data['client_id']]);
            $client = $client_stmt->fetch();

            if ($client && !empty($client['email'])) {
                $to = $client['email'];
                $subject = "Confirmação de Contrato - Expovale #" . str_pad($sale_id, 4, '0', STR_PAD_LEFT);
                
                $itemsHtml = "";
                foreach ($data['items'] as $item) {
                    $itemsHtml .= "<li>" . htmlspecialchars($item['name'] ?? 'Espaço') . "</li>";
                }
                
                $totalFormatted = "R$ " . number_format($data['total_price'], 2, ',', '.');
                $statusText = $status === 'paid' ? 'Liquidado' : 'Pendente';
                
                $message = "
                <html>
                <head>
                  <title>Seu Comprovante</title>
                </head>
                <body style='font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px;'>
                  <h2 style='color: #000;'>Olá, {$client['name']}!</h2>
                  <p>Este é um e-mail automático confirmando a sua transação com a Expovale.</p>
                  <div style='background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee; margin: 20px 0;'>
                      <p style='margin: 5px 0;'><strong>Pedido:</strong> #" . str_pad($sale_id, 4, '0', STR_PAD_LEFT) . "</p>
                      <p style='margin: 5px 0;'><strong>Status:</strong> {$statusText}</p>
                      <p style='margin: 5px 0;'><strong>Total:</strong> {$totalFormatted}</p>
                  </div>
                  <h3>Itens Contratados:</h3>
                  <ul>{$itemsHtml}</ul>
                  <br>
                  <p>Agradecemos a parceria!</p>
                  <p><small>Equipe Expovale</small></p>
                </body>
                </html>
                ";

                $headers = "MIME-Version: 1.0" . "\r\n";
                $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
                $headers .= "From: contato@expovalesfg.com.br" . "\r\n";
                $headers .= "Reply-To: contato@expovalesfg.com.br" . "\r\n";

                @mail($to, $subject, $message, $headers);
            }

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

    public function mySales(): void
    {
        $user = \App\Core\Auth::getUser();
        if (!$user) {
            $this->jsonResponse(['error' => 'Não autorizado'], 401);
            return;
        }

        $sql = "SELECT 
                    s.*, 
                    s.negotiated_price as total_price,
                    c.name as client_name, 
                    u.name as seller_name, 
                    GROUP_CONCAT(asp.name) as item_names
                FROM sales s
                JOIN clients c ON s.client_id = c.id
                JOIN users u ON s.user_id = u.id
                LEFT JOIN sale_items si ON si.sale_id = s.id
                LEFT JOIN ad_spaces asp ON si.ad_space_id = asp.id
                WHERE s.user_id = ?
                GROUP BY s.id
                ORDER BY s.created_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$user['id']]);
        $sales = $stmt->fetchAll();
        
        $this->jsonResponse($sales);
    }

    public function updateStatus(int $id): void
    {
        $user = \App\Core\Auth::getUser();
        if (!$user) {
            $this->jsonResponse(['error' => 'Não autorizado'], 401);
            return;
        }

        $data = $this->getPostData();
        $status = $data['status'] ?? null;

        if (!$status) {
            $this->jsonResponse(['error' => 'Status não informado'], 400);
            return;
        }

        // Verificar se a venda pertence ao vendedor (ou se é admin)
        $stmt = $this->db->prepare("SELECT user_id FROM sales WHERE id = ?");
        $stmt->execute([$id]);
        $sale = $stmt->fetch();

        if (!$sale) {
            $this->jsonResponse(['error' => 'Venda não encontrada'], 404);
            return;
        }

        if ($sale['user_id'] != $user['id']) {
            $this->jsonResponse(['error' => 'Você não tem permissão para alterar esta venda. Apenas o vendedor proprietário pode fazê-lo.'], 403);
            return;
        }

        $allowedStatuses = ['pending', 'paid', 'expired', 'refused', 'cancelled'];
        // Mapear status do frontend (opcional, se vier em PT-BR)
        $statusMap = [
            'pendente' => 'pending',
            'pago' => 'paid',
            'expirado' => 'expired',
            'recusado' => 'refused',
            'cancelado' => 'cancelled'
        ];
        
        $finalStatus = $statusMap[$status] ?? $status;

        if (!in_array($finalStatus, $allowedStatuses)) {
            $this->jsonResponse(['error' => 'Status inválido'], 400);
            return;
        }

        $stmt = $this->db->prepare("UPDATE sales SET status = ? WHERE id = ?");
        $stmt->execute([$finalStatus, $id]);

        $spaceStatus = in_array($finalStatus, ['cancelled', 'refused', 'expired']) ? 'available' : 'sold';
        
        $this->db->prepare($sqlSpace)->execute([$spaceStatus, $id]);
        
        // Sincronizar status das parcelas
        if ($finalStatus === 'paid') {
            $this->db->prepare("UPDATE sale_installments SET status = 'paid', paid_at = NOW() WHERE sale_id = ? AND status = 'pending'")->execute([$id]);
        } elseif (in_array($finalStatus, ['cancelled', 'refused', 'expired'])) {
            $this->db->prepare("UPDATE sale_installments SET status = ? WHERE sale_id = ?")->execute([$finalStatus, $id]);
        } elseif ($finalStatus === 'pending') {
            $this->db->prepare("UPDATE sale_installments SET status = 'pending', paid_at = NULL WHERE sale_id = ?")->execute([$id]);
        }

        $this->jsonResponse(['success' => true]);
    }
}
