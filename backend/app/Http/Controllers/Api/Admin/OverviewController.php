<?php

namespace Pterodactyl\Http\Controllers\Api\Admin;

use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\ApiKey;
use Pterodactyl\Models\DatabaseHost;
use Pterodactyl\Models\Egg;
use Pterodactyl\Models\Location;
use Pterodactyl\Models\Mount;
use Pterodactyl\Models\Nest;
use Pterodactyl\Models\Node;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\User;
use Illuminate\Support\Facades\DB;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Services\Flash\ThemeVersionService;
use Pterodactyl\Services\Helpers\SoftwareVersionService;

class OverviewController extends Controller
{
    public function __construct(
        private SoftwareVersionService $softwareVersion,
        private ThemeVersionService $themeVersion,
    ) {
    }

    public function __invoke(): JsonResponse
    {
        $theme = rescue(fn () => $this->themeVersion->getStatus(), [
            'name' => (string) config('flash_theme.name', 'Flash Theme'),
            'repository' => (string) config('flash_theme.repository', ''),
            'current_version' => (string) config('flash_theme.version', '1.0.0'),
            'latest_version' => null,
            'latest_url' => (string) config('flash_theme.repository', ''),
            'published_at' => null,
            'has_update' => false,
            'checked' => false,
        ], false);

        $software = !config('pterodactyl.cdn.enabled') ? [
            'latest_panel' => null,
            'latest_wings' => null,
            'discord' => null,
            'donations' => null,
            'up_to_date' => true,
        ] : rescue(fn () => [
            'latest_panel' => $this->softwareVersion->getPanel(),
            'latest_wings' => $this->softwareVersion->getDaemon(),
            'discord' => $this->softwareVersion->getDiscord(),
            'donations' => $this->softwareVersion->getDonations(),
            'up_to_date' => $this->softwareVersion->isLatestPanel(),
        ], [
            'latest_panel' => null,
            'latest_wings' => null,
            'discord' => null,
            'donations' => null,
            'up_to_date' => true,
        ], false);

        return new JsonResponse([
            'data' => [
                'version' => view()->shared('appVersion'),
                'is_git' => view()->shared('appIsGit'),
                'theme' => $theme,
                'software' => $software,
                'stats' => [
                    'users' => User::query()->count(),
                    'servers' => Server::query()->count(),
                    'nodes' => Node::query()->count(),
                    'locations' => Location::query()->count(),
                    'nests' => Nest::query()->count(),
                    'eggs' => Egg::query()->count(),
                    'mounts' => Mount::query()->count(),
                    'database_hosts' => DatabaseHost::query()->count(),
                    'application_api_keys' => ApiKey::query()->where('key_type', ApiKey::TYPE_APPLICATION)->count(),
                    'tickets' => DB::table('tickets')->count(),
                ],
            ],
        ]);
    }
}
