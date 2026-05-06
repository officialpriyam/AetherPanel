<?php

return [
    'version' => panel_runtime_config('FLASH_THEME_VERSION', '1.0.0'),
    'name' => panel_runtime_config('FLASH_THEME_NAME', 'Flash Ptero Theme'),
    'repository' => panel_runtime_config('FLASH_THEME_REPOSITORY', 'https://github.com/officialpriyam/Flash-Ptero-Theme'),
    'api_release_url' => panel_runtime_config('FLASH_THEME_RELEASE_API', 'https://api.github.com/repos/officialpriyam/Flash-Ptero-Theme/releases/latest'),
    'api_tags_url' => panel_runtime_config('FLASH_THEME_TAGS_API', 'https://api.github.com/repos/officialpriyam/Flash-Ptero-Theme/tags'),
    'cache_key' => panel_runtime_config('FLASH_THEME_CACHE_KEY', 'flash-theme:release-data'),
    'cache_minutes' => (int) panel_runtime_config('FLASH_THEME_CACHE_MINUTES', 30),
    'version_check_enabled' => (bool) panel_runtime_config('FLASH_THEME_VERSION_CHECK_ENABLED', panel_runtime_config('APP_ENV', 'production') !== 'local'),
    'http_timeout' => (int) panel_runtime_config('FLASH_THEME_HTTP_TIMEOUT', 3),
    'connect_timeout' => (int) panel_runtime_config('FLASH_THEME_CONNECT_TIMEOUT', 2),
];
