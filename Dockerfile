FROM php:8.1-apache

# 1. Instalación de dependencias del sistema y extensiones PHP críticas
RUN apt-get update && apt-get install -y \
    libmysqli-dev \
    libgd-dev \
    libzip-dev \
    libc-client-dev \
    libkrb5-dev \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# 2. Configuración e instalación de extensiones para vtiger
RUN docker-php-ext-configure imap --with-kerberos --with-imap-ssl \
    && docker-php-ext-install mysqli gd imap zip

# 3. Aplicar configuración de PHP optimizada 
COPY ./config/php.ini /usr/local/etc/php/conf.d/vtiger-config.ini

# 4. Directorio de trabajo
WORKDIR /var/www/html

# 5. Copiar el código fuente CORE de vtiger [cite: 15, 17]
COPY ./vtiger-source /var/www/html/

# --- ESTRATEGIA PROFESIONAL (ONBUILD) --- [cite: 18]
# Estas instrucciones se ejecutarán automáticamente cuando un 
# repositorio de CLIENTE use esta imagen como base (FROM vtiger-core).
ONBUILD COPY ./custom-code /var/www/html/
ONBUILD RUN chown -R www-data:www-data /var/www/html