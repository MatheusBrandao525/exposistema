<?php
// backend-pure/config.php - Configurações e Conexão de Banco de Dados

// Configurações do MySQL
$host = '127.0.0.1';
$db   = 'exposistema';
$user = 'root';
$pass = '1Exagon1@';
$charset = 'utf8mb4';

$dsn_base = "mysql:host=$host;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn_base, $user, $pass, $options);
    
    // Cria o banco de dados se não existir
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `$db` ");
    
    // Inicialização automática das tabelas...
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS events (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            address VARCHAR(255),
            start_date DATE,
            end_date DATE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS ad_space_types (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS ad_spaces (
            id INT PRIMARY KEY AUTO_INCREMENT,
            event_id INT,
            ad_space_type_id INT,
            name VARCHAR(255) NOT NULL,
            location VARCHAR(255),
            status ENUM('available', 'reserved', 'sold') DEFAULT 'available',
            base_price DECIMAL(12, 2),
            image_path VARCHAR(255),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS clients (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(50),
            company VARCHAR(255),
            email VARCHAR(255),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('admin', 'seller') DEFAULT 'seller',
            seller_function VARCHAR(255), -- Ex: Mesas de rodapé, Stands, etc.
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sales (
            id INT PRIMARY KEY AUTO_INCREMENT,
            event_id INT,
            client_id INT,
            user_id INT,
            total_price DECIMAL(12, 2) DEFAULT 0,
            status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
            payment_method VARCHAR(100),
            total_installments INT DEFAULT 1,
            purchase_date DATE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (client_id) REFERENCES clients(id)
        );

        CREATE TABLE IF NOT EXISTS sale_items (
            id INT PRIMARY KEY AUTO_INCREMENT,
            sale_id INT,
            ad_space_id INT,
            item_price DECIMAL(12, 2),
            quantity INT DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sale_id) REFERENCES sales(id),
            FOREIGN KEY (ad_space_id) REFERENCES ad_spaces(id)
        );
    ");

    // Seed básico para teste se estiver vazio
    $count = $pdo->query("SELECT count(*) FROM ad_space_types")->fetchColumn();
    if ($count == 0) {
        $pdo->exec("INSERT INTO ad_space_types (name) VALUES ('Banner'), ('Digital'), ('Totem')");
        $pdo->exec("INSERT INTO events (name, start_date, end_date) VALUES ('Expo Agro 2026', '2026-05-01', '2026-05-10')");
        $pdo->exec("INSERT INTO ad_spaces (event_id, ad_space_type_id, name, base_price, status) VALUES (1, 1, 'Banner Arena A1', 4500, 'available'), (1, 2, 'Telão Principal', 12000, 'available')");
        $pdo->exec("INSERT INTO clients (name, company, email) VALUES ('João Silva', 'AgroForte', 'joao@agro.com'), ('Maria Souza', 'Mercado Central', 'maria@mercado.com')");
        $pdo->exec("INSERT INTO users (name, email, password, role, seller_function) VALUES ('Admin', 'admin@admin.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Administrador'), ('Vendedor Teste', 'vendedor@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'seller', 'Stands')");
        
        // Venda dummy para visualização
        $pdo->exec("INSERT INTO sales (event_id, client_id, user_id, total_price, status, payment_method, purchase_date) VALUES (1, 1, 2, 4500, 'paid', 'Cartão', '2026-03-26')");
        $pdo->exec("INSERT INTO sale_items (sale_id, ad_space_id, item_price, quantity) VALUES (1, 1, 4500, 1)");

        // System Settings
        $pdo->exec("CREATE TABLE IF NOT EXISTS settings (`key` VARCHAR(50) PRIMARY KEY, `value` TEXT)");
        $pdo->exec("INSERT IGNORE INTO settings (`key`, `value`) VALUES 
            ('event_name', 'EXPOVALE 2026'),
            ('primary_color', '#fbbf24'),
            ('secondary_color', '#f59e0b'),
            ('event_date', '2026-10-15'),
            ('maintenance_mode', '0')");
    }

} catch (PDOException $e) {
    header('Content-Type: application/json', true, 500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}
