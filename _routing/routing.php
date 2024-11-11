<?php

use Home\Home;
use Router\Method;
use Router\Router;

$router = new Router();

$router->add('/', function(){
    return Home::view();
}, Method::GET);

$router->add('/process', function(){
    return Home::process();
}, Method::POST);

$router->add('/login/log.html', function() {
   
    require __DIR__ . '/../_modules/login/log.html';
}, Method::GET);


