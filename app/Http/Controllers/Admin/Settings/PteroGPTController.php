<?php

namespace Pterodactyl\Http\Controllers\Admin\Settings;

use Throwable;
use Illuminate\View\View;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Pterodactyl\Exceptions\DisplayException;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Services\PteroGPT\AIService;
use Pterodactyl\Services\PteroGPT\PromptBuilder;
use Pterodactyl\Services\PteroGPT\ProviderService;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;
use Pterodactyl\Http\Requests\Admin\Settings\PteroGPTSettingsRequest;

class PteroGPTController extends Controller
{
    public function __construct(
        private AlertsMessageBag $alert,
        private SettingsRepositoryInterface $settings,
        private ProviderService $providerService,
        private AIService $aiService,
    ) {
    }

    public function index(): View
    {
        $provider = $this->providerService->normalize(
            (string) $this->settings->get('pterogpt::provider', ''),
            (string) $this->settings->get('pterogpt::base_url', 'https://api.openai.com/v1')
        );

        return view('admin.settings.pterogpt', [
            'enabled' => (bool) $this->settings->get('pterogpt::enabled', false),
            'baseUrl' => $this->providerService->endpointFor($provider),
            'provider' => $provider,
            'providers' => $this->providerService->all(),
            'hasApiKey' => (string) $this->settings->get('pterogpt::api_key', '') !== '',
            'modelMode' => (string) $this->settings->get('pterogpt::model_mode', 'fixed'),
            'modelFixed' => (string) $this->settings->get('pterogpt::model_fixed', 'gpt-4.1-mini'),
            'modelsAllowed' => (string) $this->settings->get('pterogpt::models_allowed', '["gpt-4.1-mini"]'),
            'uiMode' => (string) $this->settings->get('pterogpt::ui_mode', 'panel'),
            'systemPrompt' => (string) $this->settings->get('pterogpt::system_prompt', PromptBuilder::DEFAULT_SYSTEM_PROMPT),
            'language' => (string) $this->settings->get('pterogpt::language', 'en'),
            'limitChat' => (int) $this->settings->get('pterogpt::limit_chat', 50),
            'limitRead' => (int) $this->settings->get('pterogpt::limit_read', 100),
            'limitWrite' => (int) $this->settings->get('pterogpt::limit_write', 20),
            'limitCommand' => (int) $this->settings->get('pterogpt::limit_command', 10),
        ]);
    }

    public function update(PteroGPTSettingsRequest $request): RedirectResponse
    {
        $provider = $this->providerService->normalize((string) $request->input('provider'));
        $modelFixed = trim((string) $request->input('model_fixed'));
        $modelsAllowed = $this->normalizeModelsAllowed((string) $request->input('models_allowed'), $modelFixed);

        $this->settings->set('pterogpt::enabled', $request->boolean('enabled') ? '1' : '0');
        $this->settings->set('pterogpt::provider', $provider);
        $this->settings->set('pterogpt::base_url', $this->providerService->endpointFor($provider));
        $this->settings->set('pterogpt::model_mode', (string) $request->input('model_mode'));
        $this->settings->set('pterogpt::model_fixed', $modelFixed);
        $this->settings->set('pterogpt::models_allowed', $modelsAllowed);
        $this->settings->set('pterogpt::ui_mode', (string) $request->input('ui_mode'));
        $this->settings->set('pterogpt::system_prompt', (string) $request->input('system_prompt', ''));
        $this->settings->set('pterogpt::language', (string) $request->input('language'));

        $this->settings->set('pterogpt::limit_chat', (string) $request->input('limit_chat'));
        $this->settings->set('pterogpt::limit_read', (string) $request->input('limit_read'));
        $this->settings->set('pterogpt::limit_write', (string) $request->input('limit_write'));
        $this->settings->set('pterogpt::limit_command', (string) $request->input('limit_command'));

        if ($request->filled('api_key')) {
            $this->settings->set('pterogpt::api_key', encrypt((string) $request->input('api_key')));
        }

        $this->alert->success('PriyxStudio AI settings were updated successfully.')->flash();

        return redirect()->route('admin.settings.pterogpt');
    }

    public function models(Request $request): JsonResponse
    {
        $provider = $this->providerService->normalize(
            (string) $request->input('provider', $this->settings->get('pterogpt::provider', 'openai')),
            (string) $this->settings->get('pterogpt::base_url', '')
        );

        try {
            $models = $this->aiService->listModels(
                $provider,
                $request->filled('api_key') ? (string) $request->input('api_key') : null
            );
        } catch (DisplayException $exception) {
            return new JsonResponse([
                'error' => $exception->getMessage(),
            ], 422);
        } catch (Throwable) {
            return new JsonResponse([
                'error' => 'Unable to fetch models for the selected provider right now.',
            ], 422);
        }

        return new JsonResponse([
            'data' => [
                'provider' => $provider,
                'models' => $models,
            ],
        ]);
    }

    private function normalizeModelsAllowed(string $value, string $fallbackModel): string
    {
        $decoded = json_decode($value, true);

        if (!is_array($decoded)) {
            $decoded = [];
        }

        $decoded = array_values(array_unique(array_filter(array_map(
            static fn ($model) => trim((string) $model),
            $decoded
        ))));

        if (empty($decoded) && $fallbackModel !== '') {
            $decoded[] = $fallbackModel;
        }

        return json_encode($decoded, JSON_UNESCAPED_SLASHES) ?: '[]';
    }
}
