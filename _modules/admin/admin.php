
<?php
session_start();

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once __DIR__ . '/../../_repository/Database.php';
use Repository\Database;

header('Content-Type: application/json');

error_reporting(E_ALL);
ini_set('display_errors', 0);


// Sprawdzenie, czy użytkownik ma uprawnienia administratora
if (!isset($_SESSION['user']) || $_SESSION['user']['is_admin'] != 1) {
    echo json_encode(['status' => 'error', 'message' => 'Brak dostępu']);
    exit();
}


// Pobranie akcji z GET
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'getUsers':
        $users = Database::fetchAll("SELECT * FROM client");
        if ($users) {
            echo json_encode($users);
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Nie udało się pobrać danych.']);
        }
        
        break;

    case 'getCakes':
        $cakes = Database::fetchAll("SELECT * FROM ready_cakes");
        echo json_encode($cakes);
        break;

        case 'getOrders':
            $orders = Database::fetchAll("
                SELECT 
                    o.order_id,
                    o.user_name,
                    o.user_last_name,
                    o.total_price,
                    o.order_date,
                    o.status,
                    o.street,
                    o.city,
                    o.zip,
                    oi.cake_name,
                    oi.cake_type,
                    oi.ingredients,
                    oi.price AS item_price
                FROM orders o
                LEFT JOIN order_items oi ON o.order_id = oi.order_id
                ORDER BY o.order_id
            ");
        
            $groupedOrders = [];
            foreach ($orders as $order) {
                $orderId = $order['order_id'];
                if (!isset($groupedOrders[$orderId])) {
                    $groupedOrders[$orderId] = [
                        'order_id' => $orderId,
                        'user_name' => $order['user_name'],
                        'user_last_name' => $order['user_last_name'],
                        'total_price' => $order['total_price'],
                        'order_date' => $order['order_date'],
                        'status' => $order['status'],
                        'street' => $order['street'],
                        'city' => $order['city'],
                        'zip' => $order['zip'],
                        'items' => [],
                    ];
                }
                // Add items to the current order
                if ($order['cake_name'] !== null) {
                    $groupedOrders[$orderId]['items'][] = [
                        'cake_name' => $order['cake_name'],
                        'cake_type' => $order['cake_type'],
                        'ingredients' => $order['ingredients'],
                        'item_price' => $order['item_price'],
                    ];
                }
            }
        
            echo json_encode(array_values($groupedOrders));
            break;
        


    case 'deleteUser':
        $data = json_decode(file_get_contents("php://input"), true);
        $userId = $data['user_id'] ?? null;
        if ($userId) {
            Database::execute("DELETE FROM client WHERE client_id = ?", [$userId]);
            echo json_encode(['status' => 'success', 'message' => 'Użytkownik został usunięty']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Nie podano ID użytkownika']);
        }
        break;

    case 'toggleAdmin':
        $data = json_decode(file_get_contents("php://input"), true);
        $userId = $data['user_id'] ?? null;
        if ($userId) {
            $currentStatus = Database::fetch("SELECT is_admin FROM client WHERE client_id = ?", [$userId]);
            $newStatus = $currentStatus['is_admin'] == 1 ? 0 : 1;
            Database::execute("UPDATE client SET is_admin = ? WHERE client_id = ?", [$newStatus, $userId]);
            echo json_encode(['status' => 'success', 'message' => 'Rola użytkownika została zmieniona']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Nie podano ID użytkownika']);
        }
        break;

        case 'deleteCake':
            $data = json_decode(file_get_contents("php://input"), true);
            $cakeId = $data['cake_id'] ?? null;
        
            if ($cakeId) {
                $deleted = Database::execute("DELETE FROM ready_cakes WHERE cake_id = ?", [$cakeId]);
                if ($deleted) {
                    http_response_code(200); // Ustaw kod HTTP 200
                    echo json_encode(['status' => 'success', 'message' => 'Tort został usunięty']);
                } else {
                    http_response_code(500); // Ustaw kod HTTP 500 dla błędu
                    echo json_encode(['status' => 'error', 'message' => 'Nie udało się usunąć tortu']);
                }
            } else {
                http_response_code(400); // Ustaw kod HTTP 400 dla nieprawidłowego żądania
                echo json_encode(['status' => 'error', 'message' => 'Nie podano ID tortu']);
            }
            break;
        
           case 'addIngredient':
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        error_log("Dane odebrane w addIngredient: " . json_encode($data));

        $name = $data['name'] ?? null;
        $type = $data['type'] ?? null;
        $price = $data['price'] ?? null;

        if (!$name || !$type || $price === null) {
            throw new Exception('Nie podano wszystkich wymaganych danych');
        }

        if (!is_numeric($price) || $price < 0) {
            throw new Exception('Cena składnika musi być liczbą większą lub równą 0');
        }

        // Loguj dane przed wykonaniem zapytania
        error_log("Dane przed SQL: name=$name, type=$type, price=$price");

        $query = "INSERT INTO ingredient (ingredient_name, ingredient_type, ingredient_price) VALUES (?, ?, ?)";
        $params = [$name, $type, $price];
        $result = Database::execute($query, $params);

        if ($result) {
            echo json_encode(['status' => 'success', 'message' => 'Składnik został dodany.']);
        } else {
            throw new Exception('Nie udało się dodać składnika do bazy danych.');
        }
    } catch (Exception $e) {
        error_log("Błąd w addIngredient: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    break;
            
                case 'getIngredientsByType':
                    try {
                        $type = $_GET['type'] ?? '';
                        if (empty($type)) {
                            throw new Exception('Nie podano typu składnika');
                        }
                
                        $ingredients = Database::fetchAll("SELECT * FROM ingredient WHERE ingredient_type = ?", [$type]);
                        echo json_encode(['status' => 'success', 'data' => $ingredients]);
                    } catch (Exception $e) {
                        http_response_code(500);
                        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
                    }
                    break;
                
    
           
    
                case 'addCake':
                    $data = json_decode(file_get_contents("php://input"), true);
                    $name = $data['name'] ?? '';
                    $description = $data['description'] ?? '';
                    $price = $data['price'] ?? null;
                    $image = $data['image'] ?? '';
                
                    if ($name && $description && $price !== null && $image) {
                        Database::execute(
                            "INSERT INTO ready_cakes (cake_name, cake_description, cake_price, cake_image) VALUES (?, ?, ?, ?)",
                            [$name, $description, $price, $image]
                        );
                        echo json_encode(['status' => 'success', 'message' => 'Tort został dodany']);
                    } else {
                        echo json_encode(['status' => 'error', 'message' => 'Nie podano wszystkich danych']);
                    }
                    break;
                
                

                    case 'deleteIngredient':
                        $data = json_decode(file_get_contents("php://input"), true);
                        $ingredientId = $data['ingredient_id'] ?? null;
                    
                        if ($ingredientId) {
                            $deleted = Database::execute("DELETE FROM ingredient WHERE ingredient_id = ?", [$ingredientId]);
                            if ($deleted) {
                                http_response_code(200); // Ustaw kod HTTP 200
                                echo json_encode(['status' => 'success', 'message' => 'Składnik został usunięty']);
                            } else {
                                http_response_code(500); // Błąd serwera
                                echo json_encode(['status' => 'error', 'message' => 'Nie udało się usunąć składnika']);
                            }
                        } else {
                            http_response_code(400); // Nieprawidłowe żądanie
                            echo json_encode(['status' => 'error', 'message' => 'Nie podano ID składnika']);
                        }
                        break;
                        
                        case 'updateOrderStatus':
                            $data = json_decode(file_get_contents("php://input"), true);
                                $orderId = $data['order_id'] ?? null;
                                $status = $data['status'] ?? null;
                            
                                if ($orderId && $status) {
                                    $result = Database::execute("UPDATE orders SET status = ? WHERE order_id = ?", [$status, $orderId]);
                                    if ($result) {
                                        echo json_encode(['status' => 'success', 'message' => 'Status zamówienia został zaktualizowany.']);
                                    } else {
                                        echo json_encode(['status' => 'error', 'message' => 'Nie udało się zaktualizować statusu zamówienia.']);
                                    }
                                } else {
                                    echo json_encode(['status' => 'error', 'message' => 'Brak danych do aktualizacji.']);
                                }
                                break;
                            
                    
}
