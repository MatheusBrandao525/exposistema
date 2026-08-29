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
                    (SELECT SUM(base_price) FROM ad_spaces JOIN sale_items ON ad_spaces.id = sale_items.ad_space_id WHERE sale_items.sale_id = s.id) as original_price,
                    c.name as client_name, 
                    u.name as seller_name, 
                    u.seller_function as seller_function,
                    (SELECT GROUP_CONCAT(t.name) FROM ad_space_types t JOIN ad_spaces asp ON t.id = asp.ad_space_type_id JOIN sale_items si ON asp.id = si.ad_space_id WHERE si.sale_id = s.id) as item_types_raw
                FROM sales s
                JOIN clients c ON s.client_id = c.id
                JOIN users u ON s.user_id = u.id
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
        if (!$user || !in_array($user['role'], ['seller', 'admin', 'treasurer'])) {
            $this->jsonResponse(['success' => false, 'error' => 'Apenas vendedores, administradores e tesoureiros podem realizar vendas.'], 403);
            return;
        }

        $data = $this->getPostData();
        $this->db->beginTransaction();
        
        try {
            $status = in_array($data['status'] ?? '', ['paid', 'pending']) ? $data['status'] : 'pending';
            
            $cardBrand = null;
            $cardFeeRate = 0.00;
            $cardFeeAmount = 0.00;
            
            $paymentMethod = $data['payment_method'] ?? 'pix';
            if ($paymentMethod === 'credito' && !empty($data['card_brand'])) {
                $cardBrand = $data['card_brand'];
                $fee_stmt = $this->db->prepare("SELECT value FROM settings WHERE `key` = 'card_fees'");
                $fee_stmt->execute();
                $cardFeesJson = $fee_stmt->fetchColumn();
                if ($cardFeesJson) {
                    $feesArray = json_decode($cardFeesJson, true);
                    if (is_array($feesArray)) {
                        foreach ($feesArray as $fee) {
                            if (strcasecmp($fee['brand'], $cardBrand) === 0) {
                                $cardFeeRate = floatval($fee['rate']);
                                break;
                            }
                        }
                    }
                }
                $cardFeeAmount = floatval($data['total_price']) * ($cardFeeRate / 100);
            }
            
            $sql = "INSERT INTO sales (event_id, client_id, user_id, negotiated_price, status, payment_method, observations, purchase_date, card_brand, card_fee_rate, card_fee_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                $data['event_id'] ?? 1,
                $data['client_id'],
                $data['user_id'] ?? 1,
                $data['total_price'],
                $status,
                $paymentMethod,
                $data['observations'] ?? null,
                date('Y-m-d'),
                $cardBrand,
                $cardFeeRate,
                $cardFeeAmount
            ]);
            $sale_id = $this->db->lastInsertId();

            $item_stmt = $this->db->prepare("INSERT INTO sale_items (sale_id, ad_space_id, item_price, quantity) VALUES (?, ?, ?, ?)");
            $space_stmt = $this->db->prepare("SELECT controls_stock, stock_qty FROM ad_spaces WHERE id = ?");

            foreach ($data['items'] as $item) {
                $qty = $item['quantity'] ?? 1;
                $item_stmt->execute([$sale_id, $item['id'], $item['price'], $qty]);

                // Query current stock status
                $space_stmt->execute([$item['id']]);
                $space = $space_stmt->fetch();

                if ($space) {
                    if ($space['controls_stock']) {
                        $new_stock = max(0, (int)$space['stock_qty'] - $qty);
                        if ($new_stock <= 0) {
                            $this->db->prepare("UPDATE ad_spaces SET stock_qty = ?, status = 'sold' WHERE id = ?")
                                     ->execute([$new_stock, $item['id']]);
                        } else {
                            $this->db->prepare("UPDATE ad_spaces SET stock_qty = ? WHERE id = ?")
                                     ->execute([$new_stock, $item['id']]);
                        }
                    } else {
                        // Does not control stock, do not set status to sold. Leave it available!
                    }
                }
            }

            $this->db->commit();

            $this->db->prepare("INSERT INTO sale_installments (sale_id, installment_number, amount, due_date, status) VALUES (?, 1, ?, ?, ?)")
                 ->execute([$sale_id, $data['total_price'], date('Y-m-d'), $status]);

            $this->jsonResponse(['success' => true, 'id' => $sale_id]);
        } catch (Exception $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            $this->jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function show(int $id): void
    {
        $stmt = $this->db->prepare("SELECT s.*, s.negotiated_price as total_price, (SELECT SUM(base_price) FROM ad_spaces JOIN sale_items ON ad_spaces.id = sale_items.ad_space_id WHERE sale_items.sale_id = s.id) as original_price, c.name as client_name, u.name as seller_name FROM sales s JOIN clients c ON s.client_id = c.id JOIN users u ON s.user_id = u.id WHERE s.id = ?");
        $stmt->execute([$id]);
        $sale = $stmt->fetch();
        if ($sale) {
            $user = \App\Core\Auth::getUser();
            if ($user && $user['role'] !== 'admin' && $user['role'] !== 'treasurer') {
                unset($sale['card_fee_rate']);
                unset($sale['card_fee_amount']);
            }
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
                    (SELECT SUM(base_price) FROM ad_spaces JOIN sale_items ON ad_spaces.id = sale_items.ad_space_id WHERE sale_items.sale_id = s.id) as original_price,
                    c.name as client_name, 
                    u.name as seller_name, 
                    (SELECT GROUP_CONCAT(asp.name) FROM ad_spaces asp JOIN sale_items si ON asp.id = si.ad_space_id WHERE si.sale_id = s.id) as item_names
                FROM sales s
                JOIN clients c ON s.client_id = c.id
                JOIN users u ON s.user_id = u.id
                WHERE s.user_id = ?
                ORDER BY s.created_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$user['id']]);
        $sales = $stmt->fetchAll();
        foreach ($sales as &$sale) {
            unset($sale['card_fee_rate']);
            unset($sale['card_fee_amount']);
        }
        $this->jsonResponse($sales);
    }

    public function updateStatus(int $id): void
    {
        try {
            $user = \App\Core\Auth::getUser();
            if (!$user) throw new Exception("Não autorizado");

            $data = $this->getPostData();
            $status = $data['status'] ?? null;
            if (!$status) throw new Exception("Status não informado");

            $stmt = $this->db->prepare("SELECT user_id FROM sales WHERE id = ?");
            $stmt->execute([$id]);
            $sale = $stmt->fetch();
            if (!$sale) throw new Exception("Venda não encontrada");

            if ($user['role'] !== 'admin' && $user['role'] !== 'treasurer' && $sale['user_id'] != $user['id']) throw new Exception("Acesso negado");

            $statusMap = ['pendente' => 'pending', 'pago' => 'paid', 'expirado' => 'expired', 'recusado' => 'refused', 'cancelado' => 'cancelled', 'cancelada' => 'cancelled'];
            $finalStatus = $statusMap[$status] ?? $status;
            $spaceStatus = in_array($finalStatus, ['cancelled', 'refused', 'expired']) ? 'available' : 'sold';

            $this->db->beginTransaction();

            // 1. Atualizar Venda
            $this->db->prepare("UPDATE sales SET status = ? WHERE id = ?")->execute([$finalStatus, $id]);

            // 2. Atualizar Espaços com base em controle de estoque
            $items_stmt = $this->db->prepare("SELECT ad_space_id, quantity FROM sale_items WHERE sale_id = ?");
            $items_stmt->execute([$id]);
            $sale_items = $items_stmt->fetchAll();

            $space_stmt = $this->db->prepare("SELECT controls_stock, stock_qty FROM ad_spaces WHERE id = ?");

            foreach ($sale_items as $s_item) {
                $space_stmt->execute([$s_item['ad_space_id']]);
                $space = $space_stmt->fetch();

                if ($space) {
                    if (in_array($finalStatus, ['cancelled', 'refused', 'expired'])) {
                        // Cancelling sale: release stock if controlled
                        if ($space['controls_stock']) {
                            $new_stock = (int)$space['stock_qty'] + (int)$s_item['quantity'];
                            $this->db->prepare("UPDATE ad_spaces SET stock_qty = ?, status = 'available' WHERE id = ?")
                                     ->execute([$new_stock, $s_item['ad_space_id']]);
                        } else {
                            $this->db->prepare("UPDATE ad_spaces SET status = 'available' WHERE id = ?")
                                     ->execute([$s_item['ad_space_id']]);
                        }
                    } else {
                        // Activating/Confirming sale: deduct stock if controlled
                        if ($space['controls_stock']) {
                            $new_stock = max(0, (int)$space['stock_qty'] - (int)$s_item['quantity']);
                            $new_status = $new_stock <= 0 ? 'sold' : 'available';
                            $this->db->prepare("UPDATE ad_spaces SET stock_qty = ?, status = ? WHERE id = ?")
                                     ->execute([$new_stock, $new_status, $s_item['ad_space_id']]);
                        } else {
                            // Does not control stock, do not set status to sold. Leave it available!
                        }
                    }
                }
            }

            // 3. Sincronizar status das parcelas
            if ($finalStatus === 'paid') {
                $this->db->prepare("UPDATE sale_installments SET status = 'paid', paid_at = NOW() WHERE sale_id = ? AND status = 'pending'")->execute([$id]);
            } elseif (in_array($finalStatus, ['cancelled', 'refused', 'expired'])) {
                $this->db->prepare("UPDATE sale_installments SET status = ? WHERE sale_id = ?")->execute([$finalStatus, $id]);
            } elseif ($finalStatus === 'pending') {
                $this->db->prepare("UPDATE sale_installments SET status = 'pending', paid_at = NULL WHERE sale_id = ?")->execute([$id]);
            }

            $this->db->commit();
            $this->jsonResponse(['success' => true]);

        } catch (Exception $e) {
            if ($this->db->inTransaction()) $this->db->rollBack();
            $this->jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
