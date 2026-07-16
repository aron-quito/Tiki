FROM php:8.2-apache

RUN docker-php-ext-install pdo pdo_mysql

# Habilitar mod_rewrite si es necesario
RUN a2enmod rewrite

# Ajustar ServerName para evitar warnings
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Configurar el directorio raíz
ENV APACHE_DOCUMENT_ROOT /var/www/html
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf
