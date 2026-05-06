<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Restricted Environment
    |--------------------------------------------------------------------------
    |
    | Set this environment variable to true to enable a restricted configuration
    | setup on the panel. When set to true, configurations stored in the
    | database will not be applied.
    */

    'load_environment_only' => (bool) panel_runtime_config('APP_ENVIRONMENT_ONLY', false),

    /*
    |--------------------------------------------------------------------------
    | Service Author
    |--------------------------------------------------------------------------
    |
    | Each panel installation is assigned a unique UUID to identify the
    | author of custom services, and make upgrades easier by identifying
    | standard Pterodactyl shipped services.
    */

    'service' => [
        'author' => panel_runtime_config('APP_SERVICE_AUTHOR', 'unknown@unknown.com'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    |
    | Should login success and failure events trigger an email to the user?
    */

    'auth' => [
        '2fa_required' => panel_runtime_config('APP_2FA_REQUIRED', 0),
        '2fa' => [
            'bytes' => 32,
            'window' => panel_runtime_config('APP_2FA_WINDOW', 4),
            'verify_newer' => true,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    |
    | Certain pagination result counts can be configured here and will take
    | effect globally.
    */

    'paginate' => [
        'frontend' => [
            'servers' => panel_runtime_config('APP_PAGINATE_FRONT_SERVERS', 15),
        ],
        'admin' => [
            'servers' => panel_runtime_config('APP_PAGINATE_ADMIN_SERVERS', 25),
            'users' => panel_runtime_config('APP_PAGINATE_ADMIN_USERS', 25),
        ],
        'api' => [
            'nodes' => panel_runtime_config('APP_PAGINATE_API_NODES', 25),
            'servers' => panel_runtime_config('APP_PAGINATE_API_SERVERS', 25),
            'users' => panel_runtime_config('APP_PAGINATE_API_USERS', 25),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Guzzle Connections
    |--------------------------------------------------------------------------
    |
    | Configure the timeout to be used for Guzzle connections here.
    */

    'guzzle' => [
        'timeout' => panel_runtime_config('GUZZLE_TIMEOUT', 15),
        'connect_timeout' => panel_runtime_config('GUZZLE_CONNECT_TIMEOUT', 5),
    ],

    /*
    |--------------------------------------------------------------------------
    | CDN
    |--------------------------------------------------------------------------
    |
    | Information for the panel to use when contacting the CDN to confirm
    | if panel is up to date.
    */

    'cdn' => [
        'enabled' => (bool) panel_runtime_config('PTERODACTYL_CDN_ENABLED', panel_runtime_config('APP_ENV', 'production') !== 'local'),
        'cache_time' => (int) panel_runtime_config('PTERODACTYL_CDN_CACHE_TIME', 60),
        'url' => panel_runtime_config('PTERODACTYL_CDN_URL', 'https://cdn.pterodactyl.io/releases/latest.json'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Client Features
    |--------------------------------------------------------------------------
    |
    | Allow clients to create their own databases.
    */

    'client_features' => [
        'databases' => [
            'enabled' => panel_runtime_config('PTERODACTYL_CLIENT_DATABASES_ENABLED', true),
            'allow_random' => panel_runtime_config('PTERODACTYL_CLIENT_DATABASES_ALLOW_RANDOM', true),
        ],

        'schedules' => [
            // The total number of tasks that can exist for any given schedule at once.
            'per_schedule_task_limit' => panel_runtime_config('PTERODACTYL_PER_SCHEDULE_TASK_LIMIT', 10),
        ],

        'allocations' => [
            'enabled' => panel_runtime_config('PTERODACTYL_CLIENT_ALLOCATIONS_ENABLED', false),
            'range_start' => panel_runtime_config('PTERODACTYL_CLIENT_ALLOCATIONS_RANGE_START'),
            'range_end' => panel_runtime_config('PTERODACTYL_CLIENT_ALLOCATIONS_RANGE_END'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | File Editor
    |--------------------------------------------------------------------------
    |
    | This array includes the MIME filetypes that can be edited via the web.
    */

    'files' => [
        'max_edit_size' => panel_runtime_config('PTERODACTYL_FILES_MAX_EDIT_SIZE', 1024 * 1024 * 4),
    ],

    /*
    |--------------------------------------------------------------------------
    | Dynamic Environment Variables
    |--------------------------------------------------------------------------
    |
    | Place dynamic environment variables here that should be auto-appended
    | to server environment fields when the server is created or updated.
    |
    | Items should be in 'key' => 'value' format, where key is the environment
    | variable name, and value is the server-object key. For example:
    |
    | 'P_SERVER_CREATED_AT' => 'created_at'
    */

    'environment_variables' => [
        'P_SERVER_ALLOCATION_LIMIT' => 'allocation_limit',
    ],

    /*
    |--------------------------------------------------------------------------
    | Asset Verification
    |--------------------------------------------------------------------------
    |
    | This section controls the output format for JS & CSS assets.
    */

    'assets' => [
        'use_hash' => panel_runtime_config('PTERODACTYL_USE_ASSET_HASH', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Email Notification Settings
    |--------------------------------------------------------------------------
    |
    | This section controls what notifications are sent to users.
    */

    'email' => [
        // Should an email be sent to a server owner once their server has completed it's first install process?
        'send_install_notification' => panel_runtime_config('PTERODACTYL_SEND_INSTALL_NOTIFICATION', true),
        // Should an email be sent to a server owner whenever their server is reinstalled?
        'send_reinstall_notification' => panel_runtime_config('PTERODACTYL_SEND_REINSTALL_NOTIFICATION', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Telemetry Settings
    |--------------------------------------------------------------------------
    |
    | This section controls the telemetry sent by Pterodactyl.
    */

    'telemetry' => [
        'enabled' => panel_runtime_config('PTERODACTYL_TELEMETRY_ENABLED', true),
    ],

    'features' => [
        'new_server_identifiers' => (bool) panel_runtime_config('PTERODACTYL_USE_SERVER_IDENTIFIERS', false),
    ],
];
