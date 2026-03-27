<?php

namespace App\Models;

use App\Core\Model;

class User extends Model
{
    protected string $table = 'users';

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch() ?: null;
    }

    public function create(array $data): bool
    {
        $sql = "INSERT INTO {$this->table} (name, email, password, role, seller_function) VALUES (?, ?, ?, ?, ?)";
        return $this->db->prepare($sql)->execute([
            $data['name'], 
            $data['email'], 
            password_hash($data['password'], PASSWORD_DEFAULT), 
            $data['role'] ?? 'seller',
            $data['seller_function'] ?? null
        ]);
    }
}
