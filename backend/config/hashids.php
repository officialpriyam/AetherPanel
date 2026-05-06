<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Hashids Configuration
    |--------------------------------------------------------------------------
    |
    | Here are the settings that control the Hashids setup and usage in the panel.
    |
    */
    'salt' => panel_runtime_config('HASHIDS_SALT'),
    'length' => panel_runtime_config('HASHIDS_LENGTH', 8),
    'alphabet' => panel_runtime_config('HASHIDS_ALPHABET', 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'),
];
