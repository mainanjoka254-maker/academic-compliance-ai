<?php
declare(strict_types=1);

namespace App\Services;

/** Best-effort plain-text extraction. Returns null when a format can't be read. */
final class TextExtractor
{
    public static function extract(string $path, string $ext): ?string
    {
        try {
            return match (strtolower($ext)) {
                'txt', 'md', 'csv', 'rtf' => self::plain($path),
                'docx' => self::docx($path),
                'pdf' => self::pdf($path),
                default => null,
            };
        } catch (\Throwable $e) {
            error_log('[TextExtractor] ' . $e->getMessage());
            return null;
        }
    }

    private static function plain(string $path): string
    {
        return (string) file_get_contents($path);
    }

    private static function docx(string $path): ?string
    {
        if (!class_exists(\ZipArchive::class)) {
            return null; // enable extension=zip in php.ini
        }
        $zip = new \ZipArchive();
        if ($zip->open($path) !== true) {
            return null;
        }
        $xml = $zip->getFromName('word/document.xml');
        $zip->close();
        if ($xml === false) {
            return null;
        }
        $xml = preg_replace('#</w:p>#', "\n", $xml);
        return html_entity_decode(strip_tags((string) $xml), ENT_QUOTES | ENT_XML1, 'UTF-8');
    }

    private static function pdf(string $path): ?string
    {
        if (!class_exists(\Smalot\PdfParser\Parser::class)) {
            return null; // run `composer install` in backend/
        }
        return (new \Smalot\PdfParser\Parser())->parseFile($path)->getText();
    }
}
