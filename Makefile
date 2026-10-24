# =============================================================================
#  AROVIA Platform — Makefile
#  Convenience commands for development, infrastructure, and CI.
# =============================================================================

.PHONY: help \
        infra-up infra-down infra-reset infra-logs infra-tools \
        dev build lint test clean \
        db-migrate db-studio \
        ai-up ai-logs

# Default target — show help
.DEFAULT_GOAL := help

# Detect OS for cross-platform support
ifeq ($(OS),Windows_NT)
  DETECTED_OS := Windows
else
  DETECTED_OS := $(shell uname -s)
endif

# Colors (suppress on Windows cmd)
GREEN  := \033[0;32m
YELLOW := \033[1;33m
CYAN   := \033[0;36m
RESET  := \033[0m

## ---------------------------------------------------------------------------
## Help
## ---------------------------------------------------------------------------
help: ## Show this help message
	@echo ""
	@echo "  $(CYAN)AROVIA Platform — Available Commands$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ""

## ---------------------------------------------------------------------------
## Infrastructure (Docker Compose)
## ---------------------------------------------------------------------------
infra-up: ## Start core infra services (Postgres, Redis, Kafka)
	@echo "$(YELLOW)▶ Starting AROVIA infrastructure...$(RESET)"
	docker-compose up -d postgres redis kafka
	@echo "$(GREEN)✔ Infrastructure is up!$(RESET)"
	@echo "  Postgres : localhost:5432"
	@echo "  Redis    : localhost:6379"
	@echo "  Kafka    : localhost:9092"

infra-tools: ## Start infra + dev tools (Kafka UI, pgAdmin)
	@echo "$(YELLOW)▶ Starting AROVIA infrastructure + dev tools...$(RESET)"
	docker-compose --profile tools up -d
	@echo "$(GREEN)✔ Tools running!$(RESET)"
	@echo "  Kafka UI : http://localhost:8080"
	@echo "  pgAdmin  : http://localhost:5050"

infra-down: ## Stop all infra services
	@echo "$(YELLOW)▶ Stopping infrastructure...$(RESET)"
	docker-compose down

infra-reset: ## Full reset — destroy volumes and restart fresh
	@echo "$(YELLOW)⚠ Resetting all infra (data will be lost)...$(RESET)"
	docker-compose down -v
	docker-compose up -d postgres redis kafka
	@echo "$(GREEN)✔ Infrastructure reset complete!$(RESET)"

infra-logs: ## Tail logs from all infra containers
	docker-compose logs -f

infra-status: ## Show running container status
	docker-compose ps

## ---------------------------------------------------------------------------
## Application Development
## ---------------------------------------------------------------------------
install: ## Install all workspace dependencies
	@echo "$(YELLOW)▶ Installing dependencies...$(RESET)"
	yarn install

dev: ## Start all services in development mode (requires infra-up first)
	@echo "$(YELLOW)▶ Starting AROVIA dev servers...$(RESET)"
	yarn dev

dev-frontend: ## Start only the Next.js frontend
	yarn workspace frontend dev

dev-gateway: ## Start only the API Gateway
	yarn workspace @arovia/api-gateway dev

dev-auth: ## Start only the Auth Service
	yarn workspace @arovia/auth-service dev

dev-pitch: ## Start only the Pitch Service
	yarn workspace @arovia/pitch-service dev

dev-live: ## Start only the Live Session Service
	yarn workspace @arovia/live-session-service dev

dev-ai: ## Start the Python AI Agent 37
	@echo "$(YELLOW)▶ Starting AI Agent 37...$(RESET)"
	cd ai-agent-37 && uvicorn main:app --reload --port 8000

## ---------------------------------------------------------------------------
## Build & Quality
## ---------------------------------------------------------------------------
build: ## Build all packages and applications for production
	yarn build

lint: ## Lint all workspaces
	yarn lint

test: ## Run tests across all workspaces
	yarn test

format: ## Auto-format all code with Prettier
	yarn format

clean: ## Remove all build artifacts and node_modules
	@echo "$(YELLOW)▶ Cleaning build artifacts...$(RESET)"
	yarn turbo clean
	find . -name "node_modules" -type d -prune -exec rm -rf {} + 2>/dev/null || true
	find . -name ".next" -type d -prune -exec rm -rf {} + 2>/dev/null || true
	find . -name "dist" -type d -prune -exec rm -rf {} + 2>/dev/null || true
	@echo "$(GREEN)✔ Clean complete!$(RESET)"

## ---------------------------------------------------------------------------
## Database
## ---------------------------------------------------------------------------
db-migrate: ## Run Prisma migrations
	yarn workspace @arovia/database prisma migrate dev

db-studio: ## Open Prisma Studio (database GUI)
	yarn workspace @arovia/database prisma studio

db-seed: ## Seed the database with sample data
	yarn workspace @arovia/database prisma db seed

db-reset: ## Reset database and re-run all migrations
	yarn workspace @arovia/database prisma migrate reset

## ---------------------------------------------------------------------------
## AI Agent 37 (Python)
## ---------------------------------------------------------------------------
ai-install: ## Install Python dependencies for AI Agent 37
	cd ai-agent-37 && pip install -r requirements.txt

ai-up: ## Start AI Agent 37 with hot-reload
	cd ai-agent-37 && uvicorn main:app --reload --host 0.0.0.0 --port 8000

ai-logs: ## Show AI Agent 37 logs (if running via docker)
	docker-compose logs -f ai-agent-37 2>/dev/null || echo "Agent 37 is not running in Docker"

## ---------------------------------------------------------------------------
## Setup
## ---------------------------------------------------------------------------
setup: ## First-time project setup (install deps + copy .env + start infra)
	@echo "$(CYAN)▶ AROVIA Platform — First Time Setup$(RESET)"
	@if [ ! -f .env ]; then cp .env.example .env && echo "  $(GREEN)✔ Created .env from .env.example$(RESET)"; fi
	$(MAKE) install
	$(MAKE) infra-up
	@echo ""
	@echo "$(GREEN)✔ AROVIA is ready! Run 'make dev' to start development servers.$(RESET)"
