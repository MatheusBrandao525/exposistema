<?php

namespace App\Core;

class Config
{
    public static function init()
    {
        Env::load(__DIR__ . '/../../.env');
    }

    public static function getDBHost(): string { return Env::get('DB_HOST', '127.0.0.1'); }
    public static function getDBName(): string { return Env::get('DB_NAME', 'exposistema'); }
    public static function getDBUser(): string { return Env::get('DB_USER', 'root'); }
    public static function getDBPass(): string { return Env::get('DB_PASS', ''); }
    public static function getDBCharset(): string { return Env::get('DB_CHARSET', 'utf8mb4'); }
    public static function getBasePath(): string { return Env::get('BASE_PATH', '/api'); }
    public static function getCorsOrigin(): string { return Env::get('CORS_ORIGIN', '*'); }
    public static function getJwtSecret(): string { return Env::get('JWT_SECRET', 'fallback-secret-key'); }
}
