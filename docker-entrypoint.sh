#!/bin/bash
# =============================================================================
# vtiger-core/docker-entrypoint.sh
# Entrypoint del CORE. Se ejecuta en cada arranque del contenedor.
# Responsabilidades:
#   1. Generar config.inc.php dinámicamente desde variables de entorno
#   2. Esperar a que MySQL esté listo
#   3. Si la BD está vacía → ejecutar schema SQL nativo de vTiger (auto-install CLI)
#   4. Ajustar permisos y limpiar caché
#   5. Cedir control a Apache
#
# Los repositorios cliente pueden sobreescribir este script con su propio
# docker-entrypoint.sh que añada la lógica de stash + migraciones vtlib.
# =============================================================================
set -e

echo "=== [vtiger-core] Iniciando entrada ==="

# -----------------------------------------------------------------------------
# 1. Generar config.inc.php dinámicamente desde variables de entorno
#    vTiger busca config.inc.php en /var/www/html/. Si no existe, lanza el
#    wizard de instalación web. Lo generamos nosotros para evitar el wizard.
# -----------------------------------------------------------------------------
CONFIG_FILE="/var/www/html/config.inc.php"
TEMPLATE_FILE="/var/www/html/config.template.php"

# Variables con defaults seguros
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-vtiger}"
DB_USER="${DB_USER:-vtiger}"
DB_PASS="${DB_PASS:-vtiger}"
DB_ROOT_USER="${DB_ROOT_USER:-root}"
DB_ROOT_PASS="${DB_ROOT_PASS:-root}"
SITE_URL="${SITE_URL:-http://localhost}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin}"
CURRENCY_NAME="${CURRENCY_NAME:-USD}"
CURRENCY_CODE="${CURRENCY_CODE:-USD}"
LANGUAGE="${LANGUAGE:-es_co}"

echo "[core] Generando config.inc.php dinámico..."

if [ -f "$TEMPLATE_FILE" ]; then
    # vTiger incluye config.template.php con placeholders _DBC_SERVER_, _DBC_NAME_, etc.
    cp -f "$TEMPLATE_FILE" "$CONFIG_FILE"
    sed -i "s|_DBC_SERVER_|${DB_HOST}|g"          "$CONFIG_FILE"
    sed -i "s|_DBC_PORT_|${DB_PORT}|g"            "$CONFIG_FILE"
    sed -i "s|_DBC_NAME_|${DB_NAME}|g"            "$CONFIG_FILE"
    sed -i "s|_DBC_USER_|${DB_USER}|g"            "$CONFIG_FILE"
    sed -i "s|_DBC_PASS_|${DB_PASS}|g"            "$CONFIG_FILE"
    sed -i "s|_SITE_URL_|${SITE_URL}|g"           "$CONFIG_FILE"
    sed -i "s|_DB_TYPE_|mysql|g"                  "$CONFIG_FILE"
    echo "[core] config.inc.php generado desde template."
else
    # Si no hay template, generamos uno mínimo desde cero
    cat > "$CONFIG_FILE" <<PHP
<?php
\$dbconfig['db_type']    = 'mysql';
\$dbconfig['db_server']  = '${DB_HOST}';
\$dbconfig['db_port']    = '${DB_PORT}';
\$dbconfig['db_username']= '${DB_USER}';
\$dbconfig['db_password']= '${DB_PASS}';
\$dbconfig['db_name']    = '${DB_NAME}';
\$dbconfig['db_status']  = 'true';
\$site_URL               = '${SITE_URL}';
\$default_charset        = 'UTF-8';
\$default_language       = '${LANGUAGE}';
\$application_unique_key = '$(head -c 32 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | head -c 32)';
\$root_directory         = '/var/www/html/';
PHP
    echo "[core] config.inc.php generado desde cero (no había template)."
fi

chmod 644 "$CONFIG_FILE"
chown www-data:www-data "$CONFIG_FILE"

# -----------------------------------------------------------------------------
# 2. Esperar a que MySQL esté listo (hasta 60s)
# -----------------------------------------------------------------------------
echo "[core] Esperando MySQL en ${DB_HOST}:${DB_PORT}..."
WAIT_COUNT=0
until mysqladmin ping -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" --silent 2>/dev/null; do
    WAIT_COUNT=$((WAIT_COUNT + 1))
    if [ $WAIT_COUNT -ge 30 ]; then
        echo "[core] WARN: MySQL no responde tras 60s. Continuando de todas formas."
        break
    fi
    sleep 2
done
echo "[core] MySQL listo."

# -----------------------------------------------------------------------------
# 3. Verificar si la BD está vacía. Si lo está → auto-install schema nativo
# -----------------------------------------------------------------------------
echo "[core] Verificando si la BD ya tiene tablas vTiger..."
TABLE_COUNT=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" \
    -sNe "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${DB_NAME}';" 2>/dev/null || echo "0")

if [ "${TABLE_COUNT:-0}" -eq 0 ]; then
    echo "[core] BD vacía detectada. Ejecutando auto-install del schema vTiger..."

    # 3a. Schema principal (crea todas las tablas)
    SCHEMA_FILE="/var/www/html/install/schema/vtiger_schema.sql"
    if [ -f "$SCHEMA_FILE" ]; then
        echo "[core] Cargando schema principal desde $SCHEMA_FILE..."
        mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SCHEMA_FILE" 2>&1 | head -20 || true
    else
        echo "[core] WARN: $SCHEMA_FILE no existe. No se pudo cargar el schema principal."
    fi

    # 3b. Datos seed (admin user, modulos nativos, etc.)
    SEED_FILE="/var/www/html/install/schema/vtiger_seed.sql"
    if [ -f "$SEED_FILE" ]; then
        echo "[core] Cargando datos seed desde $SEED_FILE..."
        mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SEED_FILE" 2>&1 | head -20 || true
    fi

    # 3c. Datos demo (opcional — desactivado por defecto)
    # DEMO_FILE="/var/www/html/install/schema/vtiger_demodata.sql"
    # [ -f "$DEMO_FILE" ] && mysql ... < "$DEMO_FILE"

    # 3d. Marcar el admin user con la contraseña configurada (vTiger usa md5 + salt)
    if [ -n "$ADMIN_PASSWORD" ] && [ "$ADMIN_PASSWORD" != "admin" ]; then
        echo "[core] Configurando contraseña admin..."
        ADMIN_HASH=$(php -r "echo md5('${ADMIN_PASSWORD}');")
        mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" \
            -e "UPDATE vtiger_users SET user_password='${ADMIN_HASH}' WHERE user_name='admin';" 2>/dev/null || true
    fi

    # 3e. Configurar moneda
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" \
        -e "UPDATE vtiger_currency_info SET currency_name='${CURRENCY_NAME}', currency_code='${CURRENCY_CODE}' WHERE id=1;" 2>/dev/null || true

    echo "[core] Auto-install completado."

    # 3f. Crear install.lock para que vTiger NO muestre el wizard
    touch /var/www/html/user_privileges/install.lock
    chown www-data:www-data /var/www/html/user_privileges/install.lock

    # 3g. Marcar setup_status como completado
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" \
        -e "CREATE TABLE IF NOT EXISTS vtiger_crmsetup (userid INT, setup_status SMALLINT) ENGINE=InnoDB;
            REPLACE INTO vtiger_crmsetup (userid, setup_status) VALUES (1, 1);" 2>/dev/null || true
else
    echo "[core] BD ya tiene ${TABLE_COUNT} tablas. Saltando auto-install."
    # Asegurar que install.lock exista
    touch /var/www/html/user_privileges/install.lock 2>/dev/null || true
    chown www-data:www-data /var/www/html/user_privileges/install.lock 2>/dev/null || true
fi

# -----------------------------------------------------------------------------
# 4. Limpiar caché Smarty y user_privileges (evita errores 500 tras updates)
# -----------------------------------------------------------------------------
echo "[core] Limpiando caché..."
rm -rf /var/www/html/cache/templates_c/* 2>/dev/null || true
rm -rf /var/www/html/test/templates_c/* 2>/dev/null || true
# NO borrar cache/user_privileges/* porque contiene archivos PHP generados
# que vTiger necesita regenerarlos sólo si cambian los perfiles.

# -----------------------------------------------------------------------------
# 5. Ajustar permisos finales (refuerzo)
# -----------------------------------------------------------------------------
mkdir -p /var/www/html/cache/session \
         /var/www/html/cache/templates_c \
         /var/www/html/test/templates_c \
         /var/www/html/logs \
         /var/www/html/storage \
         /var/www/html/user_privileges

chown -R www-data:www-data \
    /var/www/html/cache \
    /var/www/html/test \
    /var/www/html/logs \
    /var/www/html/storage \
    /var/www/html/user_privileges 2>/dev/null || true

chmod -R 775 \
    /var/www/html/cache \
    /var/www/html/storage \
    /var/www/html/logs \
    /var/www/html/test \
    /var/www/html/user_privileges 2>/dev/null || true

echo "[core] Permisos OK."
echo "=== [vtiger-core] Listo. Cedir control a Apache. ==="

# -----------------------------------------------------------------------------
# 6. Si el cliente definió su propio entrypoint, ejecutarlo. Si no, arrancar
#    Apache directamente.
# -----------------------------------------------------------------------------
if [ -x "/usr/local/bin/docker-entrypoint-client.sh" ]; then
    echo "[core] Ejecutando entrypoint del cliente..."
    exec /usr/local/bin/docker-entrypoint-client.sh "$@"
else
    exec docker-php-entrypoint "$@"
fi
