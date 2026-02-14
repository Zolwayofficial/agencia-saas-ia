#!/bin/bash
# =========================================
# backup-total.sh - Backup Completo
# MiNuevaLLC - Agencia SaaS IA
# =========================================

set -e

# Variables
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="${BACKUP_DIR}/backup_${DATE}"

echo "🔄 Iniciando backup completo..."

# Crear directorio de backup
mkdir -p "${BACKUP_PATH}"

# Backup de PostgreSQL
echo "📦 Backup de PostgreSQL..."
docker exec postgres pg_dumpall -U user > "${BACKUP_PATH}/postgres_all.sql"

# Backup de volúmenes Docker
echo "📦 Backup de volúmenes..."
docker run --rm \
    -v agencia-saas-ia_chatwoot_data:/data \
    -v "${BACKUP_PATH}:/backup" \
    alpine tar czf /backup/chatwoot_data.tar.gz /data

docker run --rm \
    -v agencia-saas-ia_n8n_data:/data \
    -v "${BACKUP_PATH}:/backup" \
    alpine tar czf /backup/n8n_data.tar.gz /data

docker run --rm \
    -v agencia-saas-ia_evolution_data:/data \
    -v "${BACKUP_PATH}:/backup" \
    alpine tar czf /backup/evolution_data.tar.gz /data

docker run --rm \
    -v agencia-saas-ia_qdrant_data:/data \
    -v "${BACKUP_PATH}:/backup" \
    alpine tar czf /backup/qdrant_data.tar.gz /data

# Backup de archivos de configuración
echo "📦 Backup de configuración..."
cp /root/agencia-saas-ia/.env.production "${BACKUP_PATH}/"
cp -r /root/agencia-saas-ia/infrastructure/gateway "${BACKUP_PATH}/"

# Comprimir todo
echo "📦 Comprimiendo backup final..."
cd "${BACKUP_DIR}"
tar czf "backup_${DATE}.tar.gz" "backup_${DATE}"
rm -rf "backup_${DATE}"

# Limpiar backups antiguos (mantener últimos 7)
echo "🧹 Limpiando backups antiguos..."
ls -t "${BACKUP_DIR}"/backup_*.tar.gz | tail -n +8 | xargs -r rm

echo ""
echo "✅ Backup completado: ${BACKUP_DIR}/backup_${DATE}.tar.gz"
echo ""
