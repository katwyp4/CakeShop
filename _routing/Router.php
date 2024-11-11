<?php

namespace Router;

enum Method
{
    case GET;
    case POST;
    case PUT;
    case DELETE;
    case PATCH;
}

class Route
{
    private string $pattern;
    private string $method;

    public function __construct(string $route, Method $method = Method::GET)
    {
        $this->method = $method->name;
        $this->pattern = $this->rout_to_pattern($route);
    }

    private function rout_to_pattern(string $route): string
    {
        $pieces = explode('/', $route);
        $pieces = array_map(fn ($piece) => str_starts_with($piece, ':') ? '([^\/]*)' : $piece, $pieces);
        $pattern = '/^' . implode('\/', $pieces) . '$/';
        return $pattern;
    }

    public function matches(string $path, string $method): array|false
    {
        $matches = [];
        if (preg_match($this->pattern, $path, $matches) && $method === $this->method) {
            unset($matches[0]);
            return array_values($matches);
        }
        return false;
    }
}

class Router
{
    private array $routes = [];

    public function add(string $route, callable $function, Method $method = Method::GET): Route
    {
        $this->routes []= ['route' => new Route(route: $route, method: $method), 'callback' => $function];

        return $this->routes[count($this->routes) - 1]['route'];
    }

    public function start(): ?string
    {
        foreach ($this->routes as $route) {
            $result = $route['route']->matches($_SERVER['REQUEST_URI'], $_SERVER['REQUEST_METHOD']);
            if ($result !== false) {
                return $route['callback'](...$result);
            }
        }
        return null;
    }

    public static function replace($text)
    {
        $text = strtolower($text);
        $text = str_replace(array('ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż'), array('a', 'c', 'e', 'l', 'n', 'o', 's', 'z', 'z'), $text);
        $text = trim($text,'-');
        $text = preg_replace('/[\-]+/', '-', $text);
        $text = preg_replace('/[^0-9a-z-]/', '', $text);
        return $text;
    }
}