<?php

spl_autoload_register(function() {
    require_once __DIR__ . '/../_routing/Router.php';
});

spl_autoload_register(function() {
    require_once __DIR__ . '/../_routing/routing.php';
});

spl_autoload_register(function() {
    require_once __DIR__ . '/../_modules/home/home.php';
});

spl_autoload_register(function() {
    require_once __DIR__ . '/../_repository/Database.php';
});

spl_autoload_register(function() {
    require_once __DIR__ . '/../_modules/login/log.php';
});