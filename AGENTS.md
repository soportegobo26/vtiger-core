# vtiger-core — Agent Instructions

## Repo purpose

Base Docker image for vtiger CRM 8.4.0 (PHP 8.1+ / Apache). Part of a two-repo system: this repo is the **immutable core**; client repos (e.g. `vtiger-client`) extend it via `ONBUILD`.

## Directories

- `vtiger-source/` — Official vtiger CRM code (unmodified, 56+ modules)
- `config/php.ini` — Optimized PHP config (512M memory, 600s timeout, America/Bogota TZ)
- `.github/workflows/build-core.yml` — CI/CD: build & push Docker image to GHCR

## Key facts

- **Never modify `vtiger-source/` directly** — this is the official vtiger codebase. Changes belong in the client repo's `custom-code/` directory.
- **Dockerfile**: based on `php:8.1-apache`, installs `mysqli`, `gd`, `imap`, `zip` extensions. Uses `ONBUILD COPY ./custom-code /var/www/html/` + `ONBUILD RUN chown` so client repos auto-inject customizations.
- **CI/CD** triggers on pushes to `main`/`master` touching `Dockerfile`, `config/*`, or `vtiger-source/*`. Pushes to `ghcr.io/soportegobo26/vtiger-core:latest`.
- **PHP entrypoint**: `vtiger-source/index.php` (vtiger CRM application)
- **Config template**: `vtiger-source/config.template.php` — contains placeholders (`_DBC_SERVER_`, `_DBC_NAME_`, etc.) that the client repo's entrypoint replaces with real values.
- **Config**: `vtiger-source/config.inc.php` is intentionally removed from the repo. The client repo's `docker-entrypoint.sh` generates it dynamically from `config.template.php` using environment variables.
- **Install mode**: When the database has no vtiger tables (fresh install), the entrypoint sets `db_name='_DBC_TYPE_'` in config.inc.php, which triggers `isInstalled()===false` in `WebUI.php` and redirects to the built-in wizard at `index.php?module=Install&view=Index`.

## Workflows

- Build locally: `docker build -t vtiger-core .`
- CI: `.github/workflows/build-core.yml` — on merge to master, builds and pushes to GHCR with `latest`, `sha-`, and `semver` tags.
- Client repos `FROM ghcr.io/soportegobo26/vtiger-core:latest` + `ONBUILD` copies their `custom-code/` automatically.

## Constraints

- No test suite, no lint/typecheck commands in this repo (it's infrastructure, not application development).
- `composer.lock` is committed — update via `composer update` when `composer.json` changes.
- `.env` is gitignored (only used locally if at all).
- Timezone in `php.ini` is `America/Bogota`.