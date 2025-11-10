# Start all services
up: build
	@echo "Starting all services, man =D"
	@docker compose up -d

# Shutdown all services

down:
	@echo "Turning down all services"
	@docker compose down

# Build everything without start them

build:
	@echo "Building all the services"
	@docker compose build

# erase everything, but not delete the volumes

clean: down
	@echo "Cleaning the services"
	@docker image prune -a -f
	@docker container prune -f
	@docker network prune -f

# Erase everything including the volumes (FULL CLEAN)

fclean: down
	@echo "Erasing everything"
	@docker system prune -a -f --volumes

# Restart all the services (RESTART, MAN)

re: down up
	@echo "Restarting all microservices"

remake: clean up
	@echo "Recycling all microservices"

game-logs:
	@docker compose logs -f game-server

.PHONY: up down build clean fclean re remake
