# Soluciones de Riesgo a Costo $0: MiNuevaLLC

> **Última actualización:** 2026-02-04  
> **Costo total:** $0/mes

---

## Resumen de Soluciones

| Problema | Solución | Costo |
|----------|----------|-------|
| VPS único (punto de falla) | rclone + Google Drive | $0 |
| Ollama lento bajo carga | Fallback a Groq API | $0 |
| Sin rate limiting | Contador en NocoDB + n8n | $0 |
| Appsmith lento | Paginación + índices | $0 |
| Sin monitoreo | Uptime Kuma (~50MB RAM) | $0 |

---

## 1. Backups Automáticos (rclone + Google Drive)

### Instalación

```bash
curl https://rclone.org/install.sh | sudo bash
rclone config
# Tipo: Google Drive, dejar client_id vacío
```

### Script de Backup (/root/backup-docker.sh)

```bash
#!/bin/bash
BACKUP_DIR="/tmp/docker-backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="saas-backup-$DATE"

mkdir -p $BACKUP_DIR/$BACKUP_NAME

# Backup de cada volumen
for vol in nocodb n8n appsmith evolution ollama; do
  docker run --rm \
    -v ${vol}_data:/volume \
    -v $BACKUP_DIR/$BACKUP_NAME:/backup \
    alpine tar czf /backup/${vol}.tar.gz -C /volume ./
done

# Backup de docker-compose
cp /root/docker-compose.yml $BACKUP_DIR/$BACKUP_NAME/

# Comprimir y subir
cd $BACKUP_DIR
tar czf $BACKUP_NAME.tar.gz $BACKUP_NAME
rclone copy $BACKUP_NAME.tar.gz GDrive:/SaaS-Backups/

# Limpiar local y mantener 7 días en Drive
rm -rf $BACKUP_DIR
rclone delete --min-age 7d GDrive:/SaaS-Backups/
```

### Cron (diario 3 AM)

```bash
chmod +x /root/backup-docker.sh
crontab -e
# Agregar: 0 3 * * * /root/backup-docker.sh >> /var/log/backup.log 2>&1
```

---

## 2. Ollama Fallback a Groq

### Variables de Entorno Ollama

```yaml
services:
  ollama:
    environment:
      - OLLAMA_NUM_PARALLEL=2
      - OLLAMA_MAX_LOADED_MODELS=1
      - OLLAMA_KEEP_ALIVE=5m
```

### Lógica en n8n

```javascript
// Medir latencia de Ollama
const startTime = Date.now();
const ollamaResponse = await fetch('http://ollama:11434/api/tags');
const latency = Date.now() - startTime;

// Si latencia > 2s, usar Groq
if (latency > 2000 || ollamaResponse.error) {
  // Redirigir a Groq API
  return { provider: 'groq', url: 'https://api.groq.com/openai/v1/chat/completions' };
} else {
  return { provider: 'ollama', url: 'http://ollama:11434/api/generate' };
}
```

### Límites Groq Free Tier

- 14,400 requests/día
- 7,000 tokens/minuto
- Modelo: `llama-3.1-8b-instant`

---

## 3. Rate Limiting en n8n

### Tabla NocoDB: partner_usage

| Campo | Tipo | Default |
|-------|------|---------|
| partner_id | texto | - |
| hourly_count | número | 0 |
| daily_count | número | 0 |
| hour_reset | fecha | - |
| day_reset | fecha | - |

### Lógica de Verificación

```javascript
const usage = await getPartnerUsage(partnerId);
const hourlyLimit = 100;
const dailyLimit = 1000;

if (usage.hourly_count >= hourlyLimit || usage.daily_count >= dailyLimit) {
  return { blocked: true, error: 'Rate limit exceeded' };
}

// Incrementar contador
await updateUsage(partnerId, usage.hourly_count + 1, usage.daily_count + 1);
```

### Reset Automático (Cron n8n cada hora)

```javascript
// Resetear hourly_count a 0 para todos los partners
await nocodb.patch('/partner_usage', { hourly_count: 0 });
```

---

## 4. Appsmith Optimización

### Query Paginada

```sql
SELECT * FROM mi_tabla
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT {{ Table1.pageSize }}
OFFSET {{ (Table1.pageNo - 1) * Table1.pageSize }}
```

### Índices PostgreSQL

```sql
-- Conectar: docker exec -it nocodb-postgres psql -U postgres -d nocodb

CREATE INDEX idx_tabla_status ON mi_tabla(status);
CREATE INDEX idx_tabla_status_created ON mi_tabla(status, created_at DESC);
CREATE INDEX idx_tabla_active_only ON mi_tabla(created_at DESC) WHERE status = 'active';
ANALYZE mi_tabla;
```

### Lazy Loading con Debounce

```javascript
// En onSearchTextChanged del Table widget
debounce(() => {
  GetPaginatedData.run({ search: Table1.searchText });
}, 500)
```

---

## 5. Monitoreo con Uptime Kuma

### docker-compose.yml

```yaml
services:
  uptime-kuma:
    image: louislam/uptime-kuma:1
    container_name: uptime-kuma
    volumes:
      - uptime-kuma-data:/app/data
    ports:
      - "3001:3001"
    restart: unless-stopped
    mem_limit: 256m

  autoheal:
    image: willfarrell/autoheal:latest
    container_name: autoheal
    restart: unless-stopped
    environment:
      - AUTOHEAL_CONTAINER_LABEL=all
      - AUTOHEAL_INTERVAL=30
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

### Healthchecks para Servicios

```yaml
services:
  nocodb:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  n8n:
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:5678/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3

  ollama:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:11434/api/tags"]
      interval: 60s
      timeout: 10s
      retries: 3
      start_period: 120s
```

### Script de Recursos (/root/check-resources.sh)

```bash
#!/bin/bash
RAM=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'.' -f1)
DISK=$(df -h / | tail -1 | awk '{print $5}' | cut -d'%' -f1)

[ $RAM -gt 85 ] && echo "⚠️ RAM: ${RAM}%" && exit 1
[ $CPU -gt 80 ] && echo "⚠️ CPU: ${CPU}%" && exit 1
[ $DISK -gt 80 ] && echo "⚠️ Disco: ${DISK}%" && exit 1

echo "✅ OK - RAM:${RAM}% CPU:${CPU}% Disco:${DISK}%"
```

### Alertas Telegram

1. Crear bot con @BotFather
2. Obtener Chat ID con @userinfobot
3. Configurar en Uptime Kuma > Settings > Notifications

---

## Comparativa RAM de Monitoreo

| Herramienta | RAM | Recomendación |
|-------------|-----|---------------|
| **Uptime Kuma** | ~50MB | ✅ Elegida |
| Glances | ~30MB | Alternativa mínima |
| Netdata | ~200MB | Excesivo |
| Prometheus+Grafana | ~400MB | Excesivo |

---

## Plan de Implementación

| Día | Tarea | Tiempo |
|-----|-------|--------|
| 1 | Backups + healthchecks | 2-3 hrs |
| 2 | Uptime Kuma + alertas | 1 hr |
| 3 | Rate limiting + índices | 2 hrs |
| 4 | Ollama fallback a Groq | 1.5 hrs |

---

## Verificación Rápida

```bash
# Estado de contenedores
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.State}}"

# Consumo de recursos
docker stats --no-stream

# Logs de backups
tail -f /var/log/backup.log

# Verificar healthchecks
docker inspect <container> | grep -A 10 Health

# Espacio en disco
df -h

# RAM disponible
free -h
```
