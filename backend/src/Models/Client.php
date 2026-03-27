<?php

namespace App\Models;

use App\Core\Model;

class Client extends Model
{
    protected string $table = 'clients';

    public function create(array $data): bool
    {
        $sql = "INSERT INTO {$this->table} (name, phone, company, email) VALUES (?, ?, ?, ?)";
        return $this->db->prepare($sql)->execute([
            $data['name'], 
            $data['phone'] ?? null, 
            $data['company'] ?? null, 
            $data['email'] ?? null
        ]);
    }

    public function search(string $query): array
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE name LIKE ? OR company LIKE ? LIMIT 10");
        $stmt->execute(["%$query%", "%$query%"]);
        return $stmt->fetchAll();
    }
}
