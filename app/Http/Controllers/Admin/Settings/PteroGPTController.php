<?php

namespace Pterodactyl\Http\Controllers\Admin\Settings;

use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Services\PteroGPT\PromptBuilder;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;
use Pterodactyl\Http\Requests\Admin\Settings\PteroGPTSettingsRequest;

class PteroGPTController extends Controller
{
    public function __construct(
        private AlertsMessageBag $alert,
        private SettingsRepositoryInterface $settings,
    ) {
    }

    public function index(): View
    {
        return view('admin.settings.pterogpt', [
            'enabled' => (bool) $this->settings->get('pterogpt::enabled', false),
            'baseUrl' => (string) $this->settings->get('pterogpt::base_url', 'https://api.openai.com/v1'),
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
        $this->settings->set('pterogpt::enabled', $request->boolean('enabled') ? '1' : '0');
        $this->settings->set('pterogpt::base_url', trim((string) $request->input('base_url')));
        $this->settings->set('pterogpt::model_mode', (string) $request->input('model_mode'));
        $this->settings->set('pterogpt::model_fixed', trim((string) $request->input('model_fixed')));
        $this->settings->set('pterogpt::models_allowed', (string) $request->input('models_allowed'));
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
}
