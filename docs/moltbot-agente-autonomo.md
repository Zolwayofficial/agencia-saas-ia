# Moltbot: Agente Autónomo Open-Source

> **Última actualización:** 2026-02-04  
> **CORRECCIÓN:** Moltbot es **OPEN-SOURCE** y **SELF-HOSTED**, NO cloud SaaS  
> **GitHub:** 85,000+ estrellas

---

## 1. ¿Qué es Moltbot Realmente?

| Aspecto | Moltbot | Evolution API |
|---------|---------|---------------|
| **Tipo** | Agente autónomo + Gateway | Gateway de mensajería |
| **Hosting** | **Self-hosted** | Self-hosted |
| **Licencia** | **Open-source** | Apache 2.0 |
| **WhatsApp** | Baileys (WA Web) | Baileys (WA Web) |
| **IA integrada** | ✅ Nativo (Ollama) | ❌ Requiere n8n |
| **Ejecución local** | ✅ Terminal/archivos | ❌ |

> **Moltbot = "Sistema Operativo de Agentes" que puede ejecutar código, manejar archivos y comunicar por múltiples canales.**

---

## 2. Requisitos de Hardware

| Componente | Mínimo | Recomendado |
|------------|--------|-------------|
| **RAM (Solo Gateway)** | 2 GB | 4 GB |
| **RAM (Con Ollama 8B)** | 16 GB | 32 GB |
| **CPU** | 2 vCPU | 4+ vCPU |
| **Disco** | 40 GB SSD | 100 GB NVMe |
| **GPU (para IA rápida)** | - | 8 GB VRAM |

> ⚠️ **Browser Automation (Playwright)** puede consumir 2-4 GB adicionales por instancia.

---

## 3. Canales Soportados

| Canal | Método | Estado | Requisito |
|-------|--------|--------|-----------|
| **WhatsApp** | Baileys (WA Web) | ✅ Nativo | QR scan |
| **Telegram** | Bot API (GrammY) | ✅ Nativo | Token @BotFather |
| **Discord** | Discord.js | ✅ Nativo | Token dev |
| **Instagram** | Matrix Bridge | ⚠️ Puente | Servidor Matrix |
| **Facebook** | Matrix Bridge | ⚠️ Puente | Servidor Matrix |
| **Email** | IMAP/SMTP | ✅ Nativo | App password |
| **Slack/Teams** | APIs oficiales | ✅ Nativo | App tokens |
| **TikTok** | Playwright | ⚠️ Experimental | Sesión browser |

---

## 4. Moltbot vs Evolution API

| Caso de Uso | Evolution API | Moltbot |
|-------------|---------------|---------|
| Envío masivo WA | ✅ Recomendado | ⚠️ Riesgo ban |
| Asistente omnicanal | ❌ Solo WA | ✅ Excelente |
| Ejecución de código | ❌ | ✅ Nativo |
| Acceso a archivos | ❌ | ✅ Nativo |
| Integración IA | Requiere n8n | ✅ Integrado |

### Recomendación Híbrida

```
Evolution API → WhatsApp masivo/estable
Moltbot       → Agente inteligente + otros canales
```

---

## 5. Arquitectura con Moltbot

```
┌───────────────────────────────────────────────────┐
│              MOLTBOT GATEWAY (4GB RAM)            │
│  ┌─────────┬──────────┬─────────┬─────────────┐   │
│  │WhatsApp │ Telegram │ Discord │ Matrix(IG/FB)│   │
│  │(Baileys)│ (GrammY) │ (D.js)  │ (mautrix)   │   │
│  └────┬────┴────┬─────┴────┬────┴──────┬──────┘   │
│       │         │          │           │          │
│       └─────────┴──────────┴───────────┘          │
│                        │                          │
│                   Webhook POST                    │
└────────────────────────┼──────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────┐
│                    n8n (2GB RAM)                   │
│  ┌──────────────────────────────────────────────┐  │
│  │  1. Identificar canal (platform field)       │  │
│  │  2. Buscar usuario en NocoDB                 │  │
│  │  3. Recuperar historial                      │  │
│  │  4. Llamar Dify API                          │  │
│  │  5. Enviar respuesta vía Moltbot REST        │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────┼───────────────────────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
┌─────────────────────┐  ┌─────────────────────┐
│   Dify (1GB RAM)    │  │  NocoDB (1GB RAM)   │
│  ┌───────────────┐  │  │  ┌───────────────┐  │
│  │ RAG + Prompt  │  │  │  │ Usuarios      │  │
│  │ Engineering   │  │  │  │ Conversaciones│  │
│  └───────┬───────┘  │  │  │ Historial     │  │
│          │          │  │  └───────────────┘  │
└──────────┼──────────┘  └─────────────────────┘
           │
           ▼
┌─────────────────────┐
│  Ollama (4GB RAM)   │
│  ┌───────────────┐  │
│  │ Llama 3.1 8B  │  │
│  │ Q4_K_M        │  │
│  └───────────────┘  │
└─────────────────────┘
```

---

## 6. Payload de Webhook Moltbot → n8n

```json
{
  "platform": "telegram",
  "user_id": "123456789",
  "message_content": "Hola, necesito ayuda",
  "timestamp": "2026-02-04T13:00:00Z"
}
```

---

## 7. Instalación de Moltbot

```bash
# Requisito: Node.js v22+
npm install -g moltbot@latest

# Onboarding (configura Ollama como proveedor)
moltbot onboard

# Vincular Telegram
moltbot pairing approve telegram <código>

# Vincular WhatsApp (escanear QR)
moltbot channel add whatsapp
```

---

## 8. Seguridad Crítica

### ⚠️ Riesgos

1. **Prompt Injection:** Usuario malicioso puede engañar a IA para ejecutar comandos
2. **Tokens en texto plano:** Versiones tempranas tenían este problema
3. **Localhost Fallacy:** Atacantes pueden eludir auth si confía en localhost

### ✅ Mitigaciones

```bash
# 1. Activar aprobación de comandos
moltbot config set exec_approvals=true

# 2. Usar Docker con secrets
docker run -e MOLTBOT_TOKEN=xxx moltbot/gateway

# 3. Túnel seguro (NO abrir puertos)
cloudflared tunnel --url http://localhost:3000
```

---

## 9. Instagram/Facebook via Matrix

Para IG/FB sin API oficial de Meta:

1. **Instalar servidor Matrix (Synapse)**
2. **Instalar puente mautrix-meta**
3. **Configurar con cookies de sesión activa**
4. **Moltbot consume mensajes via protocolo Matrix**

> Esto permite automatizar IG/FB sin verificación de desarrollador.

---

## 10. Distribución RAM Actualizada (12GB VPS)

⚠️ **PROBLEMA:** Moltbot + Ollama necesitan ~20GB idealmente

### Opción A: Sin Ollama local (usar Groq)

| Componente | RAM |
|------------|-----|
| Moltbot Gateway | 3 GB |
| n8n | 1.5 GB |
| NocoDB | 1 GB |
| Dify | 1 GB |
| Evolution API | 1 GB |
| Sistema + buffer | 4.5 GB |
| **Total** | **12 GB** ✅ |

### Opción B: Separar servidores

- **VPS 1 (12GB):** Moltbot + n8n + NocoDB + Evolution
- **VPS 2 (16GB):** Ollama + Dify

---

## 11. Decisión de Arquitectura

### Para tu caso (VPS 12GB)

1. **Mantener Evolution API** para WhatsApp (ya funciona)
2. **Agregar Moltbot** para Telegram + Discord
3. **NO usar Ollama local** → Usar Groq como IA
4. **Instagram/FB:** Postponer hasta tener Matrix server

### Costo: $0

- Moltbot: Open-source, self-hosted
- Groq: Free tier 14,400 req/día
- Evolution: Ya lo tienes

---

## 12. Comparativa Final

| Herramienta | Rol | RAM | Costo |
|-------------|-----|-----|-------|
| Evolution API | WhatsApp (masivo) | 1 GB | $0 |
| Moltbot | Agente + TG/Discord | 3 GB | $0 |
| Moltbot | IG/FB (via Matrix) | +2 GB | $0 |
| Groq API | IA (fallback) | 0 | $0 |

**Conclusión:** Usar **Evolution API para WhatsApp** + **Moltbot para otros canales** = arquitectura óptima $0.
