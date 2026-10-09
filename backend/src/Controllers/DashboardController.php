<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use App\Core\Serializer;

final class DashboardController
{
    public static function index(Request $req): void
    {
        $userId = Auth::userId($req);
        $stmt = Database::pdo()->prepare('SELECT * FROM documents WHERE user_id = ? ORDER BY created_at ASC, id ASC');
        $stmt->execute([$userId]);
        $rows = $stmt->fetchAll();

        $total = count($rows);
        $count = fn (string $s) => count(array_filter($rows, fn ($r) => $r['status'] === $s));
        $average = $total ? (int) round(array_sum(array_column($rows, 'compliance_score')) / $total) : 0;

        $trendRows = array_slice($rows, -8);
        $trend = [];
        foreach ($trendRows as $i => $r) {
            $trend[] = [
                'label' => count($trendRows) > 6 ? '#' . ($i + 1) : mb_substr($r['title'], 0, 10),
                'score' => (int) $r['compliance_score'],
            ];
        }

        $categories = [];
        foreach ($rows as $r) {
            $categories[$r['category']] = ($categories[$r['category']] ?? 0) + 1;
        }
        arsort($categories);
        $breakdown = [];
        foreach ($categories as $category => $n) {
            $breakdown[] = ['category' => (string) $category, 'count' => $n];
        }

        $recent = array_map([Serializer::class, 'document'], array_slice(array_reverse($rows), 0, 5));

        Response::json([
            'totalDocuments' => $total,
            'compliant' => $count('compliant'),
            'needsReview' => $count('review'),
            'nonCompliant' => $count('non_compliant'),
            'averageScore' => $average,
            'scoreTrend' => $trend,
            'categoryBreakdown' => $breakdown,
            'recentDocuments' => $recent,
        ]);
    }
}
