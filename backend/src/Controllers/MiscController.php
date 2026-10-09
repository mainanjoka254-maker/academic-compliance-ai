<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Database;
use App\Core\HttpException;
use App\Core\Request;
use App\Core\Response;
use App\Core\Serializer;

final class MiscController
{
    private const PLANS = ['starter', 'professional', 'institution'];

    public static function contact(Request $req): void
    {
        $name = trim((string) $req->input('name'));
        $email = trim((string) $req->input('email'));
        $subject = trim((string) $req->input('subject'));
        $message = trim((string) $req->input('message'));

        if ($name === '' || $email === '' || $subject === '' || $message === '') {
            throw new HttpException(400, 'All fields are required');
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new HttpException(400, 'Please provide a valid email address');
        }

        $userId = Auth::userId($req, false); // contact works logged in or out
        Database::pdo()->prepare('INSERT INTO messages (user_id, name, email, subject, body, created_at) VALUES (?,?,?,?,?,?)')
            ->execute([$userId, $name, $email, $subject, $message, Database::now()]);

        Response::json(['ok' => true], 201);
    }

    public static function subscription(Request $req): void
    {
        $userId = Auth::userId($req);
        $plan = (string) $req->input('plan');
        if (!in_array($plan, self::PLANS, true)) {
            throw new HttpException(400, 'Invalid plan selected');
        }

        Database::pdo()->prepare('UPDATE users SET plan = ? WHERE id = ?')->execute([$plan, $userId]);
        Response::json(['user' => Serializer::user(AuthController::find($userId))]);
    }
}
