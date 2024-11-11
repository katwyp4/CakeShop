<?php

namespace Home;

use Repository\Database;

class Home {
    public static function view(){
        return file_get_contents(__DIR__ . '/home.html');
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
}