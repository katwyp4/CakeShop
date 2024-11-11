<?php
session_start();
require_once __DIR__ . '/../../_repository/Database.php';
use Repository\Database;

$errors = [];

if (isset($_POST['email']) && isset($_POST['password']) && isset($_POST['confirm-password'])) {
    $registerEmail = $_POST['email'];
    $registerPassword = $_POST['password'];
    $confirmPassword = $_POST['confirm-password'];
    $name = $_POST['name'] ?? '';  
    $lastName = $_POST['last_name'] ?? ''; 

    if ($registerPassword !== $confirmPassword) {
        $errors[] = "Hasła się nie zgadzają.";
    }


    $user = Database::fetch("SELECT * FROM client WHERE email = ?", [$registerEmail]);
    if ($user) {
        $errors[] = "Użytkownik o podanym emailu już istnieje.";
    }

  
    if (empty($errors)) {
        $hashedPassword = password_hash($registerPassword, PASSWORD_BCRYPT); 
        Database::execute("INSERT INTO client (name, last_name, email, pass) VALUES (?, ?, ?, ?)", [$name, $lastName, $registerEmail, $hashedPassword]);
        $_SESSION['success_message'] = "Rejestracja przebiegła pomyślnie.";
        header('Location: /_modules/login/log.html'); 
        exit();
    } else {
        $_SESSION['register_errors'] = $errors;
        header('Location: /_modules/login/log.html'); 
        exit();
    }
}

if (isset($_POST['email']) && isset($_POST['password'])) {
    $email = $_POST['email'];
    $password = $_POST['password'];

    $user = Database::fetch("SELECT * FROM client WHERE email = ?", [$email]);

    if ($user && password_verify($password, $user['pass'])) {
        $_SESSION['user'] = [
            'id' => $user['client_id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'last_name' => $user['last_name']
        ];
        echo json_encode(['success' => true]);
        exit();
    } else {
        echo json_encode(['success' => false, 'message' => 'Nieprawidłowy email lub hasło.']);
        exit();
    }
}
?>
