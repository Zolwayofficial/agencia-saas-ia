---
name: Stripe Billing y Suscripciones (stripe-billing)
description: Define cómo manejar pagos, suscripciones, webhooks y créditos de Stripe en la arquitectura V6.1 del proyecto agencia-saas-ia.
---

# Habilidad: Stripe Billing & Suscripciones

## 1. Arquitectura de Pagos (V6.1)

El sistema de monetización se basa en 3 planes con créditos prepagados:

| Plan | Precio | Créditos |
|------|--------|----------|
| Gratis | $0 | Limitado |
| Starter | $15/mes | Estándar |
| Partner | $199/mes | Ilimitado |

### Archivos clave

- **Controlador principal:** `apps/api/src/controllers/stripe.controller.ts` (291 líneas)
- **Webhooks:** Ruta `POST /api/v1/webhooks/stripe` (usa `express.raw()` para verificar firma)
- **Middleware de créditos:** `apps/api/src/middlewares/credit-guard.ts`
- **Job de facturación:** `apps/worker/src/jobs/billing.ts`

## 2. Flujos Principales

### Checkout (Nuevo suscriptor)

```
Usuario → POST /api/v1/billing/checkout → Stripe Checkout Session → Redirect
→ Stripe webhook (checkout.session.completed) → Actualizar org en DB
```

### Portal de Facturación

```
Usuario → POST /api/v1/billing/portal → Stripe Customer Portal URL
```

### Sistema de Créditos (V6.1 — Reserva Previa)

```
API recibe petición de agente
  → credit-guard verifica saldo
  → Crea CreditReservation (PENDING) en DB
  → Encola job en BullMQ
Worker ejecuta agente
  → Éxito: Marca reserva CONFIRMED + descuenta saldo (transacción atómica)
  → Fallo: Marca reserva FAILED y libera la reserva
```

### Modelos Prisma involucrados

- `Organization` — tiene `stripeCustomerId`, `creditBalance`
- `Subscription` — vincula org con plan y estado de Stripe
- `CreditTransaction` — registro de cargos/abonos
- `CreditReservation` — [V6.1] reserva previa antes de ejecutar agentes

## 3. Variables de Entorno

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PARTNER_PRICE_ID=price_...
```

## 4. Reglas de Seguridad

> [!CAUTION]
> **Cumplimiento Stripe:** El negocio se define como **B2B SaaS de automatización de soporte**. NUNCA uses palabras como "telemarketing", "cold calling", "ventas agresivas" ni en el código ni en la landing page. Stripe puede revocar la cuenta si detecta esas palabras.

- Siempre verifica la firma del webhook con `stripe.webhooks.constructEvent()`
- El `STRIPE_WEBHOOK_SECRET` NUNCA va en el frontend
- Cambios en precios/planes: créalos PRIMERO en el Dashboard de Stripe, luego actualiza los `PRICE_ID` en `.env.prod`
