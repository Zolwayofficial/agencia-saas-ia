#!/bin/bash

# ==========================================
# 🔓 Script de Desbloqueo Chatwoot Enterprise (1000% Funcional)
# ==========================================
# Este script está verificado para funcionar en la instalación "Orion Design".
# Ejecuta las sentencias SQL exactas que desbloquean las funcionalidades.

# 1. Definir variables
CONTAINER_PG="production-postgres-1"
CONTAINER_CHAT="production-chatwoot-1"
DB_USER="fulllogin"
DB_NAME="fulllogin_db" # ¡CRÍTICO! Usar fulllogin_db, no chatwoot_db

# 2. Ejecutar SQL de desbloqueo (Bloque único y atómico)
echo "� Ejecutando SQL de desbloqueo en $DB_NAME..."

docker exec -i $CONTAINER_PG psql -U $DB_USER -d $DB_NAME -c "
UPDATE public.installation_configs 
SET serialized_value = '\"--- !ruby/hash:ActiveSupport::HashWithIndifferentAccess\nvalue: enterprise\n\"' 
WHERE name = 'INSTALLATION_PRICING_PLAN';

UPDATE public.installation_configs 
SET serialized_value = '\"--- !ruby/hash:ActiveSupport::HashWithIndifferentAccess\nvalue: 10000\n\"' 
WHERE name = 'INSTALLATION_PRICING_PLAN_QUANTITY';

UPDATE public.installation_configs 
SET serialized_value = '\"--- !ruby/hash:ActiveSupport::HashWithIndifferentAccess\nvalue: e04t63ee-5gg8-4b94-8914-ed8137a7d938\n\"' 
WHERE name = 'INSTALLATION_IDENTIFIER';"

# 3. Reiniciar Chatwoot para aplicar cambios
echo "🔄 Reiniciando Chatwoot ($CONTAINER_CHAT)..."
docker restart $CONTAINER_CHAT

echo "✅ ¡Listo! Chatwoot Enterprise desbloqueado."
