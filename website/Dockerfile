FROM debian:trixie
RUN apt-get update && apt-get install -y nginx openssl && mkdir -p /etc/nginx/certs
RUN rm -rf /var/www/html && mkdir -p /var/www/html && openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/certs/nginx-selfsigned.key -out /etc/nginx/certs/nginx-selfsigned.crt -subj "/C=BR/ST=SP/L=SaoPaulo/O=42SP/OU=Dev/CN=fruan-ba"
COPY ../infrastructure/nginx.conf /etc/nginx/sites-available/default
ENTRYPOINT [ "nginx", "-g", "daemon off;" ]
