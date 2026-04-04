<?php

return [
    'version' => env('FLASH_THEME_VERSION', '1.0.0'),
    'name' => env('FLASH_THEME_NAME', 'Flash Ptero Theme'),
    'repository' => env('FLASH_THEME_REPOSITORY', 'https://github.com/officialpriyam/Flash-Ptero-Theme'),
    'api_release_url' => env('FLASH_THEME_RELEASE_API', 'https://api.github.com/repos/officialpriyam/Flash-Ptero-Theme/releases/latest'),
    'api_tags_url' => env('FLASH_THEME_TAGS_API', 'https://api.github.com/repos/officialpriyam/Flash-Ptero-Theme/tags'),
    'cache_key' => env('FLASH_THEME_CACHE_KEY', 'flash-theme:release-data'),
    'cache_minutes' => (int) env('FLASH_THEME_CACHE_MINUTES', 30),
];
