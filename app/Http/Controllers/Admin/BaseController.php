<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\View\View;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Models\Egg;
use Pterodactyl\Models\Nest;
use Pterodactyl\Models\Node;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\User;
use Pterodactyl\Services\Flash\ThemeVersionService;
use Pterodactyl\Services\Helpers\SoftwareVersionService;

class BaseController extends Controller
{
    /**
     * BaseController constructor.
     */
    public function __construct(
        private SoftwareVersionService $version,
        private ThemeVersionService $themeVersion,
    )
    {
    }

    /**
     * Return the admin index view.
     */
    public function index(): View
    {
        return view('admin.index', [
            'version' => $this->version,
            'themeVersion' => $this->themeVersion->getStatus(),
            'stats' => [
                'servers' => Server::query()->count(),
                'users' => User::query()->count(),
                'nodes' => Node::query()->count(),
                'nests' => Nest::query()->count(),
                'eggs' => Egg::query()->count(),
            ],
        ]);
    }
}
