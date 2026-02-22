---
name: Growth Marketing y Referidos (growth-marketing)
description: Documenta la estrategia de crecimiento del SaaS, el sistema de referidos (20% recurrente single-level), pricing de los 4 planes, y tácticas de conversión para B2B.
---

# Habilidad: Growth Marketing y Sistema de Referidos

## 1. Modelo de Negocio

**Tipo:** SaaS B2B de automatización de atención al cliente con IA.
**Diferenciador:** SmartSend™ (anti-ban para WhatsApp) + Inteligencia Vertical por industria.
**Motor de crecimiento:** Referidos orgánicos (cero presupuesto en ads).

> [!CAUTION]
> **Regla crítica de Stripe:** Este negocio se posiciona como **B2B SaaS de soporte y automatización inbound**. NUNCA uses terminología de telemarketing, cold calling, spam, ventas agresivas, o marketing multinivel. Stripe puede cancelar la cuenta si detecta esas palabras.

## 2. Planes y Precios (Actualizados)

| Plan | Precio | Target | Features clave |
|------|--------|--------|---------------|
| **Gratis** | $0/mes | Curiosos | 50 msgs/mes, 1 agente básico, 1 WhatsApp |
| **Starter** | $15/mes | Emprendedores | 1,000 msgs, IA local ilimitada, 1 vertical |
| **Pro** | $79/mes | Negocios | 10,000 msgs, multi-agentes, API Meta, todos los verticales |
| **Partner** | $199/mes | Agencias | Msgs ilimitados, 10 sub-cuentas, marca blanca |

**Archivos de referencia:**

- Seed de DB: `packages/database/src/seed.ts`
- Landing de precios: `landing/index.html`
- UI de billing: `apps/web/src/app/dashboard/billing/page.tsx`

## 3. Sistema de Referidos (ACTUALIZADO)

> [!IMPORTANT]
> **El modelo multinivel fue DESCARTADO** para cumplir con las políticas de Stripe. El sistema actual es de un solo nivel.

### Modelo actual

- **Comisión: 20% recurrente** por cada cliente referido
- **Duración:** Mientras ese cliente mantenga su suscripción activa
- **Sin niveles:** No hay comisiones de segundo nivel ni multinivel
- **Sin bounties:** No hay bonificaciones de primer mes

### Ejemplo

```
Refieres a 10 clientes en plan Pro ($79/mes):
  → 10 × $79 × 20% = $158/mes de ingreso recurrente
  → Mientras ellos paguen, tú cobras
```

### Archivos clave

- **Backend:** `apps/api/src/controllers/referral.controller.ts`
- **Dashboard:** `apps/web/src/app/dashboard/referrals/page.tsx`

## 4. Verticales de Industria (Roadmap)

Estrategia: dominar un nicho a la vez, crear caso de éxito, expandir.

| Vertical | Pain Point | Solución |
|----------|-----------|----------|
| 🦷 Clínicas Dentales | Pacientes faltan a citas | Recordatorios + Re-agendamiento auto |
| 🍔 Restaurantes | Comisiones altas UberEats | Menú WhatsApp + Pedidos directos |
| 💈 Salones/Barber | Teléfono suena todo el día | Agendamiento sincronizado |
| 🏠 Inmobiliarias | Leads fríos | Calificación IA + Tour virtual |
| 📦 E-commerce | Carritos abandonados | Recuperación proactiva |

## 5. Tácticas de Copy y Conversión

Al escribir textos comerciales para landing, emails o dashboard:

- **CTA principal:** "Empieza Gratis" (no "Comprar" ni "Registrarse")
- **Propuesta de valor en 1 frase:** "Automatiza tu atención al cliente con IA, sin riesgo de baneos"
- **Garantía:** 30 días de devolución, sin contratos, cancelación con 1 clic
- **Social Proof:** Casos de éxito por industria vertical
- **Urgencia ética:** "Cupos limitados para Partner" (no falsa urgencia)
