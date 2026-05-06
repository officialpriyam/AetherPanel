<?php

namespace Pterodactyl\Http\Controllers\Api\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Services\Config\RuntimeConfigWriterService;

class RuntimeConfigController extends Controller
{
    private const ALLOWED_KEYS = [
        'APP_NAME',
        'APP_ENV',
        'APP_DEBUG',
        'APP_URL',
        'PANEL_FRONTEND_URL',
        'APP_TIMEZONE',
        'APP_LOCALE',
        'APP_FALLBACK_LOCALE',
        'APP_SERVICE_AUTHOR',
        'APP_CORS_ALLOWED_ORIGINS',
        'SESSION_COOKIE',
        'SESSION_DOMAIN',
        'SESSION_SECURE_COOKIE',
        'SESSION_SAME_SITE',
        'SANCTUM_STATEFUL_DOMAINS',
        'MAIL_MAILER',
        'MAIL_HOST',
        'MAIL_PORT',
        'MAIL_USERNAME',
        'MAIL_PASSWORD',
        'MAIL_ENCRYPTION',
        'MAIL_FROM_ADDRESS',
        'MAIL_FROM_NAME',
        'RECAPTCHA_ENABLED',
        'RECAPTCHA_SECRET_KEY',
        'RECAPTCHA_WEBSITE_KEY',
        'FLASH_THEME_NAME',
        'FLASH_THEME_VERSION',
        'FLASH_THEME_REPOSITORY',
        'MCVAPI_URL',
        'MCVAPI_KEY',
    ];

    public function __construct(private RuntimeConfigWriterService $writer)
    {
    }

    public function index(): JsonResponse
    {
        $data = [];
        foreach (self::ALLOWED_KEYS as $key) {
            $data[$key] = panel_runtime_config($key);
        }

        return new JsonResponse(['data' => $data]);
    }

    public function update(Request $request): JsonResponse
    {
        $values = array_intersect_key($request->all(), array_flip(self::ALLOWED_KEYS));
        $this->writer->write($values);

        return new JsonResponse(['data' => $values]);
    }
}
