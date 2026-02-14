# Investigación Técnica Profunda: SaaS Multi-Inquilino

> **Última actualización:** 2026-02-04  
> **Fuente:** Análisis exhaustivo de integración y despliegue

---

## 1. Decisiones Finales Confirmadas

| Componente | Decisión | Razón |
|------------|----------|-------|
| **Dashboard** | Appsmith | JavaScript profundo, 4GB RAM, GAC integrado |
| **Multi-tenancy** | Row-Level Security | Un solo schema, filtro por `tenant_id` |
| **IA Model** | Llama 3.1 8B Q4_K_M | Cuantizado 4-bit, ~5.7GB RAM total |
| **VPS** | Hetzner o Contabo | NVMe + RAM económica |

---

## 2. Distribución de RAM Revisada (12GB)

| Componente | RAM Asignada |
|------------|--------------|
| Sistema Operativo | 1 GB |
| **Appsmith** | **4 GB** |
| **Ollama (Llama 3.1 Q4)** | **4 GB** (límite estricto) |
| n8n + NocoDB | 2 GB |
| Evolution API + Dify | 1 GB |
| **Total** | **12 GB** ✅ |

> ⚠️ **Importante:** Configurar partición SWAP de 4GB para picos de memoria.

---

## 3. Requisitos de RAM para Llama 3.1 8B

| Componente | Q4 (4-bit) | Q8 (8-bit) |
|------------|------------|------------|
| Pesos del modelo | ~4.7 GB | ~8.5 GB |
| Context Window (8k) | ~0.5 GB | ~1.0 GB |
| Overhead inferencia | ~0.5 GB | ~0.8 GB |
| **Total** | **~5.7 GB** | ~10.3 GB |

**Decisión:** Usar Q4_K_M para mantener consumo bajo 6GB.

---

## 4. Estrategia Multi-Tenancy: Row-Level Security

### Estructura de Datos

```sql
-- Todas las tablas incluyen tenant_id
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255),
    tenant_id INTEGER REFERENCES revendedores(id),  -- Clave de aislamiento
    saldo DECIMAL(10,2),
    ...
);
```

### Consultas Filtradas

```javascript
// En Appsmith, SIEMPRE filtrar por tenant_id
SELECT * FROM clientes 
WHERE tenant_id = {{appsmith.store.tenantId}}
```

---

## 5. Seguridad: Nunca Exponer API Keys

### ❌ INCORRECTO (API Key en frontend)

```javascript
// PELIGROSO: La key es visible en el navegador
fetch('https://nocodb.example.com/api', {
    headers: { 'xc-token': 'mi-api-key-secreta' }
})
```

### ✅ CORRECTO (Datasource en servidor Appsmith)

```
1. Crear Datasource en Appsmith (server-side)
2. Appsmith añade el token en el servidor
3. Solo los datos llegan al navegador
```

### ✅ MÁS SEGURO (n8n como proxy)

```
Dashboard → n8n (valida JWT) → NocoDB
                ↓
         Respuesta filtrada
```

---

## 6. Advertencia de Licenciamiento n8n

> ⚠️ **"Sustainable Use License"** de n8n prohíbe:
>
> - Ofrecer n8n como servicio gestionado
> - Cobrar por acceso directo a funcionalidades de n8n

### Solución

- Usar n8n como motor **interno** de automatización
- Los clientes NO ven ni acceden a n8n directamente
- Solo interactúan con dashboards/bots
- Si necesitas exponer flujos a usuarios → Licencia "Embed"

---

## 7. Flujo de Comisiones en n8n

```
1. Webhook → Stripe confirma pago ($V)
           ↓
2. Consulta → Buscar cadena de revendedores en NocoDB
           ↓
3. Cálculo → Loop por cada nivel:
   - Nivel 1: C₁ = V × R₁ (tasa revendedor directo)
   - Nivel 2: C₂ = V × R₂ (tasa del "padre")
           ↓
4. Registro → Insertar en tabla "Historial_Comisiones"
           ↓
5. Update → Actualizar balance acumulado del revendedor
```

---

## 8. Flujo de IA con Dify

```
1. WhatsApp → Evolution API recibe mensaje
           ↓
2. Webhook → n8n recibe y busca config del bot en NocoDB
           ↓
3. Proceso → n8n envía a Dify con contexto del cliente
           ↓
4. IA → Dify consulta Ollama (Llama 3.1 local)
           ↓
5. RAG → Dify busca en base de conocimiento específica
           ↓
6. Respuesta → n8n ordena a Evolution API enviar respuesta
```

---

## 9. Gestión de Contenedores Docker

### Prioridad OOM (Out of Memory)

Configurar para que Linux mate procesos en este orden:

1. **Primero:** Ollama (IA puede reiniciarse)
2. **Después:** Evolution API
3. **Nunca:** NocoDB (datos críticos)
4. **Nunca:** n8n (flujos activos)

```yaml
# docker-compose.yml
services:
  ollama:
    deploy:
      resources:
        limits:
          memory: 4G  # Límite estricto
```

---

## 10. Proveedores de VPS Recomendados

| Proveedor | RAM | CPU | Precio | Notas |
|-----------|-----|-----|--------|-------|
| **Contabo** | 16GB | 6 vCPU | ~$15/mes | Mejor precio/RAM |
| **Hetzner CPX** | 16GB | 4 vCPU | ~$20/mes | AMD EPYC, baja latencia |
| **Netcup** | 16GB | 8 vCPU | ~$18/mes | CPU garantizada |

**Recomendación:** Hetzner para mejor latencia en inferencia IA.

---

## 11. Hoja de Ruta de Implementación

| Fase | Tarea | Duración |
|------|-------|----------|
| 1 | VPS + Docker + SWAP 4GB | 1 día |
| 2 | NocoDB + PostgreSQL + tablas con tenant_id | 2 días |
| 3 | Nginx Proxy Manager + SSL Let's Encrypt | 1 día |
| 4 | n8n + flujos Evolution API + Dify | 1 semana |
| 5 | Ollama + Llama 3.1 Q4_K_M | 1 día |
| 6 | Appsmith (3 dashboards) | 2-3 semanas |
| 7 | Testing + optimización | 1 semana |
| **Total** | | **4-5 semanas** |

---

## 12. Conclusiones Clave

1. ✅ **Appsmith** es la mejor opción (4GB RAM, JavaScript profundo, GAC)
2. ✅ **Row-Level Security** para multi-tenancy (tenant_id en todas las tablas)
3. ✅ **Llama 3.1 Q4_K_M** para mantener IA bajo 6GB
4. ⚠️ **n8n** debe usarse como motor interno, no expuesto a clientes
5. ✅ **Swap 4GB** obligatorio para prevenir OOM
6. ✅ **Hetzner/Contabo** para mejor precio/rendimiento
