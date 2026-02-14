# ⚠️ DEPRECADO / DEPRECATED ⚠️
>
> **ESTE DOCUMENTO ES UNA ESPECIFICACIÓN ANTIGUA.**
> **LA ARQUITECTURA DEFINITIVA ES:** [ARQUITECTURA-V6-DEFINITIVA.md](ARQUITECTURA-V6-DEFINITIVA.md)
> **NO UTILIZAR ESTE ARCHIVO COMO REFERENCIA.**

# 🏗️ Arquitectura Monorepo V5 - Especificación Técnica Detallada

> **Nivel de Detalle:** 100% (Archivos de configuración, dependencias, scripts)
> **Stack:** Turborepo, pnpm, Docker, TypeScript.

Este documento define **exactamente** cómo se construye el proyecto desde cero.

---

## 1. 📂 Estructura de Directorios (Profundidad Máxima)

```text
agencia-saas-ia/
├── .github/
│   └── workflows/
│       ├── ci.yml                  # Build, Test & Lint en cada Push
│       └── deploy.yml              # Deploy a VPS via SSH
├── .vscode/
│   └── settings.json               # Configuración compartida de VSCode
├── apps/                           # APLICACIONES (Deployables)
│   ├── api/                        # Backend (Node.js/Express o NestJS)
│   │   ├── src/
│   │   │   ├── config/             # Configuración (Zod)
│   │   │   │   ├── env.ts          # Validación de vars de entorno de API
│   │   │   │   └── index.ts
│   │   │   ├── modules/            # Módulos de Negocio
│   │   │   │   ├── auth/           # Autenticación (Supabase/NextAuth)
│   │   │   │   ├── chat/           # Lógica de Chat & SmartSend
│   │   │   │   ├── referrals/      # Sistema de Referidos (Nivel 1 & 2)
│   │   │   │   ├── billing/        # Pagos (Stripe/Lago) & Suscripciones
│   │   │   │   └── compliance/     # Alertas de Uso & Bloqueos
│   │   │   ├── app.ts              # Setup de Express
│   │   │   └── server.ts           # Entry point (Listen port)
│   │   ├── .env.example
│   │   ├── Dockerfile              # Dockerfile de Producción (Multistage)
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                        # Frontend (Next.js App Router)
│   │   ├── src/
│   │   │   ├── app/                # Rutas (File-system routing)
│   │   │   ├── components/         # Componentes específicos de la app
│   │   │   └── lib/                # Utilidades de frontend
│   │   ├── .env.example
│   │   ├── Dockerfile
│   │   ├── next.config.js
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── worker/                     # Worker (BullMQ/Redis)
│       ├── src/
│       │   ├── jobs/               # Definición de Jobs
│       │   └── index.ts            # Entry point
│       ├── Dockerfile
│       ├── package.json
│       └── tsconfig.json
│
├── infrastructure/                 # INFRAESTRUCTURA
│   ├── production/
│   │   ├── Caddyfile               # Reverse Proxy Config
│   │   └── docker-compose.yml      # Orchestration Prod
│   └── local/
│       └── docker-compose.yml      # DB + Redis + MinIO (Dev)
│
├── packages/                       # PAQUETES COMPARTIDOS (Internal)
│   ├── database/                   # Prisma Client
│   │   ├── prisma/
│   │   │   └── schema.prisma       # ÚNICA fuente de verdad de datos
│   │   ├── src/
│   │   │   ├── index.ts            # Exporta PrismaClient instanciado
│   │   │   └── seed.ts             # Datos de prueba
│   │   └── package.json
│   │
│   ├── logger/                     # Logger Estandarizado (Pino)
│   │   ├── src/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── tsconfig/                   # Configs de TS compartidas
│   │   ├── base.json
│   │   ├── nextjs.json
│   │   └── react.json
│   │
│   └── ui/                         # Componentes UI (React + Tailwind)
│       ├── src/
│       │   ├── button.tsx
│       │   └── card.tsx
│       └── package.json
│
├── .dockerignore
├── .gitignore
├── package.json                    # Root (Workspaces definition)
├── pnpm-lock.yaml
├── pnpm-workspace.yaml             # Configuración de pnpm monorepo
└── turbo.json                      # Configuración de Turborepo Pipeline
```

---

## 2. ⚙️ Archivos de Configuración Críticos

### A. Root `package.json`

Define los scripts globales para manejar todo el monorepo.

```json
{
  "name": "agencia-saas-ia-monorepo",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "clean": "turbo run clean",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "db:studio": "pnpm --filter database db:studio",
    "db:push": "pnpm --filter database db:push"
  },
  "devDependencies": {
    "turbo": "latest",
    "prettier": "latest",
    "typescript": "latest"
  },
  "packageManager": "pnpm@9.0.0"
}
```

### B. `pnpm-workspace.yaml`

Le dice a pnpm dónde están los paquetes.

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### C. `turbo.json` (El Cerebro del Build)

Define cómo se ejecutan las tareas y sus dependencias.

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"], 
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

*Explicación:* `dependsOn: ["^build"]` significa "antes de construir `web`, construye sus dependencias (como `ui` o `database`)".

---

## 3. 📦 Paquetes Compartidos (El "Pegamento")

### A. `packages/database/package.json`

Este paquete exporta el cliente de Prisma para que `api`, `web` y `worker` lo usen.

```json
{
  "name": "@repo/database",
  "version": "0.0.1",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push"
  },
  "dependencies": {
    "@prisma/client": "latest"
  },
  "devDependencies": {
    "prisma": "latest",
    "typescript": "latest"
  }
}
```

### B. `packages/database/src/index.ts`

Singleton de Prisma para evitar múltiples conexiones en serverless/dev.

```typescript
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export * from '@prisma/client'; // Re-exporta tipos generados
```

---

## 4. 🚀 Aplicación `apps/api` (Backend)

### `apps/api/package.json`

Nota cómo depende de los paquetes locales (`workspace:*`).

```json
{
  "name": "api",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc"
  },
  "dependencies": {
    "@repo/database": "workspace:*",  // <--- MAGIA
    "@repo/logger": "workspace:*",
    "express": "latest",
    "zod": "latest",
    "cors": "latest"
  },
  "devDependencies": {
    "tsx": "latest",
    "@types/express": "latest"
  }
}
```

### `apps/api/Dockerfile` (Producción)

Optimizado para capas y caché.

```dockerfile
# Base
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Prune (Solo copia lo necesario para 'api')
FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo prune api --docker

# Installer
FROM base AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./
RUN pnpm install

COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=api...

# Runner
FROM base AS runner
WORKDIR /app
COPY --from=installer /app .
CMD ["node", "apps/api/dist/server.js"]
```

---

## 5. 🐳 Orquestación Local (`infrastructure/local/docker-compose.yml`)

Para desarrollar, solo necesitas levantar los servicios de soporte, no las apps (esas las corres con `pnpm dev`).

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: saas_db
    ports:
      - "5432:5432"
    volumes:
      - pg_data:/var/lib/postgresql/data

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  mailpit: # Para probar emails locamente
    image: axllent/mailpit
    ports:
      - "8025:8025" # UI
      - "1025:1025" # Update SMTP port

volumes:
  pg_data:
```

---

## 📋 Pasos para "Ejecutar" esta estructura

1. **Crear Carpetas:** Generar el esqueleto de directorios.
2. **Inicializar Git & pnpm:** `git init`, `pnpm init`.
3. **Configurar Workspaces:** Crear `pnpm-workspace.yaml`.
4. **Crear Paquetes Base:** Configurar `packages/tsconfig` y `packages/database`.
5. **Mover Apps:** Migrar tu código actual a `apps/api` y `apps/web`.
6. **Conectar Todo:** Actualizar imports para usar `@repo/database`.

---

## 6. 🔌 Integraciones Externas (Evolution API, n8n, AI)

En esta arquitectura, las herramientas "satélite" son servicios Docker que corren junto a tu aplicación en `infrastructure/production/docker-compose.yml`. No son parte del código fuente (`apps/`), sino de la infraestructura.

### A. Evolution API (WhatsApp)

- **Ubicación:** `infrastructure/production/docker-compose.yml`
- **Rol:** Gateway de Mensajería.
- **Comunicación:**
  - **Outbound:** `apps/api` llama a Evolution via HTTP (`http://evolution-api:8080/message/send`).
  - **Inbound:** Evolution envía Webhooks a `apps/api/src/modules/webhooks/whatsapp`.

### B. n8n (Automatización Low-Code)

- **Ubicación:** `infrastructure/production/docker-compose.yml`
- **Rol:** Orquestador de tareas complejas o integraciones rápidas.
- **Comunicación:** `apps/worker` puede activar flujos de n8n, o n8n puede llamar a `apps/api`.

### C. MinIO (Almacenamiento S3 Compatible)

- **Ubicación:** `infrastructure/local/docker-compose.yml` (Dev) / S3 Real en Prod.
- **Rol:** Guardar PDFs, imágenes y audios.

### D. IA (Ollama / Groq / OpenAI)

- **Ollama (Opcional):** Corre en `infrastructure/local/ai-stack.yml` si tienes GPU.
- **Producción:** `apps/api` y `apps/worker` usan SDKs (OpenAI SDK) para llamar a APIs externas (Groq, OpenAI) configuradas en `.env`.

### E. Chatwoot (Atención Humana)

- **Ubicación:** `infrastructure/production/docker-compose.yml`
- **Rol:** Bandeja de entrada compartida.
- **Comunicación:** Webhooks bidireccionales con `apps/api`.

### F. Stack No-Code (NocoDB + Appsmith)

- **Ubicación:** `infrastructure/production/docker-compose.yml`
- **NocoDB:** "Corazón de Datos". UI administrativa para ver la DB PostgreSQL que gestiona `apps/api`.
- **Appsmith:** "Panel Visual". Dashboards para socios (Saldos, Gráficas) conectados a NocoDB o `apps/api`.

Esta arquitectura es **profesional, escalable y robusta**. Elimina la duplicación de código y prepara el terreno para un equipo grande o un producto complejo.

---

## 7. 🛡️ Sistema "Modo Seguro" (SmartSend™)

El "Modo Seguro" es nuestra lógica defensiva para evitar bloqueos de WhatsApp/Facebook. Se implementa principalmente en `apps/worker` usando **BullMQ (Redis)**.

### ¿Cómo funciona técnicamente?

1. **Cola de Mensajes (Throttled Queue):**
    - No enviamos mensajes directamente. Los metemos a una cola en Redis: `queue.add('sendMessage', data)`.
    - **Rate Limiter Global:** Configuramos BullMQ para procesar máximo 1 mensaje cada 5-10 segundos por número de teléfono.

2. **Delays Aleatorios (Jitter):**
    - Antes de enviar, el worker espera un tiempo random (`Math.random() * 3000ms`). Esto imita el comportamiento humano.

3. **Rotación de Identidad (Multi-Agent):**
    - Si un cliente tiene 3 números conectados en Evolution API, `apps/api` rota el `instanceId` en cada envío para distribuir la carga.

4. **Warm-up Automático:**
    - Si detectamos un número nuevo (flag `isNew: true` en DB), el Rate Limiter se ajusta automáticamente a modo "Ultra Lento" (1 mensaje/minuto) durante las primeras 48 horas.

```typescript
// Ejemplo en apps/worker/src/jobs/send-message.ts
const worker = new Worker('whatsapp-queue', async job => {
  // 1. Simular 'escribiendo...'
  await setPresence('composing');
  
  // 2. Espera pseudo-aleatoria
  await sleep(Math.random() * 5000 + 2000); 

  // 3. Enviar
  await evolutionApi.sendText(job.data);
}, {
  limiter: {
    max: 10, // Máximo 10 mensajes
    duration: 60000 // Por minuto
  }
});
```

---

## 8. 🔄 Flujo Híbrido: Código Pro + No-Code (Tu Fase 5)

Esta arquitectura está diseñada para soportar tu visión de "Cerebro en Código, Músculo en No-Code".

### A. El Corazón de los Datos (PostgreSQL Compartido)

- **Código (`apps/api`):** Usa **Prisma** para escribir datos críticos con validación estricta (Pagos, Auth).

- **No-Code (NocoDB):** Se conecta a la *misma* DB PostgreSQL. Sirve como tu "Admin Panel" para ver lo que `apps/api` escribe.
  - *Ejemplo:* `apps/api` procesa el pago de Stripe -> `apps/api` escribe en tabla `credits` -> Tú lo ves en NocoDB al instante.

### B. Lógica de Negocio (Híbrida)

- **Crítica (`apps/worker`):** SmartSend, Rate Limiting, Colas. Esto **debe** ser código para rendimiento (Moltbot Finance).

- **Flexible (n8n):** Orquestación y prototipado.
  - *Tu caso:* n8n consulta el saldo.
  - *Mejora V5:* En lugar de SQL directo desde n8n, n8n llama a `GET https://api.tudominio.com/partner/balance`. Más seguro, mismo resultado.

### C. Capa Visual

- **Pública (`apps/web`):** Landing page y Login de usuario final (Next.js rápido y SEO-friendly).

- **Privada (Appsmith):** Dashboards para Socios/Revendedores. Se conecta a tu API o directamente a la DB (lectura) para mostrar gráficas y velocímetros.

### D. Voz e IA Locales

- **Local (`infrastructure/local/ai-stack`):** `apps/api` ejecuta comandos o llama a servicios locales (Kokoro/Ollama) via HTTP interno, exponiendo esta potencia a n8n via Webhoks.

```
