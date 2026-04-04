<?php

namespace Pterodactyl\Services\PteroGPT;

use Pterodactyl\Exceptions\DisplayException;

class PromptSanitizer
{
    private const MAX_MESSAGE_LENGTH = 4000;
    private const MAX_CONTEXT_LINES = 120;

    private const INJECTION_PATTERNS = [
        '/ignore\s+(all\s+)?(previous|prior|above)/i',
        '/disregard\s+(all\s+)?(previous|prior|above)/i',
        '/forget\s+(all\s+)?(previous|prior|above)/i',
        '/<\|im_start\|>/i',
        '/<\|im_end\|>/i',
        '/<\|system\|>/i',
        '/<\|assistant\|>/i',
        '/jailbreak/i',
    ];

    /**
     * @throws DisplayException
     */
    public function sanitizeMessage(string $message): string
    {
        if (strlen($message) > self::MAX_MESSAGE_LENGTH) {
            throw new DisplayException('Message exceeds the maximum allowed length.');
        }

        foreach (self::INJECTION_PATTERNS as $pattern) {
            if (preg_match($pattern, $message) === 1) {
                throw new DisplayException('Message contains blocked prompt-injection keywords.');
            }
        }

        return trim(str_replace(['```', '<|', '|>'], ['` ` `', '< |', '| >'], $message));
    }

    public function sanitizeConsoleLines(string|array $lines): string
    {
        $rows = is_array($lines) ? $lines : explode("\n", $lines);
        $rows = array_slice($rows, -self::MAX_CONTEXT_LINES);

        $rows = array_map(static function ($line) {
            $line = (string) $line;

            return strlen($line) > 500 ? substr($line, 0, 500) . '...' : $line;
        }, $rows);

        return implode("\n", $rows);
    }

    public function sanitizeFilePath(string $path): string
    {
        $path = str_replace(['../', '..\\'], '', $path);

        if ($path === '') {
            return '/';
        }

        return str_starts_with($path, '/') ? $path : '/' . $path;
    }

    public function sanitizeFileContent(string $content): string
    {
        if (strlen($content) > 50000) {
            return substr($content, 0, 50000) . "\n\n[Content truncated]";
        }

        return $content;
    }
}
