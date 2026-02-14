# Arquitectura de Dashboards Multi-Rol: MiNuevaLLC

> **Última actualización:** 2026-02-04  
> **Decisión:** Appsmith (self-hosted)

---

## 1. Plataforma Seleccionada: Appsmith

| Criterio | Appsmith | Budibase | Retool | Next.js |
|----------|----------|----------|--------|---------|
| Costo | **$0** | $0-50 | $500+ | $0 + tiempo |
| RAM | **700MB** | 600MB | 1GB | 300MB |
| RBAC nativo | ✅ | ⚠️ | ✅ | ❌ |
| NocoDB API | ✅ | ⚠️ | ✅ | ✅ |
| Self-hosted | ✅ | ✅ | ❌ | ✅ |
| Open-source | ✅ | ✅ | ❌ | ✅ |

**Razones de elección:**

- 100% gratis en self-hosted
- Integración nativa con NocoDB vía REST API
- RBAC integrado con roles personalizados
- Git integration
- Comunidad activa (20k+ stars GitHub)

---

## 2. Distribución de RAM en VPS (12GB)

| Servicio | RAM |
|----------|-----|
| NocoDB | 1.5GB |
| n8n | 1GB |
| Evolution API | 800MB |
| Dify + Ollama | 4GB |
| **Appsmith** | **700MB** |
| Sistema operativo | 1GB |
| **Buffer libre** | **~3GB** ✅ |

---

## 3. Los 3 Dashboards

### Dashboard Admin (Tú)

- Ver todos los revendedores y sus redes
- Ver todos los clientes finales
- Gestionar comisiones pendientes y pagadas
- Métricas globales (ingresos, usuarios activos, consumo IA)
- Configurar precios y planes
- Ver logs de errores y salud del sistema

### Dashboard Revendedor

- Ver solo SUS clientes (filtrado por `revendedor_id`)
- Ver sub-revendedores y comisiones que generan
- Comisiones pendientes y pagadas
- Slots usados vs disponibles
- Link de referido personal
- Historial de pagos

### Dashboard Cliente Final

- Ver solo SU consumo (interacciones, saldo)
- Historial de conversaciones con el bot
- Botón de recarga de saldo
- Configuración de su bot

---

## 4. Modelo de Datos en NocoDB

### Tabla: usuarios

```sql
id | email | password_hash | rol | revendedor_padre_id | fecha_registro
1  | admin@empresa.com | xxx | admin | NULL | 2026-01-01
2  | juan@vendedor.com | xxx | revendedor | 1 | 2026-01-15
3  | cliente1@gmail.com | xxx | cliente | 2 | 2026-02-03
```

### Tabla: clientes

```sql
id | nombre | revendedor_id | saldo | slots_totales | slots_usados
1  | Cliente A | 2 | 50.00 | 100 | 45
```

### Tabla: comisiones

```sql
id | revendedor_id | cliente_id | monto | estado | fecha
1  | 2 | 1 | 15.00 | pendiente | 2026-02-01
```

---

## 5. Autenticación y Permisos (RBAC)

### Login con JWT en Appsmith

```javascript
const loginUser = async () => {
  const response = await NocoDB.authenticate({
    email: emailInput.text,
    password: passwordInput.text
  });
  
  storeValue('userRole', response.data.rol);
  storeValue('userId', response.data.id);
  
  if (response.data.rol === 'admin') {
    navigateTo('AdminDashboard');
  } else if (response.data.rol === 'revendedor') {
    navigateTo('RevendedorDashboard');
  } else {
    navigateTo('ClienteDashboard');
  }
}
```

### Filtrado automático por rol

```javascript
// Revendedor: solo ve SUS clientes
SELECT * FROM clientes 
WHERE revendedor_id = {{appsmith.store.userId}}

// Cliente: solo ve SU data
SELECT * FROM interacciones 
WHERE cliente_id = {{appsmith.store.userId}}
```

---

## 6. Conexión Appsmith ↔ NocoDB

1. Generar API Token en NocoDB:
   - Settings → API Tokens → Create
   - Guardar: `xc-token-xxxxx`

2. Crear Datasource en Appsmith:

   ```
   Type: REST API
   URL: https://db.minuevallc.com/api/v2
   Headers: xc-token: tu-api-token
   ```

3. Query con filtro de seguridad:

   ```
   GET /api/v2/tables/{tableId}/records
   ?where=(revendedor_id,eq,{{appsmith.store.userId}})
   ```

---

## 7. Instalación de Appsmith

```bash
docker run -d --name appsmith \
  -p 80:80 \
  -v appsmith-data:/appsmith-stacks \
  appsmith/appsmith-ce
```

---

## 8. Roadmap de Implementación

| Fase | Descripción | Duración |
|------|-------------|----------|
| 1 | Setup Appsmith + NocoDB | 1 semana |
| 2 | Dashboard Admin | 1 semana |
| 3 | Dashboard Revendedor | 1 semana |
| 4 | Dashboard Cliente | 1 semana |
| 5 | Integración + Testing | 1-2 semanas |
| **Total** | | **4-6 semanas** |

---

## 9. Arquitectura Visual

```
┌─────────────────────────────────────────┐
│         VPS (12GB RAM)                  │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │   Appsmith (Dashboard Layer)    │   │
│  │   - Admin / Revendedor / Cliente│   │
│  └─────────────┬───────────────────┘   │
│                │ REST API               │
│  ┌─────────────▼───────────────────┐   │
│  │   NocoDB (Data Layer)           │   │
│  └─────────────┬───────────────────┘   │
│                │                        │
│  ┌─────────────▼───────────────────┐   │
│  │   n8n (Business Logic)          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   Evolution API + Dify + Ollama │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```
