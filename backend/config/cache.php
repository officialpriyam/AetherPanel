<?php

use Illuminate\Support\Str;

return [
    /*
    |--------------------------------------------------------------------------
    | Default Cache Store
    |--------------------------------------------------------------------------
    |
    | This option controls the default cache store that will be used by the
    | framework. This connection is utilized if another isn't explicitly
    | specified when running a cache operation inside the application.
    |
    */

    'default' => panel_runtime_config('CACHE_STORE', panel_runtime_config('CACHE_DRIVER', 'redis')),

    /*
    |--------------------------------------------------------------------------
    | Cache Stores
    |--------------------------------------------------------------------------
    |
    | Here you may define all of the cache "stores" for your application as
    | well as their drivers. You may even define multiple stores for the
    | same cache driver to group types of items stored in your caches.
    |
    | Supported drivers: "array", "database", "file", "memcached",
    |                    "redis", "octane", "null"
    |
    */

    'stores' => [
        'array' => [
            'driver' => 'array',
            'serialize' => false,
        ],

        'database' => [
            'driver' => 'database',
            'connection' => panel_runtime_config('DB_CACHE_CONNECTION'),
            'table' => panel_runtime_config('DB_CACHE_TABLE', 'cache'),
            'lock_connection' => panel_runtime_config('DB_CACHE_LOCK_CONNECTION'),
            'lock_table' => panel_runtime_config('DB_CACHE_LOCK_TABLE'),
        ],

        'file' => [
            'driver' => 'file',
            'path' => storage_path('framework/cache/data'),
            'lock_path' => storage_path('framework/cache/data'),
        ],

        'memcached' => [
            'driver' => 'memcached',
            'persistent_id' => panel_runtime_config('MEMCACHED_PERSISTENT_ID'),
            'sasl' => [
                panel_runtime_config('MEMCACHED_USERNAME'),
                panel_runtime_config('MEMCACHED_PASSWORD'),
            ],
            'options' => [
                // Memcached::OPT_CONNECT_TIMEOUT => 2000,
            ],
            'servers' => [
                [
                    'host' => panel_runtime_config('MEMCACHED_HOST', '127.0.0.1'),
                    'port' => panel_runtime_config('MEMCACHED_PORT', 11211),
                    'weight' => 100,
                ],
            ],
        ],

        'redis' => [
            'driver' => 'redis',
            'connection' => panel_runtime_config('REDIS_CACHE_CONNECTION', 'default'),
            'lock_connection' => panel_runtime_config('REDIS_CACHE_LOCK_CONNECTION', 'default'),
        ],

        'sessions' => [
            'driver' => panel_runtime_config('SESSION_DRIVER', 'database'),
            'table' => 'sessions',
            'connection' => panel_runtime_config('SESSION_DRIVER') === 'redis' ? 'sessions' : null,
        ],

        'octane' => [
            'driver' => 'octane',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache Key Prefix
    |--------------------------------------------------------------------------
    |
    | When utilizing the APC, database, memcached, Redis, or DynamoDB cache
    | stores there might be other applications using the same cache. For
    | that reason, you may prefix every cache key to avoid collisions.
    |
    */

    'prefix' => panel_runtime_config('CACHE_PREFIX', Str::slug(panel_runtime_config('APP_NAME', 'pterodactyl'), '_') . '_cache_'),
];
