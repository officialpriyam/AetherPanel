<?php
namespace Pterodactyl\Http\Controllers\Admin\Flash;

use Illuminate\View\View;
use Illuminate\Support\Facades\Http as AASupport;
use Prologue\Alerts\AlertsMessageBag;
use Illuminate\View\Factory as ViewFactory;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Http\Requests\Admin\Flash\FlashRequest;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class FlashController extends Controller
{
    public function __construct(private AlertsMessageBag $alert, private SettingsRepositoryInterface $settings, private ViewFactory $view)
    {
    }
    public function index(): View
    {
        return $this->view->make('admin.flash.index', ['logo' => $this->settings->get('settings::flash:logo', '/flash/Flash.png'), 'fullLogo' => $this->settings->get('settings::flash:fullLogo', false), 'logoHeight' => $this->settings->get('settings::flash:logoHeight', '32px')]);
    }
    public function store(FlashRequest $request)
    {
        foreach ($request->normalize() as $key => $value) {
            $this->settings->set('settings::' . $key, $value);
        }

        $this->alert->success('Theme settings have been updated successfully.')->flash();
        return redirect()->route('admin.flash');
    }
}
