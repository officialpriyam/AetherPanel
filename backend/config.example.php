<?php

return [
    'APP_ENV' => 'local',
    'APP_DEBUG' => true,
    'APP_URL' => 'http://localhost:8080',
    'PANEL_FRONTEND_URL' => 'http://localhost:3000',
    'APP_KEY' => 'base64:generate-a-real-key-here',
    'FRONTEND_API_KEY' => 'generate-a-frontend-access-key-here',
    'APP_CORS_ALLOWED_ORIGINS' => [
        'http://localhost:3000',
    ],
    'PTERODACTYL_CDN_ENABLED' => false,
    'PTERODACTYL_CDN_CACHE_TIME' => 60,
    'GUZZLE_TIMEOUT' => 5,
    'GUZZLE_CONNECT_TIMEOUT' => 2,
    'FLASH_THEME_VERSION_CHECK_ENABLED' => false,
    'FLASH_THEME_HTTP_TIMEOUT' => 3,
    'FLASH_THEME_CONNECT_TIMEOUT' => 2,
    'SESSION_DOMAIN' => null,
    'SANCTUM_STATEFUL_DOMAINS' => [
        'localhost:3000',
        'localhost:8080',
    ],
    'DB_HOST' => '127.0.0.1',
    'DB_PORT' => '3306',
    'DB_DATABASE' => 'panel',
    'DB_USERNAME' => 'aetherpanel',
    'DB_PASSWORD' => 'change-me',
    'REDIS_HOST' => '127.0.0.1',
    'REDIS_PORT' => '6379',
    'MAIL_HOST' => '127.0.0.1',
    'MAIL_PORT' => '1025',
    'RECAPTCHA_SECRET_KEY' => '',
    'RECAPTCHA_WEBSITE_KEY' => '',
    'MCVAPI_URL' => 'https://versions.mcjars.app',
    'MCVAPI_KEY' => '',
];

