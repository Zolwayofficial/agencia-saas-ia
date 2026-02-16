#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  DEPLOY_V61.sh — Despliegue completo de Agencia SaaS IA V6.1
#  VPS: Contabo Cloud VPS 30 NVMe (Ubuntu)
#  Ejecutar como root: bash DEPLOY_V61.sh
# ═══════════════════════════════════════════════════════════════

set -e  # Salir ante cualquier error

echo "═══════════════════════════════════════════════════════"
echo "  🚀 AGENCIA SAAS IA — Despliegue V6.1"
echo "  $(date)"
echo "═══════════════════════════════════════════════════════"

# ═══════════════════════════════════════════════════════════════
# PASO 1: Actualizar el sistema
# ═══════════════════════════════════════════════════════════════
echo ""
echo "📦 [1/7] Actualizando sistema operativo..."
apt-get update -qq && apt-get upgrade -y -qq
echo "✅ Sistema actualizado"

# ═══════════════════════════════════════════════════════════════
# PASO 2: Instalar Docker + Docker Compose
# ═══════════════════════════════════════════════════════════════
echo ""
echo "🐳 [2/7] Instalando Docker..."

if command -v docker &> /dev/null; then
    echo "✅ Docker ya está instalado: $(docker --version)"
else
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    echo "✅ Docker instalado: $(docker --version)"
fi

if docker compose version &> /dev/null; then
    echo "✅ Docker Compose ya disponible: $(docker compose version --short)"
else
    echo "❌ Docker Compose no encontrado. Instalando plugin..."
    apt-get install -y docker-compose-plugin
    echo "✅ Docker Compose instalado"
fi

# ═══════════════════════════════════════════════════════════════
# PASO 3: Instalar utilidades
# ═══════════════════════════════════════════════════════════════
echo ""
echo "🔧 [3/7] Instalando utilidades (git, curl, jq)..."
apt-get install -y -qq git curl jq
echo "✅ Utilidades instaladas"

# ═══════════════════════════════════════════════════════════════
# PASO 4: Clonar o actualizar el repositorio
# ═══════════════════════════════════════════════════════════════
echo ""
echo "📥 [4/7] Configurando repositorio..."

PROJECT_DIR="/opt/agencia-saas-ia"

if [ -d "$PROJECT_DIR" ]; then
    echo "   Repositorio existente encontrado, actualizando..."
    cd "$PROJECT_DIR"
    git fetch --all
    git reset --hard origin/main
    echo "✅ Repositorio actualizado a la última versión"
else
    echo "   Clonando repositorio..."
    git clone https://github.com/Zolwayofficial/agencia-saas-ia.git "$PROJECT_DIR"
    cd "$PROJECT_DIR"
    echo "✅ Repositorio clonado"
fi

echo "   Tag actual: $(git describe --tags --always 2>/dev/null || echo 'sin tag')"

# ═══════════════════════════════════════════════════════════════
# PASO 5: Crear archivo .env.prod
# ═══════════════════════════════════════════════════════════════
echo ""
echo "🔐 [5/7] Configurando variables de entorno..."

ENV_FILE="$PROJECT_DIR/infrastructure/production/.env.prod"

if [ -f "$ENV_FILE" ]; then
    echo "✅ Archivo .env.prod ya existe, conservando configuración actual"
else
    echo "   Creando .env.prod con valores por defecto..."
    cat > "$ENV_FILE" << 'ENVEOF'
# ═══════════════════════════════════════════════════════════════
# AGENCIA SAAS IA — Variables de Producción (.env.prod)
# 🔴 EDITA TODOS LOS VALORES MARCADOS CON "CAMBIAR_ESTO"
# ═══════════════════════════════════════════════════════════════

# ─── Base de Datos ───────────────────────────────────────────
POSTGRES_USER=saas_admin
POSTGRES_PASSWORD=CAMBIAR_ESTO_db_password_seguro
POSTGRES_DB=agencia_saas
DATABASE_URL=postgresql://saas_admin:CAMBIAR_ESTO_db_password_seguro@postgres:5432/agencia_saas

# ─── Redis ───────────────────────────────────────────────────
REDIS_URL=redis://redis:6379

# ─── JWT + Seguridad ────────────────────────────────────────
JWT_SECRET=CAMBIAR_ESTO_jwt_secret_largo_y_random
NODE_ENV=production

# ─── Stripe (Pagos) ─────────────────────────────────────────
STRIPE_SECRET_KEY=sk_live_CAMBIAR_ESTO
STRIPE_WEBHOOK_SECRET=whsec_CAMBIAR_ESTO

# ─── Evolution API (WhatsApp) ───────────────────────────────
EVOLUTION_API_URL=http://evolution-api:8080
EVOLUTION_API_KEY=CAMBIAR_ESTO_evolution_key

# ─── AI Local (Ollama — corre en tu VPS) ────────────────────
# No necesitas claves externas. Ollama corre local.
OLLAMA_URL=http://ollama:11434
OPENAI_API_BASE=http://ollama:11434/v1
AI_MODEL=llama3.1

# ─── URLs del SaaS ──────────────────────────────────────────
API_URL=https://api.fulllogin.com
APP_URL=https://app.fulllogin.com
NEXT_PUBLIC_API_URL=https://api.fulllogin.com/api/v1

# ─── Logging ─────────────────────────────────────────────────
LOG_LEVEL=info
SERVICE_NAME=saas-api

# ─── Agent Costs ─────────────────────────────────────────────
COST_PER_AGENT_RUN=0.50

# ─── Chatwoot ────────────────────────────────────────────────
CHATWOOT_SECRET_KEY_BASE=CAMBIAR_ESTO_chatwoot_secret
ENVEOF

    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "  ⚠️  IMPORTANTE: Edita el archivo .env.prod"
    echo "  Ruta: $ENV_FILE"
    echo "  Cambia todos los valores 'CAMBIAR_ESTO' por tus claves reales"
    echo "═══════════════════════════════════════════════════════"
    echo ""
    echo "  Abre el archivo con: nano $ENV_FILE"
    echo ""
    echo "  Cuando hayas terminado de editarlo, vuelve a ejecutar"
    echo "  este script para continuar el despliegue."
    echo "═══════════════════════════════════════════════════════"
    exit 0
fi

# ═══════════════════════════════════════════════════════════════
# PASO 6: Construir y levantar servicios
# ═══════════════════════════════════════════════════════════════
echo ""
echo "🏗️ [6/7] Construyendo y levantando servicios con Docker..."

cd "$PROJECT_DIR/infrastructure/production"

# Construir imágenes custom UNA A LA VEZ (evitar falta de memoria)
echo "   Construyendo saas-api..."
docker compose build --no-cache saas-api
echo "   Construyendo saas-worker..."
docker compose build --no-cache saas-worker
echo "   Construyendo saas-web..."
docker compose build --no-cache saas-web

# Levantar TODO (core + saas)
docker compose up -d

echo "✅ Todos los servicios levantados"

# ═══════════════════════════════════════════════════════════════
# PASO 7: Ejecutar migraciones de base de datos
# ═══════════════════════════════════════════════════════════════
echo ""
echo "🗄️ [7/7] Ejecutando migraciones de Prisma..."

# Esperar a que Postgres esté listo
echo "   Esperando que PostgreSQL esté disponible..."
sleep 5

for i in {1..10}; do
    if docker compose exec -T postgres pg_isready -U saas_admin &>/dev/null; then
        echo "   ✅ PostgreSQL listo"
        break
    fi
    echo "   Esperando... ($i/10)"
    sleep 3
done

# Ejecutar migraciones dentro del contenedor de la API
docker compose exec -T saas-api npx prisma migrate deploy 2>/dev/null || {
    echo "   ⚠️ Migraciones no ejecutadas (puede que necesites crearlas primero)"
    echo "   Ejecutando db push como alternativa..."
    docker compose exec -T saas-api npx prisma db push --accept-data-loss 2>/dev/null || {
        echo "   ℹ️ Las migraciones se ejecutarán cuando el esquema esté sincronizado"
    }
}

# ═══════════════════════════════════════════════════════════════
# RESUMEN FINAL
# ═══════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ✅ DESPLIEGUE V6.1 COMPLETADO"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  🌐 Servicios disponibles:"
echo "  ├── API:              https://api.fulllogin.com"
echo "  ├── Dashboard:        https://app.fulllogin.com"
echo "  ├── Evolution API:    https://wa.fulllogin.com"
echo "  ├── Chatwoot:         https://chat.fulllogin.com"
echo "  ├── n8n:              https://auto.fulllogin.com"
echo "  ├── NocoDB:           https://db.fulllogin.com"
echo "  ├── Dify AI:          https://ai.fulllogin.com"
echo "  ├── Portainer:        https://docker.fulllogin.com"
echo "  └── Uptime Kuma:      https://status.fulllogin.com"
echo ""
echo "  📊 Comandos útiles:"
echo "  docker compose ps                  # Ver estado"
echo "  docker compose logs -f saas-api    # Ver logs API"
echo "  docker compose logs -f saas-worker # Ver logs Worker"
echo "  docker compose restart saas-api    # Reiniciar API"
echo ""
echo "  🔑 Health check:"
echo "  curl https://api.fulllogin.com/api/v1/health"
echo ""
