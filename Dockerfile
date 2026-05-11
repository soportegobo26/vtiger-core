# vtiger-core base image
FROM php:8.1-apache AS base

# 1. Instalación de dependencias del sistema y extensiones PHP críticas
RUN apt-get update && apt-get install -y \
    libgd-dev \
    libzip-dev \
    unzip \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 2. Configuración e instalación de extensiones para vtiger
RUN docker-php-ext-install mysqli gd zip

# 3. Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# 4. Aplicar configuración de PHP optimizada 
COPY ./config/php.ini /usr/local/etc/php/conf.d/vtiger-config.ini

# 5. Directorio de trabajo
WORKDIR /var/www/html

# 6. Copiar el código fuente CORE de vtiger
COPY ./vtiger-source /var/www/html/

# 7. Instalar dependencias de Composer
RUN composer install --no-dev --no-interaction --optimize-autoloader

# 8. Permisos
RUN chown -R www-data:www-data /var/www/html

# --- ESTRATEGIA PROFESIONAL (ONBUILD) ---
ONBUILD COPY ./custom-code /var/www/html/
ONBUILD RUN chown -R www-data:www-data /var/www/html