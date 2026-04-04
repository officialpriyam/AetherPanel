<?php

namespace Pterodactyl\Http\Controllers\Admin\Settings;

use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
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
        $defaultPrompt = <<<'PROMPT'
You are PteroGPT, an AI assistant integrated into Pterodactyl Panel for game server management. Your role is to help users diagnose errors, configure servers, and optimize performance.
Be concise, technical, and focused on game server administration. Always explain your reasoning and provide actionable solutions.
{server_info}
PROMPT;

        return view('admin.settings.pterogpt', [
            'enabled' => $this->settings->get('pterogpt::enabled', false),
            'baseUrl' => $this->settings->get('pterogpt::base_url', 'https://api.openai.com/v1'),
            'hasApiKey' => !empty($this->settings->get('pterogpt::api_key')),
            'modelMode' => $this->settings->get('pterogpt::model_mode', 'fixed'),
            'modelFixed' => $this->settings->get('pterogpt::model_fixed', 'gpt-4o-mini'),
            'modelsAllowed' => $this->settings->get('pterogpt::models_allowed', '["gpt-4o-mini", "gpt-4o"]'),
            'uiMode' => $this->settings->get('pterogpt::ui_mode', 'panel'),
            'systemPrompt' => $this->settings->get('pterogpt::system_prompt', $defaultPrompt),
            'language' => $this->settings->get('pterogpt::language', 'en'),
            'limitChat' => $this->settings->get('pterogpt::limit_chat', 50),
            'limitRead' => $this->settings->get('pterogpt::limit_read', 100),
            'limitWrite' => $this->settings->get('pterogpt::limit_write', 20),
            'limitCommand' => $this->settings->get('pterogpt::limit_command', 10),
        ]);
    }

    public function update(PteroGPTSettingsRequest $request): RedirectResponse
    {
        $this->settings->set('pterogpt::enabled', $request->boolean('enabled'));
        $this->settings->set('pterogpt::base_url', $request->input('base_url'));
        $this->settings->set('pterogpt::model_mode', $request->input('model_mode'));
        $this->settings->set('pterogpt::model_fixed', $request->input('model_fixed'));
        $this->settings->set('pterogpt::models_allowed', $request->input('models_allowed'));
        $this->settings->set('pterogpt::ui_mode', $request->input('ui_mode'));
        $this->settings->set('pterogpt::system_prompt', $request->input('system_prompt', ''));
        $this->settings->set('pterogpt::language', $request->input('language'));
        $this->settings->set('pterogpt::limit_chat', $request->input('limit_chat'));
        $this->settings->set('pterogpt::limit_read', $request->input('limit_read'));
        $this->settings->set('pterogpt::limit_write', $request->input('limit_write'));
        $this->settings->set('pterogpt::limit_command', $request->input('limit_command'));

        if ($request->filled('api_key')) {
            $this->settings->set('pterogpt::api_key', encrypt($request->input('api_key')));
        }

        $this->alert->success('PteroGPT settings have been updated.')->flash();

        return redirect()->route('admin.settings.pterogpt');
    }
}