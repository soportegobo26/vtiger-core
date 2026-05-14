# =============================================================================
# vtiger-core/Dockerfile
# Imagen base para todos los clientes vtiger CRM 8.3.0
# NO modificar este archivo sin pasar por el proceso de release del core.
# =============================================================================

FROM php:8.1-apache-bookworm AS base

# 1. Dependencias del sistema
RUN apt-get update && apt-get install -y \
    libgd-dev \
    libzip-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    unzip \
    git \
    curl \
    default-mysql-client \
    libc-client2007e-dev \
    libkrb5-dev \
    libcurl4-openssl-dev \
    && rm -rf /var/lib/apt/lists/*

# 2. Extensiones PHP requeridas por vtiger
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-configure imap --with-kerberos --with-imap-ssl \
    && docker-php-ext-install \
        mysqli \
        gd \
        zip \
        imap \
        curl \
        pdo \
        pdo_mysql \
        bcmath \
        calendar \
        sockets

# 3. Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# 4. Habilitar módulos Apache requeridos
RUN a2enmod rewrite headers expires deflate

# 5. Configuración Apache: AllowOverride All (necesario para .htaccess de vtiger)
COPY ./apache/vtiger.conf /etc/apache2/sites-available/000-default.conf
RUN a2ensite 000-default

# 6. Configuración PHP optimizada para vtiger
COPY ./config/php.ini /usr/local/etc/php/conf.d/vtiger-config.ini

# 7. Directorio de trabajo
WORKDIR /var/www/html

# 8. Código fuente CORE de vtiger
COPY ./vtiger-source /var/www/html/

# 9. Instalar dependencias Composer del core
RUN composer install --no-dev --no-interaction --optimize-autoloader \
    --ignore-platform-req=ext-imap \
    --ignore-platform-req=ext-curl \
    || true

# 10. Permisos base
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && chmod -R 775 /var/www/html/cache \
                    /var/www/html/storage \
                    /var/www/html/logs 2>/dev/null || true

# =============================================================================
# ONBUILD: se ejecuta automáticamente cuando crm-cliente hace FROM de esta imagen
# =============================================================================
ONBUILD COPY ./custom-code /var/www/html/
ONBUILD COPY ./migrations  /var/www/html/migrations/
ONBUILD COPY ./docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
ONBUILD RUN  chmod +x /usr/local/bin/docker-entrypoint.sh \
          && chown -R www-data:www-data /var/www/html \
          && chmod +x /var/www/html/migrations/run-migrations.sh 2>/dev/null || true

EXPOSE 80

ENTRYPOINT ["docker-php-entrypoint"]
CMD ["apache2-foreground"]
