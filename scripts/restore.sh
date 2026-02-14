#!/bin/bash
# =========================================
# MiNuevaLLC - Script de Restauración
# Ejecutar: ./restore.sh backup-file.tar.gz
# =========================================

set -e

if [ -z "$1" ]; then
  echo "Uso: ./restore.sh <archivo-backup.tar.gz>"
  echo ""
  echo "Backups disponibles en Google Drive:"
  rclone ls GDrive:/SaaS-Backups/
  exit 1
fi

BACKUP_FILE=$1
RESTORE_DIR="/tmp/saas-restore"
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${RED}⚠️  ADVERTENCIA: Esto sobrescribirá todos los datos actuales.${NC}"
read -p "¿Continuar? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Cancelado."
  exit 0
fi

echo -e "${GREEN}[1/6] Descargando backup...${NC}"
mkdir -p $RESTORE_DIR
if [[ $BACKUP_FILE == http* ]] || [[ $BACKUP_FILE == GDrive:* ]]; then
  rclone copy $BACKUP_FILE $RESTORE_DIR
  BACKUP_FILE=$(ls $RESTORE_DIR/*.tar.gz | head -1)
else
  cp $BACKUP_FILE $RESTORE_DIR/
fi

echo -e "${GREEN}[2/6] Descomprimiendo...${NC}"
cd $RESTORE_DIR
tar xzf $(basename $BACKUP_FILE)
BACKUP_DIR=$(ls -d */ | head -1)

echo -e "${GREEN}[3/6] Deteniendo servicios...${NC}"
cd /opt/agencia/docker
docker-compose down

echo -e "${GREEN}[4/6] Restaurando base de datos...${NC}"
docker-compose up -d postgres
sleep 10
cat $RESTORE_DIR/$BACKUP_DIR/postgres_dump.sql | docker exec -i postgres psql -U saas_admin

echo -e "${GREEN}[5/6] Restaurando volúmenes...${NC}"
for vol in nocodb n8n appsmith evolution moltbot; do
  if [ -f "$RESTORE_DIR/$BACKUP_DIR/${vol}_data.tar.gz" ]; then
    docker run --rm -v agencia-saas-ia_${vol}_data:/volume -v $RESTORE_DIR/$BACKUP_DIR:/backup alpine \
      sh -c "rm -rf /volume/* && tar xzf /backup/${vol}_data.tar.gz -C /volume"
    echo "  ✅ $vol restaurado"
  fi
done

echo -e "${GREEN}[6/6] Iniciando servicios...${NC}"
docker-compose up -d

# Limpiar
rm -rf $RESTORE_DIR

echo -e "${GREEN}✅ Restauración completada${NC}"
echo "Verifica los servicios con: docker-compose ps"
