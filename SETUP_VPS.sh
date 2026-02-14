#!/bin/bash
# SETUP_VPS.sh — Script para actualizar y reiniciar tu SaaS
# Ejecuta este script e tu VPS cuando subas cambios.

echo "🚀 Iniciando despliegue de Agencia SaaS IA..."

# 0. Verificar .env
if [ ! -f .env ]; then
    echo "⚠️ ERROR: No encontré el archivo .env"
    echo "   Por favor crea el archivo .env con tus credenciales antes de continuar."
    exit 1
fi

# 1. Bajar últimos cambios
echo "📥 Bajando código de GitHub..."
git pull origin main

# 2. Instalar dependencias
echo "📦 Instalando dependencias..."
pnpm install

# 3. Generar cliente Prisma
echo "🗄️ Generando Prisma Client..."
pnpm db:generate

# 4. Construir aplicaciones
echo "🏗️ Construyendo aplicaciones..."
pnpm build

# 5. Reiniciar servicios (PM2)
# Asumimos que tienes pm2 configurado con ecosystem.config.js
# Si usas Docker, cambia esto por 'docker compose up -d --build'
echo "🔄 Reiniciando servicios..."
if command -v pm2 &> /dev/null; then
    pm2 restart all
else
    echo "⚠️ PM2 no encontrado. Si usas Docker:"
    echo "   docker compose down && docker compose up -d --build"
fi

echo "✅ ¡Despliegue completado con éxito!"
