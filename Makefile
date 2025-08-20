#Transcendence main link

TRANSCENDENCE="./infrastructure/docker-compose.yml"

#Up the transcendence

up:
	docker-compose $(TRANSCENDENCE) up -d --build

#Down the transcendence

down:
	docker-compose $(TRANSCENDENCE) down

#Build the transcendence

build:
	docker-compose -f $(TRANSCENDENCE)

#clean

clean: down
	@docker system prune -f
	@docker image prune -af
	@docker network prune -f

#fclean

fclean: clean
	@echo "cleaning everything..."
	@docker system prune -a --volumes -f || true
	@bash -c 'docker volume rm -f $$(docker volume ls -q)' || true

#restart

re: clean up

.PHONY: up down build clean fclean re
