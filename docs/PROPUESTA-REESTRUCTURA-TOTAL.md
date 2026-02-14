# ⚠️ DEPRECADO / DEPRECATED ⚠️
>
> **ESTE DOCUMENTO ES UNA PROPUESTA ANTIGUA.**
> **LA ARQUITECTURA DEFINITIVA ES:** [ARQUITECTURA-V6-DEFINITIVA.md](ARQUITECTURA-V6-DEFINITIVA.md)
> **NO UTILIZAR ESTE ARCHIVO COMO REFERENCIA.**

# 🏛️ Propuesta de Reestructuración TOTAL (Desde Cero)

Esta estructura asume un enfoque **"Greenfield"** (empezar de limpio) para construir una SaaS escalable, mantenible y profesional, utilizando una arquitectura **Monorepo**.

## 🎯 ¿Por qué esta estructura?

1. **Monorepo:** Todo el código en un solo lugar, pero modular. Facilita compartir tipos (TypeScript) y utilidades entre el Backend, Frontend y Workers.
2. **Separación de Responsabilidades:**
    * `apps/`: Aplicaciones ejecutables (API, Dashboard, Landing).
    * `packages/`: Código compartido (UI Kit, Database Client, Configs).
    * `infrastructure/`: Docker y Terraform.

---

## 📂 Árbol de Directorios Ideal

```bash
agencia-saas-ia/
├── 📄 package.json                     # Root (Workspaces config)
├── 📄 turborepo.json                   # Pipeline de build (opcional pero recomendado)
├── 📄 .gitignore
├── 📄 .env.example                     # Variables de entorno base
│
├── 📂 apps/                            # 🚀 APLICACIONES (Deployables)
│   │
│   ├── 📂 api/                         # (Antes "moltbot") - Tu Backend Principal
│   │   ├── 📄 package.json
│   │   ├── 📄 Dockerfile
│   │   └── 📂 src/
│   │       ├── 📂 modules/             # Dominios (Auth, Billing, Chat)
│   │       │   ├── 📂 chat/
│   │       │   │   ├── chat.controller.ts
│   │       │   │   ├── chat.service.ts
│   │       │   │   └── chat.entity.ts
│   │       ├── 📂 webhooks/            # Endpoints para servicios externos
│   │       └── 📄 main.ts              # Entry point
│   │
│   ├── 📂 web/                         # (Antes "dashboard") - App Principal Next.js
│   │   ├── 📄 package.json
│   │   ├── 📄 Dockerfile
│   │   └── 📂 src/
│   │       ├── 📂 app/                 # Next.js App Router
│   │       │   ├── 📂 dashboard/       # Panel de Cliente
│   │       │   └── 📂 admin/           # Panel de Super Admin
│   │       └── 📂 components/          # Componentes locales
│   │
│   ├── 📂 landing/                     # Marketing Site (Astro o Next.js)
│   │   ├── 📄 package.json
│   │   └── 📂 src/
│   │
│   └── 📂 worker/                      # Procesos en Background (Colas)
│       ├── 📄 package.json
│       └── 📂 src/
│           ├── 📂 jobs/                # Procesadores de BullMQ/Redis
│           │   ├── process-audio.job.ts
│           │   └── sync-crm.job.ts
│           └── 📄 main.ts
│
├── 📂 packages/                        # 📦 LIBRERÍAS COMPARTIDAS
│   │
│   ├── 📂 db/                          # Cliente de Base de Datos
│   │   ├── 📄 package.json
│   │   └── 📂 prisma/                  # Schema único de verdad
│   │       └── 📄 schema.prisma
│   │
│   ├── 📂 ui/                          # Sistema de Diseño (Botones, Inputs)
│   │   ├── 📄 package.json
│   │   └── 📂 src/
│   │
│   ├── 📂 ts-config/                   # Configs de TypeScript compartidas
│   │   └── 📄 base.json
│   │
│   └── 📂 logger/                      # Utilidad de logging estandarizada
│
├── 📂 infrastructure/                  # ⚙️ INFRAESTRUCTURA
│   ├── 📂 local/                       # Entorno de Desarrollo
│   │   └── 📄 docker-compose.yml       # DB, Redis, MinIO, Mailpit
│   │
│   ├── 📂 pro/                         # Entorno de Producción
│   │   ├── 📄 docker-compose.yml       # Apps + Infra
│   │   ├── 📂 nginx/                   # Reverse Proxy Config
│   │   └── 📂 backups/                 # Scripts de seguridad
│   │
│   └── 📂 terraform/ (Futuro)          # Infracode para AWS/Cloud
│
├── 📂 scripts/                         # 🛠️ SCRIPTS DE UTILIDAD
│   ├── 📄 setup-dev.sh                 # "One click setup" para desarrolladores
│   ├── 📄 seed-db.ts                   # Datos de prueba
│   └── 📄 deploy.sh                    # Script de despliegue SSH
│
└── 📂 docs/                            # 📚 DOCUMENTACIÓN
    ├── 📄 ARQUITECTURA.md
    ├── 📄 ONBOARDING.md
    └── 📂 decisions/                   # Registro de decisiones técnicas (ADR)
```

---

## 🔑 Ventajas de este Enfoque

1. **Type Safety Real:**
    * Si cambias una tabla en `packages/db`, **inmediatamente** ves los errores en `apps/api` y `apps/worker`. TypeScript te protege.
2. **Escalabilidad Independiente:**
    * ¿Tu `worker` de IA necesita mucha CPU? Despliégalo en un servidor separado fácilmente.
    * ¿Tu `landing` es estática? Despliégala en Vercel/Netlify gratis, sin tocar el backend.
3. **Código DRY (Don't Repeat Yourself):**
    * No copias y pegas tipos o funciones de utilidad de un proyecto a otro. Los importas desde `packages/`.

## 🛠️ Stack Tecnológico Recomendado v4.0

| Capa | Tecnología | Por qué |
| :--- | :--- | :--- |
| **Monorepo** | **Turborepo** (o pnpm workspaces) | Standard moderno, rápido, caché de builds. |
| **Backend** | **NestJS** (o Fastify con Clean Arch) | Estructura forzada, inyección de dependencias, escalable. |
| **Frontend** | **Next.js** (App Router) | React moderno, SSR, SEO amigable. |
| **Database** | **PostgreSQL** + **Prisma ORM** | Tipado fuerte, migraciones seguras. |
| **Cola** | **BullMQ** (Redis) | Manejo robusto de tareas pesadas (IA, Audio). |
| **Gateway** | **Traefik** (o Caddy) | Proxy automático con etiquetas Docker. |

---

## 🚦 ¿Cómo empezamos "Desde Cero"?

Si apruebas esta estructura, el plan sería:

1. **Inicializar Monorepo:** Crear la carpeta raíz y `package.json` workspaces.
2. **Mover Apps:**
    * Mover `moltbot` a `apps/api` (y refactorizar gradualmente).
    * Mover landing a `apps/landing`.
3. **Extraer DB:** Crear `packages/db` y mover allí el `schema.prisma` (o `init.sql`).
4. **Configurar Docker:** Crear un `docker-compose.yml` en raíz que orqueste todo.

¿Te parece esta la estructura que tenías en mente para "estructurar desde cero"?
