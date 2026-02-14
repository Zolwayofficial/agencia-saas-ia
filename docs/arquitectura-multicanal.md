# Arquitectura Multi-Canal con Moltbot: MiNuevaLLC

> **Última actualización:** 2026-02-04  
> **Costo base:** $0 (arquitectura híbrida)

---

## 1. ¿Qué es Moltbot?

| Aspecto | Moltbot | Evolution API |
|---------|---------|---------------|
| **Hosting** | Cloud SaaS | Self-hosted |
| **RAM local** | 0 MB | 512MB-1GB |
| **Costo** | Freemium ($0-$19+) | $0 |
| **Open-source** | No | Sí (Apache 2.0) |
| **Control** | Limitado a API | Total |

> **Moltbot = Hub cloud para múltiples canales. No consume RAM en tu VPS.**

---

## 2. Canales Soportados

### ✅ Canales Disponibles

| Canal | Límites Free | Costo Extra |
|-------|--------------|-------------|
| **WhatsApp Business** | 1000 msg/día (Tier 1) | $0.005-0.05/msg Meta |
| **Telegram** | 30 msg/seg | $0 |
| **Instagram DM** | 1000 conv/día | $0 |
| **Facebook Messenger** | 2000 msg/día proactivos | $0 |
| **Webchat** | Ilimitado | $0 |
| **Email (SMTP)** | Según proveedor | Variable |

### ❌ NO Soportados

| Canal | Razón |
|-------|-------|
| TikTok DMs | Sin API pública |
| Twitter/X | API muy costosa |
| LinkedIn | Prohibido por ToS |

---

## 3. Arquitectura Híbrida Recomendada ($0)

```
┌─────────────────────────────────────────┐
│          CANALES DE ENTRADA             │
├─────────────────────────────────────────┤
│ WhatsApp ────► Evolution API (self-host)│ ← $0
│ Telegram ────► Moltbot Free             │ ← $0
│ Instagram ───► Moltbot Free             │ ← $0
│ Facebook ────► Moltbot Free             │ ← $0
│ Webchat ─────► Moltbot Free             │ ← $0
└─────────────────┬───────────────────────┘
                  │
                  ▼
          ┌───────────────┐
          │      n8n      │ ← Orquestador
          └───────┬───────┘
                  │
          ┌───────▼───────┐
          │ Dify + Ollama │ ← IA local
          └───────┬───────┘
                  │
          ┌───────▼───────┐
          │    NocoDB     │ ← Base de datos
          └───────────────┘
```

**Justificación:**

- Evolution API para WhatsApp = $0 (tu canal crítico)
- Moltbot Free = ~500 msg/mes gratis en otros canales
- Sin costo adicional hasta ~8000 msg/mes totales

---

## 4. Comparativa WhatsApp

| Aspecto | Evolution API | Moltbot + WA Business |
|---------|---------------|----------------------|
| Método | WhatsApp Web emulado | API oficial Meta |
| Límite | 500-1000 msg/día | 1000-100k msg/día |
| Riesgo ban | Medio-Alto | Nulo |
| Botones | ❌ | ✅ |
| Costo | $0 | $19/mes + $0.005/msg |

**Decisión:** Evolution API para iniciar ($0), migrar a Moltbot si creces.

---

## 5. Integración n8n + Moltbot

### Webhook de Entrada

```json
POST https://tu-n8n.com/webhook/moltbot
{
  "event": "message.received",
  "channel": "telegram",
  "from": "+51987654321",
  "message": {
    "type": "text",
    "content": "Hola, necesito info"
  },
  "conversation_id": "conv_abc123"
}
```

### Normalización de Mensajes (nodo Code)

```javascript
const rawData = $input.item.json;
let normalized = {
  channel: '',
  user_id: '',
  message: '',
  conversation_id: ''
};

// Evolution API (WhatsApp)
if (rawData.key?.remoteJid) {
  normalized.channel = 'whatsapp';
  normalized.user_id = rawData.key.remoteJid.split('@')[0];
  normalized.message = rawData.message?.conversation || '';
  normalized.conversation_id = `wa_${normalized.user_id}`;
}
// Moltbot (otros canales)
else if (rawData.channel) {
  normalized.channel = rawData.channel;
  normalized.user_id = rawData.from;
  normalized.message = rawData.message?.content || '';
  normalized.conversation_id = rawData.conversation_id;
}

return normalized;
```

### Switch por Canal

```javascript
const channel = $json.channel.toLowerCase();
switch(channel) {
  case 'whatsapp': return 0; // → Evolution API
  case 'telegram': return 1; // → Moltbot
  case 'instagram': return 2; // → Moltbot
  case 'facebook': return 3; // → Moltbot
  default: return 4; // → Log error
}
```

### Respuesta Dinámica

```javascript
const channel = $json.channel;

if (channel === 'whatsapp') {
  return {
    url: 'https://evolution-api/message/sendText/INSTANCE',
    headers: { 'apikey': 'EVOLUTION_KEY' },
    body: { number: $json.user_id, text: $json.ai_response }
  };
} else {
  return {
    url: 'https://api.moltbot.com/v1/messages/send',
    headers: { 'Authorization': 'Bearer MOLTBOT_KEY' },
    body: {
      conversation_id: $json.conversation_id,
      channel: $json.channel,
      message: { type: 'text', content: $json.ai_response }
    }
  };
}
```

---

## 6. Límites por Canal

### Telegram (vía Moltbot)

| Límite | Valor |
|--------|-------|
| Mensajes/segundo | 30 |
| Archivos | Hasta 2GB |
| Botones inline | ✅ |
| Costo | $0 |

### Instagram (vía Moltbot)

| Límite | Valor |
|--------|-------|
| Conversaciones nuevas/día | ~1000 |
| Respuestas | Ilimitadas |
| Mensajes proactivos | ❌ Prohibido |
| Stories replies | ✅ |

### Facebook Messenger (vía Moltbot)

| Límite | Valor |
|--------|-------|
| Mensajes proactivos/día | 2000 |
| Respuestas en 24h | Ilimitadas |
| Después de 24h | Requiere Message Tag |
| Botones | ✅ |

---

## 7. Plan de Implementación

| Fase | Tarea | Semana |
|------|-------|--------|
| 1 | Setup Moltbot + Telegram + Webchat | 1 |
| 2 | Workflow n8n multicanal | 1 |
| 3 | Integración Dify | 1 |
| 4 | Facebook + Instagram | 2 |
| 5 | Email (SMTP) opcional | 2 |
| 6 | Analytics + optimización | 3 |

---

## 8. Proyección de Costos

### Escenario: 5000 msg/mes

| Canal | Volumen | Proveedor | Costo |
|-------|---------|-----------|-------|
| WhatsApp | 2500 msg | Evolution | $0 |
| Telegram | 1000 msg | Moltbot | $0 |
| Instagram | 800 msg | Moltbot | $0 |
| Facebook | 500 msg | Moltbot | $0 |
| Webchat | 200 msg | Moltbot | $0 |
| **TOTAL** | 5000 msg | | **$0** |

> ⚠️ Si superas 500 msg/mes en canales Moltbot → Plan Pro $19/mes

---

## 9. Tabla NocoDB: conversations

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Auto | ID único |
| channel | Select | whatsapp, telegram, instagram, etc. |
| user_id | Text | Identificador del usuario |
| conversation_id | Text | ID de conversación (Moltbot/Evolution) |
| messages | JSON | Historial de mensajes |
| created_at | Date | Fecha de creación |
| last_message_at | Date | Último mensaje |

---

## 10. Conclusiones

### ✅ Ventajas

- Costo inicial $0 (plan free Moltbot)
- IA centralizada (un modelo para todos los canales)
- Datos unificados en NocoDB
- Sin vendor lock-in (Evolution API es tuyo)

### ⚠️ Limitaciones

- Moltbot no es open-source
- WhatsApp vía Moltbot es costoso a escala
- Instagram/Facebook requieren verificación para alto volumen

### Acción Recomendada

1. Mantener Evolution API para WhatsApp
2. Probar Moltbot Free con Telegram/Webchat
3. Medir adopción antes de expandir
4. Evaluar upgrade solo si superas 500 msg/mes en Moltbot
