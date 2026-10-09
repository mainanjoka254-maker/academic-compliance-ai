<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Database;
use App\Core\HttpException;
use App\Core\Request;
use App\Core\Response;
use App\Core\Serializer;

final class AuthController
{
    public static function register(Request $req): void
    {
        $name = trim((string) $req->input('name'));
        $email = strtolower(trim((string) $req->input('email')));
        $password = (string) $req->input('password');
        $institution = trim((string) $req->input('institution')) ?: null;

        if ($name === '' || $email === '' || $password === '') {
            throw new HttpException(400, 'Name, email and password are required');
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new HttpException(400, 'Please provide a valid email address');
        }
        if (strlen($password) < 8) {
            throw new HttpException(400, 'Password must be at least 8 characters');
        }

        $pdo = Database::pdo();
        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            throw new HttpException(409, 'An account with this email already exists');
        }

        $pdo->prepare('INSERT INTO users (name, email, password_hash, institution, role, plan, created_at) VALUES (?,?,?,?,?,?,?)')
            ->execute([$name, $email, password_hash($password, PASSWORD_BCRYPT), $institution, 'member', 'starter', Database::now()]);
        $id = (int) $pdo->lastInsertId();

        Response::json(['token' => Auth::issue($id), 'user' => Serializer::user(self::find($id))], 201);
    }

    public static function login(Request $req): void
    {
        $email = strtolower(trim((string) $req->input('email')));
        $password = (string) $req->input('password');
        if ($email === '' || $password === '') {
            throw new HttpException(400, 'Email and password are required');
        }

        $stmt = Database::pdo()->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $row = $stmt->fetch();

        if (!$row || !password_verify($password, $row['password_hash'])) {
            throw new HttpException(401, 'Invalid email or password');
        }
        Response::json(['token' => Auth::issue((int) $row['id']), 'user' => Serializer::user($row)]);
    }

    public static function me(Request $req): void
    {
        $id = Auth::userId($req);
        Response::json(['user' => Serializer::user(self::find($id))]);
    }

    public static function updateMe(Request $req): void
    {
        $id = Auth::userId($req);
        $current = self::find($id);

        $name = trim((string) ($req->input('name') ?? ''));
        $institution = $req->input('institution');

        Database::pdo()->prepare('UPDATE users SET name = ?, institution = ? WHERE id = ?')->execute([
            $name !== '' ? $name : $current['name'],
            $institution !== null ? (trim((string) $institution) ?: null) : $current['institution'],
            $id,
        ]);

        Response::json(['user' => Serializer::user(self::find($id))]);
    }

    public static function find(int $id): array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM users WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
}
