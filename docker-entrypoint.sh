#!/bin/bash
set -e
echo "=== [vtiger-core] Iniciando ==="

mkdir -p /var/www/html/cache/session /var/www/html/cache/templates_c \
         /var/www/html/test/templates_c /var/www/html/logs \
         /var/www/html/storage /var/www/html/user_privileges

chown -R www-data:www-data /var/www/html/cache /var/www/html/test \
    /var/www/html/logs /var/www/html/storage /var/www/html/user_privileges 2>/dev/null || true

rm -rf /var/www/html/cache/templates_c/* /var/www/html/test/templates_c/* 2>/dev/null || true

echo "=== [vtiger-core] Listo ==="

if [ -x "/usr/local/bin/docker-entrypoint-client.sh" ]; then
    exec /usr/local/bin/docker-entrypoint-client.sh "$@"
else
    exec docker-php-entrypoint "$@"
fi
