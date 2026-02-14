FROM node:22-alpine

WORKDIR /app

# Instalar dependencias del sistema para audio
RUN apk add --no-cache python3 make g++ ffmpeg

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Comando de inicio
CMD ["npm", "start"]
