FROM composer:2 AS vendor

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --optimize-autoloader \
    --no-scripts \
    --ignore-platform-reqs

FROM php:8.3-fpm-alpine

WORKDIR /var/www/backend

RUN apk add --no-cache \
    bash \
    curl \
    icu-dev \
    libpng-dev \
    libzip-dev \
    nginx \
    oniguruma-dev \
    supervisor \
    && docker-php-ext-configure zip \
    && docker-php-ext-install bcmath intl opcache pdo_mysql zip

COPY --from=vendor /app/vendor ./vendor
COPY . ./

COPY docker/php.ini /usr/local/etc/php/conf.d/zz-production.ini
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint

RUN chmod +x /usr/local/bin/docker-entrypoint \
    && mkdir -p /var/log/supervisor \
    && mkdir -p bootstrap/cache storage/framework/cache storage/framework/sessions storage/framework/views storage/logs \
    && chown -R www-data:www-data /var/www/backend/storage /var/www/backend/bootstrap/cache

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -fsS http://127.0.0.1:8080/api/health || exit 1

ENTRYPOINT ["docker-entrypoint"]
CMD ["supervisord", "-n", "-c", "/etc/supervisord.conf"]
