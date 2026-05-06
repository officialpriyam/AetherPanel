<?php

use Illuminate\Support\Str;
use Pterodactyl\Helpers\Time;

return [
    /*
    |--------------------------------------------------------------------------
    | Default Database Connection Name
    |--------------------------------------------------------------------------
    |
    | Here you may specify which of the database connections below you wish
    | to use as your default connection for database operations. This is
    | the connection which will be utilized unless another connection
    | is explicitly specified when you execute a query / statement.
    |
    */

    'default' => panel_runtime_config('DB_CONNECTION', 'mysql'),

    /*
    |--------------------------------------------------------------------------
    | Database Connections
    |--------------------------------------------------------------------------
    |
    | Here are each of the database connections setup for your application.
    | Of course, examples of configuring each database platform that is
    | supported by Laravel is shown below to make development simple.
    |
    |
    | All database work in Laravel is done through the PHP PDO facilities
    | so make sure you have the driver for your particular database of
    | choice installed on your machine before you begin development.
    |
    */

    'connections' => [
        'mysql' => [
            'driver' => 'mysql',
            'url' => panel_runtime_config('DB_URL', panel_runtime_config('DATABASE_URL')),
            'host' => panel_runtime_config('DB_HOST', '127.0.0.1'),
            'port' => panel_runtime_config('DB_PORT', '3306'),
            'database' => panel_runtime_config('DB_DATABASE', 'panel'),
            'username' => panel_runtime_config('DB_USERNAME', 'pterodactyl'),
            'password' => panel_runtime_config('DB_PASSWORD', ''),
            'unix_socket' => panel_runtime_config('DB_SOCKET', ''),
            'charset' => panel_runtime_config('DB_CHARSET', 'utf8mb4'),
            'collation' => panel_runtime_config('DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix' => panel_runtime_config('DB_PREFIX', ''),
            'prefix_indexes' => true,
            'strict' => panel_runtime_config('DB_STRICT_MODE', false), // TODO: true by default
            'engine' => null,
            'timezone' => panel_runtime_config('DB_TIMEZONE', Time::getMySQLTimezoneOffset(panel_runtime_config('APP_TIMEZONE', 'UTC'))),
            'sslmode' => panel_runtime_config('DB_SSLMODE', 'prefer'),
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                PDO::MYSQL_ATTR_SSL_CA => panel_runtime_config('MYSQL_ATTR_SSL_CA'),
                PDO::MYSQL_ATTR_SSL_CERT => panel_runtime_config('MYSQL_ATTR_SSL_CERT'),
                PDO::MYSQL_ATTR_SSL_KEY => panel_runtime_config('MYSQL_ATTR_SSL_KEY'),
                PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => panel_runtime_config('MYSQL_ATTR_SSL_VERIFY_SERVER_CERT', true),
            ]) : [],
        ],

        'mariadb' => [
            'driver' => 'mariadb',
            'url' => panel_runtime_config('DB_URL', panel_runtime_config('DATABASE_URL')),
            'host' => panel_runtime_config('DB_HOST', '127.0.0.1'),
            'port' => panel_runtime_config('DB_PORT', '3306'),
            'database' => panel_runtime_config('DB_DATABASE', 'panel'),
            'username' => panel_runtime_config('DB_USERNAME', 'pterodactyl'),
            'password' => panel_runtime_config('DB_PASSWORD', ''),
            'unix_socket' => panel_runtime_config('DB_SOCKET', ''),
            'charset' => panel_runtime_config('DB_CHARSET', 'utf8mb4'),
            'collation' => panel_runtime_config('DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix' => panel_runtime_config('DB_PREFIX', ''),
            'prefix_indexes' => true,
            'strict' => panel_runtime_config('DB_STRICT_MODE', true),
            'engine' => null,
            'timezone' => panel_runtime_config('DB_TIMEZONE', Time::getMySQLTimezoneOffset(panel_runtime_config('APP_TIMEZONE', 'UTC'))),
            'sslmode' => panel_runtime_config('DB_SSLMODE', 'prefer'),
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                PDO::MYSQL_ATTR_SSL_CA => panel_runtime_config('MYSQL_ATTR_SSL_CA'),
                PDO::MYSQL_ATTR_SSL_CERT => panel_runtime_config('MYSQL_ATTR_SSL_CERT'),
                PDO::MYSQL_ATTR_SSL_KEY => panel_runtime_config('MYSQL_ATTR_SSL_KEY'),
                PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => panel_runtime_config('MYSQL_ATTR_SSL_VERIFY_SERVER_CERT', true),
            ]) : [],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Migration Repository Table
    |--------------------------------------------------------------------------
    |
    | This table keeps track of all the migrations that have already run for
    | your application. Using this information, we can determine which of
    | the migrations on disk haven't actually been run on the database.
    |
    */

    'migrations' => [
        'table' => 'migrations',
        'update_date_on_publish' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Redis Databases
    |--------------------------------------------------------------------------
    |
    | Redis is an open source, fast, and advanced key-value store that also
    | provides a richer body of commands than a typical key-value system
    | such as Memcached. You may define your connection settings here.
    |
    */

    'redis' => [
        'client' => panel_runtime_config('REDIS_CLIENT', 'predis'),

        'options' => [
            'cluster' => panel_runtime_config('REDIS_CLUSTER', 'redis'),
            'prefix' => panel_runtime_config('REDIS_PREFIX', Str::slug(panel_runtime_config('APP_NAME', 'pterodactyl'), '_') . '_database_'),
        ],

        'default' => [
            'scheme' => panel_runtime_config('REDIS_SCHEME', 'tcp'),
            'path' => panel_runtime_config('REDIS_PATH', '/run/redis/redis.sock'),
            'host' => panel_runtime_config('REDIS_HOST', 'localhost'),
            'username' => panel_runtime_config('REDIS_USERNAME'),
            'password' => panel_runtime_config('REDIS_PASSWORD'),
            'port' => panel_runtime_config('REDIS_PORT', 6379),
            'database' => panel_runtime_config('REDIS_DATABASE', 0),
            'context' => extension_loaded('redis') && panel_runtime_config('REDIS_CLIENT') === 'phpredis' ? [
                'stream' => array_filter([
                    'verify_peer' => panel_runtime_config('REDIS_VERIFY_PEER', true),
                    'verify_peer_name' => panel_runtime_config('REDIS_VERIFY_PEER_NAME', true),
                    'cafile' => panel_runtime_config('REDIS_CAFILE'),
                    'local_cert' => panel_runtime_config('REDIS_LOCAL_CERT'),
                    'local_pk' => panel_runtime_config('REDIS_LOCAL_PK'),
                ]),
            ] : [],
        ],

        'sessions' => [
            'scheme' => panel_runtime_config('REDIS_SCHEME', 'tcp'),
            'path' => panel_runtime_config('REDIS_PATH', '/run/redis/redis.sock'),
            'host' => panel_runtime_config('REDIS_HOST', 'localhost'),
            'username' => panel_runtime_config('REDIS_USERNAME'),
            'password' => panel_runtime_config('REDIS_PASSWORD'),
            'port' => panel_runtime_config('REDIS_PORT', 6379),
            'database' => panel_runtime_config('REDIS_DATABASE_SESSIONS', 1),
            'context' => extension_loaded('redis') && panel_runtime_config('REDIS_CLIENT') === 'phpredis' ? [
                'stream' => array_filter([
                    'verify_peer' => panel_runtime_config('REDIS_VERIFY_PEER', true),
                    'verify_peer_name' => panel_runtime_config('REDIS_VERIFY_PEER_NAME', true),
                    'cafile' => panel_runtime_config('REDIS_CAFILE'),
                    'local_cert' => panel_runtime_config('REDIS_LOCAL_CERT'),
                    'local_pk' => panel_runtime_config('REDIS_LOCAL_PK'),
                ]),
            ] : [],
        ],
    ],
];
