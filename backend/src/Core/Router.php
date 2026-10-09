<?php
declare(strict_types=1);

namespace App\Core;

final class Router
{
    /** @var array<int,array{0:string,1:string,2:callable}> */
    private array $routes = [];

    public function add(string $method, string $pattern, callable $handler): void
    {
        $regex = '#^' . preg_replace('#\{(\w+)\}#', '(?P<$1>[^/]+)', $pattern) . '$#';
        $this->routes[] = [strtoupper($method), $regex, $handler];
    }

    public function dispatch(Request $request): void
    {
        foreach ($this->routes as [$method, $regex, $handler]) {
            if ($method === $request->method && preg_match($regex, $request->path, $m)) {
                foreach ($m as $key => $value) {
                    if (is_string($key)) {
                        $request->params[$key] = $value;
                    }
                }
                $handler($request);
                return;
            }
        }
        throw new HttpException(404, 'Not found');
    }
}
