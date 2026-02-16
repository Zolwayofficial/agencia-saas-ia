# 🏗️ Arquitectura V6.1 — Versión Definitiva (Post-Auditoría)

> **Origen:** V6 "20/20" + 7 mejoras validadas de auditoría de seguridad y resiliencia
> **Stack:** Turborepo · pnpm · Docker · TypeScript · BullMQ · Prisma · Zod
> **Filosofía:** "Lo que cobra (API) nunca toca lo que gasta (Worker). Lo peligroso (Agentes) vive en jaulas. Lo que entra se valida siempre."
> **Última actualización:** 2026-02-16

---

## 📊 Changelog: V6 → V6.1

| Aspecto | V6 | V6.1 |
|---|---|---|
| **Validación de entrada** | ❌ Implícita | ✅ Zod explícito (DTOs en `packages/types/src/dto/`) |
| **Manejo de errores** | ❌ try/catch repetido | ✅ Middleware `errorHandler` centralizado |
| **Idempotencia** | ❌ No existe | ✅ `idempotencyKey` + modelo `SentMessage` |
| **Cobro de agentes** | ⚠️ Post-ejecución | ✅ Reserva → Ejecución → Confirmación |
| **Jobs fallidos** | ❌ Solo log | ✅ Dead Letter Queue (`FailedMessage` model) |
| **Health checks** | ⚠️ Solo `{status:'ok'}` | ✅ Verifica DB, Redis, servicios |
| **Rate limiting** | ❌ No existe | ✅ Por organización según plan |
| **Logger** | ⚠️ Básico | ✅ Estructurado con `SERVICE_NAME` |

---

## 1. 📂 Estructura de Directorios (Cambios V6.1)

Cambios respecto a V6 marcados con `[V6.1]`:

```text
agencia-saas-monorepo/
│
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   └── env.ts
│   │   │   ├── controllers/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── agent.controller.ts
│   │   │   │   ├── billing.controller.ts
│   │   │   │   ├── health.controller.ts       # [V6.1] Mejorado: verifica DB/Redis
│   │   │   │   ├── referral.controller.ts
│   │   │   │   ├── stripe.controller.ts
│   │   │   │   ├── webhook.controller.ts
│   │   │   │   └── whatsapp.controller.ts     # [V6.1] Validación Zod
│   │   │   ├── middlewares/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── credit-guard.ts
│   │   │   │   ├── error-handler.ts           # [V6.1] NUEVO
│   │   │   │   └── rate-limit.ts              # [V6.1] NUEVO
│   │   │   ├── routes/
│   │   │   │   └── v1.ts
│   │   │   ├── services/
│   │   │   │   ├── queue.service.ts
│   │   │   │   ├── referral.service.ts
│   │   │   │   └── compliance.service.ts
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── worker/
│   │   ├── src/
│   │   │   ├── jobs/
│   │   │   │   ├── smart-send.ts              # [V6.1] Idempotencia + DLQ
│   │   │   │   ├── agent-run.ts               # [V6.1] CreditReservation
│   │   │   │   ├── ai-response.ts
│   │   │   │   ├── billing.ts
│   │   │   │   └── compliance.ts
│   │   │   ├── lib/
│   │   │   │   ├── docker.ts
│   │   │   │   └── evolution.ts
│   │   │   └── index.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── web/                                    # Frontend Next.js (sin cambios V6.1)
│   │   └── ...
│   │
│   ├── moltbot/                                # ⚠️ LEGACY — Pendiente migración
│   └── voice-agent/                            # ⚠️ LEGACY — Pendiente migración
│
├── packages/
│   ├── database/
│   │   ├── prisma/
│   │   │   └── schema.prisma                  # [V6.1] +SentMessage, +CreditReservation,
│   │   │                                      #         +FailedMessage, Plan.rateLimit
│   │   └── src/
│   │       └── index.ts
│   │
│   ├── types/
│   │   └── src/
│   │       ├── dto/                            # [V6.1] NUEVA CARPETA
│   │       │   ├── whatsapp.dto.ts
│   │       │   ├── agent.dto.ts
│   │       │   └── auth.dto.ts
│   │       ├── smart-send.ts                   # [V6.1] +idempotencyKey
│   │       ├── agent.ts
│   │       ├── billing.ts
│   │       └── index.ts
│   │
│   ├── logger/
│   │   └── src/
│   │       └── index.ts                        # [V6.1] +SERVICE_NAME +bindings
│   │
│   └── tsconfig/
│       ├── base.json
│       ├── nextjs.json
│       └── node.json
│
├── infrastructure/                             # Sin cambios V6.1
│   ├── docker-compose.yml
│   ├── local/
│   ├── production/
│   ├── gateway/
│   ├── images/
│   ├── db/
│   └── voice/
│
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

---

## 2. 🛡️ Capa de Validación (NUEVO V6.1)

**Regla:** Todo dato que entra por HTTP se valida con Zod ANTES de procesarse.

```text
  Request → Zod Schema → Controller → Service → Queue
              ↓
         400 VALIDATION_ERROR (si falla)
```

### Flujo de Validación

```typescript
// packages/types/src/dto/whatsapp.dto.ts
import { z } from 'zod';

export const SendMessageSchema = z.object({
  instanceId: z.string().min(1),
  to: z.string().regex(/^\d{10,15}$/),
  text: z.string().min(1).max(4096),
  priority: z.enum(['high', 'normal', 'low']).default('normal'),
  idempotencyKey: z.string().uuid().optional(),
});
```

```typescript
// apps/api/src/controllers/whatsapp.controller.ts
send: async (req: Request, res: Response) => {
    const parsed = SendMessageSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            error: 'VALIDATION_ERROR',
            details: parsed.error.errors,
        });
    }
    // ... usar parsed.data (tipado y sanitizado)
}
```

---

## 3. 🚨 Manejo de Errores (NUEVO V6.1)

Un solo middleware captura todos los errores de la app:

```typescript
// apps/api/src/middlewares/error-handler.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public isOperational = true
  ) { super(message); }
}

export function errorHandler(
  err: Error, req: Request, res: Response, _next: NextFunction
) {
  if (err instanceof ZodError)    → 400 VALIDATION_ERROR
  if (err instanceof AppError)    → err.statusCode + err.code
  else                            → 500 INTERNAL_ERROR (+ log)
}
```

---

## 4. 🔑 Idempotencia (NUEVO V6.1)

Previene envíos duplicados por reintentos de red o doble clic:

```text
  Cliente genera UUID → Lo envía como idempotencyKey
                            ↓
  Worker verifica: ¿Existe en DB? → Sí: Skip   No: Procesar y guardar
```

Modelo Prisma:

```prisma
model SentMessage {
  id              String   @id @default(cuid())
  idempotencyKey  String?  @unique
  organizationId  String
  instanceId      String
  to              String
  jobId           String?
  status          String   @default("sent")
  createdAt       DateTime @default(now())
  @@map("sent_messages")
}
```

---

## 5. 💳 CreditReservation para Agentes (MEJORADO V6.1)

**Problema V6:** El cobro ocurría DESPUÉS de ejecutar el agente. Si la transacción de cobro fallaba, el agente se ejecutaba gratis.

**Solución V6.1:** Patrón Reserva → Ejecución → Confirmación:

```text
  API recibe petición
    → credit-guard verifica saldo
    → Crea CreditReservation (PENDING)
    → Encola job

  Worker ejecuta agente
    → Marca reserva CONFIRMED + descuenta saldo (transacción atómica)
    → Si falla, marca FAILED y libera la reserva
```

```prisma
model CreditReservation {
  id             String            @id @default(cuid())
  organizationId String
  amount         Float
  status         ReservationStatus @default(PENDING)
  jobId          String?           @unique
  createdAt      DateTime          @default(now())
  expiresAt      DateTime
  @@index([organizationId, status])
  @@map("credit_reservations")
}

enum ReservationStatus {
  PENDING
  CONFIRMED
  FAILED
  EXPIRED
}
```

---

## 6. 💀 Dead Letter Queue (NUEVO V6.1)

Jobs que fallan 3+ veces se guardan para diagnóstico:

```prisma
model FailedMessage {
  id             String   @id @default(cuid())
  organizationId String
  jobId          String?
  payload        Json
  error          String
  attempts       Int      @default(0)
  failedAt       DateTime @default(now())
  resolved       Boolean  @default(false)
  @@index([organizationId, resolved])
  @@map("failed_messages")
}
```

---

## 7. 🏥 Health Checks (MEJORADO V6.1)

El endpoint `/health` ahora verifica servicios reales:

```typescript
GET /api/v1/health → 200 o 503

{
  "status": "ok" | "degraded",
  "service": "api",
  "uptime": 12345,
  "checks": {
    "database": "healthy" | "unhealthy",
    "api": "healthy"
  }
}
```

---

## 8. 🚦 Rate Limiting (NUEVO V6.1)

Limita requests por organización según su plan:

```typescript
// Campo nuevo en Plan
model Plan {
  // ... campos existentes ...
  rateLimit  Int  @default(60)  // Requests por minuto
}
```

```typescript
// apps/api/src/middlewares/rate-limit.ts
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  keyGenerator: (req) => req.organizationId || req.ip,
});
```

---

## 9-11. Sin Cambios desde V6

Los siguientes componentes permanecen idénticos a la V6 "20/20":

- **SmartSend™ Anti-Ban** (flujo Jitter + Warmup + Rotación)
- **Modelo de Monetización** (Gratis $0 / Starter $15 / Partner $199)
- **Referidos Recurrentes** (20% Nivel 1, 5% Nivel 2)
- **Infraestructura Docker** (15 servicios en docker-compose)
- **Frontend Next.js** (`apps/web`)

Para referencia completa, ver: [ARQUITECTURA-V6-DEFINITIVA.md](file:///C:/Users/Billy/.gemini/antigravity/scratch/agencia-saas-ia/docs/ARQUITECTURA-V6-DEFINITIVA.md)

---

## 📋 Schema Prisma V6.1 Completo

Los modelos **nuevos** de V6.1 son:

| Modelo | Propósito |
|---|---|
| `SentMessage` | Tracking de idempotencia para mensajes |
| `CreditReservation` | Reserva de crédito antes de ejecutar agentes |
| `FailedMessage` | Dead Letter Queue para jobs fallidos |

El campo **nuevo** en modelos existentes:

| Modelo | Campo | Propósito |
|---|---|---|
| `Plan` | `rateLimit` | Requests/min permitidos por plan |

---

## 🔗 Dependencias Nuevas (Todas Open Source)

| Paquete | Dónde | Licencia |
|---|---|---|
| `zod` | `packages/types` | MIT |
| `express-rate-limit` | `apps/api` | MIT |

> **NOTA:** No se agregan dependencias de pago ni propietarias. Todo el stack sigue siendo 100% open source.

---

> **V6.1 es una evolución incremental de V6.** No cambia la filosofía ni la arquitectura fundamental. Solo agrega las capas de seguridad, validación y resiliencia que faltan para ir a producción con confianza.
