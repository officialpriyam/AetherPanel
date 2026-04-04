<?php
namespace Pterodactyl\Http\Controllers\Admin\Flash;

use Illuminate\View\View;
use Illuminate\Support\Facades\Http as AASupport;
use Prologue\Alerts\AlertsMessageBag;
use Illuminate\View\Factory as ViewFactory;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Http\Requests\Admin\Flash\FlashColorsRequest;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class FlashColorsController extends Controller
{
    public function __construct(private AlertsMessageBag $alert, private SettingsRepositoryInterface $settings, private ViewFactory $view)
    {
    }
    public function index(): View
    {
        return $this->view->make('admin.flash.colors', [
            'primary' => $this->settings->get('settings::flash:primary', '#6D28D9'), 
            'successText' => $this->settings->get('settings::flash:successText', '#E1FFD8'), 
            'successBorder' => $this->settings->get('settings::flash:successBorder', '#56AA2B'), 
            'successBackground' => $this->settings->get('settings::flash:successBackground', '#3D8F1F'), 
            'dangerText' => $this->settings->get('settings::flash:dangerText', '#FFD8D8'), 
            'dangerBorder' => $this->settings->get('settings::flash:dangerBorder', '#AA2A2A'), 
            'dangerBackground' => $this->settings->get('settings::flash:dangerBackground', '#8F1F20'), 
            'secondaryText' => $this->settings->get('settings::flash:secondaryText', '#B2B2C1'), 
            'secondaryBorder' => $this->settings->get('settings::flash:secondaryBorder', '#42425B'), 
            'secondaryBackground' => $this->settings->get('settings::flash:secondaryBackground', '#2B2B40'), 
            'gray50' => $this->settings->get('settings::flash:gray50', '#F5F3FF'), 
            'gray100' => $this->settings->get('settings::flash:gray100', '#EDE9FE'), 
            'gray200' => $this->settings->get('settings::flash:gray200', '#DDD6FE'), 
            'gray300' => $this->settings->get('settings::flash:gray300', '#C4B5FD'), 
            'gray400' => $this->settings->get('settings::flash:gray400', '#A78BFA'), 
            'gray500' => $this->settings->get('settings::flash:gray500', '#3B2F5A'), 
            'gray600' => $this->settings->get('settings::flash:gray600', '#2C2340'), 
            'gray700' => $this->settings->get('settings::flash:gray700', '#1B1528'), 
            'gray800' => $this->settings->get('settings::flash:gray800', '#120C1B'), 
            'gray900' => $this->settings->get('settings::flash:gray900', '#0B0812'), 
            'lightmode_primary' => $this->settings->get('settings::flash:lightmode_primary', '#7C3AED'), 
            'lightmode_successText' => $this->settings->get('settings::flash:lightmode_successText', '#E1FFD8'), 
            'lightmode_successBorder' => $this->settings->get('settings::flash:lightmode_successBorder', '#56AA2B'), 
            'lightmode_successBackground' => $this->settings->get('settings::flash:lightmode_successBackground', '#3D8F1F'), 
            'lightmode_dangerText' => $this->settings->get('settings::flash:lightmode_dangerText', '#FFD8D8'), 
            'lightmode_dangerBorder' => $this->settings->get('settings::flash:lightmode_dangerBorder', '#AA2A2A'), 
            'lightmode_dangerBackground' => $this->settings->get('settings::flash:lightmode_dangerBackground', '#8F1F20'), 
            'lightmode_secondaryText' => $this->settings->get('settings::flash:lightmode_secondaryText', '#F8FAFC'), 
            'lightmode_secondaryBorder' => $this->settings->get('settings::flash:lightmode_secondaryBorder', '#E2E8F0'), 
            'lightmode_secondaryBackground' => $this->settings->get('settings::flash:lightmode_secondaryBackground', '#94A3B8'), 
            'lightmode_gray50' => $this->settings->get('settings::flash:lightmode_gray50', '#1B102A'), 
            'lightmode_gray100' => $this->settings->get('settings::flash:lightmode_gray100', '#2B1B3C'), 
            'lightmode_gray200' => $this->settings->get('settings::flash:lightmode_gray200', '#3A2552'), 
            'lightmode_gray300' => $this->settings->get('settings::flash:lightmode_gray300', '#4B3266'), 
            'lightmode_gray400' => $this->settings->get('settings::flash:lightmode_gray400', '#6B4A88'), 
            'lightmode_gray500' => $this->settings->get('settings::flash:lightmode_gray500', '#A18CCB'), 
            'lightmode_gray600' => $this->settings->get('settings::flash:lightmode_gray600', '#D6CEF2'), 
            'lightmode_gray700' => $this->settings->get('settings::flash:lightmode_gray700', '#EEE9FF'), 
            'lightmode_gray800' => $this->settings->get('settings::flash:lightmode_gray800', '#F6F3FF'), 
            'lightmode_gray900' => $this->settings->get('settings::flash:lightmode_gray900', '#FFFFFF')
        ]);
    }
    public function store(FlashColorsRequest $request)
    {
        foreach ($request->normalize() as $key => $value) {
            $this->settings->set('settings::' . $key, $this->sanitizeHexColor((string) $value));
        }

        $this->alert->success('Theme settings have been updated successfully.')->flash();
        return redirect()->route('admin.flash.colors');
    }

    private function sanitizeHexColor(string $value): string
    {
        $color = trim($value);
        if ($color === '') {
            return '#000000';
        }

        if ($color[0] !== '#') {
            $color = '#' . $color;
        }

        if (!preg_match('/^#[0-9a-fA-F]{6}$/', $color)) {
            return '#000000';
        }

        return strtoupper($color);
    }
}
