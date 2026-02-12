# Generate secrets for local/dev (Docker secrets + .env used by AWS helpers)
secrets:
	@echo "Generating secrets..."
	@mkdir -p secrets
	@chmod 700 secrets
	@if [ ! -s secrets/jwt_secret.txt ]; then openssl rand -base64 64 | tr -d '\n' > secrets/jwt_secret.txt; fi
	@if [ ! -s secrets/cookie_secret.txt ]; then openssl rand -base64 48 | tr -d '\n' > secrets/cookie_secret.txt; fi
	@if [ ! -s secrets/session_secret.txt ]; then openssl rand -base64 48 | tr -d '\n' > secrets/session_secret.txt; fi
	@if [ ! -s secrets/sync_secret.txt ]; then openssl rand -base64 48 | tr -d '\n' > secrets/sync_secret.txt; fi
	@if [ ! -s secrets/cron_secret.txt ]; then openssl rand -base64 48 | tr -d '\n' > secrets/cron_secret.txt; fi
	@if [ ! -s secrets/lobby_id.txt ]; then echo "42" > secrets/lobby_id.txt; fi
	@if [ ! -s secrets/lobby_pass.txt ]; then openssl rand -base64 32 | tr -d '\n' > secrets/lobby_pass.txt; fi
	@if [ ! -s secrets/grafana_admin_password.txt ]; then openssl rand -base64 32 | tr -d '\n' > secrets/grafana_admin_password.txt; fi
	@if [ ! -f secrets/email_gmail_user.txt ]; then : > secrets/email_gmail_user.txt; fi
	@if [ ! -f secrets/email_gmail_pass.txt ]; then : > secrets/email_gmail_pass.txt; fi
	@if [ ! -f secrets/sightengine_user.txt ]; then : > secrets/sightengine_user.txt; fi
	@if [ ! -f secrets/sightengine_secret.txt ]; then : > secrets/sightengine_secret.txt; fi
	@chmod 600 secrets/*.txt
	@echo "Syncing .env with secrets..."
	@touch .env
	@set -e; tmp=$$(mktemp); \
		grep -vE '^(JWT_SECRET|GRAFANA_ADMIN_PASSWORD)=' .env > $$tmp || true; \
		printf '%s\n' "JWT_SECRET=$$(cat secrets/jwt_secret.txt)" >> $$tmp; \
		printf '%s\n' "GRAFANA_ADMIN_PASSWORD=$$(cat secrets/grafana_admin_password.txt)" >> $$tmp; \
		mv $$tmp .env
	@chmod 600 .env
	@echo "✓ .env updated (JWT_SECRET, GRAFANA_ADMIN_PASSWORD)"

# Start all services
up: secrets tls build
	@echo "Starting all services, man =D"
	@docker compose up -d

# Start locally for development (foreground, rebuild on changes)
dev: secrets tls
	@echo "Starting local dev stack (Ctrl+C to stop)..."
	@docker compose up --build

# Main 
all: down up


# generate tsl certificates
tls:
	@echo Generating TLS certificates
	@chmod +x ./shared/ssl/genCert.sh
	@bash ./shared/ssl/genCert.sh

# Shutdown all services

down:
	@echo "Turning down all services"
	@docker compose down --remove-orphans

# Build everything without start them

build:
	@echo "Building all the services"
	@docker compose build

# erase everything, but not delete the volumesentao

clean: down
	@echo "Cleaning the services"
	@docker image prune -a -f
	@docker container prune -f
	@docker network prune -f

# Erase everything including the volumes (FULL CLEAN)

fclean: down
	@echo "Erasing everything"
	@docker system prune -a -f --volumes
	@rm -f ./shared/ssl/server.crt ./shared/ssl/server.key
	
# Restart an individual service
# how to use:
# make restart-service
# example:
# make restart-game-server
restart-%:
	@echo "Restarting service $*"
	@docker compose down $*
	@docker compose build $*
	@docker compose up -d $*

# Aliases for individual services (short commands)
nginx: restart-nginx
api: restart-api-gateway
auth: restart-auth-service
users: restart-users-service
sqlite: restart-sqlite-db
chat: restart-chat-service
server: restart-game-server
pong: restart-game-pong
flappy: restart-game-flappy-bird
match: restart-match-service
front: restart-frontend

# Restart all the services (RESTART, MAN)

re: down up
	@echo "Restarting all microservices"

remake: clean up
	@echo "Recycling all microservices"

game-logs:
	@docker compose logs -f game-server

# ========================================
# AWS Deployment with Let's Encrypt
# ========================================

# Domain and email for Let's Encrypt (override with: make aws-cert-init DOMAIN=yourdomain.com EMAIL=you@email.com)
DOMAIN ?= transcendence42.xyz
ALT_DOMAIN ?= www.$(DOMAIN)
EMAIL ?= rflseijiueno@gmail.com
ACME_WEBROOT ?= ./shared/certbot/www
LE_COMPOSE = docker compose -f docker-compose.yml -f docker-compose.letsencrypt.yml
AWS_COMPOSE = NGINX_SSL_DIR=./shared/ssl-public PUBLIC_DOMAIN=$(DOMAIN) docker compose
CERT_DOMAINS = -d $(DOMAIN) $(if $(ALT_DOMAIN),-d $(ALT_DOMAIN),)

# Persist AWS runtime variables in .env so plain `docker compose up -d` keeps public TLS.
aws-env-sync: secrets
	@echo "Syncing AWS runtime variables into .env..."
	@if grep -q '^PUBLIC_DOMAIN=' .env; then \
		sed -i "s#^PUBLIC_DOMAIN=.*#PUBLIC_DOMAIN=$(DOMAIN)#" .env; \
	else \
		echo "PUBLIC_DOMAIN=$(DOMAIN)" >> .env; \
	fi
	@if grep -q '^NGINX_SSL_DIR=' .env; then \
		sed -i 's#^NGINX_SSL_DIR=.*#NGINX_SSL_DIR=./shared/ssl-public#' .env; \
	else \
		echo 'NGINX_SSL_DIR=./shared/ssl-public' >> .env; \
	fi
	@echo "✓ .env updated with PUBLIC_DOMAIN and NGINX_SSL_DIR"

# Initialize Let's Encrypt certificates (first time only)
aws-cert-init: secrets tls
	@echo "Obtaining Let's Encrypt certificate for $(DOMAIN)..."
	@test -n "$(EMAIL)" || (echo "ERROR: Set EMAIL (e.g., make aws-cert-init EMAIL=you@example.com)"; exit 1)
	@mkdir -p "$(ACME_WEBROOT)/.well-known/acme-challenge"
	@echo "Starting services so nginx can answer ACME challenge..."
	@docker compose up -d
	@echo "Running certbot (webroot challenge)..."
	@$(LE_COMPOSE) run --rm certbot certbot certonly \
		--webroot \
		-w /var/www/certbot \
		--non-interactive \
		--agree-tos \
		--email $(EMAIL) \
		$(CERT_DOMAINS)
	@$(MAKE) aws-tls DOMAIN=$(DOMAIN)
	@$(MAKE) aws-env-sync DOMAIN=$(DOMAIN)
	@echo "✓ Certificates obtained and copied to shared/ssl-public/"

# Copy Let's Encrypt certs to ssl directory for nginx
aws-tls:
	@echo "Copying Let's Encrypt certificates to ssl directory..."
	@test -f "./shared/letsencrypt/live/$(DOMAIN)/fullchain.pem" || (echo "ERROR: Certificate not found. Run 'make aws-cert-init' first"; exit 1)
	@mkdir -p ./shared/ssl-public
	@cp "./shared/letsencrypt/live/$(DOMAIN)/fullchain.pem" "./shared/ssl-public/server.cert"
	@cp "./shared/letsencrypt/live/$(DOMAIN)/privkey.pem" "./shared/ssl-public/server.key"
	@chmod 644 ./shared/ssl-public/server.cert
	@chmod 600 ./shared/ssl-public/server.key
	@echo "✓ Certificates copied to shared/ssl-public/"

# Renew Let's Encrypt certificates (run every 60-90 days)
aws-cert-renew: aws-env-sync
	@echo "Renewing Let's Encrypt certificates..."
	@mkdir -p "$(ACME_WEBROOT)/.well-known/acme-challenge"
	@$(LE_COMPOSE) run --rm certbot certbot renew --webroot -w /var/www/certbot --non-interactive
	@$(MAKE) aws-tls DOMAIN=$(DOMAIN)
	@$(AWS_COMPOSE) restart nginx
	@echo "✓ Certificates renewed and nginx restarted!"

# Deploy on AWS VM with Let's Encrypt (use this after aws-cert-init)
aws: secrets tls aws-tls aws-env-sync
	@echo "Deploying on AWS with Let's Encrypt certificates..."
	@$(AWS_COMPOSE) up -d --build
	@echo "✓ Deployed! Access at https://$(DOMAIN)"

.PHONY: up down build clean fclean re remake tls secrets dev game-logs aws-env-sync aws-cert-init aws-cert-renew aws-tls aws
