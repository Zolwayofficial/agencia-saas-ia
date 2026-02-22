---
name: Autenticación y Seguridad (auth-security)
description: Documenta el sistema de autenticación JWT, hash de contraseñas, middleware de auth, CORS y procedimientos de recuperación de acceso del proyecto V6.1.
---

# Habilidad: Autenticación y Seguridad

## 1. Flujo de Autenticación

```
Register → bcrypt hash → Guardar en DB → Devolver JWT
Login    → bcrypt compare → Generar JWT → Devolver token
Request  → Middleware auth.ts → Verificar JWT → Inyectar userId/orgId en req
```

### Archivos clave

- **Controlador:** `apps/api/src/controllers/auth.controller.ts`
- **Middleware JWT:** `apps/api/src/middlewares/auth.ts`
- **Rate Limiter [V6.1]:** `apps/api/src/middlewares/rate-limit.ts`
- **Error Handler [V6.1]:** `apps/api/src/middlewares/error-handler.ts`

## 2. Hash de Contraseñas

Se usa `bcrypt` con salt rounds = 10 (estándar):

```typescript
const hashed = await bcrypt.hash(password, 10);
const match = await bcrypt.compare(input, storedHash);
```

### Resetear contraseña de admin manualmente

Si el admin pierde acceso, genera un nuevo hash:

```javascript
// fix-hash.js (ya existe en la raíz del proyecto)
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('NUEVA_CONTRASEÑA', 10);
console.log(hash);
```

Luego actualiza en la DB:

```sql
UPDATE users SET password = '$2a$10$...' WHERE email = 'admin@tudominio.com';
```

## 3. JWT (JSON Web Tokens)

- Firmados con `process.env.JWT_SECRET`
- Expiración: configurable (por defecto 24h)
- Payload incluye: `userId`, `organizationId`, `role`

> [!CAUTION]
> `JWT_SECRET` NUNCA debe exponerse en el frontend ni en logs. Si se compromete, todos los tokens activos quedan vulnerables. Rota el secret y redespliega.

## 4. CORS

Configurado en `apps/api/src/app.ts`. Dominios permitidos:

- `https://app.fulllogin.com` (producción)
- `http://localhost:3000` (desarrollo)

### Error común: "Failed to fetch" en login

**Causa más frecuente:** La variable `NEXT_PUBLIC_API_URL` no está inyectada correctamente en el build de Next.js. Debe pasarse como argumento de build en el Dockerfile:

```dockerfile
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm build
```

## 5. Rate Limiting [V6.1]

Limita requests por organización según su plan:

```typescript
Plan.rateLimit = 60  // requests por minuto (default)
```

Configurado en: `apps/api/src/middlewares/rate-limit.ts`
