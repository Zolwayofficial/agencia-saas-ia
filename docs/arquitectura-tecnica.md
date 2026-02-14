# Arquitectura Técnica: Agencia SaaS MiNuevaLLC

> **Dominio:** minuevallc.com  
> **Última actualización:** 2026-02-04

---

## 1. Infraestructura Base

| Componente | Especificación | Costo/mes |
|------------|----------------|-----------|
| **VPS** | Contabo 6 vCPU / 12GB RAM / 200GB SSD | ~$12-15 |
| **Backup** | Contabo Backup | $1 |
| **DNS + WAF** | Cloudflare Free | $0 |
| **SSL** | Nginx Proxy Manager (Let's Encrypt) | $0 |
| **Total Infraestructura** | | **~$13-16** |

### Subdominios

- `db.minuevallc.com` → NocoDB
- `n8n.minuevallc.com` → n8n
- `api.minuevallc.com` → Evolution API
- `dify.minuevallc.com` → Dify
- `chat.minuevallc.com` → Chatwoot

---

## 2. Stack de Inteligencia Artificial

### Estrategia Zero-Cost con Fallback

```
Prioridad 1: Ollama (local)           → $0, ilimitado
Prioridad 2: Groq Free Tier           → $0, 14,400 req/día
Prioridad 3: Cloudflare Workers AI    → $0, 10,000 req/día
Prioridad 4: Google AI Studio         → $0, 1,500 req/día
```

### Modelos

| Función | Modelo | Ejecución | RAM |
|---------|--------|-----------|-----|
| **Cerebro (LLM)** | Llama 3.1 8B | Ollama (Docker) | ~6GB |
| **Voz (TTS)** | Kokoro-82M | Local (Docker) | ~1GB |
| **Oído (STT)** | Whisper | Local (Docker) | ~1-2GB |

### Generación de Imágenes (Opcional)

- **Modelo:** FLUX.1 Schnell vía Replicate
- **Costo:** ~$0.003/imagen
- **Precio sugerido:** $0.10/imagen (margen 97%)

---

## 3. Base de Datos y CRM (NocoDB)

### Tablas Principales

| Tabla | Función |
|-------|---------|
| `Socios` | Control de saldo, comisiones, datos de contacto |
| `Leads_Pruebas` | Bots individuales, consumo, documentos |
| `Créditos` | Historial de movimientos (+recargas, -consumos) |
| `Comisiones` | Cálculo automático: `Monto_Venta * 0.20` |
| `Documentos_Biblioteca` | PDFs para entrenamiento de bots |

---

## 4. Sistema de Comunicaciones

| Componente | Función |
|------------|---------|
| **Evolution API v2** | Motor WhatsApp, conexión con n8n |
| **n8n** | Orquestador de flujos |
| **Chatwoot** | Human-in-the-loop, cuando el bot no sabe |
| **Moltbot** | Supervisor, alertas de saldo y errores |

---

## 5. Rate Limiting (Protección)

| Plan | Límite/Hora | Límite/Día | Precio |
|------|-------------|------------|--------|
| Básico | 200 interacciones | 2,000 interacciones | $29/mes |
| Pro | 1,000 interacciones | 10,000 interacciones | $79/mes |
| Enterprise | Ilimitado | Ilimitado | $199/mes |

> **Interacción** = texto, audio, imagen, link o llamada. Con IA local (costo $0), todo es margen puro.

---

## 6. Dashboard del Socio (Appsmith)

### Funcionalidades

- Ver saldo en tiempo real
- Historial de consumos
- Panel de afiliados (20% comisión)
- Botón de recarga (enlace a pasarela)

---

## 7. Flujo de Trabajo Principal

```
1. Cliente envía mensaje (texto/audio) por WhatsApp
          ↓
2. Evolution API → n8n recibe webhook
          ↓
3. n8n consulta NocoDB: ¿Tiene saldo?
    ├─ NO → Moltbot envía alerta de recarga, FIN
    └─ SÍ → Continúa
          ↓
4. n8n consulta Chatwoot: ¿Hay humano atendiendo?
    ├─ SÍ → Flujo termina silenciosamente
    └─ NO → Continúa
          ↓
5. Si es audio → Whisper transcribe
          ↓
6. Dify + Llama procesa y genera respuesta
          ↓
7. Si debe ser audio → Kokoro genera voz
          ↓
8. Evolution API envía respuesta
          ↓
9. n8n registra consumo en NocoDB (fila negativa)
```

---

## 8. Distribución de RAM (12GB VPS)

| Servicio | RAM Estimada |
|----------|-------------|
| Llama 3.1 8B (Ollama) | ~6GB |
| Kokoro TTS | ~1GB |
| Whisper STT | ~1-2GB |
| n8n, NocoDB, Docker, etc. | ~2-3GB |
| **Total** | **~10-12GB** |

---

## 9. Resumen de Costos Operativos

| Concepto | Costo/mes |
|----------|-----------|
| VPS + Backup | $13-16 |
| IA (LLM, TTS, STT) | $0 |
| APIs (WhatsApp, etc.) | $0 |
| **Total Operativo** | **~$13-16** |

### Break-even

Con 2-3 socios pagando, se cubre toda la infraestructura.

---

## 10. Escalabilidad

| Fase | Socios | Acción |
|------|--------|--------|
| 1 | 1-50 | Solo Ollama local |
| 2 | 50-200 | Activar fallback APIs gratuitas |
| 3 | 200+ | Evaluar VPS más grande o microservicios |
