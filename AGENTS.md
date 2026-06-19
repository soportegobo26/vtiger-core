# vtiger-core — Agent Instructions

## Repo purpose

Base Docker image for vtiger CRM 8.4.0 (PHP 8.1+ / Apache). Part of a two-repo system: this repo is the **immutable core**; client repos (e.g. `crm-racksandbags`) extend it via `ONBUILD`.

## Directories

- `vtiger-source/` — Official vtiger CRM code (unmodified)
- `config/php.ini` — Optimized PHP config (512M memory, 120s timeout, America/Bogota TZ)
- `.github/workflows/build-core.yml` — CI/CD: build & push Docker image to GHCR

## Key facts

- **Never modify `vtiger-source/` directly** — this is the official vtiger codebase. Changes belong in the client repo's `custom-code/` directory.
- **Dockerfile** (`Dockerfile`): based on `php:8.1-apache`, installs `mysqli`, `gd`, `imap`, `zip` extensions. Uses `ONBUILD COPY ./custom-code /var/www/html/` + `ONBUILD RUN chown` so client repos auto-inject customizations.
- **CI/CD** triggers on pushes to `main`/`master` touching `Dockerfile`, `config/*`, or `vtiger-source/*`. Pushes to `ghcr.io/soportegobo26/vtiger-core:latest`.
- **PHP entrypoint**: `vtiger-source/index.php` (vtiger CRM application)
- **Composer**: `vtiger-source/composer.json` requires PHP >=8.1, ext-mysqli, ext-imap, ext-curl, plus smarty, monolog, phpmailer, tcpdf, etc. Run `composer update` if modifying `composer.json`.
- **Config template**: `vtiger-source/config.template.php` — actual `config.inc.php` is empty (0 bytes); database config is injected at deployment time by the client repo's `docker-entrypoint.sh` from environment variables.

## Workflows

- Build locally: `docker build -t vtiger-core .`
- CI: `.github/workflows/build-core.yml` — on merge to master, builds and pushes to GHCR with `latest`, `sha-`, and `semver` tags.
- Client repos `FROM ghcr.io/soportegobo26/vtiger-core:latest` + `ONBUILD` copies their `custom-code/` automatically.

## Constraints

- No test suite, no lint/typecheck commands in this repo (it's infrastructure, not application development).
- `composer.lock` is committed — update via `composer update` when `composer.json` changes.
- `.env` is gitignored (only used locally if at all).
- Timezone in `php.ini` is `America/Bogota`.