# 🔓 Desbloqueo de Chatwoot Enterprise (Hack)

Este script permite desbloquear las funcionalidades **Enterprise** de Chatwoot (Reportes, SLAs, Gestión de Agentes, etc.) modificando directamente la base de datos de configuración.

> **IMPORTANTE:** Este método es para uso educativo y de pruebas en entornos self-hosted.

## 🛠️ Requisitos Previos

1. Tener acceso SSH al servidor VPS.
2. Tener Docker instalado y Chatwoot corriendo.
3. **CRÍTICO:** Asegurarse de usar la base de datos correcta. En nuestra instalación (Orion Design / Full Login), la base de datos se llama **`fulllogin_db`**, NO `chatwoot_db`.

## 🚀 Script de Desbloqueo Automático

Hemos creado un script en la carpeta `scripts/` llamado `unlock_chatwoot_enterprise.sh` que hace todo el trabajo sucio.

### Pasos Manuales (si prefieres hacerlo tú mismo)

Ejecuta los siguientes comandos dentro de tu servidor VPS:

```bash
# 1. Definir contraseña de Postgres (para evitar prompts)
export PGPASSWORD='QJ0SYYiOpH1+3qtOABpxNSpi86RIt+7i'

# 2. Desbloquear Enterprise (usando fulllogin_db)
# IMPORTANTE: Usamos -d fulllogin_db porque ahí están las tablas de instalación
docker exec -e PGPASSWORD=$PGPASSWORD -i production-postgres-1 psql -U fulllogin -d fulllogin_db -c "UPDATE public.installation_configs SET serialized_value = '\"--- !ruby/hash:ActiveSupport::HashWithIndifferentAccess\nvalue: enterprise\n\"' WHERE name = 'INSTALLATION_PRICING_PLAN';"

# 3. Aumentar límite de agentes a 10,000
docker exec -e PGPASSWORD=$PGPASSWORD -i production-postgres-1 psql -U fulllogin -d fulllogin_db -c "UPDATE public.installation_configs SET serialized_value = '\"--- !ruby/hash:ActiveSupport::HashWithIndifferentAccess\nvalue: 10000\n\"' WHERE name = 'INSTALLATION_PRICING_PLAN_QUANTITY';"

# 4. Establecer Identificador de Instalación (necesario para validar licencia)
docker exec -e PGPASSWORD=$PGPASSWORD -i production-postgres-1 psql -U fulllogin -d fulllogin_db -c "UPDATE public.installation_configs SET serialized_value = '\"--- !ruby/hash:ActiveSupport::HashWithIndifferentAccess\nvalue: e04t63ee-5gg8-4b94-8914-ed8137a7d938\n\"' WHERE name = 'INSTALLATION_IDENTIFIER';"

# 5. Reiniciar Chatwoot para aplicar cambios
docker restart production-chatwoot-1
```

## ✅ Verificación

1. Espera unos 30-60 segundos tras el reinicio.
2. Entra a tu panel de Chatwoot.
3. Ve a **Ajustes** -> **Información del sistema** o intenta acceder a **Reportes**. Si cargas los reportes avanzados, ¡felicidades! Ya eres Enterprise.
