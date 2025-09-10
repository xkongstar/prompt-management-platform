# Makefile for Prompt Management Platform

.PHONY: help dev prod stop clean logs backup restore test lint

# Default target
help:
	@echo "Prompt Management Platform - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start development environment"
	@echo "  make stop         - Stop all services"
	@echo "  make logs         - View logs from all services"
	@echo "  make clean        - Clean up containers and volumes"
	@echo ""
	@echo "Production:"
	@echo "  make prod         - Deploy to production"
	@echo "  make backup       - Create database backup"
	@echo "  make restore      - Restore database from backup"
	@echo ""
	@echo "Development Tools:"
	@echo "  make test         - Run tests"
	@echo "  make lint         - Run linting"
	@echo "  make db-shell     - Open database shell"
	@echo "  make redis-shell  - Open Redis shell"

# Development environment
dev:
	@echo "🚀 Starting development environment..."
	@chmod +x scripts/dev-setup.sh
	@./scripts/dev-setup.sh

# Production deployment
prod:
	@echo "🚀 Deploying to production..."
	@chmod +x scripts/prod-deploy.sh
	@./scripts/prod-deploy.sh

# Stop services
stop:
	@echo "🛑 Stopping services..."
	@docker-compose down

# View logs
logs:
	@docker-compose logs -f

# Clean up
clean:
	@echo "🧹 Cleaning up..."
	@docker-compose down -v --remove-orphans
	@docker system prune -f

# Database backup
backup:
	@echo "🗄️ Creating backup..."
	@chmod +x scripts/backup.sh
	@./scripts/backup.sh

# Database restore
restore:
	@echo "🔄 Restoring database..."
	@chmod +x scripts/restore.sh
	@./scripts/restore.sh $(BACKUP_FILE)

# Run tests
test:
	@echo "🧪 Running tests..."
	@docker-compose exec backend npm test
	@docker-compose exec frontend npm test

# Run linting
lint:
	@echo "🔍 Running linting..."
	@docker-compose exec backend npm run lint
	@docker-compose exec frontend npm run lint

# Database shell
db-shell:
	@docker-compose exec postgres psql -U promptuser -d promptdb

# Redis shell
redis-shell:
	@docker-compose exec redis redis-cli

# Backend shell
backend-shell:
	@docker-compose exec backend sh

# Frontend shell
frontend-shell:
	@docker-compose exec frontend sh
