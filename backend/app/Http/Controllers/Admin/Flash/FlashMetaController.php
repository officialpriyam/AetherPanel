<?php
namespace Pterodactyl\Http\Controllers\Admin\Flash;

use Illuminate\View\View;
use Illuminate\Support\Facades\Http as AASupport;
use Prologue\Alerts\AlertsMessageBag;
use Illuminate\View\Factory as ViewFactory;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Http\Requests\Admin\Flash\FlashMetaRequest;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class FlashMetaController extends Controller
{
    public function __construct(private AlertsMessageBag $alert, private SettingsRepositoryInterface $settings, private ViewFactory $view)
    {
    }
    public function index(): View
    {
        return $this->view->make('admin.flash.meta', ['meta_color' => $this->settings->get('settings::flash:meta_color', '#4a35cf'), 'meta_title' => $this->settings->get('settings::flash:meta_title', 'AetherPanel'), 'meta_description' => $this->settings->get('settings::flash:meta_description', 'A modern game server control panel powered by AetherPanel.'), 'meta_image' => $this->settings->get('settings::flash:meta_image', '/flash/meta-tags.png'), 'meta_favicon' => $this->settings->get('settings::flash:meta_favicon', '/branding/aether-mark.png'), 'meta_keywords' => $this->settings->get('settings::flash:meta_keywords', 'aetherpanel, game, panel'), 'search_indexing' => $this->settings->get('settings::flash:search_indexing', 'true')]);
    }
    public function store(FlashMetaRequest $request)
    {
        foreach ($request->normalize() as $key => $value) {
            $this->settings->set('settings::' . $key, $value);
        }

        $this->alert->success('Theme settings have been updated successfully.')->flash();
        return redirect()->route('admin.flash.meta');
    }
}
