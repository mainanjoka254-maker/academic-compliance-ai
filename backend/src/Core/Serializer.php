<?php
declare(strict_types=1);

namespace App\Core;

/** Maps DB rows to the exact JSON shapes the React client expects. */
final class Serializer
{
    public static function iso(?string $ts): string
    {
        return gmdate('Y-m-d\TH:i:s\Z', strtotime(($ts ?? 'now') . ' UTC'));
    }

    public static function user(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'email' => $row['email'],
            'institution' => $row['institution'],
            'role' => $row['role'],
            'plan' => $row['plan'],
            'createdAt' => self::iso($row['created_at']),
        ];
    }

    public static function document(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'title' => $row['title'],
            'category' => $row['category'],
            'fileName' => $row['file_name'],
            'fileSize' => (int) $row['file_size'],
            'mimeType' => $row['mime_type'],
            'status' => $row['status'],
            'complianceScore' => (int) $row['compliance_score'],
            'issues' => (int) $row['issues'],
            'summary' => $row['summary'],
            'aiPercentage' => $row['ai_percentage'] !== null ? (float) $row['ai_percentage'] : null,
            'similarityPercentage' => $row['similarity_percentage'] !== null ? (float) $row['similarity_percentage'] : null,
            'wordCount' => $row['word_count'] !== null ? (int) $row['word_count'] : null,
            'createdAt' => self::iso($row['created_at']),
        ];
    }
}
