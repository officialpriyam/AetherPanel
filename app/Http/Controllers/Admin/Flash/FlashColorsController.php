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
            'primary' => $this->settings->get('settings::flash:primary', '#2563EB'), 
            'successText' => $this->settings->get('settings::flash:successText', '#E1FFD8'), 
            'successBorder' => $this->settings->get('settings::flash:successBorder', '#56AA2B'), 
            'successBackground' => $this->settings->get('settings::flash:successBackground', '#3D8F1F'), 
            'dangerText' => $this->settings->get('settings::flash:dangerText', '#FFD8D8'), 
            'dangerBorder' => $this->settings->get('settings::flash:dangerBorder', '#AA2A2A'), 
            'dangerBackground' => $this->settings->get('settings::flash:dangerBackground', '#8F1F20'), 
            'secondaryText' => $this->settings->get('settings::flash:secondaryText', '#E2E8F0'), 
            'secondaryBorder' => $this->settings->get('settings::flash:secondaryBorder', '#475569'), 
            'secondaryBackground' => $this->settings->get('settings::flash:secondaryBackground', '#1E293B'), 
            'gray50' => $this->settings->get('settings::flash:gray50', '#F8FAFC'), 
            'gray100' => $this->settings->get('settings::flash:gray100', '#E2E8F0'), 
            'gray200' => $this->settings->get('settings::flash:gray200', '#CBD5E1'), 
            'gray300' => $this->settings->get('settings::flash:gray300', '#94A3B8'), 
            'gray400' => $this->settings->get('settings::flash:gray400', '#64748B'), 
            'gray500' => $this->settings->get('settings::flash:gray500', '#475569'), 
            'gray600' => $this->settings->get('settings::flash:gray600', '#334155'), 
            'gray700' => $this->settings->get('settings::flash:gray700', '#1E293B'), 
            'gray800' => $this->settings->get('settings::flash:gray800', '#0F172A'), 
            'gray900' => $this->settings->get('settings::flash:gray900', '#020617'), 
            'lightmode_primary' => $this->settings->get('settings::flash:lightmode_primary', '#2563EB'), 
            'lightmode_successText' => $this->settings->get('settings::flash:lightmode_successText', '#E1FFD8'), 
            'lightmode_successBorder' => $this->settings->get('settings::flash:lightmode_successBorder', '#56AA2B'), 
            'lightmode_successBackground' => $this->settings->get('settings::flash:lightmode_successBackground', '#3D8F1F'), 
            'lightmode_dangerText' => $this->settings->get('settings::flash:lightmode_dangerText', '#FFD8D8'), 
            'lightmode_dangerBorder' => $this->settings->get('settings::flash:lightmode_dangerBorder', '#AA2A2A'), 
            'lightmode_dangerBackground' => $this->settings->get('settings::flash:lightmode_dangerBackground', '#8F1F20'), 
            'lightmode_secondaryText' => $this->settings->get('settings::flash:lightmode_secondaryText', '#334155'), 
            'lightmode_secondaryBorder' => $this->settings->get('settings::flash:lightmode_secondaryBorder', '#CBD5E1'), 
            'lightmode_secondaryBackground' => $this->settings->get('settings::flash:lightmode_secondaryBackground', '#E2E8F0'), 
            'lightmode_gray50' => $this->settings->get('settings::flash:lightmode_gray50', '#0F172A'), 
            'lightmode_gray100' => $this->settings->get('settings::flash:lightmode_gray100', '#1E293B'), 
            'lightmode_gray200' => $this->settings->get('settings::flash:lightmode_gray200', '#334155'), 
            'lightmode_gray300' => $this->settings->get('settings::flash:lightmode_gray300', '#475569'), 
            'lightmode_gray400' => $this->settings->get('settings::flash:lightmode_gray400', '#64748B'), 
            'lightmode_gray500' => $this->settings->get('settings::flash:lightmode_gray500', '#94A3B8'), 
            'lightmode_gray600' => $this->settings->get('settings::flash:lightmode_gray600', '#CBD5E1'), 
            'lightmode_gray700' => $this->settings->get('settings::flash:lightmode_gray700', '#E2E8F0'), 
            'lightmode_gray800' => $this->settings->get('settings::flash:lightmode_gray800', '#F1F5F9'), 
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
