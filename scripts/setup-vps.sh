#!/bin/bash
# =========================================
# setup-vps.sh - Instalación Inicial del VPS
# MiNuevaLLC - Agencia SaaS IA
# =========================================

set -e

echo "🚀 Iniciando setup del VPS para MiNuevaLLC..."

# Actualizar sistema
echo "📦 Actualizando sistema..."
apt update && apt upgrade -y

# Instalar dependencias básicas
echo "📦 Instalando dependencias..."
apt install -y curl git vim wget htop ufw fail2ban

# Instalar Docker
echo "🐳 Instalando Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Verificar instalación
docker --version
docker compose version

# Configurar firewall
echo "🔒 Configurando firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Configurar fail2ban
echo "🔒 Configurando fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

# Crear directorio de trabajo
echo "📁 Creando estructura de directorios..."
mkdir -p /root/agencia-saas-ia
mkdir -p /root/backups

# Clonar repositorio
echo "📥 Clonando repositorio..."
cd /root
git clone https://github.com/Zolwayofficial/agencia-saas-ia.git

# Configurar variables de entorno
echo "⚙️ Preparando variables de entorno..."
cd /root/agencia-saas-ia
cp .env.production.example .env.production
echo "⚠️  IMPORTANTE: Edita .env.production con tus valores reales"

echo ""
echo "✅ Setup completado!"
echo ""
echo "Próximos pasos:"
echo "1. Editar /root/agencia-saas-ia/.env.production"
echo "2. cd /root/agencia-saas-ia/infrastructure"
echo "3. docker compose up -d"
echo ""
