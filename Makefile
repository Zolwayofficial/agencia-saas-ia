# =========================================
# MiNuevaLLC - Makefile
# Comandos rápidos para gestión del stack
# =========================================

.PHONY: help up down restart logs backup restore clean

# Variables
COMPOSE_FILE=infrastructure/docker-compose.yml

help: ## Mostrar ayuda
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# =========================================
# DOCKER COMPOSE
# =========================================

up: ## Levantar todos los servicios
	docker compose -f $(COMPOSE_FILE) up -d

down: ## Detener todos los servicios
	docker compose -f $(COMPOSE_FILE) down

restart: ## Reiniciar todos los servicios
	docker compose -f $(COMPOSE_FILE) restart

logs: ## Ver logs en tiempo real
	docker compose -f $(COMPOSE_FILE) logs -f

ps: ## Ver estado de servicios
	docker compose -f $(COMPOSE_FILE) ps

# =========================================
# SERVICIOS INDIVIDUALES
# =========================================

moltbot-logs: ## Ver logs de Moltbot
	docker compose -f $(COMPOSE_FILE) logs -f moltbot

moltbot-restart: ## Reiniciar solo Moltbot
	docker compose -f $(COMPOSE_FILE) restart moltbot

chatwoot-logs: ## Ver logs de Chatwoot
	docker compose -f $(COMPOSE_FILE) logs -f chatwoot_web

n8n-logs: ## Ver logs de n8n
	docker compose -f $(COMPOSE_FILE) logs -f n8n

# =========================================
# BASE DE DATOS
# =========================================

db-console: ## Consola PostgreSQL
	docker compose -f $(COMPOSE_FILE) exec postgres psql -U user -d agencia

db-dump: ## Exportar base de datos
	docker compose -f $(COMPOSE_FILE) exec postgres pg_dump -U user agencia > backup/db_$(shell date +%Y%m%d_%H%M%S).sql

# =========================================
# MANTENIMIENTO
# =========================================

backup: ## Backup completo
	./scripts/backup-total.sh

restore: ## Restaurar desde backup
	./scripts/restore.sh

clean: ## Limpiar contenedores huérfanos y caché
	docker system prune -f
	docker volume prune -f

update: ## Actualizar imágenes y recrear
	docker compose -f $(COMPOSE_FILE) pull
	docker compose -f $(COMPOSE_FILE) up -d --force-recreate

# =========================================
# DESARROLLO
# =========================================

build-moltbot: ## Reconstruir imagen de Moltbot
	docker compose -f $(COMPOSE_FILE) build moltbot

shell-moltbot: ## Shell dentro de Moltbot
	docker compose -f $(COMPOSE_FILE) exec moltbot sh

# =========================================
# DEPLOY
# =========================================

deploy: ## Deploy completo (pull + up)
	git pull origin main
	docker compose -f $(COMPOSE_FILE) pull
	docker compose -f $(COMPOSE_FILE) up -d --build
	@echo "✅ Deploy completado"
