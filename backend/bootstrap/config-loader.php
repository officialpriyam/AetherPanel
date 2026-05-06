<?php

if (!function_exists('panel_bootstrap_config')) {
    /**
     * Load runtime settings from PHP config files rather than a .env file.
     */
    function panel_bootstrap_config(string $basePath): array
    {
        $config = [];
        $defaultPath = $basePath . DIRECTORY_SEPARATOR . 'config.php';

        if (file_exists($defaultPath)) {
            $config = require $defaultPath;
        }

        foreach ($config as $key => $value) {
            panel_set_runtime_value($key, $value);
        }

        $GLOBALS['panel_runtime_config'] = $config;

        return $config;
    }
}

if (!function_exists('panel_runtime_config')) {
    function panel_runtime_config(?string $key = null, mixed $default = null): mixed
    {
        $config = $GLOBALS['panel_runtime_config'] ?? [];

        if ($key === null) {
            return $config;
        }

        return $config[$key] ?? $default;
    }
}

if (!function_exists('panel_frontend_url')) {
    function panel_frontend_url(string $path = ''): string
    {
        $base = rtrim((string) panel_runtime_config('PANEL_FRONTEND_URL', panel_runtime_config('APP_URL', '')), '/');
        $path = ltrim($path, '/');

        return $path === '' ? $base : sprintf('%s/%s', $base, $path);
    }
}

if (!function_exists('panel_set_runtime_value')) {
    function panel_set_runtime_value(string $key, mixed $value): void
    {
        if ($value === null) {
            return;
        }

        if (is_bool($value)) {
            $stringValue = $value ? 'true' : 'false';
        } elseif (is_array($value)) {
            $stringValue = implode(',', array_map(static fn ($item) => (string) $item, $value));
        } else {
            $stringValue = (string) $value;
        }

        $_ENV[$key] = $stringValue;
        $_SERVER[$key] = $stringValue;
        putenv(sprintf('%s=%s', $key, $stringValue));
    }
}
