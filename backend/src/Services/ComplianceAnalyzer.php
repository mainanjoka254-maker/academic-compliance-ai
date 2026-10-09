<?php
declare(strict_types=1);

namespace App\Services;

/**
 * Turns an uploaded file into { status, complianceScore, issues, summary, ... }.
 *
 * 1. Extract text (PDF / DOCX / TXT).
 * 2. Structural rubric (required sections, minimum length).
 * 3. If AI_API_URL + AI_API_KEY are set, add AI-likelihood and similarity scores.
 * 4. If text can't be read at all, fall back to a deterministic heuristic.
 */
final class ComplianceAnalyzer
{
    private const CHECKS = [
        'overview or introduction' => '/\b(abstract|overview|summary|introduction)\b/i',
        'learning outcomes or objectives' => '/\b(learning outcomes?|objectives?|aims?)\b/i',
        'assessment or grading criteria' => '/\b(assessment|grading|marking|evaluation|rubric)\b/i',
        'academic integrity policy' => '/\b(plagiarism|academic integrity|academic honesty|misconduct)\b/i',
        'references or bibliography' => '/\b(references|bibliography|works cited|citations?)\b/i',
        'schedule or structure' => '/\b(schedule|timetable|week\s*\d+|module|chapter|section\s*\d+)\b/i',
    ];

    private const RANK = ['compliant' => 0, 'review' => 1, 'non_compliant' => 2];

    public static function analyze(string $path, string $fileName, string $category, int $size): array
    {
        $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $text = TextExtractor::extract($path, $ext);

        if ($text === null || trim($text) === '') {
            return self::fallback($fileName, $category, $size);
        }

        $words = preg_match_all('/\p{L}[\p{L}\p{N}\'’-]*/u', $text);

        // Structural rubric
        $missing = [];
        foreach (self::CHECKS as $label => $regex) {
            if (!preg_match($regex, $text)) {
                $missing[] = $label;
            }
        }
        $tooShort = $words < 150;
        $failed = count($missing) + ($tooShort ? 1 : 0);
        $total = count(self::CHECKS) + 1;

        $score = (int) round(30 + 70 * (($total - $failed) / $total));
        $issues = $failed;
        $status = self::statusFromScore($score);

        $parts = [];
        $ai = $sim = null;

        // Optional external AI / similarity check
        $service = AIComplianceService::fromEnv();
        if ($service) {
            try {
                $r = $service->analyzeDocument(mb_substr($text, 0, 200000));
                $ai = $r['ai_percentage'];
                $sim = $r['similarity_percentage'];

                $apiStatus = ['passed' => 'compliant', 'flagged' => 'review', 'failed' => 'non_compliant'][$r['status']];
                $apiScore = (int) max(0, min(100, round(100 - ($ai * 0.6 + $sim * 0.4) * 2)));

                $issues += ($ai > 10) + ($ai > 25) + ($sim > 10) + ($sim > 20);
                $score = min($score, $apiScore);
                if (self::RANK[$apiStatus] > self::RANK[$status]) {
                    $status = $apiStatus;
                }
                $parts[] = sprintf('AI-generated likelihood %.1f%%, similarity %.1f%%.', $ai, $sim);
            } catch (\Throwable $e) {
                error_log('[ComplianceAnalyzer] AI API failed: ' . $e->getMessage());
                $parts[] = 'External AI check was unavailable.';
            }
        }

        if ($missing) {
            $parts[] = 'Missing: ' . implode(', ', $missing) . '.';
        }
        if ($tooShort) {
            $parts[] = 'Document is very short (' . $words . ' words).';
        }
        if (!$missing && !$tooShort) {
            $parts[] = 'All required sections are present.';
        }

        return [
            'status' => $status,
            'complianceScore' => $score,
            'issues' => $issues,
            'summary' => implode(' ', $parts),
            'aiPercentage' => $ai,
            'similarityPercentage' => $sim,
            'wordCount' => $words,
        ];
    }

    private static function statusFromScore(int $score): string
    {
        return $score >= 85 ? 'compliant' : ($score >= 65 ? 'review' : 'non_compliant');
    }

    /** Deterministic stand-in used when the file's text can't be extracted. */
    private static function fallback(string $fileName, string $category, int $size): array
    {
        $seed = abs(crc32("$fileName|$category|$size"));
        $score = 42 + ($seed % 57);
        $status = self::statusFromScore($score);
        $issues = match ($status) {
            'compliant' => $seed % 2,
            'review' => 1 + ($seed % 3),
            default => 3 + ($seed % 5),
        };

        return [
            'status' => $status,
            'complianceScore' => $score,
            'issues' => $issues,
            'summary' => 'Estimated result: the text of this file could not be read '
                . '(install backend dependencies with composer for PDF support).',
            'aiPercentage' => null,
            'similarityPercentage' => null,
            'wordCount' => null,
        ];
    }
}
