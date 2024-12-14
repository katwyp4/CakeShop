<?php

namespace Repository;

class Database {
    private static $host = "localhost";
    private static $db_user = "root";
    private static $db_password = "";
    private static $db_name = "mycake";

    public static function connect()
    {
        $conn = new \mysqli(Database::$host, Database::$db_user, Database::$db_password, Database::$db_name);

        if ($conn->connect_error) {
            die("Nie udalo sie nawiazac polaczenia: " . $conn->connect_error);
        }

        return $conn;
        
    }

    public static function execute($query, $params = []) {
        $conn = self::connect();
        $stmt = $conn->prepare($query);
    
        if ($params) {
            $types = str_repeat("s", count($params));
            $stmt->bind_param($types, ...$params);
        }
    
        $success = $stmt->execute();
    
        if (!$success) {
            error_log("Błąd SQL: " . $stmt->error); 
        }
    
        $stmt->close();
        $conn->close();
    
        return $success; 
    }

    public static function fetch($query, $params = []) {
        $conn = self::connect();
        $stmt = $conn->prepare($query);

        if ($params) {
            $types = str_repeat("s", count($params));
            $stmt->bind_param($types, ...$params);
        }

        $stmt->execute();
        $result = $stmt->get_result();
        $data = $result->fetch_assoc();

        $stmt->close();
        $conn->close();

        return $data;
    }


    public static function fetchAll($query, $params = []) {
        $conn = self::connect();
        $stmt = $conn->prepare($query);

        if ($params) {
            $types = str_repeat("s", count($params));
            $stmt->bind_param($types, ...$params);
        }

        $stmt->execute();
        $result = $stmt->get_result();
        $data = $result->fetch_all(MYSQLI_ASSOC);

        $stmt->close();
        $conn->close();

        return $data;
    }

    public static function getIngredientsByType($type) {
        try {
            $query = "SELECT ingredient_id, ingredient_name, ingredient_price FROM ingredient WHERE ingredient_type = ?";
            return self::fetchAll($query, [$type]);
        } catch (\Exception $e) {
            error_log("Błąd w getIngredientsByType: " . $e->getMessage());
            return [];
        }
    }    
    
    
}