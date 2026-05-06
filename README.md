# AetherPanel

AetherPanel is a standalone frontend and backend panel forked from Pterodactyl.

This repository is split into:
- `backend/` - Laravel API, auth, admin, client, scheduler, and queue worker
- `frontend/` - Next.js 16 frontend for panel, account, auth, and admin
- `install.sh` - interactive Ubuntu/Debian production installer

## Stack

- Backend: PHP 8.2/8.3, Laravel 11, MariaDB/MySQL, optional Redis
- Frontend: Next.js 16.2.4, React 18, Yarn
- Web: Nginx
- Process management: systemd

## Production install

`install.sh` is designed for a fresh Ubuntu 22.04/24.04 or Debian 12/13 server.

It will:
- install PHP, Node 22, Composer, Nginx, MariaDB, Redis, and Certbot
- ask for the panel domain, SSL choice, database credentials, and admin user data
- deploy `backend/` and `frontend/` into the chosen install path
- write `backend/config.php` and `frontend/.env.production`
- run database migrations and seeders
- create the first admin user
- build the frontend
- create systemd services for the frontend, queue worker, and scheduler timer
- configure Nginx and optionally issue a Let's Encrypt certificate

Run it as root:

```bash
chmod +x install.sh
sudo ./install.sh
```

To remove an installed panel:

```bash
sudo ./install.sh uninstall
```

## Production behavior

The default production layout serves everything from one public domain:
- Nginx proxies browser routes to the Next.js frontend
- `/api`, `/sanctum`, and `/locales` are handled by the Laravel backend

Important generated files:
- backend runtime config: `backend/config.php`
- frontend runtime/build config: `frontend/.env.production`

Important services:
- `php8.3-fpm` for the Laravel backend runtime
- `nginx`
- `aetherpanel-frontend.service`
- `aetherpanel-queue.service`
- `aetherpanel-scheduler.timer`

## Backend performance

The production installer applies performance-oriented defaults:
- Composer autoload optimization with authoritative classmaps
- Laravel `config:cache`, `route:cache`, and `event:cache`
- PHP-FPM pool tuning
- OPcache and realpath cache tuning
- gzip and keepalive settings in Nginx

The backend code also preloads Flash theme settings by namespace instead of fetching them one key at a time. That cuts down the request cost for bootstrap and admin theme screens.

## Local development

Backend:

```bash
cd backend
php artisan serve --host=localhost --port=8080
```

Frontend:

```bash
cd frontend
yarn install
yarn dev --port 3000
```

On Windows there is also:

```powershell
.\start.ps1
```

## Notes

- This repo currently uses `backend/config.php` for runtime configuration instead of a normal Laravel `.env`-only production flow.
- The frontend expects the backend frontend-access header key configured by `FRONTEND_API_KEY`.
- `install.sh` is intended for fresh installs. Review it before running on an existing server.

## License

This project is a fork of Pterodactyl. The upstream panel repository is MIT licensed, and this fork keeps an MIT license at the repository root with upstream attribution preserved.
