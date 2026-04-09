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

    // Mantendo constantes para compatibilidade legada se necessário, mas desencorajado
    public const DB_HOST = '127.0.0.1'; 
    public const DB_NAME = 'exposistema';
    public const DB_USER = 'root';
    public const DB_PASS = '1Exagon1@';
    public const DB_CHARSET = 'utf8mb4';
    public const BASE_PATH = '/api';
}
