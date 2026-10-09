<?php
declare(strict_types=1);

namespace App\Services;

use App\Core\Env;

/** Calls the external AI-detection / plagiarism API (spec section 3). */
class AIComplianceService
{
    public function __construct(
        private string $apiKey,
        private string $apiUrl
    ) {
    }

    /** Returns null when AI_API_URL / AI_API_KEY are not configured. */
    public static function fromEnv(): ?self
    {
        $url = Env::get('AI_API_URL');
        $key = Env::get('AI_API_KEY');
        if ($url === '' || $key === '' || str_contains($key, 'your_dummy_key')) {
            return null;
        }
        return new self($key, $url);
    }

    public function analyzeDocument(string $extractedText): array
    {
        $payload = json_encode([
            'text' => $extractedText,
            'features' => ['ai_detection', 'plagiarism_check', 'metrics'],
        ]);

        $ch = curl_init($this->apiUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $this->apiKey,
            ],
            CURLOPT_TIMEOUT => 45,
        ]);

        $response = curl_exec($ch);
        $error = curl_error($ch);
        $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($error) {
            throw new \RuntimeException('API request failed: ' . $error);
        }
        if ($code >= 400) {
            throw new \RuntimeException("API returned HTTP $code");
        }

        $data = json_decode((string) $response, true);
        if (!is_array($data)) {
            throw new \RuntimeException('Invalid JSON from API');
        }

        return $this->evaluateCompliance($data);
    }

    private function evaluateCompliance(array $apiData): array
    {
        $aiScore = (float) ($apiData['ai_percentage'] ?? 0);
        $simScore = (float) ($apiData['similarity_percentage'] ?? 0);

        $status = 'passed';
        if ($aiScore > 25.0 || $simScore > 20.0) {
            $status = 'failed';
        } elseif ($aiScore > 10.0 || $simScore > 10.0) {
            $status = 'flagged';
        }

        return [
            'ai_percentage' => $aiScore,
            'similarity_percentage' => $simScore,
            'word_count' => (int) ($apiData['word_count'] ?? 0),
            'status' => $status,
        ];
    }
}
