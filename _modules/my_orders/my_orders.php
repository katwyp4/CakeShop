<?php
session_start();

require_once __DIR__ . '/../../_repository/Database.php';
use Repository\Database;

header('Content-Type: application/json');


if (!isset($_SESSION['user']) || empty($_SESSION['user'])) {
    echo json_encode(['status' => 'error', 'message' => 'Użytkownik nie jest zalogowany.']);
    exit();
}

$client_id = $_SESSION['user']['id'];

try {
    $query = "
    SELECT 
        o.order_id,
        o.total_price,
        o.order_date,
        o.street,
        o.city,
        o.zip,
        o.status,
        oi.cake_name,
        oi.cake_type,
        oi.ingredients,
        oi.price AS item_price
    FROM orders o
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.client_id = ?
    ORDER BY o.order_id
    ";
    
    
    $orders = Database::fetchAll($query, [$client_id]);

    
    echo json_encode(['status' => 'success', 'data' => $orders]);
} catch (Exception $e) {
    
    echo json_encode(['status' => 'error', 'message' => 'Błąd przy pobieraniu zamówień: ' . $e->getMessage()]);
}
