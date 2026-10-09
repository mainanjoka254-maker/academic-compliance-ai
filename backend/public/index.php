<?php
declare(strict_types=1);

use App\Controllers\{AuthController, DashboardController, DocumentController, MiscController};
use App\Core\{Env, HttpException, Request, Response, Router};

$root = dirname(__DIR__);

// PSR-4 autoloader for App\ (works even before `composer install`)
spl_autoload_register(function (string $class) use ($root): void {
    if (strncmp($class, 'App\\', 4) !== 0) {
        return;
    }
    $file = $root . '/src/' . str_replace('\\', '/', substr($class, 4)) . '.php';
    if (is_file($file)) {
        require $file;
    }
});
if (is_file($root . '/vendor/autoload.php')) {
    require $root . '/vendor/autoload.php';
}

// Let PHP's built-in server serve real static files
if (PHP_SAPI === 'cli-server') {
    $p = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if ($p !== '/' && is_file(__DIR__ . $p)) {
        return false;
    }
}

// CORS
$allowed = array_filter(array_map('trim', explode(',', Env::get('CORS_ORIGIN'))));
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!$allowed) {
    header('Access-Control-Allow-Origin: *');
} elseif ($origin && in_array($origin, $allowed, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
}
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

set_exception_handler(function (Throwable $e): void {
    if ($e instanceof HttpException) {
        Response::json(['error' => $e->getMessage()], $e->status);
    }
    error_log('[error] ' . $e);
    Response::json(['error' => 'Internal server error'], 500);
});

$router = new Router();
$router->add('GET', '/api/health', fn () => Response::json([
    'status' => 'ok', 'service' => 'complyai-php-api', 'time' => gmdate('c'),
]));

$router->add('POST', '/api/auth/register', [AuthController::class, 'register']);
$router->add('POST', '/api/auth/login', [AuthController::class, 'login']);
$router->add('GET', '/api/auth/me', [AuthController::class, 'me']);
$router->add('PATCH', '/api/auth/me', [AuthController::class, 'updateMe']);

$router->add('GET', '/api/documents', [DocumentController::class, 'index']);
$router->add('POST', '/api/documents', [DocumentController::class, 'store']);
$router->add('GET', '/api/documents/{id}', [DocumentController::class, 'show']);
$router->add('DELETE', '/api/documents/{id}', [DocumentController::class, 'destroy']);

$router->add('GET', '/api/dashboard', [DashboardController::class, 'index']);
$router->add('POST', '/api/contact', [MiscController::class, 'contact']);
$router->add('POST', '/api/subscription', [MiscController::class, 'subscription']);

$router->dispatch(Request::capture());
