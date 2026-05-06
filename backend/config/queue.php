<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default Queue Connection Name
    |--------------------------------------------------------------------------
    |
    | Laravel's queue supports a variety of backends via a single, unified
    | API, giving you convenient access to each backend using identical
    | syntax for each. The default queue connection is defined below.
    |
    */

    'default' => panel_runtime_config('QUEUE_CONNECTION', panel_runtime_config('QUEUE_DRIVER', 'redis')),

    /*
    |--------------------------------------------------------------------------
    | Queue Connections
    |--------------------------------------------------------------------------
    |
    | Here you may configure the connection options for every queue backend
    | used by your application. An example configuration is provided for
    | each backend supported by Laravel. You're also free to add more.
    |
    | Drivers: "sync", "database", "beanstalkd", "sqs", "redis", "null"
    |
    */

    'connections' => [
        'sync' => [
            'driver' => 'sync',
        ],

        'database' => [
            'driver' => 'database',
            'connection' => panel_runtime_config('DB_QUEUE_CONNECTION'),
            'table' => panel_runtime_config('DB_QUEUE_TABLE', 'jobs'),
            'queue' => panel_runtime_config('DB_QUEUE', 'standard'),
            'retry_after' => (int) panel_runtime_config('DB_QUEUE_RETRY_AFTER', 90),
            'after_commit' => false,
        ],

        'beanstalkd' => [
            'driver' => 'beanstalkd',
            'host' => panel_runtime_config('BEANSTALKD_QUEUE_HOST', 'localhost'),
            'queue' => panel_runtime_config('BEANSTALKD_QUEUE', 'default'),
            'retry_after' => (int) panel_runtime_config('BEANSTALKD_QUEUE_RETRY_AFTER', 90),
            'block_for' => 0,
            'after_commit' => false,
        ],

        'sqs' => [
            'driver' => 'sqs',
            'key' => panel_runtime_config('AWS_ACCESS_KEY_ID'),
            'secret' => panel_runtime_config('AWS_SECRET_ACCESS_KEY'),
            'prefix' => panel_runtime_config('SQS_PREFIX', 'https://sqs.us-east-1.amazonaws.com/your-account-id'),
            'queue' => panel_runtime_config('SQS_QUEUE', 'default'),
            'suffix' => panel_runtime_config('SQS_SUFFIX'),
            'region' => panel_runtime_config('AWS_DEFAULT_REGION', 'us-east-1'),
            'after_commit' => false,
        ],

        'redis' => [
            'driver' => 'redis',
            'connection' => panel_runtime_config('REDIS_QUEUE_CONNECTION', 'default'),
            'queue' => panel_runtime_config('REDIS_QUEUE', panel_runtime_config('QUEUE_STANDARD', 'standard')),
            'retry_after' => (int) panel_runtime_config('REDIS_QUEUE_RETRY_AFTER', 90),
            'block_for' => null,
            'after_commit' => false,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Failed Queue Jobs
    |--------------------------------------------------------------------------
    |
    | These options configure the behavior of failed queue job logging so you
    | can control how and where failed jobs are stored. Laravel ships with
    | support for storing failed jobs in a simple file or in a database.
    |
    | Supported drivers: "database-uuids", "dynamodb", "file", "null"
    |
    */

    'failed' => [
        'driver' => panel_runtime_config('QUEUE_FAILED_DRIVER', 'database-uuids'),
        'database' => panel_runtime_config('DB_CONNECTION', 'mysql'),
        'table' => 'failed_jobs',
    ],
];
