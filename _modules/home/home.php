<?php

namespace Home;

use Repository\Database;

session_start();


class Home {
    public static function generateFeaturedCakesSection() {
        $query = "SELECT * FROM ready_cakes"; // Pobierz wszystkie gotowe torty
        $cakes = Database::fetchAll($query);
    
        $html = ""; // Tworzymy pusty HTML, który wypełnimy danymi
    
        foreach ($cakes as $cake) {
            // Używamy ścieżki do obrazu z bazy danych
            $imageSrc = $cake['cake_image'] ?: '/_assets/images/default-placeholder.png'; // Jeśli brak obrazu, ustaw placeholder
    
            // Tworzenie HTML dla każdego tortu
            $html .= "<div class='cake-item'>
                        <img src='{$imageSrc}' alt='{$cake['cake_name']}'>
                        <h3>{$cake['cake_name']}</h3>
                        <p>{$cake['cake_price']} zł</p>
                        <p>{$cake['cake_description']}</p>
                        <button class='add-featured-cake' 
                                data-name='{$cake['cake_name']}' 
                                data-price='{$cake['cake_price']}' 
                                data-description='{$cake['cake_description']}'>
                                Dodaj do koszyka
                        </button>
                      </div>";
        }
    
        return $html; // Zwróć HTML
    }
    
    public static function view(){
        $html = file_get_contents(__DIR__ . '/home.html');

        $navigationHtml = self::generateNavigationLinks();
        $html = str_replace("<!-- NAVIGATION_SECTION -->", $navigationHtml, $html);

        // Generowanie sekcji konfiguracji tortu
        $configurationHtml = self::generateConfigurationSection();
        $html = str_replace("<!-- CONFIGURATION_SECTION -->", $configurationHtml, $html);

        $featuredCakesHtml = self::generateFeaturedCakesSection();
        $html = str_replace("<!-- FEATURED_CAKES_SECTION -->", $featuredCakesHtml, $html);

        return $html;
    }

    public static function generateNavigationLinks() {
        $html = '';
        if (isset($_SESSION['user']) && !empty($_SESSION['user'])) {
            // Link do panelu admina dla administratorów
            if ($_SESSION['user']['is_admin'] == 1) {
                $html .= '<a href="/_modules/admin/admin.html" class="nav-item">Zarządzaj</a>';
            } else {
                // Link do Moje Zamówienia dla zwykłych użytkowników
                $html .= '<a href="/_modules/my_orders/my_orders.html" class="nav-item">Moje Zamówienia</a>';
            }
            $html .= '<a href="/_modules/login/log.php?logout=true" class="nav-item">Wyloguj</a>';
        } else {
            $html .= '<a href="/_modules/login/log.html" class="nav-item">Logowanie/Rejestracja</a>';
        }
        return $html;
    }
    
    

    public static function process(){
        try{
            $data = $_POST['katie'] ?? '';

            $query =<<<SQL
                SELECT * FROM cake
            SQL;

            Database::execute($query);

            return $query;
        }catch(\Throwable $e){
            return $e;
        }
    }
    public static function generateConfigurationSection() {
        // Pobranie składników według typu
        $sizes = Database::getIngredientsByType('rozmiar');
        $flavors = Database::getIngredientsByType('smak');
        $additions = Database::getIngredientsByType('dodatek');
    
        // Generowanie HTML dla rozmiarów (pierwszy krok widoczny)
        $html = "<div id='step-rozmiar' class='menu-section'>
                    <h2>Wybierz rozmiar tortu</h2>
                    <div class='menu-items'>";
        foreach ($sizes as $size) {
            $html .= "<div class='menu-item'>
                        <h3>{$size['ingredient_name']}</h3>
                        <p>{$size['ingredient_price']} zł</p>
                        <button class='add-to-cart' data-id='{$size['ingredient_id']}' data-step='rozmiar'>Dodaj do koszyka</button>
                      </div>";
        }
        $html .= "</div></div>";
    
        // Generowanie HTML dla smaków (ukryty na starcie)
        $html .= "<div id='step-smak' class='menu-section' style='display: none;'>
                    <h2>Wybierz smak tortu</h2>
                    <div class='menu-items'>";
        foreach ($flavors as $flavor) {
            $html .= "<div class='menu-item'>
                        <h3>{$flavor['ingredient_name']}</h3>
                        <p>{$flavor['ingredient_price']} zł</p>
                        <button class='add-to-cart' data-id='{$flavor['ingredient_id']}' data-step='smak'>Dodaj do koszyka</button>
                      </div>";
        }
        $html .= "</div></div>";
    
        // Generowanie HTML dla dodatków (ukryty na starcie)
        $html .= "<div id='step-dodatek' class='menu-section' style='display: none;'>
                    <h2>Wybierz dodatki</h2>
                    <div class='menu-items'>";
        foreach ($additions as $addition) {
            $html .= "<div class='menu-item'>
                        <h3>{$addition['ingredient_name']}</h3>
                        <p>{$addition['ingredient_price']} zł</p>
                        <button class='add-to-cart' data-id='{$addition['ingredient_id']}' data-step='dodatek'>Dodaj do koszyka</button>
                      </div>";
        }
        $html .= "</div></div>";
    
        return $html;
    }

    
    
}