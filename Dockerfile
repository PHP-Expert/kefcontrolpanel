# Use the official PHP image with Apache
FROM php:8.2-apache

# Copy application files to the web server root
COPY . /var/www/html/

# Set the working directory
WORKDIR /var/www/html/

# Give the web server user ownership of the api and data directories for writing files
RUN chown -R www-data:www-data /var/www/html/api
RUN chown -R www-data:www-data /var/www/html/data

# Expose port 80 for the Apache server
EXPOSE 80

# Enable Apache rewrite module
RUN a2enmod rewrite

# Allow .htaccess overrides
RUN sed -i '/<Directory \/var\/www\/html>/,/^<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/sites-available/000-default.conf
