<?php
// backend-pure/index.php - Roteador API Simples

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

require_once __DIR__ . '/config.php';

$request_uri = $_SERVER['REQUEST_URI'];
$base_path = '/api'; // Ajuste conforme necessário

// Remove query strings
$path = parse_url($request_uri, PHP_URL_PATH);
$path = str_replace($base_path, '', $path);
$method = $_SERVER['REQUEST_METHOD'];

// Roteamento Simples
try {
    if ($path === '/' || $path === '') {
        echo json_encode(['message' => 'ExpoSistema API is running!', 'version' => '1.0.0']);
        
    } elseif ($path == '/spaces' && $method == 'GET') {
        $stmt = $pdo->query("SELECT s.*, t.name as type_name FROM ad_spaces s LEFT JOIN ad_space_types t ON s.ad_space_type_id = t.id");
        echo json_encode($stmt->fetchAll());
        
    } elseif ($path == '/clients' && $method == 'GET') {
        $stmt = $pdo->query("SELECT * FROM clients ORDER BY name ASC");
        echo json_encode($stmt->fetchAll());

    } elseif ($path == '/clients' && $method == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $sql = "INSERT INTO clients (name, phone, company, email) VALUES (?, ?, ?, ?)";
        $pdo->prepare($sql)->execute([$data['name'], $data['phone'] ?? null, $data['company'] ?? null, $data['email'] ?? null]);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);

    } elseif (preg_match('/^\/clients\/(\d+)$/', $path, $matches) && $method == 'PUT') {
        $id = $matches[1];
        $data = json_decode(file_get_contents('php://input'), true);
        $sql = "UPDATE clients SET name = ?, phone = ?, company = ?, email = ? WHERE id = ?";
        $pdo->prepare($sql)->execute([$data['name'], $data['phone'], $data['company'], $data['email'], $id]);
        echo json_encode(['success' => true]);

    } elseif (preg_match('/^\/clients\/(\d+)$/', $path, $matches) && $method == 'DELETE') {
        $id = $matches[1];
        $pdo->prepare("DELETE FROM clients WHERE id = ?")->execute([$id]);
        echo json_encode(['success' => true]);

    } elseif ($path == '/sales' && $method == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $pdo->beginTransaction();
        
        try {
            $sql = "INSERT INTO sales (event_id, client_id, user_id, total_price, status, payment_method, purchase_date) VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['event_id'] ?? 1,
                $data['client_id'],
                $data['user_id'] ?? 1, // Fallback p/ dev
                $data['total_price'],
                'pending',
                $data['payment_method'] ?? 'pending',
                date('Y-m-d')
            ]);
            $sale_id = $pdo->lastInsertId();

            $item_sql = "INSERT INTO sale_items (sale_id, ad_space_id, item_price, quantity) VALUES (?, ?, ?, ?)";
            $item_stmt = $pdo->prepare($item_sql);
            
            foreach ($data['items'] as $item) {
                $item_stmt->execute([$sale_id, $item['id'], $item['price'], $item['quantity'] ?? 1]);
                
                // Marca espaço como vendido ou reservado
                $pdo->prepare("UPDATE ad_spaces SET status = 'sold' WHERE id = ?")->execute([$item['id']]);
            }

            $pdo->commit();
            echo json_encode(['success' => true, 'id' => $sale_id]);
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }

    } elseif ($path == '/sales' && $method == 'GET') {
        $sql = "SELECT 
                    s.*, 
                    c.name as client_name, 
                    u.name as seller_name, 
                    u.seller_function as seller_function
                FROM sales s
                JOIN clients c ON s.client_id = c.id
                JOIN users u ON s.user_id = u.id
                ORDER BY s.created_at DESC";
        $stmt = $pdo->query($sql);
        $sales = $stmt->fetchAll();
        
        // Para cada venda, buscar os tipos de itens nela contidos
        foreach ($sales as &$sale) {
            $item_sql = "SELECT t.name 
                         FROM sale_items si 
                         JOIN ad_spaces asp ON si.ad_space_id = asp.id 
                         JOIN ad_space_types t ON asp.ad_space_type_id = t.id 
                         WHERE si.sale_id = ?";
            $item_stmt = $pdo->prepare($item_sql);
            $item_stmt->execute([$sale['id']]);
            $sale['item_types'] = $item_stmt->fetchAll(PDO::FETCH_COLUMN);
        }
        
        echo json_encode($sales);

    } elseif ($path == '/types' && $method == 'GET') {
        $stmt = $pdo->query("SELECT * FROM ad_space_types");
        echo json_encode($stmt->fetchAll());

    } elseif ($path == '/settings' && $method == 'GET') {
        $stmt = $pdo->query("SELECT * FROM settings");
        $results = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        echo json_encode($results);

    } elseif ($path == '/settings' && $method == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        foreach($data as $key => $value) {
            $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?")->execute([$key, $value, $value]);
        }
        echo json_encode(['success' => true]);

    } elseif ($path == '/users' && $method == 'GET') {
        $stmt = $pdo->query("SELECT id, name, email, role, seller_function, created_at FROM users ORDER BY name ASC");
        echo json_encode($stmt->fetchAll());

    } elseif ($path == '/users' && $method == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $sql = "INSERT INTO users (name, email, password, role, seller_function) VALUES (?, ?, ?, ?, ?)";
        // Para simplificar nesse estágio, usaremos a senha pura ou md5. O ideal seria password_hash.
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['name'], 
            $data['email'], 
            password_hash($data['password'], PASSWORD_DEFAULT), 
            $data['role'] ?? 'seller',
            $data['seller_function'] ?? null
        ]);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);

    } elseif ($path == '/login' && $method == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch();

        if ($user && password_verify($data['password'], $user['password'])) {
            unset($user['password']);
            echo json_encode(['success' => true, 'user' => $user]);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Credenciais inválidas']);
        }

    } elseif ($path == '/clients/search' && $method == 'GET') {
        $q = $_GET['q'] ?? '';
        $stmt = $pdo->prepare("SELECT * FROM clients WHERE name LIKE ? OR company LIKE ? LIMIT 10");
        $stmt->execute(["%$q%", "%$q%"]);
        echo json_encode($stmt->fetchAll());

    } elseif ($path == '/spaces/search' && $method == 'GET') {
        $q = $_GET['q'] ?? '';
        $stmt = $pdo->prepare("SELECT s.*, t.name as type_name FROM ad_spaces s JOIN ad_space_types t ON s.ad_space_type_id = t.id WHERE s.name LIKE ? AND s.status = 'available' LIMIT 10");
        $stmt->execute(["%$q%"]);
        echo json_encode($stmt->fetchAll());

    } elseif ($path == '/spaces' && $method == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $sql = "INSERT INTO ad_spaces (event_id, ad_space_type_id, name, base_price, status) VALUES (?, ?, ?, ?, ?)";
        $pdo->prepare($sql)->execute([1, $data['ad_space_type_id'], $data['name'], $data['base_price'], 'available']);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);

    } elseif (preg_match('/^\/spaces\/(\d+)$/', $path, $matches) && $method == 'PUT') {
        $id = $matches[1];
        $data = json_decode(file_get_contents('php://input'), true);
        $sql = "UPDATE ad_spaces SET name = ?, ad_space_type_id = ?, base_price = ?, status = ? WHERE id = ?";
        $pdo->prepare($sql)->execute([$data['name'], $data['ad_space_type_id'], $data['base_price'], $data['status'], $id]);
        echo json_encode(['success' => true]);

    } elseif (preg_match('/^\/spaces\/(\d+)$/', $path, $matches) && $method == 'DELETE') {
        $id = $matches[1];
        $pdo->prepare("DELETE FROM ad_spaces WHERE id = ?")->execute([$id]);
        echo json_encode(['success' => true]);

    } elseif (preg_match('/^\/users\/(\d+)$/', $path, $matches) && $method == 'PUT') {
        $id = $matches[1];
        $data = json_decode(file_get_contents('php://input'), true);
        if (!empty($data['password'])) {
            $sql = "UPDATE users SET name = ?, email = ?, role = ?, seller_function = ?, password = ? WHERE id = ?";
            $pdo->prepare($sql)->execute([$data['name'], $data['email'], $data['role'], $data['seller_function'], password_hash($data['password'], PASSWORD_DEFAULT), $id]);
        } else {
            $sql = "UPDATE users SET name = ?, email = ?, role = ?, seller_function = ? WHERE id = ?";
            $pdo->prepare($sql)->execute([$data['name'], $data['email'], $data['role'], $data['seller_function'], $id]);
        }
        echo json_encode(['success' => true]);

    } elseif ($path == '/stats' && $method == 'GET') {
        $revenue = $pdo->query("SELECT SUM(total_price) FROM sales WHERE status = 'paid'")->fetchColumn() ?: 0;
        $count = $pdo->query("SELECT COUNT(*) FROM sales")->fetchColumn() ?: 0;
        $clients = $pdo->query("SELECT COUNT(*) FROM clients")->fetchColumn() ?: 0;
        $spaces = $pdo->query("SELECT COUNT(*) FROM ad_spaces WHERE status = 'available'")->fetchColumn() ?: 0;
        echo json_encode(['total_revenue' => $revenue, 'total_sales' => $count, 'total_clients' => $clients, 'available_spaces' => $spaces]);

    } elseif (preg_match('/^\/sales\/(\d+)$/', $path, $matches) && $method == 'GET') {
        $id = $matches[1];
        $stmt = $pdo->prepare("SELECT s.*, c.name as client_name, u.name as seller_name FROM sales s JOIN clients c ON s.client_id = c.id JOIN users u ON s.user_id = u.id WHERE s.id = ?");
        $stmt->execute([$id]);
        $sale = $stmt->fetch();
        if ($sale) {
            $item_stmt = $pdo->prepare("SELECT si.*, asp.name as item_name FROM sale_items si JOIN ad_spaces asp ON si.ad_space_id = asp.id WHERE si.sale_id = ?");
            $item_stmt->execute([$id]);
            $sale['items'] = $item_stmt->fetchAll();
            echo json_encode($sale);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Venda não encontrada']);
        }

    } elseif ($path == '/types' && $method == 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $pdo->prepare("INSERT INTO ad_space_types (name) VALUES (?)")->execute([$data['name']]);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);

    } elseif (preg_match('/^\/types\/(\d+)$/', $path, $matches) && $method == 'DELETE') {
        $id = $matches[1];
        $pdo->prepare("DELETE FROM ad_space_types WHERE id = ?")->execute([$id]);
        echo json_encode(['success' => true]);

    } elseif (preg_match('/^\/users\/(\d+)$/', $path, $matches) && $method == 'DELETE') {
        $id = $matches[1];
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);

    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Route not found: ' . $path]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
