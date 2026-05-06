<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => panel_runtime_config('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => panel_runtime_config('AWS_ACCESS_KEY_ID'),
        'secret' => panel_runtime_config('AWS_SECRET_ACCESS_KEY'),
        'region' => panel_runtime_config('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => panel_runtime_config('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => panel_runtime_config('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => panel_runtime_config('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],
];
