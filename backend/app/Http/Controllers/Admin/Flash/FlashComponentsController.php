<?php
namespace Pterodactyl\Http\Controllers\Admin\Flash;

use Illuminate\View\View;
use Illuminate\Support\Facades\Http as AASupport;
use Prologue\Alerts\AlertsMessageBag;
use Illuminate\View\Factory as ViewFactory;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Http\Requests\Admin\Flash\FlashComponentsRequest;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class FlashComponentsController extends Controller
{
    public function __construct(private AlertsMessageBag $alert, private SettingsRepositoryInterface $settings, private ViewFactory $view)
    {
    }
    public function index(): View
    {
        return $this->view->make('admin.flash.components', ['serverRow' => $this->settings->get('settings::flash:serverRow', 1), 'socialButtons' => $this->settings->get('settings::flash:socialButtons', false), 'discordBox' => $this->settings->get('settings::flash:discordBox', true), 'statsCards' => $this->settings->get('settings::flash:statsCards', 2), 'graphs' => $this->settings->get('settings::flash:graphs', 2), 'slot1' => $this->settings->get('settings::flash:slot1', 'disabled'), 'slot2' => $this->settings->get('settings::flash:slot2', 'disabled'), 'slot3' => $this->settings->get('settings::flash:slot3', 'disabled'), 'slot4' => $this->settings->get('settings::flash:slot4', 'disabled'), 'slot5' => $this->settings->get('settings::flash:slot5', 'disabled'), 'slot6' => $this->settings->get('settings::flash:slot6', 'disabled'), 'slot7' => $this->settings->get('settings::flash:slot7', 'disabled')]);
    }
    public function store(FlashComponentsRequest $request)
    {
        foreach ($request->normalize() as $key => $value) {
            $this->settings->set('settings::' . $key, $value);
        }

        $this->alert->success('Theme settings have been updated successfully.')->flash();
        return redirect()->route('admin.flash.components');
    }
}
