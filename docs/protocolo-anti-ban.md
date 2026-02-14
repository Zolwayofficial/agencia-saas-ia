# Protocolo Anti-Ban: Evolution API + WhatsApp

> **Última actualización:** 2026-02-04  
> **Criticidad:** ALTA - Seguir estrictamente

---

## 1. Resumen Ejecutivo

WhatsApp detecta y banea cuentas que muestran comportamiento de bot o spam. Este protocolo minimiza el riesgo siguiendo las mejores prácticas investigadas.

---

## 2. Reglas de Oro (NO NEGOCIABLES)

| Regla | Descripción |
|-------|-------------|
| 🔴 **NO enviar a desconocidos** | Solo responder a quienes escriben primero |
| 🔴 **NO mensajes idénticos** | Variar siempre el contenido |
| 🔴 **NO más de 200/día** | Límite para números nuevos |
| 🔴 **NO links acortados** | Evitar bit.ly, goo.gl, etc. |
| 🔴 **NO ser reportado** | Si 5+ usuarios reportan = ban |

---

## 3. Calentamiento de Número Nuevo (CRÍTICO)

### Semana 1-2: Fase de Humanización

| Día | Acción | Límite |
|-----|--------|--------|
| 1 | Solo registrar, NO enviar | 0 mensajes |
| 2-3 | Chatear con 5 contactos conocidos | 10 msg |
| 4-7 | Aumentar gradualmente | 20 msg/día |
| 8-14 | Subir poco a poco | 50 msg/día |

### Semana 3-4: Fase de Escalamiento

| Día | Límite |
|-----|--------|
| 15-21 | 100 msg/día |
| 22-28 | 150 msg/día |
| 29+ | Máximo 200 msg/día |

> ⚠️ **NUNCA** saltar el calentamiento. Números baneados en primeros días = irrecuperables.

---

## 4. Límites de Rate por Tiempo

### Mensajes por Hora

| Tipo de Número | Límite/Hora | Límite/Día |
|----------------|-------------|------------|
| Nuevo (< 30 días) | 20 | 200 |
| Establecido (30-90 días) | 50 | 500 |
| Maduro (> 90 días) | 100 | 1,000 |

### Delays Entre Mensajes

```javascript
// En n8n: agregar delay aleatorio
const minDelay = 3000;  // 3 segundos mínimo
const maxDelay = 8000;  // 8 segundos máximo
const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
await new Promise(resolve => setTimeout(resolve, delay));
```

---

## 5. Configuración Evolution API

### Parámetros Recomendados

```yaml
# En docker-compose.yml o .env
WEBHOOK_EVENTS_MESSAGES_UPSERT: true
WEBHOOK_EVENTS_SEND_MESSAGE: true
WEBHOOK_EVENTS_CONNECTION_UPDATE: true

# Rate limiting interno
MAX_MESSAGES_PER_SECOND: 1
QUEUE_ENABLED: true
QUEUE_DELAY_MS: 5000
```

### Marcar Mensajes como Leídos

```javascript
// SIEMPRE marcar como leído antes de responder
// Esto simula comportamiento humano
await evolutionApi.markAsRead(instanceName, {
  read_messages: [{ remoteJid: message.key.remoteJid, id: message.key.id }]
});

// Delay de "escritura"
await evolutionApi.updatePresence(instanceName, {
  presence: "composing",
  delay: 3000
});
```

---

## 6. Contenido de Mensajes

### ✅ Buenas Prácticas

```
✅ Usar nombre del usuario: "Hola {nombre}, ..."
✅ Variar saludos: "Hola", "Buenos días", "Qué tal"
✅ Respuestas contextuales basadas en el mensaje
✅ Emojis moderados (1-2 por mensaje)
✅ Longitud variable (no siempre mismo largo)
```

### ❌ Evitar

```
❌ Copiar/pegar el mismo texto
❌ Links en mensajes iniciales
❌ Mensajes solo con multimedia
❌ Mensajes muy largos (>500 caracteres)
❌ MAYÚSCULAS excesivas
❌ Muchos emojis (>5)
```

### Templates con Variación

```javascript
// En n8n o Dify, randomizar respuestas
const saludos = [
  "¡Hola! 👋",
  "¡Hola, qué tal!",
  "¡Buen día! 😊",
  "¡Hola! ¿Cómo estás?"
];
const saludo = saludos[Math.floor(Math.random() * saludos.length)];
```

---

## 7. Perfil de WhatsApp Business

### Requisitos Mínimos

- [ ] Foto de perfil profesional (logo de empresa)
- [ ] Nombre de negocio real
- [ ] Descripción completa
- [ ] Horario de atención
- [ ] Dirección (si aplica)
- [ ] Email de contacto
- [ ] Sitio web

> Un perfil completo genera más confianza y menos reportes.

---

## 8. Señales de Alerta (Actuar Inmediatamente)

| Señal | Significado | Acción |
|-------|-------------|--------|
| QR se desconecta frecuentemente | Posible detección | Reducir volumen 50% |
| "Intenta de nuevo más tarde" | Rate limit activado | Pausar 24 horas |
| Mensajes no entregados | Posible shadowban | Verificar en otro teléfono |
| Reportes de usuarios | Alto riesgo | Pausar y revisar contenido |

---

## 9. Monitoreo Automático

### En n8n: Contador de Mensajes

```javascript
// Guardar en NocoDB cada mensaje enviado
const today = new Date().toISOString().split('T')[0];
const count = await nocodb.query(`
  SELECT COUNT(*) FROM mensajes_enviados 
  WHERE fecha = '${today}' AND numero = '${phoneNumber}'
`);

if (count > 180) {
  // Alertar y pausar
  await telegram.sendMessage("⚠️ Número cerca del límite: " + count + "/200");
  return { pausar: true };
}
```

### Alerta de Límite

```javascript
// Webhook a Telegram cuando alcance 80%
if (count > 160) {
  await telegram.sendMessage({
    chat_id: ADMIN_CHAT_ID,
    text: `⚠️ WhatsApp ${phoneNumber}: ${count}/200 mensajes hoy (${Math.round(count/200*100)}%)`
  });
}
```

---

## 10. Manejo de Grupos

### ⚠️ ALTO RIESGO

Los grupos son más peligrosos porque:

- Más usuarios que pueden reportar
- Meta monitorea más activamente
- Un ban en grupo = ban de cuenta

### Reglas para Grupos

| Regla | Valor |
|-------|-------|
| Máximo grupos/día | 3-5 |
| Mensajes por grupo/día | 10 |
| Delay entre mensajes | 30-60 seg |
| No enviar a grupos nuevos | Esperar 7 días |

---

## 11. Plan de Rotación de Números

### Estrategia Multi-Número

```
Número 1 (Principal)  → 70% del tráfico
Número 2 (Backup)     → 20% del tráfico
Número 3 (Emergencia) → 10% del tráfico (calentando)
```

### Rotación Automática

```javascript
// En n8n: distribuir carga
const instances = ['principal', 'backup', 'emergencia'];
const weights = [0.7, 0.2, 0.1];
const random = Math.random();
let cumulative = 0;
let selectedInstance = instances[0];

for (let i = 0; i < weights.length; i++) {
  cumulative += weights[i];
  if (random <= cumulative) {
    selectedInstance = instances[i];
    break;
  }
}
```

### Rotación de IPs (Proxies)

Para evitar que Múltiples números salgan de la misma IP del servidor:

1. **Proxies Residenciales:** Configurar cada instancia de Evolution API con un proxy distinto.
2. **Configuración Docker:** Pasar variables de proxy al contenedor.

```yaml
# docker-compose.yml (ejemplo por instancia)
environment:
  - HTTP_PROXY=http://user:pass@proxy1.provider.com:8080
  - HTTPS_PROXY=http://user:pass@proxy1.provider.com:8080
```

> ⚠️ **Importante:** Meta vincula la IP a la reputación. Si una IP hace spam, todos los números en esa IP sufren.

---

## 12. Checklist Diario

### Mañana (09:00)

- [ ] Verificar conexión de Evolution API
- [ ] Revisar contadores de mensajes de ayer
- [ ] Verificar QR sigue conectado

### Tarde (15:00)

- [ ] Revisar si hay mensajes fallidos
- [ ] Verificar logs de n8n
- [ ] Controlar límites de rate

### Noche (21:00)

- [ ] Exportar estadísticas del día
- [ ] Verificar no hay alertas
- [ ] Backup de sesión si es necesario

---

## 13. Qué Hacer Si Hay Ban

### Ban Temporal (24h - 7 días)

1. **NO** intentar reconectar inmediatamente
2. Esperar el período completo
3. Cuando termine, reducir tráfico a 50%
4. Escalar gradualmente en 2 semanas

### Ban Permanente

1. Número perdido, no hay recuperación
2. Notificar a clientes afectados
3. Activar número de backup
4. Documentar qué causó el ban
5. Ajustar reglas para evitar repetir

---

## 14. Métricas a Monitorear

| Métrica | Objetivo | Alerta |
|---------|----------|--------|
| Mensajes/día | < 200 | > 180 |
| Tasa de respuesta | > 80% | < 70% |
| Reportes recibidos | 0 | ≥ 1 |
| Desconexiones/día | 0 | ≥ 2 |
| Mensajes fallidos | < 5% | > 10% |

---

## 15. Resumen de Límites Seguros

| Parámetro | Número Nuevo | Número Maduro |
|-----------|--------------|---------------|
| Mensajes/hora | 20 | 100 |
| Mensajes/día | 200 | 1,000 |
| Delay mínimo | 5 seg | 3 seg |
| Grupos/día | 3 | 10 |
| Nuevos contactos/día | 20 | 50 |
