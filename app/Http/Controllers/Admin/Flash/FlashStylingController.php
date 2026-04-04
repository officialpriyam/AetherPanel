<?php
namespace Pterodactyl\Http\Controllers\Admin\Flash;

use Illuminate\View\View;
use Illuminate\Support\Facades\Http as AASupport;
use Prologue\Alerts\AlertsMessageBag;
use Illuminate\View\Factory as ViewFactory;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Http\Requests\Admin\Flash\FlashStylingRequest;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class FlashStylingController extends Controller
{
    public function __construct(private AlertsMessageBag $alert, private SettingsRepositoryInterface $settings, private ViewFactory $view)
    {
    }
    public function index(): View
    {
        return $this->view->make('admin.flash.styling', [
            'backgroundImage' => $this->settings->get('settings::flash:backgroundImage', 'none'),
            'backgroundBlur' => $this->settings->get('settings::flash:backgroundBlur', '0px'),
            'backdrop' => $this->settings->get('settings::flash:backdrop', false),
            'backdropPercentage' => $this->settings->get('settings::flash:backdropPercentage', '100%'),
            'defaultMode' => $this->settings->get('settings::flash:defaultMode', 'darkmode'),
            'copyright' => $this->settings->get('settings::flash:copyright', 'Designed by priyxstudio'),
            'radiusInput' => $this->settings->get('settings::flash:radiusInput', '7px'),
            'borderInput' => $this->settings->get('settings::flash:borderInput', true),
            'radiusBox' => $this->settings->get('settings::flash:radiusBox', '10px'),
            'flashMessage' => $this->settings->get('settings::flash:flashMessage', 1),
            'pageTitle' => $this->settings->get('settings::flash:pageTitle', true),
            'loginBackground' => $this->settings->get('settings::flash:loginBackground', '/flash/background-login.png'),
            'loginGradient' => $this->settings->get('settings::flash:loginGradient', false),
            'effectsSnow' => $this->settings->get('settings::flash:effects_snow', false),
            'effectsAutumn' => $this->settings->get('settings::flash:effects_autumn', false),
            'effectsStars' => $this->settings->get('settings::flash:effects_stars', false),
        ]);
    }
    public function store(FlashStylingRequest $request)
    {
        foreach ($request->normalize() as $key => $value) {
            $this->settings->set('settings::' . $key, $value);
        }

        $this->alert->success('Theme settings have been updated successfully.')->flash();
        return redirect()->route('admin.flash.styling');
    }
}
