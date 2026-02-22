---
name: WhatsApp Evolution API (whatsapp-evolution)
description: Documenta la integración con Evolution API para WhatsApp, incluyendo instancias, QR codes, SmartSend anti-ban y webhooks de mensajería.
---

# Habilidad: WhatsApp via Evolution API

## 1. Arquitectura

El sistema usa **Evolution API** como bridge a WhatsApp:

```
Usuario (Dashboard) → API REST → Evolution API (Docker) → WhatsApp
                                        ↓
                               Webhook → Worker (SmartSend™)
```

### Archivos clave

- **Controlador:** `apps/api/src/controllers/whatsapp.controller.ts` (263 líneas)
- **Lib Evolution:** `apps/api/src/lib/evolution.ts`
- **SmartSend Job:** `apps/worker/src/jobs/smart-send.ts`
- **DTO de validación:** `packages/types/src/dto/whatsapp.dto.ts`

## 2. Endpoints

| Método | Ruta | Función |
|--------|------|---------|
| POST | `/api/v1/whatsapp/instances` | Crear nueva instancia (verifica límite del plan) |
| GET | `/api/v1/whatsapp/instances` | Listar instancias de la organización |
| GET | `/api/v1/whatsapp/instances/:id/qr` | Obtener QR para escanear |
| POST | `/api/v1/whatsapp/instances/:id/logout` | Desconectar instancia |
| DELETE | `/api/v1/whatsapp/instances/:id` | Eliminar instancia permanentemente |
| POST | `/api/v1/whatsapp/send` | Encolar mensaje via SmartSend |

## 3. SmartSend™ Anti-Ban (V6.1)

El envío de mensajes NO va directamente a WhatsApp. Se encola y envía con protecciones:

- **Jitter:** Delay aleatorio entre mensajes (simula comportamiento humano)
- **Warmup:** Envía menos mensajes los primeros días de una instancia nueva
- **Rotación:** Si hay varias instancias, distribuye la carga
- **Idempotencia [V6.1]:** `idempotencyKey` UUID evita envíos duplicados por reintentos

### Validación Zod (V6.1)

```typescript
SendMessageSchema = z.object({
  instanceId: z.string().min(1),
  to: z.string().regex(/^\d{10,15}$/),
  text: z.string().min(1).max(4096),
  priority: z.enum(['high', 'normal', 'low']).default('normal'),
  idempotencyKey: z.string().uuid().optional(),
});
```

## 4. Variables de Entorno

```
EVOLUTION_API_URL=http://evolution_api:8080
EVOLUTION_API_KEY=<clave de API>
```

## 5. Reglas Importantes

> [!WARNING]
> Cambiar la configuración de Evolution API o sus webhooks puede romper la recepción de mensajes entrantes. Siempre verifica que el webhook callback URL apunte al servicio correcto dentro de la red Docker (ej. `http://saas-api:3001/api/v1/webhooks/whatsapp`).

- Los números de teléfono van SIN el `+` y CON código de país (ej. `5215512345678`)
- Máximo 4096 caracteres por mensaje
- Si el QR no se escanea en 60 segundos, hay que regenerarlo
