#!/bin/bash
# =========================================
# setup_swap.sh - Memoria Virtual Anti-Caídas
# Evita que el servidor se detenga por falta de RAM
# =========================================

set -e

echo "🔧 Configurando memoria SWAP de 4GB..."

# Crear archivo de swap
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Hacer permanente
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab

# Optimizar swappiness
echo 'vm.swappiness=10' | tee -a /etc/sysctl.conf
sysctl -p

echo "✅ SWAP configurado exitosamente"
echo "📊 Memoria actual:"
free -h
