<?php
session_start();

require_once __DIR__ . '/../../_repository/Database.php';
use Repository\Database;

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    if (!isset($_SESSION['user']) || empty($_SESSION['user'])) {
        echo json_encode(['status' => 'error', 'message' => 'Użytkownik nie jest zalogowany.']);
        exit();
    }


    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        echo json_encode(['status' => 'error', 'message' => 'Nieprawidłowe dane wejściowe.']);
        exit();
    }

 
    $delivery_type = $data['delivery_type'] ?? 'pickup';
    $street = $data['street'] ?? null;
    $city = $data['city'] ?? null;
    $zip = $data['zip'] ?? null;
    $total_price = $data['total_price'] ?? 0.0;

   
    $client_id = $_SESSION['user']['id']; 
    $user_name = $_SESSION['user']['name']; 
    $user_last_name = $_SESSION['user']['last_name']; 
    $user_email = $_SESSION['user']['email']; 

    $cart_items = $data['cart_items'] ?? [];

    try {
      
        $conn = Database::connect();
        $conn->begin_transaction();

  
        $query = "INSERT INTO orders (client_id, delivery_type, total_price, street, city, zip, user_name, user_last_name, user_email, order_date)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("issssssss", $client_id, $delivery_type, $total_price, $street, $city, $zip, $user_name, $user_last_name, $user_email);
        $stmt->execute();

       
        $order_id = $conn->insert_id;

        
        $query = "INSERT INTO order_items (order_id, cake_name, cake_type, ingredients, price) VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($query);

        foreach ($cart_items as $item) {
            $cake_name = $item['name'] ?? null;
            $cake_type = $item['type'] ?? 'configured';
            $ingredients = $item['ingredients'] ?? null;
            $price = $item['price'] ?? 0.0;


            if (!$cake_name || !$cake_type) {
                throw new Exception("Nie można dodać zamówienia. Brakuje wymaganych danych tortu.");
            }
            
            $stmt->bind_param("isssd", $order_id, $cake_name, $cake_type, $ingredients, $price);
            $stmt->execute();
        }

 
        $conn->commit();

        unset($_SESSION['cart']);
        echo json_encode(['status' => 'success', 'message' => 'Zamówienie zostało zapisane.']);
    } catch (Exception $e) {
       
        $conn->rollback();
        echo json_encode(['status' => 'error', 'message' => 'Wystąpił problem: ' . $e->getMessage()]);
    }
}