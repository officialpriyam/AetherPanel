<?php
namespace Pterodactyl\Http\Controllers\Admin\Flash;

use Illuminate\View\View;
use Illuminate\Support\Facades\Http as AASupport;
use Prologue\Alerts\AlertsMessageBag;
use Illuminate\View\Factory as ViewFactory;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Http\Requests\Admin\Flash\FlashAnnouncementRequest;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class FlashAnnouncementController extends Controller
{
    public function __construct(private AlertsMessageBag $alert, private SettingsRepositoryInterface $settings, private ViewFactory $view)
    {
    }
    public function index(): View
    {
        return $this->view->make('admin.flash.announcement', [
            'announcementType' => $this->settings->get('settings::flash:announcementType', 'party'),
            'announcementCloseable' => $this->settings->get('settings::flash:announcementCloseable', false),
            'announcementMessage' => $this->settings->get('settings::flash:announcementMessage', 'We have a brand new game panel design!'),
            'announcementTimeout' => $this->settings->get('settings::flash:announcementTimeout', '0'),
            'announcementIcon' => $this->settings->get('settings::flash:announcementIcon', ''),
        ]);
    }
    public function store(FlashAnnouncementRequest $request)
    {
        foreach ($request->normalize() as $key => $value) {
            $this->settings->set('settings::' . $key, $value);
        }

        $this->alert->success('Theme settings have been updated successfully.')->flash();
        return redirect()->route('admin.flash.announcement');
    }
}
