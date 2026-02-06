# Start all services
up: tls build
	@echo "Starting all services, man =D"
	@docker compose up -d

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
EMAIL ?= your-email@example.com
LE_COMPOSE = docker compose -f docker-compose.yml -f docker-compose.letsencrypt.yml

# Initialize Let's Encrypt certificates (first time only)
aws-cert-init:
	@echo "Obtaining Let's Encrypt certificate for $(DOMAIN)..."
	@test -n "$(EMAIL)" || (echo "ERROR: Set EMAIL (e.g., make aws-cert-init EMAIL=you@example.com)"; exit 1)
	@echo "Stopping nginx if running..."
	@docker compose stop nginx 2>/dev/null || true
	@echo "Running certbot..."
	@$(LE_COMPOSE) run --rm --service-ports certbot certbot certonly \
		--standalone \
		--non-interactive \
		--agree-tos \
		--email $(EMAIL) \
		-d $(DOMAIN)
	@$(MAKE) aws-tls DOMAIN=$(DOMAIN)
	@echo "✓ Certificates obtained! Starting services..."
	@docker compose start nginx 2>/dev/null || true

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
aws-cert-renew:
	@echo "Renewing Let's Encrypt certificates..."
	@docker compose stop nginx
	@$(LE_COMPOSE) run --rm --service-ports certbot certbot renew --standalone --non-interactive
	@$(MAKE) aws-tls DOMAIN=$(DOMAIN)
	@docker compose start nginx
	@echo "✓ Certificates renewed!"

# Deploy on AWS VM with Let's Encrypt (use this after aws-cert-init)
aws: aws-tls build
	@echo "Deploying on AWS with Let's Encrypt certificates..."
	@docker compose down || true
	@rm -rf ./shared/ssl
	@ln -sf ssl-public ./shared/ssl
	@docker compose up -d
	@echo "✓ Deployed! Access at https://$(DOMAIN)"

.PHONY: up down build clean fclean re remake tls game-logs aws-cert-init aws-cert-renew aws-tls aws
