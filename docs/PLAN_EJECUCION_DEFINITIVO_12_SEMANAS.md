# 📅 Plan de Ejecución Definitivo (12 Semanas)

> **Objetivo:** Implementar la "Estrategia de Ecosistema" ($0 Viral + $15 Masivo + Partners).
> **Foco:** Velocidad de implementación y validación de viralidad.

---

## 🏗️ Fase 1: Cimientos "Freemium" (Semanas 1-4)

**Meta:** Lanzar el Plan Gratis y el Plan Starter ($15) funcionales.

### Semana 1: Ajuste de Pricing & Límites

- [ ] **Stripe:** Configurar nuevos productos ($15, $79, $199).
- [ ] **Database:** Actualizar seed y esquemas para soportar "Gratis" (sin tarjeta).
- [ ] **Credit Guard:** Implementar límites duros (50 msgs para gratis, infinito para $15).

### Semana 2: Infraestructura IA Local (Costo Cero)

- [ ] **Llama 3:** Optimizar despliegue en VPS para soportar múltiples usuarios concurrentes.
- [ ] **Cola de Mensajes:** Implementar BullMQ para no saturar la RAM con usuarios gratis.
- [ ] **Landing:** Actualizar copy y pricing table final.

### Semana 3: Experiencia "First Aha!"

- [ ] **Onboarding:** Flow ultra-rápido para usuarios gratis (QR -> Chat -> Primer mensaje).
- [ ] **Templates:** Cargar 1 template vertical (Restaurante) para el Plan Starter.
- [ ] **Email:** Secuencia de bienvenida automática ("Haz upgrade a $15").

### Semana 4: Validación & Bug Fixes

- [ ] **Soft Launch:** Invitar a 50 usuarios beta al plan gratis.
- [ ] **Stress Test:** Verificar consumo de RAM con 50 agentes activos.
- [ ] **Feedback Loop:** Ajustar UX basado en tickets de soporte.

---

## 🚀 Fase 2: Motor de Crecimiento (Semanas 5-8)

**Meta:** Activar las 3 Capas de Referidos.

### Semana 5: Atribución & Tracking

- [ ] **Links:** Generador de links únicos referidos v2 (persistentes).
- [ ] **Cookie:** Implementar lógica "Last-click" 90 días.
- [ ] **Dashboard:** Vista "Mis Referidos" para usuarios gratis (ver cuánto ganarían).

### Semana 6: Incentivos Doble Lado

- [ ] **Créditos:** Sistema de "Wallet" interno (aplicar saldo a facturas futuras).
- [ ] **Descuentos:** Cupones automáticos via Stripe API para referidos.
- [ ] **Notificaciones:** WhatsApp al referidor cuando alguien se registra.

### Semana 7: Viral Loops (In-Product)

- [ ] **Share Button:** Botón flotante "Regala 20%" en el dashboard.
- [ ] **Team Invites:** Flow de invitación de miembros con tracking.
- [ ] **Watermark:** "Powered by..." en el widget de chat gratis.

### Semana 8: Lanzamiento Viral

- [ ] **Campaña:** Email a base de datos actual anunciando el programa.
- [ ] **Gamificación:** Barra de progreso "Invita a 3 y tu mes es gratis".

---

## 🏢 Fase 3: Escalamiento & Partners (Semanas 9-12)

**Meta:** Activar la fuerza de ventas externa (Agencias).

### Semana 9: Portal de Partners

- [ ] **Dashboard Agency:** Vista especial para el plan de $199.
- [ ] **Gestión Clientes:** UI para crear/ver sus 10 sub-cuentas.
- [ ] **Assets:** Sección de descarga de banners y scripts de venta.

### Semana 10: Whitelabeling

- [ ] **Custom Domain:** Permitir CNAME para agencias (ej. `app.miagencia.com`).
- [ ] **Branding:** Subir logo propio que reemplaza al nuestro en el dashboard de sus clientes.

### Semana 11: Outbound Partners

- [ ] **Scraping:** Identificar 100 agencias de marketing en Latam.
- [ ] **Outreach:** Email frío invitándolos al "Programa de Partners Fundadores".
- [ ] **Webinar:** Demo en vivo exclusiva para agencias.

### Semana 12: Optimización Total (The Flywheel)

- [ ] **Análisis K-Factor:** ¿Cada usuario trae >1 usuario?
- [ ] **Ajuste de Comisiones:** Si es necesario, subir/bajar incentivos.
- [ ] **Roadmap Q2:** Planificar expansión a vertical #2 (Inmobiliaria).

---

## ⚠️ Riesgos & Mitigación

1. **Abuso de CPU (IA Local):** Limitar tokens/seg por usuario gratis.
2. **Fraude de Referidos:** Implementar verificación de IP y teléfono obligatorio.
3. **Soporte:** Crear base de conocimiento (FAQ) robusta para no saturar con usuarios gratis.
