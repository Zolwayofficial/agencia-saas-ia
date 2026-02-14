# ⚠️ DEPRECADO / DEPRECATED ⚠️
>
> **ESTA DOCUMENTACIÓN ES OBSOLETA.**
> **LA FUENTE DE VERDAD ACTUAL ES:** [ARQUITECTURA-V6-DEFINITIVA.md](docs/ARQUITECTURA-V6-DEFINITIVA.md)
> **NO UTILIZAR ESTE ARCHIVO COMO REFERENCIA.**

# 📖 Biblia Maestra del Proyecto - V3.3 BLINDADA

> **Versión:** 3.3 FINAL DEFINITIVA  
> **Última actualización:** 2026-02-08  
> **Estado:** BLINDADA - NO HAY MÁS CAMBIOS

Esta guía incluye: **Multicanalidad**, **Voz**, **Documentos**, **Facturación**, **Almacenamiento S3** y **Auto-Recuperación**.

---

## 📂 1. Árbol de Directorios Maestro

```
agencia-saas-ia/
├── 📄 .env.production                  # 🔐 TODAS tus contraseñas y API Keys
├── 📄 Makefile                         # Comandos rápidos (deploy, logs, restart)
│
├── 📂 apps/                            # 🧠 TU CÓDIGO (Propiedad Intelectual)
│   ├── 📂 moltbot/                     # El Orquestador Principal (Node.js)
│   │   ├── 📄 Dockerfile
│   │   ├── 📄 package.json
│   │   ├── 📂 src/
│   │   │   ├── 📂 agents/              # Lógica conversacional (Prompts)
│   │   │   ├── 📂 tools/               # Herramientas (Generar PDF, CRM)
│   │   │   ├── 📂 voice/               # Lógica de audio (STT/TTS)
│   │   │   ├── 📂 webhooks/            # Receptores (Chatwoot, Lago, n8n)
│   │   │   └── 📂 workers/             # Cronjobs (Análisis Dashboards)
│   │
│   ├── 📂 voice-agent/                 # El Agente Telefónico
│   │   ├── 📄 Dockerfile
│   │   └── 📄 agent.py                 # Conexión SIP con LiveKit
│   │
│   └── 📂 landing/                     # Web de Ventas (Astro/HTML)
│
├── 📂 infrastructure/                  # ⚙️ LA MAQUINARIA (Docker)
│   ├── 📄 docker-compose.yml           # EL ARCHIVO MAESTRO
│   ├── 📂 gateway/Caddyfile            # Ruteo SSL automático
│   ├── 📂 db/postgres/init.sql         # Tablas iniciales
│   ├── 📂 voice/livekit.yaml           # Config telefónica
│   ├── 📂 ai-models/                   # Config modelos LLM
│   └── 📂 storage/                     # Config MinIO
│
├── 📂 dashboard-templates/             # 📊 Plantillas Appsmith
│   ├── 📄 partner_portal.json          # Panel Revendedores
│   └── 📄 client_dashboard.json        # Panel Clientes
│
└── 📂 scripts/                         # 🛠️ MANTENIMIENTO
    ├── 📄 setup_swap.sh                # Script anti-caídas (SWAP)
    ├── 📄 backup_all.sh                # Backup de DBs y MinIO
    └── 📄 restore.sh                   # Restauración emergencia
```

---

## 🏗️ 2. Arquitectura de Servicios V3.3

| # | Capa | Servicio | Software | Función |
|---|------|----------|----------|---------|
| 0 | 🛡️ Vigilancia | Auto-heal | willfarrell/autoheal | Reinicia servicios congelados |
| 1 | 🌐 Gateway | Proxy | Caddy | SSL Automático |
| 2 | 🧠 Core | Cerebro | Moltbot | Orquestador principal |
| 3 | 📦 Storage | S3 | MinIO | Almacenamiento de archivos |
| 4 | 🎙️ Voz | STT | Whisper | Audio → Texto |
| 4 | 🎙️ Voz | Llamadas | LiveKit | Servidor SIP |
| 4 | 🎙️ Voz | Agente | Voice Agent | IA telefónica |
| 5 | 📄 Docs | PDFs | Gotenberg | Genera facturas |
| 6 | 💬 Canales | Hub | Chatwoot | Bandeja unificada |
| 6 | 💬 Canales | WhatsApp | Evolution API | Gateway WA |
| 7 | 🤖 IA | Proxy | LiteLLM | GPT, Claude, Llama |
| 8 | ⚡ Tools | Automation | n8n | Integraciones |
| 8 | ⚡ Tools | Dashboards | Appsmith | Paneles control |
| 9 | 💾 Datos | SQL | PostgreSQL | Base de datos |
| 9 | 💾 Datos | Cache | Redis | Colas |
| 9 | 💾 Datos | Vectores | Qdrant | Memoria IA |

**Total: 15 servicios** en un solo docker-compose.yml

---

## 🐳 3. Docker Compose V3.3

Ver archivo: `infrastructure/docker-compose.yml`

---

## 🔑 4. Configuración Crítica

### Archivos que deben existir

- `infrastructure/gateway/Caddyfile` ✅
- `infrastructure/db/postgres/init.sql` ✅
- `infrastructure/voice/livekit.yaml` ✅
- `.env.production` (crear desde `.env.production.example`)

### Script Anti-Caídas

```bash
./scripts/setup_swap.sh  # Configura 4GB de SWAP
```

---

## ✅ Checklist de Inicio

- [ ] Crear `.env.production` con claves reales
- [ ] Ejecutar `./scripts/setup_swap.sh`
- [ ] `docker compose up -d` en `infrastructure/`
- [ ] Conectar WhatsApp en Evolution API
- [ ] Empezar a programar en `apps/moltbot`

---

**Versión:** 3.3 BLINDADA  
**Última actualización:** 2026-02-08
