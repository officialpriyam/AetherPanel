#!/usr/bin/env bash

set -euo pipefail

MODE="${1:-}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usage() {
    cat <<'EOF'
Flash Theme Manager

Usage:
  bash flash-theme-manager.sh install
  bash flash-theme-manager.sh update

Modes:
  install   Install dependencies, clear panel caches, and build the theme assets.
  update    Refresh dependencies, clear caches, and rebuild the theme after pulling new files.
EOF
}

ensure_command() {
    if ! command -v "$1" >/dev/null 2>&1; then
        echo "Missing required command: $1" >&2
        exit 1
    fi
}

run_common_steps() {
    ensure_command php
    ensure_command composer
    ensure_command yarn

    cd "$ROOT_DIR"

    php artisan optimize:clear
    composer install --no-dev --optimize-autoloader
    yarn install --frozen-lockfile
    php artisan view:clear
    php artisan config:clear
    yarn build:production
}

case "$MODE" in
    install)
        echo "Starting Flash theme install..."
        run_common_steps
        echo "Flash theme install complete."
        ;;
    update)
        echo "Starting Flash theme update..."
        run_common_steps
        echo "Flash theme update complete."
        ;;
    *)
        usage
        exit 1
        ;;
esac
