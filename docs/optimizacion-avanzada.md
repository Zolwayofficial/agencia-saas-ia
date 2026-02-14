# Optimización Avanzada y Alta Disponibilidad: MiNuevaLLC

> **Última actualización:** 2026-02-04  
> **Costo adicional:** $0

---

## 1. Resumen de Mejoras vs Documento Anterior

| Área | Solución Anterior | Mejora Avanzada |
|------|-------------------|-----------------|
| Backups | rclone + Google Drive | + Cifrado con rclone crypt + Backblaze B2 |
| Monitoreo | Uptime Kuma (~100MB) | + Netdata (~15MB) para métricas de sistema |
| Rate Limiting | Contador simple | + Bloqueo temporal automático |
| Appsmith | Paginación básica | + Índices GIN con trigram para búsquedas |
| Ollama | Fallback simple | + Fórmula de latencia + pausa de flujos |

---

## 2. Backups con Cifrado (Backblaze B2)

### Configuración de rclone crypt

```bash
rclone config
# 1. Crear remote "b2" (tipo backblaze b2)
# 2. Crear remote "b2-crypt" (tipo crypt, apuntando a b2:bucket)
```

### Script de Backup Optimizado

```bash
#!/bin/bash
BACKUP_LOCAL="/opt/backups/tmp"
REMOTE="b2-crypt:agencia-backup"
DATE=$(date +%Y-%m-%d)

mkdir -p $BACKUP_LOCAL

# Dump de PostgreSQL (NocoDB)
docker exec nocodb_db pg_dump -U postgres > $BACKUP_LOCAL/nocodb_$DATE.sql

# Comprimir volúmenes
tar -czf $BACKUP_LOCAL/volumes_$DATE.tar.gz \
  /var/lib/docker/volumes/agencia_*/_data

# Sincronizar con cifrado
rclone move $BACKUP_LOCAL $REMOTE/weekly \
  --fast-list \
  --transfers 4 \
  --b2-hard-delete

# Limpiar locales > 7 días
find /opt/backups/tmp -mtime +7 -exec rm {} \;
```

### Backblaze B2 Free Tier

- **10GB gratis** de almacenamiento
- Configurar lifecycle para eliminar versiones antiguas

---

## 3. Monitoreo con Netdata (15MB RAM)

### Por qué Netdata sobre Uptime Kuma

| Herramienta | RAM | Granularidad | Uso |
|-------------|-----|--------------|-----|
| **Netdata** | ~15MB | 1 segundo | Métricas de sistema |
| Uptime Kuma | ~100MB | 30-60 seg | Disponibilidad HTTP |

**Recomendación:** Usar Netdata para VPS + Uptime Kuma light para URLs (~115MB total).

### Instalación

```bash
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

### Alertas Telegram

```bash
sudo /etc/netdata/edit-config health_alarm_notify.conf
# Activar: SEND_TELEGRAM="YES"
# Agregar: TELEGRAM_BOT_TOKEN y DEFAULT_RECIPIENT_TELEGRAM
```

---

## 4. Fórmula de Latencia de Ollama

La latencia de inferencia se modela como:

$$L = \frac{N_t}{P_s} + T_o$$

Donde:

- $L$ = Latencia total
- $N_t$ = Número de tokens generados
- $P_s$ = Capacidad de procesamiento (tokens/seg)
- $T_o$ = Tiempo de carga del modelo

### Umbrales de Acción

| Métrica | Umbral | Acción en n8n |
|---------|--------|---------------|
| Latencia | > 45s | Redirigir a Groq |
| CPU Ollama | > 90% constante | Pausar flujos no esenciales |
| Error 503/404 | Cualquiera | Fallback inmediato |

### Configuración n8n

```
N8N_WORKFLOWS_DEFAULT_CONCURRENCY=2
```

Limita a 2 flujos de IA en paralelo.

---

## 5. Rate Limiting con Bloqueo Temporal

### Tabla NocoDB: partner_consumption

| Campo | Tipo | Uso |
|-------|------|-----|
| partner_id | texto | Identificador |
| hourly_counter | número | Mensajes esta hora |
| daily_counter | número | Mensajes hoy |
| blocked_until | fecha | Fecha desbloqueo |

### Lógica de Bloqueo

```javascript
// En n8n - nodo Code
const consumption = await getPartnerConsumption(partnerId);

// Verificar si está bloqueado
if (consumption.blocked_until && new Date() < consumption.blocked_until) {
  return { blocked: true, reason: 'Cooling down' };
}

// Verificar límites
if (consumption.hourly_counter >= 100) {
  // Bloquear por 15 minutos
  await setBlockedUntil(partnerId, new Date(Date.now() + 15 * 60 * 1000));
  return { blocked: true, reason: 'Rate limit exceeded' };
}
```

### Reset Automático (Cron SQL)

```sql
-- Ejecutar cada hora: 0 * * * *
UPDATE partner_consumption SET hourly_counter = 0;
```

---

## 6. Índices PostgreSQL Avanzados

### Tipos de Índice por Uso

| Escenario | Columna | Tipo de Índice |
|-----------|---------|----------------|
| Filtro por socio | partner_id | B-Tree |
| Ordenación fecha | created_at | B-Tree DESC |
| Búsqueda texto | customer_name | GIN + pg_trgm |

### Crear Índices

```sql
-- Conectar a PostgreSQL
docker exec -it nocodb_db psql -U postgres

-- Índice básico
CREATE INDEX idx_leads_partner ON leads(partner_id);

-- Índice para ordenamiento
CREATE INDEX idx_leads_created ON leads(created_at DESC);

-- Índice para búsqueda parcial (LIKE '%texto%')
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_leads_name_trgm ON leads 
  USING GIN(customer_name gin_trgm_ops);
```

---

## 7. Query Appsmith Optimizada

```sql
SELECT * FROM leads 
WHERE status = 'active'
  AND partner_id = {{appsmith.store.partnerId}}
  AND customer_name ILIKE '%{{Table1.searchText}}%'
ORDER BY created_at DESC
LIMIT {{Table1.pageSize}} 
OFFSET {{Table1.pageOffset}};
```

---

## 8. Healthchecks Docker Avanzados

```yaml
services:
  n8n:
    image: n8nio/n8n
    restart: always
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:5678/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s  # Crítico: permite inicialización lenta
```

> **start_period** de 60s evita reinicios falsos durante el arranque.

---

## 9. Secuencia de Recuperación ante Desastre

1. **Provisionar nuevo VPS** (Contabo/Hetzner)
2. **Instalar Docker + rclone**
3. **Descargar backups:** `rclone copy b2-crypt:agencia-backup /restore`
4. **Restaurar volúmenes:** `tar -xzf volumes_*.tar.gz -C /`
5. **Restaurar BD:** `cat nocodb_*.sql | docker exec -i nocodb_db psql -U postgres`
6. **Levantar:** `docker-compose up -d`

**RTO estimado:** 30-60 minutos

---

## 10. Distribución Final de RAM

| Componente | RAM |
|------------|-----|
| Sistema Operativo | 1 GB |
| Appsmith | 4 GB |
| Ollama (Llama Q4) | 4 GB |
| n8n + NocoDB | 2 GB |
| Evolution + Dify | 800 MB |
| **Netdata** | **15 MB** |
| **Uptime Kuma** | **100 MB** |
| **Buffer** | ~100 MB |
| **Total** | **~12 GB** ✅ |
