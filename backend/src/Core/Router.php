<?php

namespace App\Core;

use App\Core\Auth;

class Router
{
    private array $routes = [];

    public function add(string $method, string $path, string|callable $handler, bool $protected = false): void
    {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler,
            'protected' => $protected
        ];
    }

    public function handle(): void
    {
        $request_uri = $_SERVER['REQUEST_URI'];
        $path = parse_url($request_uri, PHP_URL_PATH);
        $path = str_replace(Config::getBasePath(), '', $path);
        if ($path === '' || $path === '/') {
            $path = '/';
        }
        $method = $_SERVER['REQUEST_METHOD'];

        foreach ($this->routes as $route) {
            $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<\1>[0-9]+)', $route['path']);
            $pattern = "#^" . $pattern . "$#";

            if ($route['method'] === $method && preg_match($pattern, $path, $matches)) {
                if ($route['protected']) {
                    Auth::check();
                }

                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                
                if (is_callable($route['handler'])) {
                    call_user_func_array($route['handler'], $params);
                    return;
                }

                if (is_string($route['handler']) && strpos($route['handler'], '@') !== false) {
                    [$controllerName, $action] = explode('@', $route['handler']);
                    $controllerClass = "App\\Controllers\\$controllerName";
                    
                    if (class_exists($controllerClass)) {
                        $controller = new $controllerClass();
                        if (method_exists($controller, $action)) {
                            call_user_func_array([$controller, $action], $params);
                            return;
                        }
                    }
                }
            }
        }

        http_response_code(404);
        echo json_encode(['error' => 'Route not found: ' . $path]);
    }
}
