<?php

namespace Pterodactyl\Services\PteroGPT;

use Pterodactyl\Exceptions\DisplayException;

class PromptSanitizer
{
    private const MAX_MESSAGE_LENGTH = 4000;
    private const MAX_CONTEXT_LINES = 100;

    private const INJECTION_PATTERNS = [
        '/ignore\s+(all\s+)?(previous|prior|above)/i',
        '/disregard\s+(all\s+)?(previous|prior|above)/i',
        '/forget\s+(all\s+)?(previous|prior|above)/i',
        '/system\s*:/i',
        '/\[\s*INST\s*\]/i',
        '/\[\s*\/INST\s*\]/i',
        '/<\|im_start\|>/i',
        '/<\|im_end\|>/i',
        '/<\|system\|>/i',
        '/<\|user\|>/i',
        '/<\|assistant\|>/i',
        '/```\s*system/i',
        '/new\s+instructions?\s*:/i',
        '/override\s+(previous\s+)?instructions?/i',
        '/you\s+are\s+now/i',
        '/act\s+as\s+(if\s+)?you/i',
        '/pretend\s+(that\s+)?you/i',
        '/roleplay\s+as/i',
        '/jailbreak/i',
        '/DAN\s+mode/i',
    ];

    public function sanitizeMessage(string $message): string
    {
        if (strlen($message) > self::MAX_MESSAGE_LENGTH) {
            throw new DisplayException('Message exceeds maximum length of ' . self::MAX_MESSAGE_LENGTH . ' characters.');
        }

        foreach (self::INJECTION_PATTERNS as $pattern) {
            if (preg_match($pattern, $message)) {
                throw new DisplayException('Message contains disallowed content.');
            }
        }

        $message = str_replace(['```', '<|', '|>'], ['` ` `', '< |', '| >'], $message);

        return trim($message);
    }

    public function sanitizeConsoleLines(string|array $lines): string
    {
        // Convert to array if string
        if (is_string($lines)) {
            $lines = explode("\n", $lines);
        }

        // Take last MAX_CONTEXT_LINES
        $lines = array_slice($lines, -self::MAX_CONTEXT_LINES);

        // Truncate long lines
        $lines = array_map(function ($line) {
            if (strlen($line) > 500) {
                $line = substr($line, 0, 500) . '...';
            }
            return $line;
        }, $lines);

        // Return as string joined with newlines
        return implode("\n", $lines);
    }

    public function sanitizeFilePath(string $path): string
    {
        $path = str_replace(['../', '..\\'], '', $path);

        if (!str_starts_with($path, '/')) {
            $path = '/' . $path;
        }

        return $path;
    }

    public function sanitizeFileContent(string $content): string
    {
        if (strlen($content) > 50000) {
            return substr($content, 0, 50000) . "\n\n[Content truncated...]";
        }

        return $content;
    }
}