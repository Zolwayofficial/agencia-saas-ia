# ⚠️ DEPRECADO / DEPRECATED ⚠️
>
> **ESTA DOCUMENTACIÓN ES OBSOLETA.**
> **LA FUENTE DE VERDAD ACTUAL ES:** [ARQUITECTURA-V6-DEFINITIVA.md](ARQUITECTURA-V6-DEFINITIVA.md)
> **NO UTILIZAR ESTE ARCHIVO COMO REFERENCIA.**

# 🏗️ Estructura Completa del Proyecto v4.0 (Agencia SaaS IA)

Este documento detalla la estructura física de carpetas y el plan de implementación para la versión v4.0, enfocada en **escalabilidad, seguridad y mantenimiento**.

---

## 📂 1. Árbol de Directorios Maestro (v4.0)

La principal mejora es la separación de responsabilidades en `apps/moltbot` (Clean Architecture) y la configuración modular de `infrastructure`.

```
agencia-saas-ia/
├── 📄 .env.production                  # Credenciales (NO subir a git)
├── 📄 Makefile                         # Comandos (deploy, logs, test)
├── 📄 BIBLIA-TECNICA.md                # Referencia global
├── 📄 ESTRUCTURA-PROYECTO-V4.md        # Este archivo
│
├── 📂 apps/                            # LÓGICA DE NEGOCIO
│   ├── 📂 moltbot/                     # 🧠 Cerebro Principal (Refactorizado)
│   │   ├── 📄 Dockerfile
│   │   ├── 📄 package.json
│   │   ├── 📄 tsconfig.json
│   │   ├── 📂 src/
│   │   │   ├── 📄 app.ts               # Entry point simple
│   │   │   │
│   │   │   ├── 📂 config/              # Configuración Centralizada
│   │   │   │   ├── 📄 env.ts           # Validación de vars de entorno (Zod)
│   │   │   │   └── 📄 constants.ts
│   │   │   │
│   │   │   ├── 📂 core/                # LÓGICA PURA (Casos de Uso)
│   │   │   │   ├── 📂 entities/        # Modelos (User, Conversation)
│   │   │   │   ├── 📂 repositories/    # Interfaces de DB
│   │   │   │   └── 📂 services/        # Reglas de negocio (Billing, Routing)
│   │   │   │
│   │   │   ├── 📂 infra/               # ADAPTADORES (Implementaciones)
│   │   │   │   ├── 📂 db/              # Postgres/Prisma
│   │   │   │   ├── 📂 whatsapp/        # Cliente Baileys/Evolution
│   │   │   │   └── 📂 ai/              # Clientes LLM (OpenAI, Anthropic)
│   │   │   │
│   │   │   └── 📂 api/                 # PUERTO HTTP (Express)
│   │   │       ├── 📂 controllers/     # Manejadores de requests
│   │   │       ├── 📂 middlewares/     # Auth, RateLimit, Logging
│   │   │       ├── 📂 routes/          # Definición de endpoints
│   │   │       └── 📂 validators/      # Schemas Zod de entrada
│   │   │
│   │   └── 📂 tests/                   # Pruebas Unitarias e Integración
│   │
│   └── 📂 landing/                     # Web de Ventas (Astro/HTML)
│
├── 📂 infrastructure/                  # INFRAESTRUCTURA (Docker)
│   ├── 📄 docker-compose.yml           # Orquestador principal
│   ├── 📄 docker-compose.override.yml  # Overrides locales (dev)
│   │
│   ├── 📂 gateway/                     # Router (Caddy/Traefik)
│   │   └── 📄 Caddyfile
│   │
│   ├── 📂 db/                          # Base de Datos
│   │   ├── 📂 postgres/
│   │   │   ├── 📄 init.sql             # Schema inicial + RLS
│   │   │   └── 📄 backup.sh            # Script de respaldo a S3
│   │   └── 📂 redis/                   # Cache & Colas
│   │
│   ├── 📂 monitoring/                  # Observabilidad (NUEVO)
│   │   ├── 📂 grafana/                 # Dashboards
│   │   └── 📂 loki/                    # Logs
│   │
│   └── 📂 ai-local/                    # IA On-Premise (Opcional)
│       ├── 📄 ollama.yaml              # Solo si hay GPU/RAM
│       └── 📄 whisper.yaml
│
├── 📂 dashboard-templates/             # Plantillas Appsmith
├── 📂 docs/                            # Documentación Estratégica
└── 📂 scripts/                         # Mantenimiento
    ├── 📄 deploy.sh                    # CI/CD Script
    └── 📄 setup_vps.sh                 # Configuración inicial servidor
```

---

## 🚀 2. Plan de Implementación (Roadmap)

### **Fase 1: Cimientos Sólidos (Semana 1)**

*Objetivo: Estabilidad inmediata y reducción de consumo de RAM.*

1. **Limpieza de Docker Compose:**
    * Separar servicios de IA (Ollama, Whisper) en perfil `ai-local`.
    * Configurar límites de RAM (`mem_limit`) para cada contenedor.
2. **Backup Automático:**
    * Crear script `infrastructure/db/postgres/backup.sh` que suba dumps encriptados a un S3 externo (AWS/Wasabi).
    * Configurar CronJob en el host.
3. **Seguridad Básica DB:**
    * Revisar `init.sql` para asegurar índices correctos.
    * Crear usuario de solo lectura para dashboards.

### **Fase 2: Refactorización Moltbot (Semana 2)**

*Objetivo: Código mantenible y testeable.*

1. **Setup TypeScript Estricto:**
    * Configurar `tsconfig.json` y ESLint.
2. **Migración a Capas (Clean Arch):**
    * Mover lógica de `routes/` a `core/services/`.
    * Implementar Repositories para desacoplar DB.
3. **Validación & Logs:**
    * Implementar Zod en todos los endpoints.
    * Configurar Logger estructurado (Pino/Winston).

### **Fase 3: Observabilidad & CI/CD (Semana 3)**

*Objetivo: Dormir tranquilo sabiendo qué pasa.*

1. **Monitoring Stack:**
    * Levantar Grafana + Loki (versión ligera).
    * Conectar logs de Docker a Loki.
2. **Pipeline GitHub:**
    * Action para correr linter y tests en PRs.
    * Action para deploy automático (SSH) en merge a main.

---

## 🛡️ 3. Principios de Diseño v4.0

1. **Stateless Compute:** Los contenedores de `apps/` no guardan estado. Si se reinician, no pasa nada. Todo estado va a Redis o Postgres.
2. **Fail-Fast:** Si falta una variable de entorno critica, la app no arranca (validación al inicio).
3. **Log Everything:** Cada error debe tener contexto (Request ID, Usuario, Input).
4. **Separation of Concerns:** La API no sabe de SQL, el Servicio no sabe de HTTP.

---
