# Start all services
up: tsl get-ip build
	@echo "Starting all services, man =D"
	@docker compose up -d

# Main 
all: down up

#get ip
get-ip:
	@echo "Getting server IP address"
	@bash ./shared/ip/getIp.sh

# generate tsl certificates
tsl:
	@echo "Generating TLS certificates"
	@chmod +x ./nginx/ssl/mkcert.sh
	@bash ./nginx/ssl/mkcert.sh

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

# Restart all the services (RESTART, MAN)

re: down up
	@echo "Restarting all microservices"

remake: clean up
	@echo "Recycling all microservices"

game-logs:
	@docker compose logs -f game-server

.PHONY: up down build clean fclean re remake tsl
