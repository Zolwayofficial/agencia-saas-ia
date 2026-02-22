---
name: Monorepo Turborepo + PNPM (monorepo-turborepo)
description: Explica la estructura del monorepo, las dependencias workspace, el orden de compilación de Turbo y cómo resolver errores comunes como "Cannot find module @repo/*".
---

# Habilidad: Arquitectura Monorepo (Turborepo + PNPM)

## 1. Estructura del Workspace

El proyecto usa **pnpm workspaces** + **Turborepo** para organizar múltiples apps y paquetes compartidos.

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

### Paquetes compartidos (`packages/`)

| Paquete | Ruta | Exporta |
|---------|------|---------|
| `@repo/database` | `packages/database` | Prisma client (`prisma`) |
| `@repo/logger` | `packages/logger` | Logger Pino estructurado |
| `@repo/types` | `packages/types` | Interfaces TS, DTOs Zod, enums |
| `@repo/tsconfig` | `packages/tsconfig` | Configs base de TypeScript |

### Apps (`apps/`)

| App | Depende de |
|-----|-----------|
| `api` | `@repo/database`, `@repo/logger`, `@repo/types` |
| `worker` | `@repo/database`, `@repo/logger`, `@repo/types` |
| `web` | `@repo/database`, `@repo/types` |

## 2. Orden de Compilación

Turborepo respeta las dependencias automáticamente:

```
@repo/tsconfig → @repo/types → @repo/database → @repo/logger → apps/*
```

Comando para compilar todo:

```bash
pnpm turbo build
```

## 3. Errores Comunes y Soluciones

### `TS2307: Cannot find module '@repo/database'`

**Causa:** Los paquetes `workspace:*` no están compilados.
**Fix en local:**

```bash
cd packages/database && pnpm build
cd ../types && pnpm build
cd ../logger && pnpm build
```

**Fix en Docker:** Asegúrate de que el `Dockerfile` corra `pnpm turbo build` (que compila en orden).

### `TS2742: The inferred type cannot be named without a reference to zod`

**Causa:** TypeScript no puede inferir tipos que dependen de `zod` si no están explícitos.
**Fix:** Agrega `: Promise<any>` como tipo de retorno explícito a las funciones afectadas.

### `Cannot find module` después de agregar un paquete nuevo

**Fix:**

```bash
pnpm install          # En la raíz del monorepo
pnpm turbo build      # Recompila todo
```

## 4. Agregar un Nuevo Paquete Compartido

1. Crea la carpeta en `packages/<nombre>/`
2. Agrega `package.json` con `"name": "@repo/<nombre>"`
3. Agrega `tsconfig.json` que extienda `@repo/tsconfig`
4. En las apps que lo necesiten: `"@repo/<nombre>": "workspace:*"` en dependencies
5. Corre `pnpm install` desde la raíz

## 5. Reglas del Monorepo

> [!IMPORTANT]
> **NUNCA instales dependencias desde dentro de una app individual** (`cd apps/api && pnpm add xxx`). Siempre instálalas desde la raíz con filtro: `pnpm add xxx --filter api`. Esto mantiene el lockfile consistente.

> [!TIP]
> Si el build de Docker falla pero el build local funciona, probablemente el `Dockerfile` no está copiando todos los `packages/` necesarios. Revisa las líneas `COPY` del Dockerfile.
