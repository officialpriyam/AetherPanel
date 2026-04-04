<?php

namespace Pterodactyl\Http\Controllers\Admin\Flash;

use Illuminate\View\View;
use Prologue\Alerts\AlertsMessageBag;
use Illuminate\View\Factory as ViewFactory;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Http\Requests\Admin\Flash\FlashAddonsRequest;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class FlashAddonsController extends Controller
{
    public function __construct(
        private AlertsMessageBag $alert,
        private SettingsRepositoryInterface $settings,
        private ViewFactory $view
    ) {
    }

    public function index(): View
    {
        return $this->view->make('admin.flash.addons', [
            'addon_plugin_installer_enabled' => $this->settings->get('settings::flash:addon_plugin_installer_enabled', 'true'),
            'addon_mod_installer_enabled' => $this->settings->get('settings::flash:addon_mod_installer_enabled', 'true'),
            'addon_modpack_installer_enabled' => $this->settings->get('settings::flash:addon_modpack_installer_enabled', 'true'),
            'addon_subdomain_enabled' => $this->settings->get('settings::flash:addon_subdomain_enabled', 'true'),
            'addon_split_enabled' => $this->settings->get('settings::flash:addon_split_enabled', 'true'),
            'addon_pterogpt_enabled' => $this->settings->get('settings::flash:addon_pterogpt_enabled', 'true'),
            'addon_version_changer_enabled' => $this->settings->get('settings::flash:addon_version_changer_enabled', 'true'),
            'addon_ticket_system_enabled' => $this->settings->get('settings::flash:addon_ticket_system_enabled', 'true'),
            'addon_plugin_installer_eggs' => $this->settings->get('settings::flash:addon_plugin_installer_eggs', ''),
            'addon_mod_installer_eggs' => $this->settings->get('settings::flash:addon_mod_installer_eggs', ''),
            'addon_modpack_installer_eggs' => $this->settings->get('settings::flash:addon_modpack_installer_eggs', ''),
            'addon_subdomain_eggs' => $this->settings->get('settings::flash:addon_subdomain_eggs', ''),
            'addon_split_eggs' => $this->settings->get('settings::flash:addon_split_eggs', ''),
            'addon_version_changer_eggs' => $this->settings->get('settings::flash:addon_version_changer_eggs', ''),
        ]);
    }

    public function store(FlashAddonsRequest $request)
    {
        foreach ($request->normalize() as $key => $value) {
            $this->settings->set('settings::' . $key, $value);
        }

        $this->alert->success('Addon visibility settings have been updated successfully.')->flash();

        return redirect()->route('admin.flash.addons');
    }
}
