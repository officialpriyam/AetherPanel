<?php
namespace Pterodactyl\Http\Controllers\Admin\Flash;

use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Illuminate\View\Factory as ViewFactory;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Http\Requests\Admin\Flash\FlashSocialRequest;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class FlashSocialController extends Controller
{
    public function __construct(private AlertsMessageBag $alert, private SettingsRepositoryInterface $settings, private ViewFactory $view)
    {
    }

    public function index(): View
    {
        return $this->view->make('admin.flash.social', [
            'social_discord' => $this->settings->get('settings::flash:social_discord', 'https://discord.gg/'),
            'social_billing' => $this->settings->get('settings::flash:social_billing', 'https://billing.example.com'),
            'social_status' => $this->settings->get('settings::flash:social_status', 'https://status.example.com'),
            'social_custom' => $this->settings->get('settings::flash:social_custom', ''),
            'social_custom_icon' => $this->settings->get('settings::flash:social_custom_icon', 'link'),
        ]);
    }

    public function store(FlashSocialRequest $request): RedirectResponse
    {
        foreach ($request->normalize() as $key => $value) {
            $this->settings->set('settings::' . $key, $value);
        }

        $this->alert->success('Flash social settings have been updated.')->flash();

        return redirect()->route('admin.flash.social');
    }
}
