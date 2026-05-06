<?php
namespace Pterodactyl\Http\Controllers\Admin\Flash;

use Illuminate\View\View;
use Illuminate\Support\Facades\Http as AASupport;
use Prologue\Alerts\AlertsMessageBag;
use Illuminate\View\Factory as ViewFactory;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Http\Requests\Admin\Flash\FlashAdvancedRequest;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class FlashAdvancedController extends Controller
{
    public function __construct(private AlertsMessageBag $alert, private SettingsRepositoryInterface $settings, private ViewFactory $view)
    {
    }
    public function index(): View
    {
        $brandAssetUrl = rtrim((string) (panel_runtime_config('PANEL_FRONTEND_URL', config('app.url')) ?: config('app.url')), '/') . '/branding/aether-mark.png';

        return $this->view->make('admin.flash.advanced', [
            // Advanced
            'profileType' => $this->settings->get('settings::flash:profileType', 'gravatar'),
            'ipFlag' => $this->settings->get('settings::flash:ipFlag', true),
            'lowResourcesAlert' => $this->settings->get('settings::flash:lowResourcesAlert', false),
            'knowledge_base_url' => $this->settings->get('settings::flash:knowledge_base_url', ''),

            // Meta
            'meta_color' => $this->settings->get('settings::flash:meta_color', '#4a35cf'),
            'meta_title' => $this->settings->get('settings::flash:meta_title', 'AetherPanel'),
            'meta_description' => $this->settings->get('settings::flash:meta_description', 'A modern game server control panel powered by AetherPanel.'),
            'meta_image' => $this->settings->get('settings::flash:meta_image', '/flash/meta-tags.png'),
            'meta_favicon' => $this->settings->get('settings::flash:meta_favicon', '/branding/aether-mark.png'),

            // Mail
            'mail_color' => $this->settings->get('settings::flash:mail_color', '#4a35cf'),
            'mail_backgroundColor' => $this->settings->get('settings::flash:mail_backgroundColor', '#F5F5FF'),
            'mail_logo' => $this->settings->get('settings::flash:mail_logo', $brandAssetUrl),
            'mail_logoFull' => $this->settings->get('settings::flash:mail_logoFull', false),
            'mail_mode' => $this->settings->get('settings::flash:mail_mode', 'light'),
            'mail_discord' => $this->settings->get('settings::flash:mail_discord', 'https://flash.gg/discord'),
            'mail_twitter' => $this->settings->get('settings::flash:mail_twitter', 'https://x.com'),
            'mail_facebook' => $this->settings->get('settings::flash:mail_facebook', 'https://facebook.com'),
            'mail_instagram' => $this->settings->get('settings::flash:mail_instagram', 'https://instagram.com'),
            'mail_linkedin' => $this->settings->get('settings::flash:mail_linkedin', 'https://linkedin.com'),
            'mail_youtube' => $this->settings->get('settings::flash:mail_youtube', 'https://youtube.com'),
            'mail_status' => $this->settings->get('settings::flash:mail_status', 'https://flash.gg/status'),
            'mail_billing' => $this->settings->get('settings::flash:mail_billing', 'https://flash.gg/billing'),
            'mail_support' => $this->settings->get('settings::flash:mail_support', 'https://flash.gg/support'),
        ]);
    }
    public function store(FlashAdvancedRequest $request)
    {
        foreach ($request->normalize() as $key => $value) {
            $this->settings->set('settings::' . $key, $value);
        }

        $this->alert->success('Theme settings have been updated successfully.')->flash();
        return redirect()->route('admin.flash.advanced');
    }
}
