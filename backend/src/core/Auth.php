<?php
declare(strict_types=1);

namespace App\Core;

final class Auth
{
    private static function secret(): string
    {
        return Env::get('JWT_SECRET', 'dev-insecure-secret-change-me');
    }

    public static function issue(int $userId): string
    {
        return Jwt::encode(
            ['sub' => $userId, 'iat' => time(), 'exp' => time() + 7 * 86400],
            self::secret()
        );
    }

    /** Returns the user id, or throws 401 when $required. */
    public static function userId(Request $request, bool $required = true): ?int
    {
        $token = $request->bearer();
        $payload = $token ? Jwt::decode($token, self::secret()) : null;
        $id = (int) ($payload['sub'] ?? 0);

        if ($id > 0) {
            $stmt = Database::pdo()->prepare('SELECT id FROM users WHERE id = ?');
            $stmt->execute([$id]);
            if ($stmt->fetch()) {
                return $id;
            }
        }
        if ($required) {
            throw new HttpException(401, $token ? 'Invalid or expired token' : 'Authentication required');
        }
        return null;
    }
}
