<?php
declare(strict_types=1);

namespace App\Core;

final class Env
{
    private static ?array $vars = null;

    public static function get(string $key, string $default = ''): string
    {
        if (self::$vars === null) {
            self::$vars = [];
            $file = dirname(__DIR__, 2) . '/.env';
            if (is_file($file)) {
                foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                    $line = trim($line);
                    if ($line === '' || $line[0] === '#' || !str_contains($line, '=')) {
                        continue;
                    }
                    [$k, $v] = explode('=', $line, 2);
                    self::$vars[trim($k)] = trim($v, " \t\"'");
                }
            }
        }
        $value = self::$vars[$key] ?? getenv($key);
        return ($value === false || $value === null || $value === '') ? $default : (string) $value;
    }
}
