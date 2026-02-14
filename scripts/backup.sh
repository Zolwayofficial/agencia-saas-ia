#!/bin/bash
# =========================================
# MiNuevaLLC - Script de Backup
# Ejecutar: ./backup.sh
# Cron: 0 3 * * * /opt/agencia/scripts/backup.sh
# =========================================

set -e

# Configuración
BACKUP_DIR="/tmp/saas-backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="saas-backup-$DATE"
REMOTE="GDrive:/SaaS-Backups"  # Configurar con rclone config

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}[1/5] Creando directorio temporal...${NC}"
mkdir -p $BACKUP_DIR/$BACKUP_NAME

echo -e "${GREEN}[2/5] Exportando base de datos PostgreSQL...${NC}"
docker exec postgres pg_dumpall -U saas_admin > $BACKUP_DIR/$BACKUP_NAME/postgres_dump.sql

echo -e "${GREEN}[3/5] Comprimiendo volúmenes Docker...${NC}"
# NocoDB
docker run --rm -v agencia-saas-ia_nocodb_data:/volume -v $BACKUP_DIR/$BACKUP_NAME:/backup alpine \
  tar czf /backup/nocodb_data.tar.gz -C /volume ./

# n8n
docker run --rm -v agencia-saas-ia_n8n_data:/volume -v $BACKUP_DIR/$BACKUP_NAME:/backup alpine \
  tar czf /backup/n8n_data.tar.gz -C /volume ./

# Appsmith
docker run --rm -v agencia-saas-ia_appsmith_data:/volume -v $BACKUP_DIR/$BACKUP_NAME:/backup alpine \
  tar czf /backup/appsmith_data.tar.gz -C /volume ./

# Evolution API
docker run --rm -v agencia-saas-ia_evolution_data:/volume -v $BACKUP_DIR/$BACKUP_NAME:/backup alpine \
  tar czf /backup/evolution_data.tar.gz -C /volume ./

# Moltbot
docker run --rm -v agencia-saas-ia_moltbot_data:/volume -v $BACKUP_DIR/$BACKUP_NAME:/backup alpine \
  tar czf /backup/moltbot_data.tar.gz -C /volume ./

echo -e "${GREEN}[4/5] Comprimiendo backup completo...${NC}"
cd $BACKUP_DIR
tar czf $BACKUP_NAME.tar.gz $BACKUP_NAME
rm -rf $BACKUP_NAME

echo -e "${GREEN}[5/5] Subiendo a Google Drive...${NC}"
rclone copy $BACKUP_DIR/$BACKUP_NAME.tar.gz $REMOTE --fast-list --progress

# Limpiar backups locales
rm -f $BACKUP_DIR/$BACKUP_NAME.tar.gz

# Mantener solo últimos 7 días en la nube
rclone delete --min-age 7d $REMOTE

echo -e "${GREEN}✅ Backup completado: $BACKUP_NAME.tar.gz${NC}"
echo -e "Ubicación remota: $REMOTE"
