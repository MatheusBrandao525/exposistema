<?php

namespace App\Core;

class Logger
{
    public static function log(string $message, $data = null): void
    {
        $logFile = __DIR__ . '/../../logs/app.log';
        $logDir = dirname($logFile);
        
        if (!is_dir($logDir)) {
            @mkdir($logDir, 0777, true);
        }
        
        if (!is_dir($logDir) || !is_writable($logDir)) {
            return;
        }
        
        $timestamp = date('Y-m-d H:i:s');
        $formattedData = $data ? json_encode($data, JSON_PRETTY_PRINT) : '';
        $logEntry = "[$timestamp] $message " . ($formattedData ? "\nData: $formattedData" : "") . "\n" . str_repeat('-', 40) . "\n";
        
        file_put_contents($logFile, $logEntry, FILE_APPEND);
    }

    public static function error(string $message, \Throwable $e): void
    {
        self::log("ERROR: $message - " . $e->getMessage() . "\nStack Trace: " . $e->getTraceAsString());
    }
}
