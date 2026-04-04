<?php

namespace Pterodactyl\Services\PteroGPT;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Pterodactyl\Models\AILog;
use Pterodactyl\Models\Server;
use Pterodactyl\Exceptions\DisplayException;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class AIService
{
    private ?Client $client = null;

    public function __construct(
        private SettingsRepositoryInterface $settings,
        private ProviderService $providerService,
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
        $modelMode = (string) $this->settings->get('pterogpt::model_mode', 'fixed');
        $uiMode = (string) $this->settings->get('pterogpt::ui_mode', 'panel');
        $provider = $this->providerService->normalize(
            (string) $this->settings->get('pterogpt::provider', ''),
            (string) $this->settings->get('pterogpt::base_url', '')
        );

        $config = [
            'enabled' => $this->isEnabled(),
            'ui_mode' => in_array($uiMode, ['panel', 'modal'], true) ? $uiMode : 'panel',
            'model_mode' => in_array($modelMode, ['fixed', 'list'], true) ? $modelMode : 'fixed',
            'provider' => $provider,
        ];

        if ($config['model_mode'] === 'fixed') {
            $config['model'] = (string) $this->settings->get('pterogpt::model_fixed', 'gpt-4.1-mini');
        } else {
            $models = json_decode((string) $this->settings->get('pterogpt::models_allowed', '["gpt-4.1-mini"]'), true);
            $config['models'] = is_array($models) && !empty($models) ? array_values($models) : ['gpt-4.1-mini'];
        }

        return $config;
    }

    /**
     * @throws DisplayException
     */
    public function listModels(?string $provider = null, ?string $overrideApiKey = null): array
    {
        $resolvedProvider = $this->providerService->normalize(
            $provider,
            (string) $this->settings->get('pterogpt::base_url', '')
        );

        return $this->providerService->fetchModels(
            $resolvedProvider,
            $overrideApiKey !== null && trim($overrideApiKey) !== '' ? trim($overrideApiKey) : $this->getApiKey()
        );
    }

    /**
     * @throws DisplayException
     */
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
            throw new DisplayException('PriyxStudio AI is disabled by your administrator.');
        }

        $this->rateLimiter->check($server->id, RateLimiter::ACTION_CHAT);

        $message = $this->sanitizer->sanitizeMessage($message);
        if (!empty($context['console_lines'])) {
            $context['console_lines'] = $this->sanitizer->sanitizeConsoleLines($context['console_lines']);
        }
        if (!empty($context['file_path'])) {
            $context['file_path'] = $this->sanitizer->sanitizeFilePath((string) $context['file_path']);
        }
        if (!empty($context['file_content'])) {
            $context['file_content'] = $this->sanitizer->sanitizeFileContent((string) $context['file_content']);
        }

        $resolvedModel = $this->resolveModel($model);
        $systemPrompt = $this->promptBuilder->buildSystemPrompt($server);
        $messages = $this->promptBuilder->buildMessagesArray($systemPrompt, $conversationHistory, $message, $context);

        $response = $this->callApi($messages, $resolvedModel);

        $this->rateLimiter->increment($server->id, RateLimiter::ACTION_CHAT);

        AILog::query()->create([
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
        $mode = (string) $this->settings->get('pterogpt::model_mode', 'fixed');

        if ($mode === 'fixed') {
            return (string) $this->settings->get('pterogpt::model_fixed', 'gpt-4.1-mini');
        }

        $allowed = json_decode((string) $this->settings->get('pterogpt::models_allowed', '["gpt-4.1-mini"]'), true);
        if (!is_array($allowed) || empty($allowed)) {
            return 'gpt-4.1-mini';
        }

        if ($requestedModel && in_array($requestedModel, $allowed, true)) {
            return $requestedModel;
        }

        return (string) $allowed[0];
    }

    /**
     * @throws DisplayException
     */
    private function getClient(): Client
    {
        if ($this->client) {
            return $this->client;
        }

        $provider = $this->providerService->normalize(
            (string) $this->settings->get('pterogpt::provider', ''),
            (string) $this->settings->get('pterogpt::base_url', '')
        );
        $apiKey = $this->getApiKey();

        $this->client = new Client([
            'base_uri' => rtrim($this->providerService->endpointFor($provider), '/') . '/',
            'headers' => [
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
                'HTTP-Referer' => (string) config('app.url'),
                'X-Title' => (string) config('app.name', 'Pterodactyl'),
            ],
            'timeout' => 60,
        ]);

        return $this->client;
    }

    /**
     * @throws DisplayException
     */
    private function callApi(array $messages, string $model): array
    {
        $payload = [
            'model' => $model,
            'messages' => $messages,
            'max_tokens' => 2000,
            'temperature' => 0.5,
        ];

        try {
            $response = $this->getClient()->post('chat/completions', ['json' => $payload]);
        } catch (GuzzleException $exception) {
            throw new DisplayException('AI request failed. Please check provider URL, model, and key.');
        }

        $decoded = json_decode((string) $response->getBody(), true);
        if (!is_array($decoded)) {
            throw new DisplayException('AI provider returned an invalid response.');
        }

        return $decoded;
    }

    /**
     * @throws DisplayException
     */
    private function formatResponse(array $response): array
    {
        $message = $response['choices'][0]['message']['content'] ?? null;

        if (is_array($message)) {
            $message = implode("\n", array_map(static function ($part) {
                if (is_array($part) && isset($part['text'])) {
                    return (string) $part['text'];
                }

                return is_scalar($part) ? (string) $part : '';
            }, $message));
        }

        if (!is_string($message) || trim($message) === '') {
            throw new DisplayException('AI provider returned an empty response.');
        }

        return [
            'response' => trim($message),
        ];
    }

    /**
     * @throws DisplayException
     */
    private function getApiKey(): string
    {
        $encryptedKey = (string) $this->settings->get('pterogpt::api_key', '');

        if ($encryptedKey === '') {
            throw new DisplayException('The AI provider API key is not configured.');
        }

        try {
            return (string) decrypt($encryptedKey);
        } catch (\Throwable) {
            throw new DisplayException('Unable to decrypt the AI provider API key.');
        }
    }
}
