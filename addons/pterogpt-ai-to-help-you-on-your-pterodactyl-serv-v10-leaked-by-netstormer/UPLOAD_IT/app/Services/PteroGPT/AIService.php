<?php

namespace Pterodactyl\Services\PteroGPT;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\AILog;
use Pterodactyl\Exceptions\DisplayException;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class AIService
{
    private ?Client $client = null;

    public function __construct(
        private SettingsRepositoryInterface $settings,
        private PromptBuilder $promptBuilder,
        private PromptSanitizer $sanitizer,
        private RateLimiter $rateLimiter,
    ) {
    }

    public function isEnabled(): bool
    {
        return (bool) $this->settings->get('pterogpt::enabled', false);
    }

    public function getConfig(): array
    {
        $modelMode = $this->settings->get('pterogpt::model_mode', 'fixed');
        $uiMode = $this->settings->get('pterogpt::ui_mode', 'panel');

        $config = [
            'enabled' => $this->isEnabled(),
            'ui_mode' => $uiMode,
            'model_mode' => $modelMode,
        ];

        if ($modelMode === 'fixed') {
            $config['model'] = $this->settings->get('pterogpt::model_fixed', 'gpt-4o-mini');
        } else {
            $modelsJson = $this->settings->get('pterogpt::models_allowed', '["gpt-4o-mini"]');
            $config['models'] = json_decode($modelsJson, true) ?: ['gpt-4o-mini'];
        }

        return $config;
    }

    public function chat(
        Server $server,
        int $userId,
        string $message,
        array $context = [],
        array $conversationHistory = [],
        ?string $model = null,
        string $ipAddress = ''
    ): array {
        if (!$this->isEnabled()) {
            throw new DisplayException('PteroGPT is not enabled.');
        }

        $this->rateLimiter->check($server->id, RateLimiter::ACTION_CHAT);

        $message = $this->sanitizer->sanitizeMessage($message);

        if (!empty($context['console_lines'])) {
            $context['console_lines'] = $this->sanitizer->sanitizeConsoleLines($context['console_lines']);
        }
        if (!empty($context['file_path'])) {
            $context['file_path'] = $this->sanitizer->sanitizeFilePath($context['file_path']);
        }
        if (!empty($context['file_content'])) {
            $context['file_content'] = $this->sanitizer->sanitizeFileContent($context['file_content']);
        }

        $resolvedModel = $this->resolveModel($model);
        $systemPrompt = $this->promptBuilder->buildSystemPrompt($server);
        $messages = $this->promptBuilder->buildMessagesArray($systemPrompt, $conversationHistory, $message, $context);

        try {
            $response = $this->callAPI($messages, $resolvedModel);
        } catch (\Exception $e) {
            throw new DisplayException('Failed to communicate with AI service: ' . $e->getMessage());
        }

        $this->rateLimiter->increment($server->id, RateLimiter::ACTION_CHAT);

        AILog::create([
            'user_id' => $userId,
            'server_id' => $server->id,
            'action_type' => RateLimiter::ACTION_CHAT,
            'model_used' => $resolvedModel,
            'prompt_summary' => substr($message, 0, 200),
            'tokens_used' => $response['usage']['total_tokens'] ?? null,
            'ip_address' => $ipAddress,
        ]);

        return $this->formatResponse($response);
    }

    private function resolveModel(?string $requestedModel): string
    {
        $modelMode = $this->settings->get('pterogpt::model_mode', 'fixed');

        if ($modelMode === 'fixed') {
            return $this->settings->get('pterogpt::model_fixed', 'gpt-4o-mini');
        }

        $allowedJson = $this->settings->get('pterogpt::models_allowed', '["gpt-4o-mini"]');
        $allowed = json_decode($allowedJson, true) ?: ['gpt-4o-mini'];

        if ($requestedModel && in_array($requestedModel, $allowed, true)) {
            return $requestedModel;
        }

        return $allowed[0];
    }

    private function getClient(): Client
    {
        if ($this->client === null) {
            $baseUrl = $this->settings->get('pterogpt::base_url', 'https://api.openai.com/v1');
            $apiKey = $this->settings->get('pterogpt::api_key');

            if (empty($apiKey)) {
                throw new DisplayException('PteroGPT API key is not configured.');
            }

            try {
                $apiKey = decrypt($apiKey);
            } catch (\Exception $e) {
                throw new DisplayException('Failed to decrypt API key.');
            }

            $this->client = new Client([
                'base_uri' => rtrim($baseUrl, '/') . '/',
                'headers' => [
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Content-Type' => 'application/json',
                ],
                'timeout' => 60,
            ]);
        }

        return $this->client;
    }

    private function callAPI(array $messages, string $model): array
    {
        $client = $this->getClient();

        $payload = [
            'model' => $model,
            'messages' => $messages,
            'max_tokens' => 2000,
            'temperature' => 0.7,
        ];

        try {
            $response = $client->post('chat/completions', [
                'json' => $payload,
            ]);

            return json_decode($response->getBody()->getContents(), true);
        } catch (GuzzleException $e) {
            throw new DisplayException('AI API request failed: ' . $e->getMessage());
        }
    }

    private function formatResponse(array $apiResponse): array
    {
        $choice = $apiResponse['choices'][0] ?? null;

        if (!$choice) {
            throw new DisplayException('Invalid response from AI service.');
        }

        $message = $choice['message'];

        return [
            'response' => $message['content'] ?? 'No response from AI.',
        ];
    }
}