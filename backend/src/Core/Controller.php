<?php

namespace App\Core;

class Controller
{
    protected function jsonResponse(array $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    protected function getPostData(): array
    {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }

    protected function requireAdmin(): void
    {
        Auth::checkRole(['admin']);
    }
}

