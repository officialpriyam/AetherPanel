#!/usr/bin/env sh
set -eu

cd /var/www/backend

if [ ! -f config.php ] && [ -f config.example.php ]; then
    cp config.example.php config.php
    echo "[entrypoint] backend/config.php missing, copied from config.example.php"
fi

mkdir -p bootstrap/cache storage/framework/cache storage/framework/sessions storage/framework/views storage/logs
chown -R www-data:www-data storage bootstrap/cache

if [ "${PANEL_RUN_MIGRATIONS:-false}" = "true" ]; then
    echo "[entrypoint] Running database migrations..."
    php artisan migrate --force --no-interaction
fi

php artisan package:discover --ansi >/dev/null 2>&1 || true

if [ "${PANEL_CACHE_CONFIG:-true}" = "true" ]; then
    php artisan config:cache --no-interaction >/dev/null 2>&1 || php artisan config:clear --no-interaction >/dev/null 2>&1
fi

exec "$@"
