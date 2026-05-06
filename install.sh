#!/usr/bin/env bash
set -Eeuo pipefail

APP_USER="aetherpanel"
APP_GROUP="www-data"
SERVICE_PREFIX="aetherpanel"
DEFAULT_INSTALL_ROOT="/var/www/aetherpanel"
DEFAULT_FRONTEND_PORT="3000"
PHP_VERSION="${PHP_VERSION:-8.3}"
SOURCE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_SOURCE="${SOURCE_ROOT}/backend"
FRONTEND_SOURCE="${SOURCE_ROOT}/frontend"

INSTALL_ROOT=""
BACKEND_DIR=""
FRONTEND_DIR=""
PANEL_HOST=""
PANEL_URL=""
ENABLE_SSL="false"
CERTBOT_EMAIL=""
APP_NAME="AetherPanel"
APP_TIMEZONE="UTC"
SERVICE_AUTHOR_EMAIL=""
FRONTEND_PORT="${DEFAULT_FRONTEND_PORT}"
USE_REDIS="true"
ENABLE_TELEMETRY="false"
ENABLE_RECAPTCHA="false"
RECAPTCHA_SITE_KEY=""
RECAPTCHA_SECRET_KEY=""
CONFIGURE_SMTP="false"
MAIL_HOST="127.0.0.1"
MAIL_PORT="587"
MAIL_USERNAME=""
MAIL_PASSWORD=""
MAIL_ENCRYPTION="tls"
MAIL_FROM_ADDRESS=""
MAIL_FROM_NAME=""
DB_HOST="127.0.0.1"
DB_PORT="3306"
DB_NAME="aetherpanel"
DB_USER="aetherpanel"
DB_PASSWORD=""
DB_GRANT_HOST="127.0.0.1"
AUTO_CREATE_DATABASE="true"
ADMIN_EMAIL=""
ADMIN_USERNAME="admin"
ADMIN_FIRST_NAME="Admin"
ADMIN_LAST_NAME="User"
ADMIN_PASSWORD=""
APP_KEY=""
FRONTEND_API_KEY=""
SANCTUM_STATEFUL_DOMAIN=""
BACKEND_CONFIG_PATH=""
FRONTEND_ENV_PATH=""
NGINX_SITE_PATH=""
MYSQL_ADMIN_USER="root"
MYSQL_ADMIN_PASSWORD=""
MYSQL_ADMIN_AUTH_MODE="socket"
PHP_PERF_INI_PATH=""
PHP_FPM_POOL_OVERRIDE_PATH=""

log() {
    printf '[%s] %s\n' "$(date '+%H:%M:%S')" "$*"
}

warn() {
    printf '[%s] WARNING: %s\n' "$(date '+%H:%M:%S')" "$*" >&2
}

fail() {
    printf '[%s] ERROR: %s\n' "$(date '+%H:%M:%S')" "$*" >&2
    exit 1
}

on_error() {
    fail "Installer failed on line ${1}."
}

trap 'on_error $LINENO' ERR

require_root() {
    if [[ "${EUID}" -ne 0 ]]; then
        fail "Run this installer as root."
    fi
}

require_repo_layout() {
    [[ -f "${BACKEND_SOURCE}/composer.json" ]] || fail "Cannot find backend/composer.json."
    [[ -f "${FRONTEND_SOURCE}/package.json" ]] || fail "Cannot find frontend/package.json."
}

ensure_ubuntu() {
    [[ -f /etc/os-release ]] || fail "Cannot determine the operating system."
    # shellcheck disable=SC1091
    source /etc/os-release

    if [[ "${ID:-}" != "ubuntu" ]]; then
        fail "This installer currently targets Ubuntu 22.04/24.04."
    fi
}

prompt() {
    local var_name="$1"
    local label="$2"
    local default_value="${3:-}"
    local answer=""

    if [[ -n "${default_value}" ]]; then
        read -r -p "${label} [${default_value}]: " answer
        printf -v "${var_name}" '%s' "${answer:-${default_value}}"
    else
        read -r -p "${label}: " answer
        printf -v "${var_name}" '%s' "${answer}"
    fi
}

prompt_secret() {
    local var_name="$1"
    local label="$2"
    local answer=""

    read -r -s -p "${label}: " answer
    echo
    printf -v "${var_name}" '%s' "${answer}"
}

prompt_secret_confirmed() {
    local var_name="$1"
    local label="$2"
    local first=""
    local second=""

    while true; do
        prompt_secret first "${label}"
        [[ -n "${first}" ]] || {
            warn "This value cannot be empty."
            continue
        }
        prompt_secret second "Confirm ${label,,}"
        [[ "${first}" == "${second}" ]] && break
        warn "The values did not match. Try again."
    done

    printf -v "${var_name}" '%s' "${first}"
}

confirm() {
    local label="$1"
    local default_value="${2:-Y}"
    local answer=""
    local normalized_default="${default_value^^}"

    while true; do
        read -r -p "${label} [${normalized_default}/$([[ "${normalized_default}" == "Y" ]] && echo N || echo Y)]: " answer
        answer="${answer:-${normalized_default}}"
        case "${answer,,}" in
            y|yes) return 0 ;;
            n|no) return 1 ;;
            *) warn "Please answer yes or no." ;;
        esac
    done
}

require_non_empty() {
    local label="$1"
    local value="$2"
    [[ -n "${value}" ]] || fail "${label} cannot be empty."
}

normalize_host() {
    local value="$1"
    value="${value#http://}"
    value="${value#https://}"
    value="${value%%/*}"
    printf '%s' "${value}"
}

is_ipv4() {
    local value="$1"
    [[ "${value}" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]
}

slugify_cookie_name() {
    printf '%s' "${1,,}" | tr -cs 'a-z0-9' '_' | sed 's/^_//;s/_$//'
}

require_mysql_identifier() {
    local label="$1"
    local value="$2"
    [[ "${value}" =~ ^[A-Za-z0-9_]+$ ]] || fail "${label} must contain only letters, numbers, and underscores."
}

require_port() {
    local label="$1"
    local value="$2"
    [[ "${value}" =~ ^[0-9]{1,5}$ ]] || fail "${label} must be a numeric port."
}

require_mysql_grant_host() {
    local value="$1"
    [[ "${value}" =~ ^[A-Za-z0-9.%:_-]+$ ]] || fail "Grant database user access from host contains invalid characters."
}

run_as_app() {
    local command="$1"
    runuser -u "${APP_USER}" -- bash -lc "${command}"
}

install_php_repository() {
    if ! grep -Rqs "ondrej/php" /etc/apt/sources.list /etc/apt/sources.list.d 2>/dev/null; then
        add-apt-repository -y ppa:ondrej/php
    fi
}

install_node_repository() {
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
}

install_composer() {
    if command -v composer >/dev/null 2>&1; then
        return
    fi

    php -r "copy('https://getcomposer.org/installer', '/tmp/composer-setup.php');"
    php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer
    rm -f /tmp/composer-setup.php
}

install_system_packages() {
    log "Installing system packages."
    export DEBIAN_FRONTEND=noninteractive

    apt-get update
    apt-get install -y software-properties-common ca-certificates curl gnupg lsb-release unzip git rsync nginx mariadb-server certbot python3-certbot-nginx redis-server build-essential

    install_php_repository
    apt-get update
    apt-get install -y \
        "php${PHP_VERSION}" \
        "php${PHP_VERSION}-cli" \
        "php${PHP_VERSION}-common" \
        "php${PHP_VERSION}-fpm" \
        "php${PHP_VERSION}-opcache" \
        "php${PHP_VERSION}-mysql" \
        "php${PHP_VERSION}-mbstring" \
        "php${PHP_VERSION}-xml" \
        "php${PHP_VERSION}-curl" \
        "php${PHP_VERSION}-zip" \
        "php${PHP_VERSION}-bcmath" \
        "php${PHP_VERSION}-intl" \
        "php${PHP_VERSION}-gd" \
        "php${PHP_VERSION}-redis"

    install_node_repository
    apt-get install -y nodejs

    install_composer
    corepack enable
}

collect_install_configuration() {
    echo
    log "Collecting installation settings."

    prompt INSTALL_ROOT "Install directory" "${DEFAULT_INSTALL_ROOT}"
    prompt PANEL_HOST "Public panel host (example: panel.example.com)" "panel.example.com"
    PANEL_HOST="$(normalize_host "${PANEL_HOST}")"
    require_non_empty "Public panel host" "${PANEL_HOST}"

    if is_ipv4 "${PANEL_HOST}"; then
        warn "The panel host looks like an IP address. Certbot cannot issue certificates for raw IPs."
        ENABLE_SSL="false"
    elif confirm "Enable HTTPS with Certbot?" "Y"; then
        ENABLE_SSL="true"
        prompt CERTBOT_EMAIL "Certbot email address"
        require_non_empty "Certbot email address" "${CERTBOT_EMAIL}"
    else
        ENABLE_SSL="false"
    fi

    PANEL_URL="$([[ "${ENABLE_SSL}" == "true" ]] && echo "https" || echo "http")://${PANEL_HOST}"

    prompt APP_NAME "Panel name" "${APP_NAME}"
    prompt APP_TIMEZONE "Panel timezone" "${APP_TIMEZONE}"
    prompt FRONTEND_PORT "Internal frontend port" "${FRONTEND_PORT}"
    require_port "Internal frontend port" "${FRONTEND_PORT}"
    prompt SERVICE_AUTHOR_EMAIL "Service author email" "${SERVICE_AUTHOR_EMAIL:-admin@${PANEL_HOST}}"
    require_non_empty "Service author email" "${SERVICE_AUTHOR_EMAIL}"

    if confirm "Use Redis for cache, sessions, and queues?" "Y"; then
        USE_REDIS="true"
    else
        USE_REDIS="false"
    fi

    if confirm "Enable anonymous telemetry?" "N"; then
        ENABLE_TELEMETRY="true"
    else
        ENABLE_TELEMETRY="false"
    fi

    if confirm "Configure reCAPTCHA now?" "N"; then
        ENABLE_RECAPTCHA="true"
        prompt RECAPTCHA_SITE_KEY "reCAPTCHA site key"
        prompt RECAPTCHA_SECRET_KEY "reCAPTCHA secret key"
        require_non_empty "reCAPTCHA site key" "${RECAPTCHA_SITE_KEY}"
        require_non_empty "reCAPTCHA secret key" "${RECAPTCHA_SECRET_KEY}"
    fi

    if confirm "Configure SMTP mail now?" "N"; then
        CONFIGURE_SMTP="true"
        prompt MAIL_HOST "SMTP host" "${MAIL_HOST}"
        prompt MAIL_PORT "SMTP port" "${MAIL_PORT}"
        prompt MAIL_USERNAME "SMTP username"
        prompt_secret MAIL_PASSWORD "SMTP password"
        prompt MAIL_ENCRYPTION "SMTP encryption (tls, ssl, or empty)" "${MAIL_ENCRYPTION}"
        prompt MAIL_FROM_ADDRESS "Mail from address" "${SERVICE_AUTHOR_EMAIL}"
        require_non_empty "Mail from address" "${MAIL_FROM_ADDRESS}"
    else
        MAIL_FROM_ADDRESS="${SERVICE_AUTHOR_EMAIL}"
        MAIL_ENCRYPTION=""
    fi
    MAIL_FROM_NAME="${APP_NAME}"

    prompt DB_HOST "Database host" "${DB_HOST}"
    prompt DB_PORT "Database port" "${DB_PORT}"
    require_port "Database port" "${DB_PORT}"
    prompt DB_NAME "Database name" "${DB_NAME}"
    require_mysql_identifier "Database name" "${DB_NAME}"
    prompt DB_USER "Database username" "${DB_USER}"
    require_mysql_identifier "Database username" "${DB_USER}"
    prompt_secret_confirmed DB_PASSWORD "Database password"

    if [[ "${DB_HOST}" == "127.0.0.1" || "${DB_HOST}" == "localhost" ]]; then
        if confirm "Create the MySQL/MariaDB database and user automatically?" "Y"; then
            AUTO_CREATE_DATABASE="true"
            prompt DB_GRANT_HOST "Grant database user access from host" "${DB_GRANT_HOST}"
            require_non_empty "Grant database user access from host" "${DB_GRANT_HOST}"
            require_mysql_grant_host "${DB_GRANT_HOST}"
        else
            AUTO_CREATE_DATABASE="false"
        fi
    else
        AUTO_CREATE_DATABASE="false"
    fi

    prompt ADMIN_EMAIL "Admin user email" "admin@${PANEL_HOST}"
    prompt ADMIN_USERNAME "Admin username" "${ADMIN_USERNAME}"
    prompt ADMIN_FIRST_NAME "Admin first name" "${ADMIN_FIRST_NAME}"
    prompt ADMIN_LAST_NAME "Admin last name" "${ADMIN_LAST_NAME}"
    require_non_empty "Admin user email" "${ADMIN_EMAIL}"
    require_non_empty "Admin username" "${ADMIN_USERNAME}"
    require_non_empty "Admin first name" "${ADMIN_FIRST_NAME}"
    require_non_empty "Admin last name" "${ADMIN_LAST_NAME}"
    prompt_secret_confirmed ADMIN_PASSWORD "Admin password"
}

prepare_app_user() {
    if ! id -u "${APP_USER}" >/dev/null 2>&1; then
        useradd --system --create-home --home-dir "/home/${APP_USER}" --shell /bin/bash "${APP_USER}"
    fi

    usermod -a -G "${APP_GROUP}" "${APP_USER}" || true
}

prepare_install_tree() {
    INSTALL_ROOT="$(realpath -m "${INSTALL_ROOT}")"
    BACKEND_DIR="${INSTALL_ROOT}/backend"
    FRONTEND_DIR="${INSTALL_ROOT}/frontend"
    BACKEND_CONFIG_PATH="${BACKEND_DIR}/config.php"
    FRONTEND_ENV_PATH="${FRONTEND_DIR}/.env.production"
    NGINX_SITE_PATH="/etc/nginx/sites-available/${SERVICE_PREFIX}.conf"
    PHP_PERF_INI_PATH="/etc/php/${PHP_VERSION}/fpm/conf.d/99-${SERVICE_PREFIX}-performance.ini"
    PHP_FPM_POOL_OVERRIDE_PATH="/etc/php/${PHP_VERSION}/fpm/pool.d/99-${SERVICE_PREFIX}-performance.conf"

    mkdir -p "${INSTALL_ROOT}" "${BACKEND_DIR}" "${FRONTEND_DIR}"

    log "Copying backend source to ${BACKEND_DIR}."
    rsync -a \
        --exclude '.git' \
        --exclude 'vendor' \
        --exclude 'node_modules' \
        --exclude '.env' \
        "${BACKEND_SOURCE}/" "${BACKEND_DIR}/"

    log "Copying frontend source to ${FRONTEND_DIR}."
    rsync -a \
        --exclude '.git' \
        --exclude 'node_modules' \
        --exclude '.next' \
        --exclude '.env' \
        "${FRONTEND_SOURCE}/" "${FRONTEND_DIR}/"

    chown -R "${APP_USER}:${APP_GROUP}" "${INSTALL_ROOT}"
    find "${INSTALL_ROOT}" -type d -exec chmod 755 {} +
    find "${INSTALL_ROOT}" -type f -exec chmod 644 {} +
}

generate_secrets() {
    APP_KEY="$(php -r 'echo "base64:" . base64_encode(random_bytes(32));')"
    FRONTEND_API_KEY="$(openssl rand -hex 32)"
    SANCTUM_STATEFUL_DOMAIN="${PANEL_HOST}"
}

write_backend_config() {
    log "Writing backend runtime config."

    APP_NAME="${APP_NAME}" \
    PANEL_URL="${PANEL_URL}" \
    PANEL_HOST="${PANEL_HOST}" \
    APP_TIMEZONE="${APP_TIMEZONE}" \
    APP_KEY="${APP_KEY}" \
    FRONTEND_API_KEY="${FRONTEND_API_KEY}" \
    SERVICE_AUTHOR_EMAIL="${SERVICE_AUTHOR_EMAIL}" \
    USE_REDIS="${USE_REDIS}" \
    ENABLE_SSL="${ENABLE_SSL}" \
    ENABLE_TELEMETRY="${ENABLE_TELEMETRY}" \
    ENABLE_RECAPTCHA="${ENABLE_RECAPTCHA}" \
    RECAPTCHA_SITE_KEY="${RECAPTCHA_SITE_KEY}" \
    RECAPTCHA_SECRET_KEY="${RECAPTCHA_SECRET_KEY}" \
    DB_HOST="${DB_HOST}" \
    DB_PORT="${DB_PORT}" \
    DB_NAME="${DB_NAME}" \
    DB_USER="${DB_USER}" \
    DB_PASSWORD="${DB_PASSWORD}" \
    FRONTEND_PORT="${FRONTEND_PORT}" \
    PANEL_STATEFUL_DOMAIN="${SANCTUM_STATEFUL_DOMAIN}" \
    CONFIGURE_SMTP="${CONFIGURE_SMTP}" \
    MAIL_HOST="${MAIL_HOST}" \
    MAIL_PORT="${MAIL_PORT}" \
    MAIL_USERNAME="${MAIL_USERNAME}" \
    MAIL_PASSWORD="${MAIL_PASSWORD}" \
    MAIL_ENCRYPTION="${MAIL_ENCRYPTION}" \
    MAIL_FROM_ADDRESS="${MAIL_FROM_ADDRESS}" \
    MAIL_FROM_NAME="${MAIL_FROM_NAME}" \
    BACKEND_CONFIG_PATH="${BACKEND_CONFIG_PATH}" \
    php <<'PHP'
<?php
$bool = static fn (string $key, bool $default = false): bool => filter_var(getenv($key) !== false ? getenv($key) : ($default ? 'true' : 'false'), FILTER_VALIDATE_BOOLEAN);
$nullable = static fn (string $key): ?string => (($value = getenv($key)) === false || $value === '') ? null : $value;
$cookieBase = strtolower(preg_replace('/[^a-z0-9]+/', '_', getenv('APP_NAME') ?: 'aetherpanel'));
$cookieBase = trim($cookieBase, '_') ?: 'aetherpanel';

$config = [
    'APP_NAME' => getenv('APP_NAME'),
    'APP_ENV' => 'production',
    'APP_DEBUG' => false,
    'APP_URL' => getenv('PANEL_URL'),
    'PANEL_FRONTEND_URL' => getenv('PANEL_URL'),
    'APP_TIMEZONE' => getenv('APP_TIMEZONE'),
    'APP_LOCALE' => 'en',
    'APP_FALLBACK_LOCALE' => 'en',
    'APP_KEY' => getenv('APP_KEY'),
    'FRONTEND_API_KEY' => getenv('FRONTEND_API_KEY'),
    'APP_SERVICE_AUTHOR' => getenv('SERVICE_AUTHOR_EMAIL'),
    'APP_CORS_ALLOWED_ORIGINS' => [getenv('PANEL_URL')],
    'PTERODACTYL_CDN_ENABLED' => false,
    'PTERODACTYL_CDN_CACHE_TIME' => 60,
    'PTERODACTYL_TELEMETRY_ENABLED' => $bool('ENABLE_TELEMETRY'),
    'GUZZLE_TIMEOUT' => 10,
    'GUZZLE_CONNECT_TIMEOUT' => 5,
    'FLASH_THEME_VERSION_CHECK_ENABLED' => false,
    'FLASH_THEME_HTTP_TIMEOUT' => 5,
    'FLASH_THEME_CONNECT_TIMEOUT' => 3,
    'SESSION_DRIVER' => $bool('USE_REDIS', true) ? 'redis' : 'database',
    'CACHE_DRIVER' => $bool('USE_REDIS', true) ? 'redis' : 'file',
    'QUEUE_CONNECTION' => $bool('USE_REDIS', true) ? 'redis' : 'database',
    'SESSION_COOKIE' => $cookieBase . '_session',
    'SESSION_DOMAIN' => null,
    'SESSION_SECURE_COOKIE' => $bool('ENABLE_SSL'),
    'SESSION_SAME_SITE' => 'lax',
    'SANCTUM_STATEFUL_DOMAINS' => array_values(array_unique(array_filter([
        getenv('PANEL_STATEFUL_DOMAIN'),
        'localhost',
        '127.0.0.1',
        'localhost:' . getenv('FRONTEND_PORT'),
        '127.0.0.1:' . getenv('FRONTEND_PORT'),
    ]))),
    'DB_HOST' => getenv('DB_HOST'),
    'DB_PORT' => getenv('DB_PORT'),
    'DB_DATABASE' => getenv('DB_NAME'),
    'DB_USERNAME' => getenv('DB_USER'),
    'DB_PASSWORD' => getenv('DB_PASSWORD'),
    'REDIS_HOST' => '127.0.0.1',
    'REDIS_PORT' => '6379',
    'REDIS_PASSWORD' => null,
    'MAIL_MAILER' => $bool('CONFIGURE_SMTP') ? 'smtp' : 'log',
    'MAIL_HOST' => $nullable('MAIL_HOST') ?? '127.0.0.1',
    'MAIL_PORT' => getenv('MAIL_PORT') ?: '587',
    'MAIL_USERNAME' => $nullable('MAIL_USERNAME'),
    'MAIL_PASSWORD' => $nullable('MAIL_PASSWORD'),
    'MAIL_ENCRYPTION' => $nullable('MAIL_ENCRYPTION'),
    'MAIL_FROM_ADDRESS' => getenv('MAIL_FROM_ADDRESS'),
    'MAIL_FROM_NAME' => getenv('MAIL_FROM_NAME'),
    'RECAPTCHA_ENABLED' => $bool('ENABLE_RECAPTCHA'),
    'RECAPTCHA_SECRET_KEY' => getenv('RECAPTCHA_SECRET_KEY') ?: '',
    'RECAPTCHA_WEBSITE_KEY' => getenv('RECAPTCHA_SITE_KEY') ?: '',
];

file_put_contents(getenv('BACKEND_CONFIG_PATH'), "<?php\n\nreturn " . var_export($config, true) . ";\n");
PHP
}

write_frontend_env() {
    log "Writing frontend production environment."
    cat > "${FRONTEND_ENV_PATH}" <<EOF
NEXT_PUBLIC_APP_URL=${PANEL_URL}
NEXT_PUBLIC_API_URL=${PANEL_URL}
NEXT_PUBLIC_PANEL_ACCESS_KEY=${FRONTEND_API_KEY}
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=${RECAPTCHA_SITE_KEY}
EOF
    chown "${APP_USER}:${APP_GROUP}" "${FRONTEND_ENV_PATH}"
    chmod 640 "${FRONTEND_ENV_PATH}"
}

configure_mysql_access() {
    if mysql -u root -e "SELECT 1" >/dev/null 2>&1; then
        MYSQL_ADMIN_AUTH_MODE="socket"
        MYSQL_ADMIN_USER="root"
        MYSQL_ADMIN_PASSWORD=""
        return
    fi

    MYSQL_ADMIN_AUTH_MODE="password"
    prompt MYSQL_ADMIN_USER "MySQL/MariaDB admin username" "${MYSQL_ADMIN_USER}"
    prompt_secret MYSQL_ADMIN_PASSWORD "MySQL/MariaDB admin password"
    mysql -u "${MYSQL_ADMIN_USER}" -p"${MYSQL_ADMIN_PASSWORD}" -e "SELECT 1" >/dev/null
}

mysql_exec() {
    local sql="$1"
    if [[ "${MYSQL_ADMIN_AUTH_MODE}" == "socket" ]]; then
        mysql -u "${MYSQL_ADMIN_USER}" -e "${sql}"
    else
        mysql -u "${MYSQL_ADMIN_USER}" -p"${MYSQL_ADMIN_PASSWORD}" -e "${sql}"
    fi
}

create_database_and_user() {
    [[ "${AUTO_CREATE_DATABASE}" == "true" ]] || return 0

    log "Creating database and database user."
    configure_mysql_access

    local escaped_db_password
    escaped_db_password="$(printf '%s' "${DB_PASSWORD}" | sed "s/'/''/g")"

    mysql_exec "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    mysql_exec "CREATE USER IF NOT EXISTS '${DB_USER}'@'${DB_GRANT_HOST}' IDENTIFIED BY '${escaped_db_password}';"
    mysql_exec "GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'${DB_GRANT_HOST}'; FLUSH PRIVILEGES;"
}

install_backend_dependencies() {
    log "Installing backend dependencies."
    run_as_app "cd '${BACKEND_DIR}' && COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev --optimize-autoloader --classmap-authoritative --no-interaction"
}

write_php_performance_config() {
    log "Writing PHP-FPM and OPcache performance tuning."

    cat > "${PHP_PERF_INI_PATH}" <<EOF
memory_limit = 512M
max_execution_time = 120
max_input_vars = 5000
post_max_size = 100M
upload_max_filesize = 100M
expose_php = Off
realpath_cache_size = 4096K
realpath_cache_ttl = 600

opcache.enable = 1
opcache.enable_cli = 0
opcache.memory_consumption = 256
opcache.interned_strings_buffer = 16
opcache.max_accelerated_files = 20000
opcache.validate_timestamps = 0
opcache.revalidate_freq = 0
opcache.fast_shutdown = 1
opcache.save_comments = 1
opcache.jit = 0
EOF

    cat > "${PHP_FPM_POOL_OVERRIDE_PATH}" <<EOF
[www]
pm = dynamic
pm.max_children = 24
pm.start_servers = 4
pm.min_spare_servers = 2
pm.max_spare_servers = 8
pm.max_requests = 500
request_terminate_timeout = 300s
EOF
}

warm_backend_caches() {
    log "Warming backend caches."
    run_as_app "cd '${BACKEND_DIR}' && php artisan config:cache"
    run_as_app "cd '${BACKEND_DIR}' && php artisan route:cache"
    run_as_app "cd '${BACKEND_DIR}' && php artisan event:cache"
}

bootstrap_backend() {
    log "Running backend setup tasks."
    run_as_app "cd '${BACKEND_DIR}' && php artisan optimize:clear"
    run_as_app "cd '${BACKEND_DIR}' && php artisan migrate --force"
    run_as_app "cd '${BACKEND_DIR}' && php artisan db:seed --force"
    if [[ ! -L "${BACKEND_DIR}/public/storage" ]]; then
        run_as_app "cd '${BACKEND_DIR}' && php artisan storage:link"
    fi
    runuser -u "${APP_USER}" -- env \
        ADMIN_EMAIL="${ADMIN_EMAIL}" \
        ADMIN_USERNAME="${ADMIN_USERNAME}" \
        ADMIN_FIRST_NAME="${ADMIN_FIRST_NAME}" \
        ADMIN_LAST_NAME="${ADMIN_LAST_NAME}" \
        ADMIN_PASSWORD="${ADMIN_PASSWORD}" \
        bash -lc "cd '${BACKEND_DIR}' && php artisan p:user:make --email=\"\$ADMIN_EMAIL\" --username=\"\$ADMIN_USERNAME\" --name-first=\"\$ADMIN_FIRST_NAME\" --name-last=\"\$ADMIN_LAST_NAME\" --password=\"\$ADMIN_PASSWORD\" --admin=1"

    chown -R "${APP_USER}:${APP_GROUP}" "${BACKEND_DIR}/storage" "${BACKEND_DIR}/bootstrap/cache"
    chmod -R ug+rwX "${BACKEND_DIR}/storage" "${BACKEND_DIR}/bootstrap/cache"
    warm_backend_caches
}

install_frontend_dependencies() {
    log "Installing frontend dependencies."
    run_as_app "cd '${FRONTEND_DIR}' && yarn install --frozen-lockfile"
}

build_frontend() {
    log "Building frontend."
    run_as_app "cd '${FRONTEND_DIR}' && cp '.env.production' '.env' && yarn build"
}

write_systemd_units() {
    log "Writing systemd unit files."

    cat > "/etc/systemd/system/${SERVICE_PREFIX}-frontend.service" <<EOF
[Unit]
Description=AetherPanel Next.js frontend
After=network.target

[Service]
Type=simple
User=${APP_USER}
Group=${APP_GROUP}
WorkingDirectory=${FRONTEND_DIR}
Environment=NODE_ENV=production
Environment=HOSTNAME=127.0.0.1
Environment=PORT=${FRONTEND_PORT}
ExecStart=/usr/bin/node .next/standalone/server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

    cat > "/etc/systemd/system/${SERVICE_PREFIX}-queue.service" <<EOF
[Unit]
Description=AetherPanel Laravel queue worker
After=network.target mariadb.service $([[ "${USE_REDIS}" == "true" ]] && echo "redis-server.service")

[Service]
Type=simple
User=${APP_USER}
Group=${APP_GROUP}
WorkingDirectory=${BACKEND_DIR}
ExecStart=/usr/bin/php artisan queue:work --sleep=3 --tries=3 --timeout=90
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

    cat > "/etc/systemd/system/${SERVICE_PREFIX}-scheduler.service" <<EOF
[Unit]
Description=AetherPanel Laravel scheduler
After=network.target

[Service]
Type=oneshot
User=${APP_USER}
Group=${APP_GROUP}
WorkingDirectory=${BACKEND_DIR}
ExecStart=/usr/bin/php artisan schedule:run
EOF

    cat > "/etc/systemd/system/${SERVICE_PREFIX}-scheduler.timer" <<EOF
[Unit]
Description=Run the AetherPanel scheduler every minute

[Timer]
OnCalendar=*-*-* *:*:00
Persistent=true
Unit=${SERVICE_PREFIX}-scheduler.service

[Install]
WantedBy=timers.target
EOF

    systemctl daemon-reload
    systemctl enable --now "${SERVICE_PREFIX}-frontend.service"
    systemctl enable --now "${SERVICE_PREFIX}-queue.service"
    systemctl enable --now "${SERVICE_PREFIX}-scheduler.timer"
}

write_nginx_site() {
    log "Writing Nginx site."

    cat > "${NGINX_SITE_PATH}" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${PANEL_HOST};

    sendfile on;
    tcp_nopush on;
    keepalive_timeout 65;
    gzip on;
    gzip_comp_level 5;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/xml image/svg+xml;

    root ${BACKEND_DIR}/public;
    index index.php;
    client_max_body_size 100m;

    location ^~ /storage/ {
        try_files \$uri \$uri/ =404;
        access_log off;
        expires 7d;
    }

    location /api/ {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location /sanctum/ {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location /locales/ {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location = /health {
        try_files /does-not-exist /index.php?\$query_string;
    }

    location ~ ^/index\.php(/|$) {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME ${BACKEND_DIR}/public/index.php;
        fastcgi_param DOCUMENT_ROOT ${BACKEND_DIR}/public;
        fastcgi_param HTTPS \$https if_not_empty;
        fastcgi_param HTTP_PROXY "";
        fastcgi_pass unix:/run/php/php${PHP_VERSION}-fpm.sock;
        fastcgi_read_timeout 300;
    }

    location ~ \.php$ {
        return 404;
    }

    location / {
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_pass http://127.0.0.1:${FRONTEND_PORT};
        proxy_read_timeout 300;
    }
}
EOF

    ln -sf "${NGINX_SITE_PATH}" "/etc/nginx/sites-enabled/${SERVICE_PREFIX}.conf"
    rm -f /etc/nginx/sites-enabled/default
    nginx -t
    systemctl restart "php${PHP_VERSION}-fpm"
    systemctl enable --now nginx
    systemctl restart nginx
}

obtain_ssl_certificate() {
    [[ "${ENABLE_SSL}" == "true" ]] || return 0

    log "Requesting a Let's Encrypt certificate."
    certbot --nginx --non-interactive --agree-tos --redirect -m "${CERTBOT_EMAIL}" -d "${PANEL_HOST}"
    nginx -t
    systemctl restart nginx
}

print_summary() {
    echo
    log "Installation completed."
    printf 'Panel URL: %s\n' "${PANEL_URL}"
    printf 'Install path: %s\n' "${INSTALL_ROOT}"
    printf 'Frontend service: %s-frontend.service\n' "${SERVICE_PREFIX}"
    printf 'Queue service: %s-queue.service\n' "${SERVICE_PREFIX}"
    printf 'Scheduler timer: %s-scheduler.timer\n' "${SERVICE_PREFIX}"
    printf 'Backend config: %s\n' "${BACKEND_CONFIG_PATH}"
    printf 'Frontend env: %s\n' "${FRONTEND_ENV_PATH}"
    echo
    echo "Admin login:"
    printf '  email: %s\n' "${ADMIN_EMAIL}"
    printf '  username: %s\n' "${ADMIN_USERNAME}"
    echo
    echo "Keep the database password, app key, frontend API key, and admin password stored safely."
}

main() {
    require_root
    require_repo_layout
    ensure_ubuntu
    collect_install_configuration
    install_system_packages
    prepare_app_user
    prepare_install_tree
    generate_secrets
    write_backend_config
    write_frontend_env
    create_database_and_user
    install_backend_dependencies
    write_php_performance_config
    bootstrap_backend
    install_frontend_dependencies
    build_frontend
    write_systemd_units
    write_nginx_site
    obtain_ssl_certificate
    print_summary
}

main "$@"
