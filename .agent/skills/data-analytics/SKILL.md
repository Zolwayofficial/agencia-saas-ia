---
name: Análisis de Datos y KPIs (data-analytics)
description: Define cómo rastrear, consultar y visualizar métricas de negocio del SaaS (MRR, churn, contención IA, volumen de mensajes) usando PostgreSQL, Metabase y los scripts Python existentes.
---

# Habilidad: Análisis de Datos y KPIs

## 1. Métricas Clave del Negocio

| KPI | Qué mide | Fórmula |
|-----|----------|---------|
| **MRR** | Ingreso Mensual Recurrente | Suma de todas las suscripciones activas |
| **Churn Rate** | Tasa de cancelación | Clientes perdidos / Total clientes × 100 |
| **LTV** | Valor de vida del cliente | MRR promedio / Churn rate |
| **Tasa de Contención IA** | % de chats resueltos sin humano | Chats IA / Total chats × 100 |
| **CAC** | Costo de adquisición | $0 (modelo de referidos, sin ads) |

## 2. Tablas Analíticas (PostgreSQL)

El proyecto define 3 tablas especializadas en `docs/analitica-kpis.md`:

- **`analytics_events`** — Serie temporal de eventos (msg_sent, msg_recv, ai_failed). Indexar por `timestamp` y `tenant_id`.
- **`conversations_summary`** — Calidad por conversación (sentiment_score, human_handoff).
- **`subscription_audit`** — Movimientos financieros (new_sub, churn, upgrade, mrr_delta).

## 3. Scripts Python de Análisis

Ubicados en `infrastructure/images/openclaw-runner/skills/`:

- **`data_analyzer.py`** — Analiza datos crudos de la DB y genera insights.
- **`chart_generator.py`** — Genera gráficos (barras, líneas, pie) a partir de datasets.

Estos scripts son ejecutados por los agentes OpenClaw dentro de jaulas Docker aisladas.

## 4. Queries SQL Útiles

### MRR Total Histórico

```sql
SELECT 
    date_trunc('month', created_at) AS mes,
    SUM(mrr_delta) OVER (ORDER BY date_trunc('month', created_at)) as mrr_total
FROM subscription_audit ORDER BY mes;
```

### Contención IA (últimos 30 días)

```sql
SELECT 
    date_trunc('day', created_at) AS fecha,
    COUNT(*) FILTER (WHERE status = 'handled_by_ai') * 100.0 / COUNT(*) AS tasa
FROM conversations_summary
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY 1 ORDER BY 1;
```

### Volumen por canal (últimas 24h)

```sql
SELECT channel, COUNT(*) as total
FROM analytics_events
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY channel;
```

## 5. Dashboard (Web)

- **Ruta:** `apps/web/src/app/dashboard/kpis/`
- **Metabase:** Se recomienda como herramienta de BI. Configurar con `MB_JAVA_MX=1024m` en Docker para limitar RAM.

> [!TIP]
> Si el VPS tiene menos de 8GB de RAM, no instales Metabase en el mismo servidor. Usa las queries SQL directamente en el dashboard built-in de Next.js.
