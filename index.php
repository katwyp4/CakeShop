<?php

require_once __DIR__ . '/_config/autoloader.php';
require_once __DIR__ . '/_routing/routing.php';

session_start();

echo $router->start();