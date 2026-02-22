---
name: Operaciones Base de Datos Seguras (db-migrate)
description: Define el estándar y las protecciones a la hora de manipular la base de datos PostgreSQL a nivel de migraciones (Prisma) en el repositorio y en la VPS.
---

# Habilidad: Mantenimiento Base de Datos (Prisma)

El proyecto `agencia-saas-ia` utiliza Prisma ORM para interactuar con una base de datos PostgreSQL. Esta habilidad asegura la integridad transaccional de la agencia.

## 1. Modificar el Esquema

Cuando el usuario pida "agregar una tabla", "crear un modelo" o similar:

1. Edita _únicamente_ el archivo `packages/database/prisma/schema.prisma`.
2. Revisa las relaciones (`@relation`), cuidando el borrado en cascada `onDelete: Cascade` si el modelo principal lo amerita.
3. Localmente, genera la migración usando la terminal en la raíz del proyecto (o ve a `packages/database`):

   ```bash
   pnpm db:push # Si es en desarrollo rápido
   # Ó
   pnpm prisma migrate dev --name <nombre>
   ```

## 2. Acceso Remoto de Datos

El contenedor `postgres-mcp` brinda acceso a modelos fundacionales orientados a lectura para Agentes (OpenClaw/MCP). **Nunca expongas contraseñas desde el Worker al público.**
La contraseña de PostgreSQL en `infrastructure/production/docker-compose.yml` debe respetarse, al igual que los `.env.prod`.

## 3. Resolución

* **Error P1001 (Can't reach database):** Indica que probablemente estés corriendo el script sin tener los contenedores Docker en desarrollo levantados (o falló `docker compose up postgres -d`).
* **Conflictos de tipos:** Si Prisma devuelve un Warning en CI o en el log de Typescript (`Cannot find module '@repo/database'`), siempre vuelve a compilar el paquete _Database_ lanzando `pnpm build` dentro de `/packages/database`.
