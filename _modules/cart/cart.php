session_start();
require_once 'Database.php';

function addToCart($ingredient_id) {
    // Pobieramy pełne informacje o składniku, w tym cenę
    $ingredient = Database::fetch("SELECT ingredient_id, ingredient_name, ingredient_price FROM ingredient WHERE ingredient_id = ?", [$ingredient_id]);

    if ($ingredient) {
        // Dodajemy składnik do koszyka z pełnymi danymi
        $_SESSION['cart'][] = [
            'id' => $ingredient['ingredient_id'],
            'name' => $ingredient['ingredient_name'],
            'price' => $ingredient['ingredient_price']
        ];
    }
}

function viewCart() {
    return $_SESSION['cart'] ?? [];
}

function viewCartWithTotal() {
    $cart = viewCart();
    $totalPrice = 0;

    // Wyświetlamy każdy składnik z ceną i obliczamy łączną cenę
    echo "<h2>Twój koszyk</h2><ul>";
    foreach ($cart as $item) {
        echo "<li>{$item['name']} - {$item['price']} zł</li>";
        $totalPrice += $item['price'];
    }
    echo "</ul>";
    echo "<p>Łączna cena: {$totalPrice} zł</p>";

    return $totalPrice;
}

function finalizeOrder() {
    $cart = viewCart();
    $db = Database::connect();

    // Przykładowe ID tortu, który zamawiamy (możesz to rozszerzyć, aby przypisać nowe ID tortu)
    $cake_id = 1;

    foreach ($cart as $item) {
        $ingredient_id = $item['id'];
        $query = "INSERT INTO cake_ingredient (cake_id, ingredient_id) VALUES (?, ?)";
        $stmt = $db->prepare($query);
        $stmt->bind_param("ii", $cake_id, $ingredient_id);
        $stmt->execute();
    }

    // Po zapisaniu zamówienia, czyścimy koszyk
    unset($_SESSION['cart']);
    echo "Zamówienie zostało zrealizowane!";
}

// Obsługa zapytań do koszyka (np. AJAX lub bezpośrednie wywołania)

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'add') {
        $ingredient_id = $_POST['ingredient_id'] ?? null;
        if ($ingredient_id) {
            addToCart($ingredient_id);
            echo json_encode(["success" => true, "message" => "Dodano do koszyka"]);
        }
    } elseif ($action === 'view') {
        viewCartWithTotal();
    } elseif ($action === 'finalize') {
        finalizeOrder();
    }
}
