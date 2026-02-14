# 🏗️ Arquitectura V6 "20/20" — Versión Definitiva

> **Origen:** Fusión de Arquitectura V5 (Monorepo) + Estructura Sugerida (OpenClaw/SmartSend)
> **Stack:** Turborepo · pnpm · Docker · TypeScript · BullMQ · Prisma
> **Filosofía:** "Lo que cobra (API) nunca toca lo que gasta (Worker). Lo peligroso (Agentes) vive en jaulas."

---

## 📊 Tabla Comparativa: V5 vs Sugerida vs V6 Final

| Aspecto | Nuestra V5 | Sugerida | V6 "20/20" |
|---|---|---|---|
| **`packages/types`** | ❌ No existía | ✅ Interfaces compartidas | ✅ **Adoptado** |
| **`packages/ui`** | ✅ Componentes React | ❌ No incluido | ✅ **Mantenido** (para `apps/web`) |
| **Patrón Backend** | Modules (NestJS-style) | Controller-Service | ✅ **Controller-Service** (más claro) |
| **`credit-guard` middleware** | ❌ Implícito | ✅ Middleware explícito | ✅ **Adoptado** (Moltbot Finance) |
| **OpenClaw (Agentes IA)** | ❌ No existía | ✅ Docker sandboxed | ✅ **Adoptado** (`infrastructure/images/`) |
| **SmartSend detalle** | ✅ BullMQ + Jitter + Warmup | ✅ En `jobs/smart-send.ts` | ✅ **Fusionado** (lógica V5 + ubicación Sugerida) |
| **NocoDB / Appsmith** | ✅ Stack No-Code | ❌ No mencionado | ✅ **Mantenido** (infra Docker) |
| **Chatwoot (HITL)** | ✅ Handoff humano | ❌ No mencionado | ✅ **Mantenido** |
| **Referidos / Billing** | ✅ Módulos explícitos | ✅ `billing.ts` en worker | ✅ **Fusionado** (API + Worker) |
| **Compliance (Alertas)** | ✅ Módulo explícito | ❌ Implícito | ✅ **Mantenido** |
| **Voz Local (Kokoro)** | ✅ `ai-stack.yml` | ❌ No mencionado | ✅ **Mantenido** |
| **`infrastructure/images/`** | ❌ No existía | ✅ OpenClaw runner | ✅ **Adoptado** |
| **Dashboard detallado** | ❌ Genérico | ✅ `agents/`, `whatsapp/` | ✅ **Adoptado** |

---

## 1. 📂 Estructura de Directorios Definitiva

```text
agencia-saas-monorepo/
│
├── .github/
│   └── workflows/
│       ├── ci.yml                      # Build + Test + Lint en cada Push
│       └── deploy.yml                  # Deploy a VPS via SSH
│
├── apps/                               # ═══ APLICACIONES DESPLEGABLES ═══
│   │
│   ├── api/                            # BACKEND — "El Portero"
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   └── env.ts              # Validación con Zod
│   │   │   ├── controllers/            # Entrada HTTP (Req → Res)
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── agent.controller.ts
│   │   │   │   ├── whatsapp.controller.ts
│   │   │   │   ├── referral.controller.ts
│   │   │   │   └── billing.controller.ts
│   │   │   ├── middlewares/
│   │   │   │   ├── auth.ts             # Valida JWT / API Key
│   │   │   │   └── credit-guard.ts     # ⚡ Moltbot Finance: ¿Tiene saldo?
│   │   │   ├── routes/
│   │   │   │   └── v1.ts               # Versionado de API
│   │   │   ├── services/               # Lógica pura (sin req/res)
│   │   │   │   ├── queue.service.ts    # Envía jobs a Redis (BullMQ)
│   │   │   │   ├── referral.service.ts # Comisiones Nivel 1 y 2
│   │   │   │   └── compliance.service.ts # Alertas 70/85/95%
│   │   │   └── server.ts
│   │   ├── .env.example
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                            # FRONTEND — "La Cara del Cliente"
│   │   ├── src/
│   │   │   ├── app/                    # Next.js App Router
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── agents/         # Ver agentes corriendo (logs)
│   │   │   │   │   ├── whatsapp/       # Semáforo de salud de números
│   │   │   │   │   ├── billing/        # Saldo, recargas, historial
│   │   │   │   │   └── referrals/      # Red de afiliados
│   │   │   │   └── api/                # Route Handlers (Proxy → apps/api)
│   │   │   ├── components/
│   │   │   │   ├── terminal-view.tsx   # Logs estilo "Matrix"
│   │   │   │   └── health-badge.tsx    # Estado: WARMUP / ACTIVE / BANNED
│   │   │   └── lib/
│   │   │       └── api-client.ts       # Fetch wrapper tipado
│   │   ├── .env.example
│   │   ├── Dockerfile
│   │   ├── next.config.js
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── worker/                         # WORKER — "El Músculo"
│       ├── src/
│       │   ├── jobs/
│       │   │   ├── smart-send.ts       # 🛡️ Anti-Ban (Jitter + Rotación + Warmup)
│       │   │   ├── agent-run.ts        # 🤖 Lanza contenedores OpenClaw
│       │   │   ├── billing.ts          # 💰 Recalcula créditos
│       │   │   └── compliance.ts       # 🚨 Dispara alertas 70/85/95%
│       │   ├── lib/
│       │   │   ├── docker.ts           # Wrapper Dockerode (crear/destruir jaulas)
│       │   │   └── evolution.ts        # Cliente HTTP → Evolution API
│       │   └── index.ts                # Inicializa Workers BullMQ
│       ├── Dockerfile
│       ├── package.json
│       └── tsconfig.json
│
├── infrastructure/                     # ═══ DEVOPS & SERVICIOS EXTERNOS ═══
│   ├── local/
│   │   ├── docker-compose.yml          # Postgres + Redis + MinIO + Mailpit
│   │   └── ai-stack.yml                # Ollama + Kokoro (dev con GPU)
│   ├── production/
│   │   ├── Caddyfile                   # Reverse Proxy + HTTPS automático
│   │   ├── docker-compose.yml          # TODO: Apps + Evolution + Chatwoot + n8n
│   │   │                               #       + NocoDB + Appsmith + Uptime Kuma
│   │   └── .env.prod
│   └── images/                         # Imágenes Docker Custom
│       └── openclaw-runner/            # 🔒 LA JAULA DEL AGENTE
│           ├── Dockerfile              # Python + OpenClaw deps
│           ├── main.py                 # Recibe args → ejecuta → retorna
│           └── requirements.txt
│
├── packages/                           # ═══ LIBRERÍAS COMPARTIDAS ═══
│   ├── database/                       # Prisma ORM (La Única Verdad)
│   │   ├── prisma/
│   │   │   └── schema.prisma           # Modelos: User, WhatsappInstance, Organization
│   │   ├── src/
│   │   │   ├── index.ts                # Exporta PrismaClient (Singleton)
│   │   │   └── seed.ts                 # Admin user, Planes iniciales
│   │   └── package.json
│   │
│   ├── types/                          # Interfaces TypeScript Compartidas
│   │   ├── src/
│   │   │   ├── smart-send.ts           # SendMessagePayload, InstanceStatus
│   │   │   ├── agent.ts                # OpenClawConfig, TaskResult
│   │   │   ├── billing.ts              # CreditTransaction, PlanTier
│   │   │   └── index.ts                # Re-exporta todo
│   │   └── package.json
│   │
│   ├── logger/                         # Logger Estandarizado (Pino)
│   │   ├── src/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── ui/                             # Componentes UI (React + Tailwind)
│   │   ├── src/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── badge.tsx
│   │   └── package.json
│   │
│   └── tsconfig/                       # Configs de TS compartidas
│       ├── base.json
│       ├── nextjs.json
│       └── node.json
│
├── .dockerignore
├── .gitignore
├── .vscode/
│   └── settings.json
├── package.json                        # Root (Workspaces + Scripts globales)
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── turbo.json                          # Pipeline de Build
```

---

## 2. ⚙️ Configuración Raíz

### `package.json` (Root)

```json
{
  "name": "agencia-saas-monorepo",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "clean": "turbo run clean",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "db:generate": "pnpm --filter @repo/database db:generate",
    "db:push": "pnpm --filter @repo/database db:push",
    "db:studio": "pnpm --filter @repo/database db:studio",
    "db:seed": "pnpm --filter @repo/database db:seed"
  },
  "devDependencies": {
    "turbo": "latest",
    "prettier": "latest",
    "typescript": "latest"
  },
  "packageManager": "pnpm@9.0.0"
}
```

### `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### `turbo.json`

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

---

## 3. 📦 Paquetes Compartidos

### `packages/database`

La **Única Fuente de Verdad** para los datos.

```typescript
// packages/database/src/index.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export * from '@prisma/client';
```

> **Mejora V6:** Singleton robusto que evita múltiples conexiones tanto en desarrollo (hot-reload) como en producción.

### `packages/types` *(NUEVO de la Sugerida)*

```typescript
// packages/types/src/smart-send.ts
export interface SendMessagePayload {
  instanceId: string;
  to: string;
  text: string;
  organizationId: string;
  priority: 'high' | 'normal' | 'low';
}

export type InstanceHealth = 'WARMUP' | 'ACTIVE' | 'THROTTLED' | 'BANNED';
```

```typescript
// packages/types/src/agent.ts
export interface OpenClawConfig {
  taskId: string;
  model: string;
  maxSteps: number;
  timeout: number;
}

export interface TaskResult {
  status: 'success' | 'error' | 'timeout';
  output: string;
  stepsUsed: number;
}
```

---

## 4. 🚀 Backend (`apps/api`) — "El Portero"

**Regla de Oro:** La API **NUNCA** envía un WhatsApp ni ejecuta un agente directamente. Solo **valida, cobra y delega** a la cola.

```typescript
// apps/api/src/middlewares/credit-guard.ts — Moltbot Finance
import { prisma } from '@repo/database';
import { Request, Response, NextFunction } from 'express';

export async function creditGuard(req: Request, res: Response, next: NextFunction) {
  const orgId = req.user.organizationId;
  const org = await prisma.organization.findUnique({ where: { id: orgId } });

  if (!org || org.creditBalance <= 0) {
    return res.status(402).json({
      error: 'INSUFFICIENT_CREDITS',
      message: 'Saldo agotado. Recarga para continuar.',
      balance: org?.creditBalance ?? 0
    });
  }

  next();
}
```

```typescript
// apps/api/src/services/queue.service.ts — Delega al Worker
import { Queue } from 'bullmq';

const whatsappQueue = new Queue('whatsapp-send');
const agentQueue = new Queue('agent-run');

export const queueService = {
  sendWhatsApp: (payload: SendMessagePayload) =>
    whatsappQueue.add('send', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 }
    }),

  runAgent: (config: OpenClawConfig) =>
    agentQueue.add('execute', config, {
      timeout: config.timeout
    })
};
```

---

## 5. ⚙️ Worker (`apps/worker`) — "El Músculo"

### `smart-send.ts` — Lógica Anti-Ban Completa

```typescript
// apps/worker/src/jobs/smart-send.ts
import { Worker } from 'bullmq';
import { prisma } from '@repo/database';
import { evolutionApi } from '../lib/evolution';

const worker = new Worker('whatsapp-send', async job => {
  const { instanceId, to, text, organizationId } = job.data;

  // 1. Verificar salud de la instancia
  const instance = await prisma.whatsappInstance.findUnique({
    where: { id: instanceId }
  });
  if (instance?.health === 'BANNED') throw new Error('Instance banned');

  // 2. Simular "escribiendo..."
  await evolutionApi.setPresence(instanceId, 'composing');

  // 3. Jitter anti-bot (2s a 7s aleatorio)
  const delay = Math.random() * 5000 + 2000;
  await new Promise(r => setTimeout(r, delay));

  // 4. Enviar mensaje
  await evolutionApi.sendText(instanceId, to, text);

  // 5. Descontar crédito
  await prisma.organization.update({
    where: { id: organizationId },
    data: { creditBalance: { decrement: 0.05 } }
  });
}, {
  limiter: { max: 10, duration: 60000 }  // 10 msgs/min por worker
});
```

### `agent-run.ts` — Jaula Docker para OpenClaw

```typescript
// apps/worker/src/jobs/agent-run.ts
import Docker from 'dockerode';
import { Worker } from 'bullmq';

const docker = new Docker();

const worker = new Worker('agent-run', async job => {
  const { taskId, model, maxSteps, timeout } = job.data;

  // Crear contenedor efímero (jaula aislada)
  const container = await docker.createContainer({
    Image: 'openclaw-runner:latest',
    Cmd: ['python', 'main.py', '--task', taskId, '--model', model],
    HostConfig: {
      Memory: 512 * 1024 * 1024,        // Máx 512MB RAM
      NetworkMode: 'none',               // Sin acceso a red
      AutoRemove: true                    // Se destruye al terminar
    }
  });

  await container.start();
  const result = await container.wait();

  return { status: result.StatusCode === 0 ? 'success' : 'error' };
});
```

---

## 6. 🖥️ Frontend (`apps/web`) — "La Cara"

Rutas del Dashboard:

| Ruta | Qué ve el socio |
|---|---|
| `/dashboard` | KPIs: Saldo, Mensajes Hoy, Comisiones |
| `/dashboard/whatsapp` | Semáforo de salud de números (🟢🟡🔴) |
| `/dashboard/agents` | Logs en vivo de agentes OpenClaw |
| `/dashboard/billing` | Historial de créditos y botón de recarga |
| `/dashboard/referrals` | Red de afiliados y comisiones ganadas |

---

## 7. 🐳 Infraestructura

### `infrastructure/production/docker-compose.yml`

Servicios que corren junto a tus apps:

| Servicio | Puerto | Rol |
|---|---|---|
| **Evolution API** | 8080 | Gateway WhatsApp |
| **Chatwoot** | 3000 | Atención Humana (HITL) |
| **n8n** | 5678 | Automatización Low-Code |
| **NocoDB** | 8080 | Admin Panel (vista de DB) |
| **Appsmith** | 8081 | Dashboards para Socios |
| **PostgreSQL** | 5432 | Base de Datos |
| **Redis** | 6379 | Colas BullMQ |
| **Uptime Kuma** | 3001 | Monitoreo |
| **Caddy** | 80/443 | Reverse Proxy + SSL |

### `infrastructure/images/openclaw-runner/` *(NUEVO)*

La "jaula" aislada donde corren los agentes IA:

```dockerfile
# infrastructure/images/openclaw-runner/Dockerfile
FROM python:3.11-slim
WORKDIR /agent
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY main.py .
ENTRYPOINT ["python", "main.py"]
```

---

## 8. 🛡️ SmartSend™ + Compliance (Flujo Completo)

```text
                    ┌─────────────┐
  Mensaje llega →   │  apps/api   │
                    │             │
                    │ 1. Auth ✓   │
                    │ 2. Saldo ✓  │ ← credit-guard.ts
                    │ 3. Encolar  │ → Redis (BullMQ)
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ apps/worker │
                    │             │
                    │ 4. Jitter   │ ← smart-send.ts
                    │ 5. Enviar   │ → Evolution API
                    │ 6. Cobrar   │ → DB (-$0.05)
                    │ 7. Alertar? │ → compliance.ts (70/85/95%)
                    └─────────────┘
```

---

## 9. 🔄 Flujo Híbrido: Código + No-Code

| Capa | Herramienta Pro | Herramienta No-Code |
|---|---|---|
| **Datos** | Prisma (`apps/api`) escribe | NocoDB lo visualiza |
| **Lógica** | BullMQ (`apps/worker`) ejecuta | n8n orquesta integraciones |
| **Visual** | Next.js (`apps/web`) para SEO | Appsmith para dashboards internos |
| **IA** | OpenClaw runner (Docker) | Dify para prototipos rápidos |

---

## 🚀 Checklist de Día 1

```bash
# 1. Scaffolding
npx create-turbo@latest agencia-saas-monorepo --package-manager pnpm

# 2. Instalar dependencias base
pnpm add -w dockerode bullmq ioredis zod dotenv

# 3. Crear paquetes
# packages/database → schema.prisma con modelos
# packages/types → interfaces compartidas
# packages/logger → pino configurado

# 4. Crear apps vacías
# apps/api → Express + controllers + middlewares
# apps/worker → BullMQ workers
# apps/web → Next.js App Router

# 5. Infraestructura local
# infrastructure/local/docker-compose.yml → Postgres + Redis

# 6. Verificar
pnpm dev  # Todo debe arrancar sin errores
```

---

## 10. 💳 Modelo de Monetización (Estrategia "Oportunidades")

> **Pivot:** Pasamos de "Vender Software" a **"Vender Oportunidades"**.
> **Tecnología Clave:** IA Local (Llama 3) para costo cero = Margen bruto >90%.

### Escalera de Valor (3 Capas)

| Plan | Precio/mes | Msgs WhatsApp | Ejecuciones IA | Instancias WA | Valor "Gancho" |
|---|---|---|---|---|---|
| **Gratis** | $0 | 50 | 1 Agente | 1 | "El Caballo de Troya" - Afiliado en potencia |
| **Starter** | $15 | 2,000 | **Ilimitado** | 1 | "El No-Brainer" - Emprendedores sin riesgo |
| **Partner** | $199 | 50,000 | **Ilimitado** | 10 | "La Franquicia" - Tu propia SaaS Marca Blanca |

> **Nota:** El plan "Growth" ($45) se elimina para simplificar la oferta en: Gratis (Entrada) -> Starter (Uso) -> Partner (Negocio).

### Lógica de Cobro

```text
1. El socio elige un Plan → Se le asigna en DB (Organization.planId)
2. El contador de mensajes se reinicia mensualmente.
3. La IA es ILIMITADA en planes pagos (gracias a Local LLMs).
4. El Plan Partner permite revender (Marca Blanca).
```

### Campos Necesarios en Schema (Actualizado)

```prisma
model Plan {
  id                String   @id @default(cuid())
  name              String   @unique
  priceMonthly      Float
  messagesIncluded  Int
  isAiUnlimited     Boolean  @default(false) // Nuevo: Controla si la IA es free
  maxInstances      Int      @default(1)
  isWhiteLabel      Boolean  @default(false) // Nuevo: Para Plan Partner
  organizations     Organization[]
}
```

---

## 11. 🤝 Estrategia de Referidos Recurrentes

> **Ventaja clave del modelo suscripción:** Las comisiones de referidos se pagan **cada mes** mientras el referido siga pagando. Esto motiva a los socios a traer clientes de calidad que se queden.

### Estructura de Comisiones

```text
Nivel 1 (Directo):              20% recurrente mensual
Nivel 2 (Referido del referido): 5% recurrente mensual

Ejemplo:
  Juan → refiere a María (Plan Growth $45/mes)
    → Juan gana $9/mes (20% de $45) = $108/año

  María → refiere a Pedro (Plan Starter $15/mes)
    → María gana $3/mes (20% de $15)
    → Juan gana $0.75/mes (5% de $15, Nivel 2)
```

### Flujo Mensual de Comisiones

```text
              ┌──────────────────────┐
  Día 1 del   │  billing.ts (Worker) │
  ciclo  ───► │                      │
              │ 1. Cobrar plan       │ → Stripe/Manual
              │ 2. Calcular comisión │ → 20% Nivel 1, 5% Nivel 2
              │ 3. Acreditar         │ → CreditTransaction (COMMISSION)
              │ 4. Reiniciar conteo  │ → messagesUsed = 0
              └──────────────────────┘
```

### Tabla de Ganancias Potenciales del Socio

| # Referidos | Plan Promedio | Ingreso Nivel 1/mes | Ingreso/año |
|---|---|---|---|
| 5 | Starter ($15) | $15 | $180 |
| 10 | Growth ($45) | $90 | $1,080 |
| 20 | Mixto (~$30) | $120 | $1,440 |
| 50 | Mixto (~$30) | $300 | $3,600 |

> **Esto es poderoso para vender:** "Refiere 10 agencias y gana $90/mes pasivos. Si ellas refieren a otras, ganas el 5% también."

---

> **Esta arquitectura V6 "20/20" es la fusión definitiva.** Toma la solidez empresarial de nuestra V5 (NocoDB, Chatwoot, Compliance, Referidos) y la precisión quirúrgica de la estructura sugerida (OpenClaw, credit-guard, Controller-Service). El modelo de monetización estilo Mailchimp garantiza ingresos recurrentes, y los referidos de 2 niveles incentivan el crecimiento orgánico. No hay ambigüedades. Cada archivo tiene un propósito claro.
