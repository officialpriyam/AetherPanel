<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Module System
    |--------------------------------------------------------------------------
    |
    | Modules are installed into the base "modules" directory. Each module owns
    | its own folder and declares metadata in a module.php manifest.
    |
    */

    'enabled' => in_array(strtolower((string) panel_runtime_config('MODULES_ENABLED', 'true')), [
        '1',
        'true',
        'yes',
        'on',
    ], true),

    'path' => base_path('modules'),

    /*
     * Optional API tokens keyed by module id. A module can also define an
     * "api_key" in its module.php manifest.
     */
    'tokens' => is_array(panel_runtime_config('MODULE_API_KEYS'))
        ? panel_runtime_config('MODULE_API_KEYS')
        : [],

    'rate_limit' => (int) panel_runtime_config('MODULE_API_RATE_LIMIT', 120),
];
