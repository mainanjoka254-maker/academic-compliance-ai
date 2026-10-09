<?php
declare(strict_types=1);

namespace App\Core;

final class Request
{
    /** @var array<string,string> */
    public array $params = [];

    public function __construct(
        public readonly string $method,
        public readonly string $path,
        public readonly array $body,
        public readonly array $files
    ) {
    }

    public static function capture(): self
    {
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
        $path = rtrim($path, '/') ?: '/';

        $body = $_POST;
        $type = $_SERVER['CONTENT_TYPE'] ?? '';
        if (stripos($type, 'application/json') !== false) {
            $decoded = json_decode(file_get_contents('php://input') ?: '', true);
            $body = is_array($decoded) ? $decoded : [];
        }

        return new self($method, $path, $body, $_FILES);
    }

    public function input(string $key): mixed
    {
        return $this->body[$key] ?? null;
    }

    public function bearer(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;
        if (!$header && function_exists('getallheaders')) {
            foreach (getallheaders() as $name => $value) {
                if (strcasecmp($name, 'Authorization') === 0) {
                    $header = $value;
                }
            }
        }
        if ($header && preg_match('/^Bearer\s+(.+)$/i', $header, $m)) {
            return trim($m[1]);
        }
        return null;
    }
}
