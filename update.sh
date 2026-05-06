#!/usr/bin/env bash

set -euo pipefail

APP_USER="${APP_USER:-aetherpanel}"
APP_GROUP="${APP_GROUP:-www-data}"
SERVICE_PREFIX="${SERVICE_PREFIX:-aetherpanel}"
PANEL_DIR="${1:-${PANEL_DIR:-/var/www/aetherpanel}}"
PANEL_REPO_URL="${PANEL_REPO_URL:-https://github.com/officialpriyam/AetherPanel.git}"
PHP_FPM_SERVICE="${PHP_FPM_SERVICE:-php8.3-fpm}"
NGINX_SERVICE="${NGINX_SERVICE:-nginx}"

BACKEND_DIR="${PANEL_DIR}/backend"
FRONTEND_DIR="${PANEL_DIR}/frontend"
FRONTEND_SERVICE="${SERVICE_PREFIX}-frontend"
QUEUE_SERVICE="${SERVICE_PREFIX}-queue"
SCHEDULER_TIMER="${SERVICE_PREFIX}-scheduler.timer"

log() {
    printf '[%s] %s\n' "$(date '+%H:%M:%S')" "$*"
}

fail() {
    log "ERROR: $*"
    exit 1
}

run_as_app() {
    local command="$1"
    runuser -u "${APP_USER}" -- bash -lc "${command}"
}

ensure_root() {
    if [[ "${EUID}" -ne 0 ]]; then
        fail "Run this script as root."
    fi
}

ensure_paths() {
    [[ -d "${PANEL_DIR}" ]] || fail "Panel directory not found: ${PANEL_DIR}"
    [[ -d "${BACKEND_DIR}" ]] || fail "Backend directory not found: ${BACKEND_DIR}"
    [[ -d "${FRONTEND_DIR}" ]] || fail "Frontend directory not found: ${FRONTEND_DIR}"
    git -C "${PANEL_DIR}" rev-parse --is-inside-work-tree >/dev/null 2>&1 || fail "Panel directory is not a git checkout: ${PANEL_DIR}"
}

sync_repository() {
    local current_remote
    local branch

    current_remote="$(git -C "${PANEL_DIR}" remote get-url origin 2>/dev/null || true)"
    if [[ -z "${current_remote}" ]]; then
        git -C "${PANEL_DIR}" remote add origin "${PANEL_REPO_URL}"
    elif [[ "${current_remote}" != "${PANEL_REPO_URL}" ]]; then
        log "Updating git remote origin to ${PANEL_REPO_URL}."
        git -C "${PANEL_DIR}" remote set-url origin "${PANEL_REPO_URL}"
    fi

    branch="$(git -C "${PANEL_DIR}" symbolic-ref --quiet --short HEAD 2>/dev/null || true)"
    branch="${branch:-main}"

    log "Fetching latest source from ${PANEL_REPO_URL} (${branch})."
    git -C "${PANEL_DIR}" fetch origin --tags --prune
    git -C "${PANEL_DIR}" pull --ff-only origin "${branch}"
}

refresh_backend() {
    log "Updating backend dependencies and caches."
    chown -R "${APP_USER}:${APP_GROUP}" "${BACKEND_DIR}/storage" "${BACKEND_DIR}/bootstrap/cache"
    chmod -R ug+rwX "${BACKEND_DIR}/storage" "${BACKEND_DIR}/bootstrap/cache"

    run_as_app "cd '${BACKEND_DIR}' && composer install --no-dev --optimize-autoloader --no-interaction"
    run_as_app "cd '${BACKEND_DIR}' && php artisan optimize:clear"
    run_as_app "cd '${BACKEND_DIR}' && php artisan migrate --force"
    run_as_app "cd '${BACKEND_DIR}' && php artisan config:cache"
    run_as_app "cd '${BACKEND_DIR}' && php artisan route:cache"
    run_as_app "cd '${BACKEND_DIR}' && php artisan event:cache"
}

refresh_frontend() {
    log "Updating frontend dependencies and production build."
    rm -rf "${FRONTEND_DIR}/.next"
    mkdir -p "${FRONTEND_DIR}/.next"
    chown -R "${APP_USER}:${APP_GROUP}" "${FRONTEND_DIR}"

    run_as_app "cd '${FRONTEND_DIR}' && yarn install --frozen-lockfile --non-interactive"
    run_as_app "cd '${FRONTEND_DIR}' && cp '.env.production' '.env' && yarn build"

    mkdir -p "${FRONTEND_DIR}/.next/standalone/.next"
    rm -rf "${FRONTEND_DIR}/.next/standalone/.next/static" "${FRONTEND_DIR}/.next/standalone/public"
    cp -R "${FRONTEND_DIR}/.next/static" "${FRONTEND_DIR}/.next/standalone/.next/static"
    if [[ -d "${FRONTEND_DIR}/public" ]]; then
        cp -R "${FRONTEND_DIR}/public" "${FRONTEND_DIR}/.next/standalone/public"
    fi

    chown -R "${APP_USER}:${APP_GROUP}" "${FRONTEND_DIR}/.next"
}

restart_services() {
    log "Restarting application services."
    systemctl restart "${PHP_FPM_SERVICE}"
    systemctl restart "${FRONTEND_SERVICE}"
    systemctl restart "${QUEUE_SERVICE}"
    systemctl restart "${SCHEDULER_TIMER}"
    systemctl reload "${NGINX_SERVICE}"
}

health_check() {
    local frontend_url
    local scheme
    local host
    local frontend_key

    frontend_url="$(php -r '$c = include "'"${BACKEND_DIR//\\/\\\\}"'/config.php"; echo $c["PANEL_FRONTEND_URL"] ?? ($c["APP_URL"] ?? "");')"
    scheme="${frontend_url%%://*}"
    if [[ "${scheme}" == "${frontend_url}" ]]; then
        scheme="https"
    fi

    host="$(php -r '$c = include "'"${BACKEND_DIR//\\/\\\\}"'/config.php"; $u = $c["PANEL_FRONTEND_URL"] ?? ($c["APP_URL"] ?? ""); echo parse_url($u, PHP_URL_HOST) ?: "";')"
    frontend_key="$(php -r '$c = include "'"${BACKEND_DIR//\\/\\\\}"'/config.php"; echo $c["FRONTEND_API_KEY"] ?? "";')"

    [[ -n "${host}" ]] || fail "Unable to determine panel host from backend/config.php."
    [[ -n "${frontend_key}" ]] || fail "Unable to determine FRONTEND_API_KEY from backend/config.php."

    log "Running production health checks."
    if [[ "${scheme}" == "https" ]]; then
        curl --silent --show-error --fail --resolve "${host}:443:127.0.0.1" "https://${host}/" >/dev/null
        curl --silent --show-error --fail --resolve "${host}:443:127.0.0.1" \
            "https://${host}/api/bootstrap" \
            -H "Origin: https://${host}" \
            -H "Referer: https://${host}/" \
            -H "Accept: application/json" \
            -H "X-AetherPanel-Frontend-Key: ${frontend_key}" >/dev/null
    else
        curl --silent --show-error --fail -H "Host: ${host}" "http://127.0.0.1/" >/dev/null
        curl --silent --show-error --fail -H "Host: ${host}" \
            "http://127.0.0.1/api/bootstrap" \
            -H "Origin: http://${host}" \
            -H "Referer: http://${host}/" \
            -H "Accept: application/json" \
            -H "X-AetherPanel-Frontend-Key: ${frontend_key}" >/dev/null
    fi
}

main() {
    ensure_root
    ensure_paths
    sync_repository
    refresh_backend
    refresh_frontend
    restart_services
    health_check
    log "Update completed successfully."
}

main "$@"
