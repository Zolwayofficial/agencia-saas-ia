---
name: Backup y Recuperación (backup-restore)
description: Documenta los scripts de respaldo, restauración de base de datos y procedimientos de disaster recovery disponibles en el proyecto.
---

# Habilidad: Backup & Disaster Recovery

## 1. Scripts Disponibles

Ubicados en `scripts/`:

| Script | Qué hace |
|--------|----------|
| `backup.sh` | Respaldo de base de datos PostgreSQL |
| `backup-total.sh` | Respaldo completo (DB + archivos + configs) |
| `restore.sh` | Restaurar desde backup |
| `setup_swap.sh` | Configurar swap en VPS con poca RAM |
| `setup-vps.sh` | Setup inicial del servidor |
| `setup_host.sh` | Configuración de hostname y red |

## 2. Cuándo Hacer Backup

> [!IMPORTANT]
> **Siempre hacer backup ANTES de:**
>
> - Correr migraciones de Prisma en producción
> - Actualizar el docker-compose.yml de producción
> - Cambiar variables de entorno críticas (DB passwords, Stripe keys)
> - Actualizar versiones de dependencias mayores

## 3. Proceso de Backup

Conectar al VPS y ejecutar:

```bash
ssh root@161.97.127.222
cd /opt/agencia-saas-ia/scripts
bash backup.sh        # Backup rápido de DB
# ó
bash backup-total.sh  # Backup completo
```

Los backups se guardan en `/opt/backups/` con timestamp.

## 4. Proceso de Restauración

```bash
ssh root@161.97.127.222
cd /opt/agencia-saas-ia/scripts
bash restore.sh /opt/backups/<archivo_backup>
```

## 5. Swap (Memoria Virtual)

Si el VPS tiene poca RAM (2-4GB) y los builds de Docker fallan con OOM:

```bash
bash scripts/setup_swap.sh
```

Esto crea un archivo swap de 2-4GB para evitar que el sistema mate procesos por falta de memoria.

## 6. Procedimiento de Emergencia

Si el VPS no responde o la DB se corrompe:

1. Acceder via panel del proveedor (Contabo/Hetzner) → Console
2. Verificar disco: `df -h`
3. Verificar RAM: `free -m`
4. Revisar logs de Docker: `docker compose logs --tail 50`
5. Si la DB está corrupta: restaurar desde último backup
6. Si Docker no arranca: `docker system prune -a` y re-build

> [!WARNING]
> Los backups NO incluyen archivos subidos por usuarios (media de WhatsApp). Si usas MinIO para almacenamiento, necesitarás un backup separado de los buckets.
