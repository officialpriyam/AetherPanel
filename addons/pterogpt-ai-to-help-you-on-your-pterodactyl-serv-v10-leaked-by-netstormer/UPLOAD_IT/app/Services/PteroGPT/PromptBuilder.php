<?php

namespace Pterodactyl\Services\PteroGPT;

use Pterodactyl\Models\Server;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class PromptBuilder
{
    private const DEFAULT_SYSTEM_PROMPT = <<<'PROMPT'
You are PteroGPT, an AI assistant integrated into Pterodactyl Panel for game server management. Your role is to help users diagnose errors, configure servers, and optimize performance.
Be concise, technical, and focused on game server administration. Always explain your reasoning and provide actionable solutions.
{server_info}
PROMPT;

    private const LANGUAGE_INSTRUCTIONS = [
        'en' => 'Respond in English.',
        'fr' => 'Réponds en français.',
        'es' => 'Responde en español.',
        'de' => 'Antworte auf Deutsch.',
        'it' => 'Rispondi in italiano.',
        'pt' => 'Responda em português.',
        'nl' => 'Reageer in het Nederlands.',
        'pl' => 'Odpowiadaj po polsku.',
        'ru' => 'Отвечай на русском языке.',
        'ja' => '日本語で答えてください。',
        'zh' => '用中文回答。',
    ];

    public function __construct(
        private SettingsRepositoryInterface $settings,
    ) {
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

        // Get custom system prompt or use default
        $customPrompt = $this->settings->get('pterogpt::system_prompt', '');
        $basePrompt = !empty($customPrompt) ? $customPrompt : self::DEFAULT_SYSTEM_PROMPT;

        // Replace {server_info} placeholder
        $prompt = str_replace('{server_info}', $serverInfo, $basePrompt);

        // Add language instruction
        $language = $this->settings->get('pterogpt::language', 'en');
        $languageInstruction = self::LANGUAGE_INSTRUCTIONS[$language] ?? self::LANGUAGE_INSTRUCTIONS['en'];
        $prompt .= "\n\nIMPORTANT: " . $languageInstruction;

        return $prompt;
    }

    public function buildMessagesArray(string $systemPrompt, array $conversationHistory, string $userMessage, ?array $context = null): array
    {
        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        foreach ($conversationHistory as $msg) {
            $messages[] = [
                'role' => $msg['role'],
                'content' => $msg['content'],
            ];
        }

        $userContent = $userMessage;

        if ($context) {
            if (!empty($context['console_lines'])) {
                $userContent .= "\n\n--- Recent Console Output ---\n" . $context['console_lines'];
            }
            if (!empty($context['file_path']) && !empty($context['file_content'])) {
                $userContent .= "\n\n--- File: " . $context['file_path'] . " ---\n" . $context['file_content'];
            }
        }

        $messages[] = ['role' => 'user', 'content' => $userContent];

        return $messages;
    }
}