<?php

namespace App\Core;

class Router
{
    private array $routes = [];

    public function add(string $method, string $path, string $handler): void
    {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler
        ];
    }

    public function handle(): void
    {
        $request_uri = $_SERVER['REQUEST_URI'];
        $path = parse_url($request_uri, PHP_URL_PATH);
        $path = str_replace(Config::BASE_PATH, '', $path);
        if ($path === '' || $path === '/') {
            $path = '/';
        }
        $method = $_SERVER['REQUEST_METHOD'];

        foreach ($this->routes as $route) {
            $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<\1>[0-9]+)', $route['path']);
            $pattern = "#^" . $pattern . "$#";

            if ($route['method'] === $method && preg_match($pattern, $path, $matches)) {
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
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

        http_response_code(404);
        echo json_encode(['error' => 'Route not found: ' . $path]);
    }
}
