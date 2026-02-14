# Arquitectura de Datos: KPIs y Analytics

> **Propósito:** Definir el esquema de base de datos y consultas SQL para alimentar el Dashboard Ejecutivo en Metabase sin sobrecargar el VPS.

---

## 1. Esquema de Base de Datos (NocoDB/Postgres)

Para soportar analítica avanzada, necesitamos estas 3 tablas optimizadas.

### Tabla A: `analytics_events` (Serie Temporal)

Registra cada evento granular. Se usa para métricas volumétricas.

| Columna | Tipo | Descripción | Indexado |
|---------|------|-------------|----------|
| `id` | UUID | Primary Key | ✅ |
| `timestamp` | TIMESTAMPTZ | Fecha y hora exacta | ✅ |
| `tenant_id` | UUID | ID del cliente (SaaS) | ✅ |
| `event_type` | VARCHAR(50) | `msg_sent`, `msg_recv`, `ai_failed` | ✅ |
| `channel` | VARCHAR(20) | `whatsapp`, `telegram`, `discord`, `instagram` | |
| `tokens_used` | INTEGER | Costo computacional | |
| `latency_ms` | INTEGER | Tiempo de respuesta IA | |

### Tabla B: `conversations_summary` (Calidad)

Una fila por sesión/conversación. Se usa para medir calidad y contención.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `conversation_id` | UUID | Primary Key |
| `tenant_id` | UUID | Cliente |
| `status` | VARCHAR | `handled_by_ai`, `human_handoff` |
| `sentiment_score` | FLOAT | -1.0 (Negativo) a 1.0 (Positivo) |
| `turns_count` | INTEGER | Cantidad de mensajes |
| `cost_usd` | DECIMAL | Costo estimado de la sesión |

### Tabla C: `subscription_audit` (Negocio)

Registro inmutable de movimientos financieros.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID | Primary Key |
| `tenant_id` | UUID | Cliente |
| `type` | VARCHAR | `new_sub`, `churn`, `upgrade` |
| `mrr_delta` | DECIMAL | Cambio en el MRR (+$49, -$99) |
| `created_at` | TIMESTAMPTZ | Fecha del movimiento |

---

## 2. Consultas SQL para Metabase

Copia y pega estas queries en Metabase.

### KPI 1: Tasa de Contención AI (Global)

*Qué % de chats resolvió la IA sin humanos.*

```sql
SELECT 
    date_trunc('day', created_at) AS fecha,
    COUNT(*) FILTER (WHERE status = 'handled_by_ai') * 100.0 / COUNT(*) AS tasa_contencion
FROM conversations_summary
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY 1
ORDER BY 1;
```

### KPI 2: Volumen de Mensajes por Canal

*Carga del sistema por red social.*

```sql
SELECT 
    channel,
    COUNT(*) as total_msgs
FROM analytics_events
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY channel;
```

### KPI 3: MRR Cohorts (Crecimiento Real)

*Crecimiento neto de ingresos mensuales.*

```sql
SELECT 
    date_trunc('month', created_at) AS mes,
    SUM(mrr_delta) OVER (ORDER BY date_trunc('month', created_at)) as mrr_total
FROM subscription_audit
ORDER BY mes;
```

---

## 3. Recomendación de Infraestructura

Dado que activaremos Metabase + Postgres con carga analítica:

1. **Indexación:** Es CRÍTICO crear índices en `timestamp` y `tenant_id`. Sin esto, el dashboard será lento.
2. **RAM:** Metabase consume Java Heap. En un VPS de 12GB, configura `MB_JAVA_MX=1024m` (1GB máximo) en Docker.
3. **Read Replicas:** Si crecen a >100 clientes, necesitaremos mover Metabase a un servidor separado o usar una réplica de lectura de Postgres.
