#!/bin/bash

# ==========================================
# MiNuevaLLC - VPS Setup Script
# Installs Docker, Security & Tools
# ==========================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}[1/5] Updating System...${NC}"
apt-get update && apt-get upgrade -y
apt-get install -y curl wget git unzip htop ufw fail2ban

echo -e "${GREEN}[2/5] Installing Docker & Docker Compose...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

echo -e "${GREEN}[3/5] Configuring Firewall (UFW)...${NC}"
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable

echo -e "${GREEN}[4/5] Optimizing for 12GB RAM...${NC}"
# Increase Max Map Count for ElasticSearch/Vector operations just in case
sysctl -w vm.max_map_count=262144
echo "vm.max_map_count=262144" >> /etc/sysctl.conf

# Setup Swap (4GB)
if [ ! -f /swapfile ]; then
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo -e "${GREEN}[5/5] Creating Directory Structure...${NC}"
mkdir -p /opt/agencia-saas-ia/docker/nginx
mkdir -p /opt/agencia-saas-ia/n8n/workflows
mkdir -p /opt/agencia-saas-ia/n8n/files

echo -e "${GREEN}[OK] Server Ready!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Upload docker-compose.yml to /opt/agencia-saas-ia/docker/"
echo "2. Upload .env file"
echo "3. Run 'docker compose up -d'"
