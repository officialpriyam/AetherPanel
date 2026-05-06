<?php

namespace Pterodactyl\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Services\Frontend\SiteConfigurationService;

class BootstrapController extends Controller
{
    public function __construct(private SiteConfigurationService $siteConfiguration)
    {
    }

    public function __invoke(): JsonResponse
    {
        $configuration = $this->siteConfiguration->get();

        return new JsonResponse([
            'data' => [
                'siteConfiguration' => collect($configuration)->except('user')->toArray(),
                'user' => $configuration['user'],
            ],
        ]);
    }
}
