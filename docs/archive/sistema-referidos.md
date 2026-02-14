# Sistema de Referidos y Red de Mercadeo: MiNuevaLLC

> **Última actualización:** 2026-02-04

---

## 1. Tipos de Usuario

| Tipo | Descripción | Tiene Comisión | Puede Tener Referidos |
|------|-------------|----------------|----------------------|
| **Admin** | Dueño de la plataforma | N/A | ✅ (Revendedores) |
| **Revendedor** | Vende y administra clientes | ✅ | ✅ (Clientes + Revendedores) |
| **Cliente Final** | Consume el servicio de IA | ❌ | ❌ |

---

## 2. Estructura de la Red

```
                    ADMIN (Tú)
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
    Revendedor A   Revendedor B   Revendedor C
         │              │              │
    ┌────┴────┐    ┌────┴────┐    ┌────┴────┐
    ▼         ▼    ▼         ▼    ▼         ▼
 Cliente   Cliente  Rev D  Cliente  Cliente  Cliente
           Final    (sub)   Final   Final    Final
                      │
                 ┌────┴────┐
                 ▼         ▼
              Cliente   Cliente
              Final     Final
```

> **Nota:** Un Revendedor puede tener bajo él: Clientes Finales + Otros Revendedores.

---

## 3. Planes para Revendedor

| Plan Revendedor | Slots de Clientes | Precio | Comisión que Recibe |
|-----------------|-------------------|--------|---------------------|
| **Starter** | 5 clientes | $15/mes | 15% por venta |
| **Growth** | 20 clientes | $29/mes | 20% por venta |
| **Agency** | 50 clientes | $59/mes | 25% por venta |
| **Enterprise** | Ilimitado | $99/mes | 30% por venta |

> **Slot** = Cada cliente final que el revendedor administra cuenta como 1 slot.

---

## 4. Planes para Cliente Final

| Plan | Interacciones/Hora | Interacciones/Día | Precio |
|------|---------------------|-------------------|--------|
| **Básico** | 200 | 2,000 | $9/mes |
| **Pro** | 1,000 | 10,000 | $19/mes |
| **Enterprise** | Ilimitado | Ilimitado | $49/mes |

> El Cliente Final NO recibe comisiones. Solo consume el servicio.

---

## 5. Comisiones del Revendedor

### ¿Cómo Gana el Revendedor?

El Admin (tú) paga comisión al Revendedor por cada cliente que traiga:

| Nivel | Relación | Comisión |
|-------|----------|----------|
| **Nivel 1** | Cliente directo del Revendedor | Según su plan (15%-30%) |
| **Nivel 2** | Cliente de un sub-revendedor | 5% adicional |

### Ejemplo de Ganancias

**Escenario:** Revendedor Juan (Plan Growth, 20% comisión)

- Juan tiene 15 clientes pagando Plan Pro ($79/mes)
- Juan refirió a María (también Revendedora)
- María tiene 8 clientes pagando Plan Básico ($29/mes)

| Concepto | Cálculo | Ganancia/mes |
|----------|---------|--------------|
| 15 clientes × $79 × 20% | Nivel 1 | $237 |
| 8 clientes × $29 × 5% | Nivel 2 (de María) | $11.60 |
| **Total comisiones** | | **$248.60/mes** |
| Menos su plan Growth | | -$99 |
| **Ganancia neta** | | **$149.60/mes** |

---

## 6. Código de Referido (Solo Revendedores)

### Formato

```
REV-[NOMBRE]-[RANDOM]
```

### Ejemplos

- `REV-JUAN-X7K2`
- `REV-MARIA-M9P4`

### Uso

- `minuevallc.com/r/REV-JUAN-X7K2` → Registro como Cliente Final bajo Juan
- `minuevallc.com/partner/REV-JUAN-X7K2` → Registro como Revendedor bajo Juan

---

## 7. Tablas NocoDB

### Tabla: Usuarios

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Auto | ID único |
| `nombre` | Text | Nombre completo |
| `email` | Email | Correo único |
| `telefono` | Phone | WhatsApp |
| `tipo` | Select | admin, revendedor, cliente_final |
| `plan` | Select | Starter, Growth, Agency, etc. |
| `revendedor_id` | Link | ¿A qué revendedor pertenece? |
| `slots_usados` | Rollup | Cuenta de clientes bajo este revendedor |
| `slots_max` | Number | Máximo permitido por su plan |
| `codigo_referido` | Text | Solo para revendedores |
| `activo` | Checkbox | ¿Está activo? |

### Tabla: Comisiones

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Auto | ID único |
| `revendedor` | Link | Quién recibe la comisión |
| `cliente` | Link | Quién generó la venta |
| `nivel` | Number | 1 (directo) o 2 (sub-revendedor) |
| `monto_venta` | Currency | Valor del plan del cliente |
| `porcentaje` | Percent | % según plan del revendedor |
| `monto_comision` | Formula | `monto_venta * porcentaje` |
| `estado` | Select | pendiente, pagado |
| `fecha` | Date | Cuándo se generó |

---

## 8. Flujo de Registro

### Cliente Final (con código de Revendedor)

```
1. Nuevo cliente llega a minuevallc.com/r/REV-JUAN-X7K2
                    ↓
2. Sistema extrae código y busca a Juan
                    ↓
3. ¿Juan tiene slots disponibles?
    ├─ NO → Error: "Tu revendedor no tiene cupo"
    └─ SÍ → Continúa
                    ↓
4. Cliente se registra
                    ↓
5. NocoDB guarda:
   - tipo = cliente_final
   - revendedor_id = Juan
   - Juan.slots_usados += 1
                    ↓
6. Cuando pague, se crea comisión para Juan
```

### Nuevo Revendedor (con código de otro Revendedor)

```
1. Nuevo revendedor llega a minuevallc.com/partner/REV-JUAN-X7K2
                    ↓
2. Se registra y elige su plan (Starter/Growth/etc.)
                    ↓
3. NocoDB guarda:
   - tipo = revendedor
   - revendedor_id = Juan (es su "upline")
                    ↓
4. Juan recibe 5% de cada venta de este nuevo revendedor
```

---

## 9. Dashboard del Revendedor (Appsmith)

### Vista Principal

- 👥 **Mis Clientes:** Lista con nombre, plan, estado de pago
- 📊 **Slots:** Barra de progreso (ej: 12/20 usados)
- 💰 **Comisiones Pendientes:** Total a cobrar
- 💵 **Comisiones Pagadas:** Historial
- 🔗 **Mi Link de Cliente:** `minuevallc.com/r/REV-JUAN-X7K2`
- 🤝 **Mi Link de Partner:** `minuevallc.com/partner/REV-JUAN-X7K2`
- 📈 **Mi Red:** Lista de sub-revendedores y sus clientes

---

## 10. Resumen del Modelo

| Rol | Paga | Recibe | Administra |
|-----|------|--------|------------|
| **Cliente Final** | $29-199/mes | Servicio de IA | Nada |
| **Revendedor** | $49-399/mes | Servicio + Comisiones | Clientes + Sub-revendedores |
| **Admin** | Infra ($16/mes) | Todo el ingreso - comisiones | Todo |
