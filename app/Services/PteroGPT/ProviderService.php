<?php

namespace Pterodactyl\Services\PteroGPT;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Pterodactyl\Exceptions\DisplayException;

class ProviderService
{
    public const OPENAI = 'openai';
    public const OPENROUTER = 'openrouter';
    public const GEMINI = 'gemini';

    public function all(): array
    {
        return [
            self::OPENAI => [
                'label' => 'OpenAI',
                'description' => 'Best for the native OpenAI catalog and GPT models.',
                'endpoint' => 'https://api.openai.com/v1',
            ],
            self::OPENROUTER => [
                'label' => 'OpenRouter',
                'description' => 'Access a wider multi-provider model catalog from one API.',
                'endpoint' => 'https://openrouter.ai/api/v1',
            ],
            self::GEMINI => [
                'label' => 'Gemini',
                'description' => 'Use Google Gemini through the OpenAI-compatible endpoint.',
                'endpoint' => 'https://generativelanguage.googleapis.com/v1beta/openai',
            ],
        ];
    }

    public function normalize(?string $provider, ?string $baseUrl = null): string
    {
        $provider = strtolower(trim((string) $provider));

        if (array_key_exists($provider, $this->all())) {
            return $provider;
        }

        $baseUrl = strtolower((string) $baseUrl);

        if (Str::contains($baseUrl, 'openrouter.ai')) {
            return self::OPENROUTER;
        }

        if (Str::contains($baseUrl, 'generativelanguage.googleapis.com')) {
            return self::GEMINI;
        }

        return self::OPENAI;
    }

    public function endpointFor(string $provider): string
    {
        $provider = $this->normalize($provider);

        return $this->all()[$provider]['endpoint'];
    }

    /**
     * @throws DisplayException
     */
    public function fetchModels(string $provider, string $apiKey = ''): array
    {
        $provider = $this->normalize($provider);

        return match ($provider) {
            self::OPENAI => $this->fetchOpenAiCompatibleModels($this->endpointFor($provider), $apiKey),
            self::OPENROUTER => $this->fetchOpenRouterModels($apiKey),
            self::GEMINI => $this->fetchGeminiModels($apiKey),
            default => throw new DisplayException('Unsupported AI provider.'),
        };
    }

    /**
     * @throws DisplayException
     */
    private function fetchOpenAiCompatibleModels(string $baseUrl, string $apiKey): array
    {
        if ($apiKey === '') {
            throw new DisplayException('An API key is required before model discovery can run.');
        }

        $response = Http::acceptJson()
            ->withToken($apiKey)
            ->timeout(15)
            ->retry(2, 250, throw: false)
            ->get(rtrim($baseUrl, '/') . '/models');

        if (!$response->ok()) {
            throw new DisplayException('The provider did not return a model catalog.');
        }

        $models = collect($response->json('data', []))
            ->map(fn (array $row) => (string) ($row['id'] ?? ''))
            ->filter()
            ->values()
            ->all();

        if (empty($models)) {
            throw new DisplayException('No models were returned by this provider.');
        }

        natcasesort($models);

        return array_values(array_unique($models));
    }

    /**
     * @throws DisplayException
     */
    private function fetchOpenRouterModels(string $apiKey): array
    {
        $request = Http::acceptJson()
            ->timeout(15)
            ->retry(2, 250, throw: false)
            ->withHeaders([
                'HTTP-Referer' => (string) config('app.url'),
                'X-Title' => (string) config('app.name', 'Pterodactyl'),
            ]);

        if ($apiKey !== '') {
            $request = $request->withToken($apiKey);
        }

        $response = $request->get('https://openrouter.ai/api/v1/models');

        if (!$response->ok()) {
            throw new DisplayException('OpenRouter did not return a model catalog.');
        }

        $models = collect($response->json('data', []))
            ->map(fn (array $row) => (string) ($row['id'] ?? ''))
            ->filter()
            ->values()
            ->all();

        if (empty($models)) {
            throw new DisplayException('No OpenRouter models were returned.');
        }

        natcasesort($models);

        return array_values(array_unique($models));
    }

    /**
     * @throws DisplayException
     */
    private function fetchGeminiModels(string $apiKey): array
    {
        if ($apiKey === '') {
            throw new DisplayException('A Gemini API key is required before model discovery can run.');
        }

        $response = Http::acceptJson()
            ->timeout(15)
            ->retry(2, 250, throw: false)
            ->get('https://generativelanguage.googleapis.com/v1beta/models', [
                'key' => $apiKey,
            ]);

        if (!$response->ok()) {
            throw new DisplayException('Gemini did not return a model catalog.');
        }

        $models = collect($response->json('models', []))
            ->map(function (array $row) {
                $name = (string) ($row['name'] ?? '');

                return Str::startsWith($name, 'models/')
                    ? Str::after($name, 'models/')
                    : $name;
            })
            ->filter(fn (string $model) => $model !== '')
            ->values()
            ->all();

        if (empty($models)) {
            throw new DisplayException('No Gemini models were returned.');
        }

        natcasesort($models);

        return array_values(array_unique($models));
    }
}
