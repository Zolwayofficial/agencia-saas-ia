# Plan de Contingencia: MiNuevaLLC SaaS

> **Última actualización:** 2026-02-04  
> **RTO (Recovery Time Objective):** < 1 hora  
> **RPO (Recovery Point Objective):** < 24 horas

---

## 1. Matriz de Riesgos

| Riesgo | Probabilidad | Impacto | Prioridad |
|--------|--------------|---------|-----------|
| VPS caído | Baja | **Crítico** | P1 |
| WhatsApp baneado | Media | **Crítico** | P1 |
| Base de datos corrupta | Baja | **Crítico** | P1 |
| Groq rate limit | Media | Alto | P2 |
| RAM agotada | Media | Alto | P2 |
| Disco lleno | Baja | Alto | P2 |
| n8n workflows rotos | Media | Medio | P3 |
| SSL expirado | Baja | Medio | P3 |

---

## 2. Contingencias por Servicio

### 2.1 VPS Caído (Contabo)

**Detección:**

- Uptime Kuma alerta en < 1 minuto
- Notificación Telegram automática

**Acciones inmediatas:**

```bash
# 1. Verificar estado en panel Contabo
# 2. Si no responde, solicitar reinicio vía ticket
# 3. Si demora > 30 min, activar VPS de respaldo
```

**Plan B - VPS de Emergencia:**

```bash
# Tener pre-configurado en Hetzner/DigitalOcean
# Costo: ~$5/mes en standby (apagado)

# Restauración:
./scripts/restore.sh GDrive:/SaaS-Backups/ultimo-backup.tar.gz
docker-compose up -d
```

**Tiempo de recuperación:** 30-60 minutos

---

### 2.2 WhatsApp Baneado

**Prevención:**

- Límite: < 200 mensajes/hora
- No enviar a números que no iniciaron conversación
- Evitar links sospechosos
- Usar mensajes personalizados (no templates repetitivos)

**Si ocurre el ban:**

| Tipo de Ban | Duración | Acción |
|-------------|----------|--------|
| Temporal (24h) | 24 horas | Esperar, reducir volumen |
| Temporal (7d) | 7 días | Apelar en WhatsApp Business |
| Permanente | Forever | Nuevo número + nueva cuenta |

**Plan B - Número de respaldo:**

```bash
# Tener 2-3 números registrados en Evolution API
# Rotar si uno es baneado
# Costo: $10-15 por SIM adicional
```

**Comunicación a clientes:**

- "Estamos actualizando nuestros sistemas, por favor usa Telegram"
- Activar Moltbot como canal principal temporal

---

### 2.3 Base de Datos Corrupta

**Prevención:**

- Backups diarios automáticos (3 AM)
- Retención: 7 días en Google Drive

**Recuperación:**

```bash
# 1. Detener servicios
docker-compose stop nocodb n8n appsmith

# 2. Restaurar PostgreSQL
./scripts/restore.sh GDrive:/SaaS-Backups/ultimo.tar.gz

# 3. Verificar integridad
docker exec postgres psql -U saas_admin -c "SELECT count(*) FROM usuarios;"

# 4. Reiniciar
docker-compose up -d
```

**Tiempo de recuperación:** 15-30 minutos

---

### 2.4 Groq Rate Limit (14,400 req/día)

**Monitoreo:**

```javascript
// En n8n, agregar contador
{{ $runIndex }} // Trackear en NocoDB
```

**Fallbacks automáticos (en orden):**

| Prioridad | Proveedor | Límite Gratis |
|-----------|-----------|---------------|
| 1 | Groq | 14,400/día |
| 2 | Cloudflare AI | 10,000/día |
| 3 | Google AI Studio | 1,500/día |
| 4 | Together AI | 1,000/día |

**Configuración en Dify:**

```yaml
# Agregar múltiples providers
providers:
  - name: groq
    priority: 1
  - name: cloudflare_ai
    priority: 2
  - name: google_ai_studio
    priority: 3
```

---

### 2.5 RAM Agotada (> 90%)

**Detección:**

- Netdata alerta a 85%
- Notificación Telegram

**Acciones inmediatas:**

```bash
# 1. Identificar consumidor
docker stats --no-stream

# 2. Reiniciar servicio problemático
docker restart <container>

# 3. Limpiar cache
docker system prune -f

# 4. Si persiste, reiniciar VPS
sudo reboot
```

**Prevención:**

- Límites en docker-compose.yml: `mem_limit: 3g`
- SWAP de 4GB configurado
- Autoheal container para auto-reinicio

---

### 2.6 Disco Lleno

**Detección:**

- Alerta a 80% uso

**Limpieza:**

```bash
# Logs de Docker
docker system prune -a --volumes

# Logs antiguos
find /var/log -type f -mtime +7 -delete

# Backups locales
rm -rf /tmp/saas-backups/*
```

**Prevención:**

- Logrotate configurado
- Backups solo en cloud (no locales)
- Monitoreo en Netdata

---

## 3. Comunicación en Crisis

### Canales de Notificación

| Canal | Uso | Auto |
|-------|-----|------|
| Telegram Bot | Alertas técnicas | ✅ |
| Email | Clientes afectados | Manual |
| Status Page | Estado público | ✅ |

### Plantillas de Mensajes

**Mantenimiento programado:**

```
⚙️ Mantenimiento programado
📅 Fecha: [fecha]
⏰ Duración: ~30 minutos
ℹ️ Los bots estarán temporalmente inactivos.
```

**Incidente en curso:**

```
⚠️ Estamos experimentando problemas técnicos
🔧 Nuestro equipo está trabajando en la solución
⏱️ Tiempo estimado: [X] minutos
```

**Incidente resuelto:**

```
✅ Servicio restaurado
📊 Duración del incidente: [X] minutos
🙏 Gracias por su paciencia
```

---

## 4. Checklist de Recuperación

### Falla Total del Sistema

- [ ] Verificar estado de VPS en panel Contabo
- [ ] Intentar SSH al servidor
- [ ] Si no responde, abrir ticket urgente
- [ ] Si demora > 30 min, activar VPS de respaldo
- [ ] Descargar último backup de Google Drive
- [ ] Ejecutar script de restauración
- [ ] Verificar cada servicio con health check
- [ ] Notificar a clientes cuando esté estable
- [ ] Documentar incidente en log

### Falla de WhatsApp

- [ ] Verificar tipo de ban (temporal/permanente)
- [ ] Si temporal, esperar período indicado
- [ ] Si permanente, activar número de respaldo
- [ ] Reconfigurar Evolution API con nuevo número
- [ ] Notificar a clientes del cambio
- [ ] Actualizar QR en dashboard de clientes

---

## 5. Contactos de Emergencia

| Servicio | Soporte | Tiempo Respuesta |
|----------|---------|------------------|
| Contabo | <support@contabo.com> | 24-48h |
| Cloudflare | Dashboard | Inmediato (self-service) |
| Groq | Discord | 24h |
| WhatsApp | business.whatsapp.com | 72h |

---

## 6. Costos de Contingencia

| Concepto | Costo Mensual | Notas |
|----------|---------------|-------|
| VPS Respaldo (standby) | $5 | Hetzner CPX11 apagado |
| SIM de respaldo | $5 | Prepago mínimo |
| Google Drive 100GB | $0 | Ya incluido en 15GB gratis |
| **Total Contingencia** | **~$10/mes** | Opcional pero recomendado |

---

## 7. Pruebas de Contingencia (Mensuales)

- [ ] Simular caída de VPS (parar containers)
- [ ] Restaurar desde backup
- [ ] Verificar fallback de IA (bloquear Groq)
- [ ] Probar notificaciones Telegram
- [ ] Revisar logs de los últimos 30 días
