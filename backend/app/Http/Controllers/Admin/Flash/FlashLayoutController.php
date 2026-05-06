<?php
namespace Pterodactyl\Http\Controllers\Admin\Flash;

use Illuminate\View\View;
use Illuminate\Support\Facades\Http as AASupport;
use Prologue\Alerts\AlertsMessageBag;
use Illuminate\View\Factory as ViewFactory;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Http\Requests\Admin\Flash\FlashLayoutRequest;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class FlashLayoutController extends Controller
{
    public function __construct(private AlertsMessageBag $alert, private SettingsRepositoryInterface $settings, private ViewFactory $view)
    {
    }
    public function index(): View
    {
        return $this->view->make('admin.flash.layout', ['layout' => $this->settings->get('settings::flash:layout', 1), 'dashboardLayout' => $this->settings->get('settings::flash:dashboardLayout', 1), 'searchComponent' => $this->settings->get('settings::flash:searchComponent', 1), 'logoPosition' => $this->settings->get('settings::flash:logoPosition', 1), 'socialPosition' => $this->settings->get('settings::flash:socialPosition', 1), 'loginLayout' => $this->settings->get('settings::flash:loginLayout', 1)]);
    }
    public function store(FlashLayoutRequest $request)
    {
        foreach ($request->normalize() as $key => $value) {
            $this->settings->set('settings::' . $key, $value);
        }

        $this->alert->success('Theme settings have been updated successfully.')->flash();
        return redirect()->route('admin.flash.layout');
    }
}
