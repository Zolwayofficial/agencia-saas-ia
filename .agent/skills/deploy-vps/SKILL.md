---
name: Despliegue en VPS (deploy-vps)
description: Automatiza el proceso de despliegue de agencia-saas-ia en el servidor de producción (161.97.127.222), reconstruyendo los contenedores Docker adecuadamente.
---

# Habilidad: Despliegue en Servidor de Producción (VPS)

Esta habilidad te enseña a subir los últimos cambios del repositorio y compilar la agencia-saas-ia en su entorno de producción (Contenedores Docker en Ubuntu).

## 1. Conexión SSH

* **Servidor:** `root@161.97.127.222`
* **Directorio Base:** `/opt/agencia-saas-ia`

## 2. Pasos de Despliegue Comunes

Siempre que el usuario solicite "desplegar", "subir a producción" o "actualizar el VPS", debes seguir estos pasos conectándote por SSH interactivo (pide contraseña del usuario si no la tienes en contexto):

1. Usa `ssh root@161.97.127.222` para acceder.
2. Navega a `/opt/agencia-saas-ia`.
3. Opcionalmente, haz un `git pull` si se requiere traer código nuevo desde GitHub.
4. Navega a `infrastructure/production/`.
5. Ejecuta `docker compose up -d --build postgres-mcp saas-worker saas-api` (Añade o quita contenedores según lo que el usuario haya modificado).

> [!WARNING]
> No uses redirecciones de bash (como `cat > archivo` o pipes complejos `|`) directamente sobre SSH interactivo de PowerShell en Windows, ya que causa errores y codificación UTF-16 incorrecta. Usa scripts de un solo comando (`node -e` o `.sh`) en el remoto si necesitas manipular archivos de forma segura.

## 3. Resolución de Problemas (Troubleshooting)

* **Erdrores con @modelcontextprotocol/sdk:** Si la compilación de `saas-worker` falla en TypeScript (ej. `TS2742`), recuerda que las firmas de herramientas pueden ser muy estrictas y requerir `Promise<any>`. Verifica `/opt/agencia-saas-ia/apps/worker/src/lib/mcp.ts`.
* **Logs Ocultos por Docker:** Si un build de docker falla y sólo devuelve `exit code: 1`, ingresa individualmente al directorio (ej. `/apps/worker`), corre `pnpm install` y luego `pnpm build` para ver el stack trace puro de TypeScript directamente por SSH.
