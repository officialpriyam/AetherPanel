<?php

namespace Pterodactyl\Http\Controllers\Api\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Services\Frontend\SiteConfigurationService;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class FlashSettingsController extends Controller
{
    public function __construct(
        private SettingsRepositoryInterface $settings,
        private SiteConfigurationService $siteConfiguration,
    ) {
    }

    public function index(): JsonResponse
    {
        return new JsonResponse([
            'data' => $this->siteConfiguration->get()['flash'],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $values = $request->input('settings', []);

        foreach ($values as $key => $value) {
            if (!str_starts_with((string) $key, 'settings::flash:')) {
                $key = 'settings::flash:' . $key;
            }

            $this->settings->set($key, $this->serializeSettingValue($value));
        }

        return new JsonResponse([
            'data' => $this->siteConfiguration->get()['flash'],
        ]);
    }

    private function serializeSettingValue(mixed $value): string
    {
        if (is_bool($value)) {
            return $value ? 'true' : 'false';
        }

        if ($value === null) {
            return '';
        }

        if (is_scalar($value)) {
            return (string) $value;
        }

        return json_encode($value) ?: '';
    }
}
