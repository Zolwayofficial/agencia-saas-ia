# Fases de Implementación: Agencia SaaS MiNuevaLLC

> **Última actualización:** 2026-02-04

---

## Fase 1: Infraestructura Base ✅

| Tarea | Estado |
|-------|--------|
| VPS Contabo configurado | ✅ |
| Docker + Portainer | ✅ |
| Cloudflare DNS | ✅ |
| Nginx Proxy Manager + SSL | ✅ |

---

## Fase 2: Base de Datos (NocoDB)

| Tarea | Estado |
|-------|--------|
| Instalar NocoDB en Docker | ⬜ |
| Crear tabla `Socios` | ⬜ |
| Crear tabla `Leads_Pruebas` | ⬜ |
| Crear tabla `Créditos` | ⬜ |
| Crear tabla `Comisiones` | ⬜ |
| Crear tabla `Documentos_Biblioteca` | ⬜ |
| Crear vistas filtradas para n8n | ⬜ |

---

## Fase 3: Capa de IA

| Tarea | Estado |
|-------|--------|
| Instalar Ollama en Docker | ⬜ |
| Descargar Llama 3.1 8B | ⬜ |
| Instalar Dify | ⬜ |
| Configurar Whisper (STT) | ⬜ |
| Configurar Kokoro (TTS) | ⬜ |
| Probar pipeline completo | ⬜ |

---

## Fase 4: Comunicaciones

| Tarea | Estado |
|-------|--------|
| Instalar Evolution API v2 | ⬜ |
| Conectar WhatsApp | ⬜ |
| Instalar Chatwoot | ⬜ |
| Configurar Human-in-the-loop | ⬜ |

---

## Fase 5: Orquestación (n8n)

### 5.1 Conectividad Base

| Tarea | Estado |
|-------|--------|
| Instalar n8n en Docker | ⬜ |
| Conectar n8n ↔ NocoDB | ⬜ |
| Conectar n8n ↔ Evolution API | ⬜ |

### 5.2 Validación de Saldo

| Tarea | Estado |
|-------|--------|
| Nodo: Consultar saldo del socio | ⬜ |
| Nodo IF: ¿Tiene saldo? | ⬜ |
| Flujo: Alerta de saldo agotado | ⬜ |

### 5.3 Rate Limiting

| Tarea | Estado |
|-------|--------|
| Nodo: Contar mensajes/hora del socio | ⬜ |
| Nodo IF: ¿Superó límite? | ⬜ |
| Flujo: Mensaje de límite alcanzado | ⬜ |

### 5.4 Integración con IA

| Tarea | Estado |
|-------|--------|
| Nodo: Enviar a Ollama (principal) | ⬜ |
| Nodo: Fallback a Groq | ⬜ |
| Nodo: Fallback a Cloudflare AI | ⬜ |
| Nodo: Whisper para audios | ⬜ |
| Nodo: Kokoro para respuesta en voz | ⬜ |

### 5.5 Cobro Automático

| Tarea | Estado |
|-------|--------|
| Nodo: Registrar consumo en Créditos | ⬜ |
| Rollup automático en NocoDB | ⬜ |

### 5.6 Moltbot (Supervisor)

| Tarea | Estado |
|-------|--------|
| Workflow: Alertas de saldo bajo | ⬜ |
| Workflow: Alertas de errores | ⬜ |
| Workflow: Resumen diario | ⬜ |

---

## Fase 6: Dashboard del Socio (Appsmith)

| Tarea | Estado |
|-------|--------|
| Instalar Appsmith | ⬜ |
| Conectar a vistas NocoDB | ⬜ |
| Página: Saldo en tiempo real | ⬜ |
| Página: Historial de consumos | ⬜ |
| Página: Panel de afiliados | ⬜ |
| Botón: Enlace a recarga | ⬜ |

---

## Fase 7: Landing Page (minuevallc.com)

| Tarea | Estado |
|-------|--------|
| Diseño de landing page | ⬜ |
| Sección: Hero | ⬜ |
| Sección: Cómo funciona | ⬜ |
| Sección: Precios | ⬜ |
| Sección: Testimonios | ⬜ |
| Formulario de contacto/registro | ⬜ |
| Deploy en VPS | ⬜ |

---

## Fase 8: Lanzamiento

| Tarea | Estado |
|-------|--------|
| Pruebas end-to-end | ⬜ |
| Onboarding de primer socio piloto | ⬜ |
| Ajustes post-feedback | ⬜ |
| Lanzamiento público | ⬜ |

---

## Timeline Estimado

| Fase | Duración |
|------|----------|
| Fases 1-4 (Infraestructura) | 1-2 semanas |
| Fase 5 (n8n + flujos) | 1-2 semanas |
| Fase 6 (Dashboard) | 1 semana |
| Fase 7 (Landing) | 1 semana |
| Fase 8 (Lanzamiento) | 1 semana |
| **Total** | **5-7 semanas** |
