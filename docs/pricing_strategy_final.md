# Estrategia de Precios & Referidos (Definitiva)

> **Última actualización:** 14 Febrero 2026
> **Estado:** Implementado en Landing, Backend (Seed) y Dashboard.
> **Fuente de Verdad:** `packages/database/src/seed.ts` y this file.

## 💰 Planes de Suscripción

## Estructura de Precios (Definitiva)

### 1. Plan Gratis (Freemium) - $0/mes

**Objetivo:** Viralidad y Entrada masiva.

- **Mensajes:** 50/mes (suficiente para probar).
- **WhatsApp:** 1 número (QR).
- **IA:** 1 Agente Básico.
- **Comisión:** Si actualiza, el referrer gana el 20%.

### 2. Plan Starter - $15/mes

**Objetivo:** Accesibilidad Total (Emprendedores).

- **Mensajes:** 1,000/mes.
- **WhatsApp:** 1 número (QR).
- **IA:** Local (Llama 3) Ilimitada.
- **Template:** 1 Vertical (ej. Restaurantes).
- **Soporte:** Comunidad.

### 3. Plan Pro - $79/mes

**Objetivo:** Negocios en Crecimiento.

- **Mensajes:** 10,000/mes.
- **WhatsApp:** 3 números (Business API + QR).
- **IA:** Multi-Agentes (Ventas + Soporte + Citas).
- **Templates:** Acceso a TODOS los verticales.
- **Support:** Email Prioritario.

### 4. Plan Partner (Agency) - $199/mes

**Objetivo:** Revendedores y Agencias.

- **Mensajes:** Ilimitados (Fair use).
- **Sub-cuentas:** 10 Clientes incluidos.
- **Feature:** Marca Blanca Completa + API.
- **Negocio:** Revende a tu precio (Margen 100%).

## 🤝 Comisiones de Partners (Referral Program)

**Para Agencias que traen clientes a nuestros planes:**

- **Comisión Base:** **30% Recurrente** (12 meses).
- **Bonus Activación:** **100% del 1er mes** del cliente (Bounty).
- **Incentivo Cliente:** Mes Extra Gratis o 20% Descuento.

### Notas Técnicas

- **Límites:** Protegidos por middleware `credit-guard`. Si el usuario excede mensajes/IA, se bloquea el servicio hasta upgrade/renovación.
- **WhatsApp:**
  - *Starter:* Solo conexión QR (Evolution API).
  - *Pro/Agency:* Acceso a QR (Evolution) y WhatsApp Business Cloud API (Meta).

---

## 🤝 Sistema de Referidos

Modelo simplificado de 2 niveles. Disponible para cualquier usuario registrado.

### Comisiones Recurrentes

Se pagan **cada vez** que el referido paga su suscripción mensual.

| Nivel | Comisión | Descripción |
| :--- | :--- | :--- |
| **Nivel 1** | **20%** | Referidos directos (traídos por tu link). |
| **Nivel 2** | **5%** | Referidos de tus referidos. |

### Ejemplo de Ganancias

Si refieres a 10 personas en el plan **Pro ($79)**:

```
10 x $79 x 20% = $158 / mes de ingreso pasivo recurrente
```

---

## 📂 Archivos Clave en Código

1. **Base de Datos (Seed):** `packages/database/src/seed.ts` (Define los precios base).
2. **Landing Page:** `landing/index.html` (Muestra precios y features).
3. **Billing UI:** `apps/web/src/app/dashboard/billing/page.tsx` (Checkout Stripe).
4. **Calculadora Referidos:** `apps/web/src/app/dashboard/referrals/page.tsx` (Muestra potencial).
