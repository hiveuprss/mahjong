.PHONY: up down build test shell install logs

up:
	docker compose up --build

down:
	docker compose down

build:
	docker compose run --rm app npm run build

test:
	docker compose run --rm app npm test

shell:
	docker compose run --rm app bash

install:
	docker compose run --rm app npm install

logs:
	docker compose logs -f app
