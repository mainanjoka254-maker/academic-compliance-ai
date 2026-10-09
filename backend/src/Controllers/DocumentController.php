<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Database;
use App\Core\HttpException;
use App\Core\Request;
use App\Core\Response;
use App\Core\Serializer;
use App\Services\ComplianceAnalyzer;

final class DocumentController
{
    private const MAX_BYTES = 20 * 1024 * 1024;
    private const ALLOWED = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'md', 'csv', 'xlsx', 'ppt', 'pptx'];

    public static function uploadsDir(): string
    {
        $dir = dirname(__DIR__, 2) . '/storage/uploads';
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        return $dir;
    }

    public static function index(Request $req): void
    {
        $userId = Auth::userId($req);
        $stmt = Database::pdo()->prepare('SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC, id DESC');
        $stmt->execute([$userId]);
        Response::json(['documents' => array_map([Serializer::class, 'document'], $stmt->fetchAll())]);
    }

    public static function store(Request $req): void
    {
        $userId = Auth::userId($req);

        $file = $req->files['file'] ?? null;
        if (!$file || is_array($file['name'])) {
            if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0 && !$req->files) {
                throw new HttpException(413, 'File too large (server limit reached)');
            }
            throw new HttpException(400, 'A file is required');
        }
        match ($file['error']) {
            UPLOAD_ERR_OK => null,
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => throw new HttpException(413, 'File too large (max 20 MB)'),
            UPLOAD_ERR_NO_FILE => throw new HttpException(400, 'A file is required'),
            default => throw new HttpException(500, 'Upload failed (code ' . $file['error'] . ')'),
        };
        if ($file['size'] > self::MAX_BYTES) {
            throw new HttpException(413, 'File too large (max 20 MB)');
        }

        $original = basename((string) $file['name']);
        $ext = strtolower(pathinfo($original, PATHINFO_EXTENSION));
        if (!in_array($ext, self::ALLOWED, true)) {
            throw new HttpException(400, 'Unsupported file type. Allowed: ' . implode(', ', self::ALLOWED));
        }

        $stored = bin2hex(random_bytes(12)) . '.' . $ext;
        $dest = self::uploadsDir() . '/' . $stored;
        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            throw new HttpException(500, 'Could not save the uploaded file');
        }

        $title = trim((string) $req->input('title')) ?: $original;
        $category = trim((string) $req->input('category')) ?: 'Other';
        $mime = $file['type'] ?: 'application/octet-stream';

        $a = ComplianceAnalyzer::analyze($dest, $original, $category, (int) $file['size']);

        $pdo = Database::pdo();
        $pdo->prepare(
            'INSERT INTO documents (user_id, title, category, file_name, stored_name, file_size, mime_type, status,
                compliance_score, issues, ai_percentage, similarity_percentage, word_count, summary, created_at)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
        )->execute([
            $userId, $title, $category, $original, $stored, (int) $file['size'], $mime, $a['status'],
            $a['complianceScore'], $a['issues'], $a['aiPercentage'], $a['similarityPercentage'],
            $a['wordCount'], $a['summary'], Database::now(),
        ]);

        $row = self::findOwned((int) $pdo->lastInsertId(), $userId);
        Response::json(['document' => Serializer::document($row)], 201);
    }

    public static function show(Request $req): void
    {
        $userId = Auth::userId($req);
        Response::json(['document' => Serializer::document(self::findOwned((int) $req->params['id'], $userId))]);
    }

    public static function destroy(Request $req): void
    {
        $userId = Auth::userId($req);
        $row = self::findOwned((int) $req->params['id'], $userId);

        Database::pdo()->prepare('DELETE FROM documents WHERE id = ?')->execute([$row['id']]);
        $path = self::uploadsDir() . '/' . basename($row['stored_name']);
        if (is_file($path)) {
            @unlink($path);
        }
        Response::json(['ok' => true]);
    }

    private static function findOwned(int $id, int $userId): array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM documents WHERE id = ? AND user_id = ?');
        $stmt->execute([$id, $userId]);
        $row = $stmt->fetch();
        if (!$row) {
            throw new HttpException(404, 'Document not found');
        }
        return $row;
    }
}
