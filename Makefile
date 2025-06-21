# === CONFIG ===
FRONTEND_DIR=frontend
BACKEND_DIR=backend
COMPOSE=docker-compose -f docker-compose-full.yml

# === DEFAULTS ===
.PHONY: help
help:
	@echo "Usage:"
	@echo "  make build        Build all Docker images"
	@echo "  make up           Start all services (frontend + backend)"
	@echo "  make down         Stop all services"
	@echo "  make logs         Tail logs for all containers"
	@echo "  make restart      Restart services"
	@echo "  make clean        Stop and remove all containers, volumes, and images"
	@echo "  make frontend     Start frontend only"
	@echo "  make backend      Start backend and worker only"
	@echo "  make shell        Open a shell in the backend container"
	@echo "  make test         Run backend tests"
	@echo "  make format       Format Python + TypeScript files"
	@echo "  make migrate      Run Alembic migrations"

# === SERVICES ===
build:
	$(COMPOSE) build

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

restart: down up

logs:
	$(COMPOSE) logs -f --tail=100

clean:
	$(COMPOSE) down -v --rmi all --remove-orphans

frontend:
	$(COMPOSE) up -d frontend

backend:
	$(COMPOSE) up -d backend worker db redis

shell:
	$(COMPOSE) exec backend /bin/bash || $(COMPOSE) exec backend sh

# === DEV COMMANDS ===
test:
	$(COMPOSE) exec backend pytest -v

format:
	@echo "Formatting Python..."
	black $(BACKEND_DIR)/app
	@echo "Formatting TypeScript..."
	cd $(FRONTEND_DIR) && npx prettier --write .

migrate:
	$(COMPOSE) exec backend alembic upgrade head
