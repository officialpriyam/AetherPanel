<?php

namespace Pterodactyl\Services\PteroGPT;

use Pterodactyl\Models\Server;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class PromptBuilder
{
    public const DEFAULT_SYSTEM_PROMPT = <<<'PROMPT'
You are PriyxStudio AI, an assistant integrated into Pterodactyl Panel for game server management.
Help users diagnose errors, configure servers, and improve performance.
Be concise, technical, and action-oriented.
{server_info}
PROMPT;

    private const LANGUAGE_INSTRUCTIONS = [
        'en' => 'Respond in English.',
        'fr' => 'Respond in French.',
        'es' => 'Respond in Spanish.',
        'de' => 'Respond in German.',
        'it' => 'Respond in Italian.',
        'pt' => 'Respond in Portuguese.',
        'nl' => 'Respond in Dutch.',
        'pl' => 'Respond in Polish.',
        'ru' => 'Respond in Russian.',
        'ja' => 'Respond in Japanese.',
        'zh' => 'Respond in Chinese.',
    ];

    public function __construct(private SettingsRepositoryInterface $settings)
    {
    }

    public function buildSystemPrompt(Server $server): string
    {
        $serverInfo = sprintf(
            "\n\nServer Context:\n- Name: %s\n- UUID: %s\n- Node: %s\n- Docker Image: %s\n- Memory Limit: %dMB\n- Disk Limit: %dMB",
            $server->name,
            $server->uuid,
            $server->node->name,
            $server->image,
            $server->memory,
            $server->disk
        );

        $customPrompt = (string) $this->settings->get('pterogpt::system_prompt', '');
        $basePrompt = $customPrompt !== '' ? $customPrompt : self::DEFAULT_SYSTEM_PROMPT;

        $prompt = str_replace('{server_info}', $serverInfo, $basePrompt);

        $language = (string) $this->settings->get('pterogpt::language', 'en');
        $languageInstruction = self::LANGUAGE_INSTRUCTIONS[$language] ?? self::LANGUAGE_INSTRUCTIONS['en'];

        return $prompt . "\n\nIMPORTANT: {$languageInstruction}";
    }

    public function buildMessagesArray(
        string $systemPrompt,
        array $conversationHistory,
        string $userMessage,
        ?array $context = null
    ): array {
        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        foreach ($conversationHistory as $message) {
            if (!isset($message['role'], $message['content'])) {
                continue;
            }

            $role = (string) $message['role'];
            if (!in_array($role, ['user', 'assistant'], true)) {
                continue;
            }

            $messages[] = [
                'role' => $role,
                'content' => (string) $message['content'],
            ];
        }

        $userContent = $userMessage;
        if ($context) {
            if (!empty($context['console_lines'])) {
                $userContent .= "\n\n--- Recent Console Output ---\n" . $context['console_lines'];
            }

            if (!empty($context['file_path']) && !empty($context['file_content'])) {
                $userContent .= "\n\n--- File: {$context['file_path']} ---\n{$context['file_content']}";
            }
        }

        $messages[] = ['role' => 'user', 'content' => $userContent];

        return $messages;
    }
}
