# Sistema de Alertas de Cumplimiento

> **Propósito:** Notificar al cliente cuando viola el protocolo anti-ban  
> **Efecto legal:** Transfiere responsabilidad al cliente

---

## 1. Niveles de Alerta

| Nivel | Condición | Acción |
|-------|-----------|--------|
| 🟢 **Normal** | < 70% del límite | Sin alerta |
| 🟡 **Advertencia** | 70-85% del límite | Notificación informativa |
| 🟠 **Precaución** | 85-95% del límite | Alerta urgente |
| 🔴 **Crítico** | > 95% del límite | Alerta + pausa automática |

---

## 2. Mensajes de Alerta (Templates)

### 🟡 Advertencia (70%)

```
⚠️ ADVERTENCIA - MiNuevaLLC

Tu bot ha alcanzado el 70% del límite diario seguro.

📊 Uso actual: {count}/200 mensajes
⏰ Se reinicia a las 00:00

💡 Recomendación: Reduce la frecuencia de mensajes para evitar restricciones de WhatsApp.

Si continúas superando los límites, podrías experimentar interrupciones en el servicio.

📖 Más info: minuevallc.com/protocolo-seguro
```

### 🟠 Precaución (85%)

```
🚨 PRECAUCIÓN - MiNuevaLLC

Tu bot está cerca del límite de seguridad.

📊 Uso actual: {count}/200 mensajes (85%)
⚠️ Riesgo: ALTO

Si WhatsApp detecta actividad inusual, tu número podría ser suspendido temporal o permanentemente.

⚡ Acción requerida:
1. Reduce el envío de mensajes hoy
2. Programa envíos masivos para mañana
3. Considera upgrade a Plan Pro (3 números)

📞 Soporte: [enlace]
```

### 🔴 Crítico (95%)

```
🛑 ALERTA CRÍTICA - MiNuevaLLC

Tu bot ha sido PAUSADO automáticamente por seguridad.

📊 Uso: {count}/200 mensajes (95%)
⏸️ Estado: PAUSADO hasta las 00:00

Razón: Protección anti-ban activada para evitar suspensión de tu número de WhatsApp.

⚠️ IMPORTANTE: Según nuestros Términos de Servicio, el cliente es responsable de las consecuencias si ignora las alertas de seguridad.

🔄 Para reactivar antes:
- Upgrade a Plan Pro: minuevallc.com/upgrade
- O esperar reinicio automático a medianoche

📞 Soporte urgente: [enlace]
```

---

## 3. Implementación en n8n

### Flujo: Contador de Mensajes

```javascript
// Ejecutar ANTES de cada envío de mensaje
const clientId = $input.first().json.client_id;
const today = new Date().toISOString().split('T')[0];

// Obtener conteo actual
const stats = await nocodb.query(`
  SELECT 
    COUNT(*) as count,
    limite_diario,
    alertas_enviadas
  FROM mensajes_enviados m
  JOIN clientes c ON m.cliente_id = c.id
  WHERE m.cliente_id = '${clientId}' 
  AND DATE(m.fecha) = '${today}'
`);

const count = stats.count;
const limite = stats.limite_diario || 200;
const porcentaje = (count / limite) * 100;

// Determinar nivel de alerta
let nivel = 'normal';
let mensaje = null;
let pausar = false;

if (porcentaje >= 95) {
  nivel = 'critico';
  pausar = true;
  mensaje = generarMensajeCritico(count, limite);
} else if (porcentaje >= 85) {
  nivel = 'precaucion';
  mensaje = generarMensajePrecaucion(count, limite);
} else if (porcentaje >= 70) {
  nivel = 'advertencia';
  mensaje = generarMensajeAdvertencia(count, limite);
}

// Enviar alerta si corresponde y no se ha enviado hoy
if (mensaje && !stats.alertas_enviadas.includes(nivel)) {
  await enviarAlerta(clientId, nivel, mensaje);
  await nocodb.update('clientes', clientId, {
    alertas_enviadas: [...stats.alertas_enviadas, nivel]
  });
}

return { 
  continuar: !pausar,
  nivel,
  count,
  limite
};
```

### Flujo: Enviar Alerta Multicanal

```javascript
async function enviarAlerta(clientId, nivel, mensaje) {
  const cliente = await nocodb.get('clientes', clientId);
  
  // 1. WhatsApp (si aún funciona)
  if (nivel !== 'critico') {
    await evolutionApi.sendText(cliente.whatsapp, mensaje);
  }
  
  // 2. Email (siempre)
  await sendEmail({
    to: cliente.email,
    subject: `🚨 Alerta de Uso - ${nivel.toUpperCase()}`,
    body: mensaje
  });
  
  // 3. Telegram (si tiene)
  if (cliente.telegram_id) {
    await telegram.sendMessage(cliente.telegram_id, mensaje);
  }
  
  // 4. Registrar en historial
  await nocodb.insert('historial_alertas', {
    cliente_id: clientId,
    nivel,
    mensaje,
    fecha: new Date()
  });
}
```

---

## 4. Panel de Control (Dashboard)

### Para el Cliente (Appsmith)

```
┌─────────────────────────────────────────────────┐
│  📊 USO DE HOY                                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ████████████████████░░░░░░░  145/200 (72%)    │
│                                                 │
│  🟡 Advertencia: Estás cerca del límite seguro  │
│                                                 │
│  ⏰ Reinicio en: 4h 23m                         │
│                                                 │
│  [📈 Ver historial]  [⬆️ Upgrade Plan]         │
└─────────────────────────────────────────────────┘
```

### Para Ti (Admin)

```
┌─────────────────────────────────────────────────┐
│  🚦 ESTADO DE CLIENTES                          │
├─────────────────────────────────────────────────┤
│                                                 │
│  🟢 Normal:     12 clientes                     │
│  🟡 Advertencia: 3 clientes                     │
│  🟠 Precaución:  1 cliente (Juan Pérez)         │
│  🔴 Pausados:    0 clientes                     │
│                                                 │
│  [Ver detalle] [Enviar recordatorio masivo]     │
└─────────────────────────────────────────────────┘
```

---

## 5. Términos de Servicio (Cláusula)

```markdown
## 8. Límites de Uso y Responsabilidad

8.1 **Sistema de Protección Anti-Ban**
MiNuevaLLC implementa límites de uso diseñados para proteger 
la continuidad del servicio y evitar suspensiones por parte 
de proveedores de mensajería (WhatsApp, Telegram, etc.).

8.2 **Alertas de Cumplimiento**
El sistema enviará alertas automáticas cuando el uso del 
cliente se acerque a los límites de seguridad:
- 70%: Advertencia informativa
- 85%: Alerta de precaución
- 95%: Pausa automática de protección

8.3 **Responsabilidad del Cliente**
El cliente reconoce y acepta que:

a) Si ignora las alertas de advertencia y su número de 
   WhatsApp/Telegram es suspendido o baneado, MiNuevaLLC 
   NO será responsable de:
   - Pérdida del número telefónico
   - Interrupción del servicio
   - Pérdida de contactos o historial
   - Daños comerciales derivados

b) Las alertas enviadas y registradas en el sistema 
   constituyen evidencia de que el cliente fue debidamente 
   notificado de los riesgos.

c) Es responsabilidad exclusiva del cliente gestionar su 
   volumen de mensajes de acuerdo a las recomendaciones 
   de seguridad proporcionadas.

8.4 **Pausa Preventiva**
MiNuevaLLC se reserva el derecho de pausar automáticamente 
el servicio cuando se detecte uso que ponga en riesgo la 
estabilidad del sistema o las cuentas de mensajería.

8.5 **Recuperación de Cuentas Baneadas**
En caso de suspensión de cuenta por exceder los límites 
recomendados después de recibir alertas, MiNuevaLLC:
- NO ofrece garantía de recuperación
- NO reembolsará pagos por el período afectado
- Podrá ofrecer asistencia sujeta a disponibilidad y costo adicional
```

---

## 6. Registro de Alertas (Evidencia Legal)

### Tabla NocoDB: historial_alertas

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Auto | ID único |
| cliente_id | Link | Cliente afectado |
| nivel | Select | advertencia, precaucion, critico |
| mensaje_enviado | LongText | Texto exacto enviado |
| canales_usados | MultiSelect | whatsapp, email, telegram |
| fecha_hora | DateTime | Timestamp exacto |
| leido | Checkbox | Si el cliente abrió/leyó |
| aceptado | Checkbox | Si confirmó recibido |

### Exportar para Evidencia

```sql
SELECT 
  c.nombre,
  c.email,
  ha.nivel,
  ha.mensaje_enviado,
  ha.fecha_hora
FROM historial_alertas ha
JOIN clientes c ON ha.cliente_id = c.id
WHERE c.id = 'cliente_problematico'
ORDER BY ha.fecha_hora DESC;
```

---

## 7. Modo Seguro Configurable (ON/OFF)

El cliente puede activar o desactivar el Modo Seguro a voluntad.

### Campos en NocoDB (Tabla Clientes)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `modo_seguro` | Select | `activado`, `desactivado` |
| `acepto_riesgos` | Checkbox | Requerido para desactivar |
| `fecha_desactivacion` | DateTime | Cuándo lo desactivó |
| `ip_desactivacion` | Text | IP desde donde desactivó |

### Dashboard: Toggle de Modo Seguro

```
┌─────────────────────────────────────────────────┐
│  🛡️ MODO SEGURO                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  [🟢 ACTIVADO ●───────○]                        │
│                                                 │
│  ✅ Límites automáticos: 200 msg/día            │
│  ✅ Alertas de uso                              │
│  ✅ Pausa preventiva                            │
│                                                 │
│  [Desactivar modo seguro]                       │
└─────────────────────────────────────────────────┘
```

### Modal de Confirmación (Al Desactivar)

```
┌─────────────────────────────────────────────────┐
│  ⚠️ ADVERTENCIA - DESACTIVAR MODO SEGURO        │
├─────────────────────────────────────────────────┤
│                                                 │
│  Al desactivar el Modo Seguro:                  │
│                                                 │
│  ❌ No habrá límites de mensajes                │
│  ❌ No habrá alertas de uso                     │
│  ❌ No habrá pausas automáticas                 │
│  ❌ Mayor riesgo de ban de WhatsApp             │
│                                                 │
│  ☐ Entiendo y acepto que si mi número es        │
│    baneado por WhatsApp, MiNuevaLLC NO es       │
│    responsable y NO ofrece reembolsos.          │
│                                                 │
│  [Cancelar]  [Acepto los riesgos - Desactivar]  │
└─────────────────────────────────────────────────┘
```

### Lógica en n8n

```javascript
// Al inicio de cada flujo de mensaje
const cliente = await nocodb.get('clientes', clientId);

if (cliente.modo_seguro === 'activado') {
  // Aplicar límites y alertas normalmente
  return await verificarLimites(clientId);
} else {
  // Sin límites, pero registrar todo para evidencia
  await nocodb.insert('mensajes_sin_proteccion', {
    cliente_id: clientId,
    mensaje: messageContent,
    fecha: new Date(),
    advertencia_aceptada: true,
    modo_seguro: 'desactivado'
  });
  
  // Continuar sin pausas ni límites
  return { continuar: true, protegido: false };
}
```

### Registro de Desactivación (Evidencia Legal)

```javascript
// Cuando el cliente desactiva el modo seguro
await nocodb.insert('log_modo_seguro', {
  cliente_id: clientId,
  accion: 'desactivar',
  fecha: new Date(),
  ip: request.ip,
  user_agent: request.userAgent,
  checkbox_aceptado: true,
  texto_legal: "Entiendo y acepto que si mi número es baneado por WhatsApp, MiNuevaLLC NO es responsable y NO ofrece reembolsos."
});

// Notificar al admin
await telegram.sendMessage(ADMIN_CHAT_ID, 
  `⚠️ Cliente ${cliente.nombre} DESACTIVÓ el Modo Seguro\n` +
  `📅 Fecha: ${new Date()}\n` +
  `🔗 IP: ${request.ip}`
);
```

### Tabla Resumen de Estados

| Estado | Límites | Alertas | Pausa Auto | Responsabilidad |
|--------|---------|---------|------------|-----------------|
| 🟢 Modo Seguro ON | ✅ Sí | ✅ Sí | ✅ Sí | Compartida |
| 🔴 Modo Seguro OFF | ❌ No | ❌ No | ❌ No | **100% Cliente** |

### Cláusula Adicional para TOS

```markdown
8.6 **Modo Seguro Configurable**

a) El cliente puede desactivar el Modo Seguro desde su dashboard.

b) Al desactivar el Modo Seguro, el cliente acepta expresamente:
   - Que no habrá límites automáticos de mensajes
   - Que no recibirá alertas de uso
   - Que el sistema no pausará automáticamente
   - Que asume 100% de la responsabilidad por baneos

c) La desactivación queda registrada con fecha, hora e IP 
   como evidencia del consentimiento informado.

d) MiNuevaLLC recomienda mantener el Modo Seguro activado.
```

---

## 8. Checklist de Implementación

- [ ] Crear tabla `historial_alertas` en NocoDB
- [ ] Implementar flujo de conteo en n8n
- [ ] Configurar templates de mensajes
- [ ] Agregar widget de uso en dashboard cliente
- [ ] Agregar panel de estados en dashboard admin
- [ ] Incluir cláusula en Términos de Servicio
- [ ] Configurar reinicio de contadores a medianoche
- [ ] Probar flujo completo con cliente de prueba
