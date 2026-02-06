# Start all services
up: secrets-init tls build
	@echo "Starting all services, man =D"
	@docker compose up -d

# Main 
all: down up


# generate tsl certificates
tls:
	@echo Generating TLS certificates
	@chmod +x ./shared/ssl/genCert.sh
	@bash ./shared/ssl/genCert.sh
	@if [ ! -f ./shared/ssl-public/server.cert ] || [ ! -f ./shared/ssl-public/server.key ]; then \
		mkdir -p ./shared/ssl-public; \
		cp ./shared/ssl/server.cert ./shared/ssl-public/server.cert; \
		cp ./shared/ssl/server.key ./shared/ssl-public/server.key; \
		chmod 644 ./shared/ssl-public/server.cert; \
		chmod 600 ./shared/ssl-public/server.key; \
	fi

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
	@rm -f ./shared/ssl/server.cert ./shared/ssl/server.key
	@rm -f ./shared/ssl-public/server.cert ./shared/ssl-public/server.key
	
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

IMAGE_TAG ?= 1.0.0
IMAGE_PREFIX ?=
PUBLISH_SERVICES = frontend api-gateway auth-service users-service sqlite-db chat-service game-server match-service alert-receiver

PUBLIC_DOMAIN ?= localhost
GRAFANA_ROOT_URL ?= https://localhost/grafana/

secrets-init:
	@python3 ./scripts/secrets_init.py

publish:
	@test -n "$(IMAGE_PREFIX)" || (echo "ERROR: set IMAGE_PREFIX (e.g. 'mydockerhubuser/' or '123456789012.dkr.ecr.us-east-1.amazonaws.com/transcendence/')"; exit 1)
	@echo "Building images with IMAGE_PREFIX=$(IMAGE_PREFIX) IMAGE_TAG=$(IMAGE_TAG)"
	@IMAGE_PREFIX="$(IMAGE_PREFIX)" IMAGE_TAG="$(IMAGE_TAG)" docker compose build $(PUBLISH_SERVICES)
	@echo "Pushing images..."
	@IMAGE_PREFIX="$(IMAGE_PREFIX)" IMAGE_TAG="$(IMAGE_TAG)" docker compose push $(PUBLISH_SERVICES)

prod-pull:
	@test -n "$(IMAGE_PREFIX)" || (echo "ERROR: set IMAGE_PREFIX (must match what you published)"; exit 1)
	@IMAGE_PREFIX="$(IMAGE_PREFIX)" IMAGE_TAG="$(IMAGE_TAG)" docker compose pull

prod-up: tls
	@test -n "$(IMAGE_PREFIX)" || (echo "ERROR: set IMAGE_PREFIX (must match what you published)"; exit 1)
	@IMAGE_PREFIX="$(IMAGE_PREFIX)" IMAGE_TAG="$(IMAGE_TAG)" docker compose up -d --no-build

prod-deploy: prod-pull prod-up
	@echo "Deployed (pull + up --no-build)."

VM_HOST ?=
VM_USER ?= ubuntu
VM_DIR ?= /opt/transcendence
VM_SSH_KEY ?=
VM_SSH = ssh -i "$(VM_SSH_KEY)" -o StrictHostKeyChecking=accept-new $(VM_USER)@$(VM_HOST)
VM_RSYNC_EXCLUDES = \
	--exclude .git \
	--exclude .env \
	--exclude monitoring/.grafana-password.txt \
	--exclude new-match-service/.env \
	--exclude shared/letsencrypt \
	--exclude shared/letsencrypt-lib \
	--exclude shared/ssl-public

vm-check:
	@test -n "$(VM_HOST)" || (echo "ERROR: set VM_HOST (e.g. 13.59.195.11)"; exit 1)
	@test -n "$(VM_SSH_KEY)" || (echo "ERROR: set VM_SSH_KEY (e.g. /home/seiji/Downloads/transcendence42.pem)"; exit 1)

vm-sync: vm-check
	@$(VM_SSH) "sudo mkdir -p '$(VM_DIR)' && sudo chown -R '$(VM_USER):$(VM_USER)' '$(VM_DIR)'"
	@rsync -az --delete $(VM_RSYNC_EXCLUDES) ./ "$(VM_USER)@$(VM_HOST):$(VM_DIR)/"

vm-secrets-init: vm-check
	@$(VM_SSH) "mkdir -p '$(VM_DIR)' && cd '$(VM_DIR)' && PUBLIC_DOMAIN='$(PUBLIC_DOMAIN)' GRAFANA_ROOT_URL='$(GRAFANA_ROOT_URL)' make secrets-init"

vm-prod-deploy: vm-check
	@test -n "$(IMAGE_PREFIX)" || (echo "ERROR: set IMAGE_PREFIX (must match what you published)"; exit 1)
	@$(VM_SSH) "cd '$(VM_DIR)' && IMAGE_PREFIX='$(IMAGE_PREFIX)' IMAGE_TAG='$(IMAGE_TAG)' make prod-deploy"

vm-le-init: vm-check
	@test -n "$(LE_EMAIL)" || (echo "ERROR: set LE_EMAIL (e.g. you@example.com)"; exit 1)
	@$(VM_SSH) "cd '$(VM_DIR)' && LE_DOMAIN='$(LE_DOMAIN)' LE_EMAIL='$(LE_EMAIL)' make le-init"

vm-deploy: vm-sync vm-secrets-init vm-prod-deploy
	@echo "VM deployed (sync + secrets-init + prod-deploy)."

LE_DOMAIN ?= transcendence42.xyz
LE_EMAIL ?=
LE_COMPOSE = docker compose -f docker-compose.yml -f docker-compose.letsencrypt.yml

le-sync:
	@test -f "./shared/letsencrypt/live/$(LE_DOMAIN)/fullchain.pem" || (echo "ERROR: missing ./shared/letsencrypt/live/$(LE_DOMAIN)/fullchain.pem"; exit 1)
	@test -f "./shared/letsencrypt/live/$(LE_DOMAIN)/privkey.pem" || (echo "ERROR: missing ./shared/letsencrypt/live/$(LE_DOMAIN)/privkey.pem"; exit 1)
	@mkdir -p "./shared/ssl-public"
	@cp "./shared/letsencrypt/live/$(LE_DOMAIN)/fullchain.pem" "./shared/ssl-public/server.cert"
	@cp "./shared/letsencrypt/live/$(LE_DOMAIN)/privkey.pem" "./shared/ssl-public/server.key"
	@chmod 644 "./shared/ssl-public/server.cert"
	@chmod 600 "./shared/ssl-public/server.key"
	@echo "Synced Let's Encrypt cert -> ./shared/ssl-public/server.{cert,key}"

le-init:
	@test -n "$(LE_EMAIL)" || (echo "ERROR: set LE_EMAIL (e.g. you@example.com)"; exit 1)
	@echo "Requesting Let's Encrypt cert for $(LE_DOMAIN) (and www.$(LE_DOMAIN))"
	@docker compose stop nginx || true
	@$(LE_COMPOSE) run --rm --service-ports certbot certonly \
		--standalone \
		--preferred-challenges http \
		-d "$(LE_DOMAIN)" -d "www.$(LE_DOMAIN)" \
		--agree-tos -m "$(LE_EMAIL)" \
		--non-interactive \
		--keep-until-expiring
	@$(MAKE) le-sync LE_DOMAIN="$(LE_DOMAIN)"
	@docker compose up -d nginx

le-renew:
	@echo "Renewing Let's Encrypt certs (standalone, nginx temporarily stopped)"
	@docker compose stop nginx || true
	@$(LE_COMPOSE) run --rm --service-ports certbot renew --standalone --non-interactive
	@$(MAKE) le-sync LE_DOMAIN="$(LE_DOMAIN)"
	@docker compose up -d nginx

.PHONY: up down build clean fclean re remake tls secrets-init publish prod-pull prod-up prod-deploy vm-check vm-sync vm-secrets-init vm-prod-deploy vm-le-init vm-deploy le-init le-renew le-sync
