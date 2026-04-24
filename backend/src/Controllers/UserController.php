<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Database;

class UserController extends Controller
{
    private $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function index(): void
    {
        \App\Core\Auth::checkRole(['admin', 'treasurer']);
        $stmt = $this->db->query("SELECT id, name, email, role, seller_function, created_at FROM users ORDER BY name ASC");
        $this->jsonResponse($stmt->fetchAll());
    }

    public function store(): void
    {
        \App\Core\Auth::checkRole(['admin']);
        $data = $this->getPostData();
        \App\Core\Logger::log("Tentativa de criar usuário", $data);
        
        try {
            $sql = "INSERT INTO users (name, email, password, role, seller_function) VALUES (?, ?, ?, ?, ?)";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                $data['name'], 
                $data['email'], 
                password_hash($data['password'], PASSWORD_DEFAULT), 
                $data['role'] ?? 'seller',
                $data['seller_function'] ?? null
            ]);
            $this->jsonResponse(['success' => true, 'id' => $this->db->lastInsertId()]);
        } catch (\PDOException $e) {
            $error = $e->getMessage();
            if (strpos($error, 'Duplicate entry') !== false) {
                $error = 'Este e-mail já está sendo utilizado por outro colaborador.';
            }
            $this->jsonResponse(['success' => false, 'error' => $error], 400);
        } catch (\Exception $e) {
            $this->jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function update(int $id): void
    {
        \App\Core\Auth::checkRole(['admin']);
        $data = $this->getPostData();
        
        try {
            if (!empty($data['password'])) {
                $sql = "UPDATE users SET name = ?, email = ?, role = ?, seller_function = ?, password = ? WHERE id = ?";
                $this->db->prepare($sql)->execute([
                    $data['name'], 
                    $data['email'], 
                    $data['role'], 
                    $data['seller_function'], 
                    password_hash($data['password'], PASSWORD_DEFAULT), 
                    $id
                ]);
            } else {
                $sql = "UPDATE users SET name = ?, email = ?, role = ?, seller_function = ? WHERE id = ?";
                $this->db->prepare($sql)->execute([
                    $data['name'], 
                    $data['email'], 
                    $data['role'], 
                    $data['seller_function'], 
                    $id
                ]);
            }
            $this->jsonResponse(['success' => true]);
        } catch (\PDOException $e) {
            $error = $e->getMessage();
            if (strpos($error, 'Duplicate entry') !== false) {
                $error = 'Este e-mail já está sendo utilizado por outro colaborador.';
            }
            $this->jsonResponse(['success' => false, 'error' => $error], 400);
        } catch (\Exception $e) {
            $this->jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function delete(int $id): void
    {
        $this->requireAdmin();
        $this->db->prepare("DELETE FROM users WHERE id = ?")->execute([$id]);
        $this->jsonResponse(['success' => true]);
    }

    public function login(): void
    {
        $data = $this->getPostData();
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch();

        if ($user && password_verify($data['password'], $user['password'])) {
            unset($user['password']);
            $token = \App\Core\Auth::generateToken($user);
            $this->jsonResponse([
                'success' => true, 
                'user' => $user,
                'token' => $token
            ]);
        } else {
            $this->jsonResponse(['error' => 'Credenciais inválidas'], 401);
        }
    }
}
