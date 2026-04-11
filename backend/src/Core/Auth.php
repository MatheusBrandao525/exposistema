<?php
namespace App\Core;

class Auth {
    private static function getSecret(): string {
        return Config::getJwtSecret();
    }

    public static function generateToken(array $payload): string {
        $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
        $payload['exp'] = time() + (86400 * 7); // 7 days
        $payload_json = json_encode($payload);

        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload_json));

        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, self::getSecret(), true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }

    public static function verifyToken(?string $token): ?array {
        if (!$token) return null;

        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        list($header, $payload, $signature) = $parts;

        $validSignature = hash_hmac('sha256', $header . "." . $payload, self::getSecret(), true);
        $base64ValidSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($validSignature));

        if ($signature !== $base64ValidSignature) return null;

        $data = json_decode(base64_decode($payload), true);
        if (isset($data['exp']) && $data['exp'] < time()) return null;

        return $data;
    }

    public static function check(): void {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        $token = str_replace('Bearer ', '', $authHeader);

        $user = self::verifyToken($token);
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Não autorizado']);
            exit;
        }
    }
}
