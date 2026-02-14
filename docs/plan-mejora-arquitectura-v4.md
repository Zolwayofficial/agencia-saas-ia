# 🚀 Plan de Mejora de Arquitectura v4.0 - Agencia SaaS IA

> **Objetivo:** Transformar la arquitectura monolítica de MVP en una plataforma escalable, segura y observable.

## 1. 🏗️ Reestructuración de Infraestructura

Actualmente, todo corre en un solo VPS de 12GB. Esto es un punto único de fallo y cuello de botella.

### **Fase A: Desacoplamiento de IA (Inmediato)**

- **Problema:** Llama 3.1 + Whisper + Kokoro consumen ~8-10GB RAM, dejando poco para n8n/DB.
- **Solución:**
  - **Principal:** Usar APIs externas (Groq, OpenAI, Deepgram) para producción estable.
  - **Fallback Local:** Mantener contenedores de IA pero *apagados* por defecto (`profiles: ["ai-local"]` en docker-compose), encender solo para desarrollo o backup.
- **Beneficio:** Libera ~8GB RAM para estabilidad de n8n y Moltbot.

### **Fase B: Separación de Datos (Mediano Plazo)**

- **Problema:** Si el VPS muere, los datos mueren.
- **Solución:**
  - **Base de Datos:** Usar Managed Postgres (ej. Supabase, Railway, DigitalOcean DB) o replicación WAL-G a S3.
  - **Archivos:** MinIO es bueno, pero asegurar backup a S3 real (AWS/Wasabi).

## 2. 🛡️ Hardening de Seguridad

### **Base de Datos**

- **Actual:** Schema básico sin RLS ni constraints fuertes.
- **Mejora:**
  - Implementar **Row Level Security (RLS)** si se expone a frontend.
  - Añadir **Audit Logs** (Trigger `on_update` para guardar historial de cambios en `clients`).
  - Encriptar columnas sensibles (tokens de WhatsApp) usando `pgcrypto`.

### **Moltbot API**

- **Actual:** Express básico.
- **Mejora:**
  - **Rate Limiting:** Implementar `express-rate-limit` por IP/Token.
  - **Validación Zod:** Validar estrictamente todos los payloads de entrada.
  - **API Keys:** Middleware de autenticación para webhooks internos (prevenir llamadas falsas).

## 3. 🧠 Mejora del Código (Moltbot)

### **Patrón Arquitectónico**

Mover de "Rutas con Lógica" a **Clean Architecture**:

```
src/
  conf/       # Configuración centralizada
  interfaces/ # Puertos (Interfaces)
  core/       # Casos de Uso (Lógica de Negocio Pura)
  infra/      # Adaptadores (Express, Postgres, WApp)
```

### **Testing**

- Añadir **Jest** para Unit Tests.
- Añadir **Supertest** para Integration Tests de API.

## 4.  observability & DevOps

### **Logging Centralizado**

- **Actual:** Logs de Docker dispersos.
- **Mejora:** Integrar **Loki + Grafana** (versión lightweight) o usar servicio externo (Datadog/NewRelic Free Tier) para ver logs de todos los contenedores en un solo lugar.

### **CI/CD**

- Implementar **GitHub Actions**:
    1. **Build & Test:** Correr tests en cada Push.
    2. **Deploy:** SSH Action que hace `git pull && docker compose up -d` automáticamente en producción.

---

## 📅 Roadmap de Implementación

### **Semana 1: Estabilidad (The "Must Haves")**

- [ ] Configurar `profiles` en Docker Compose para IA.
- [ ] Implementar validación Zod en Moltbot.
- [ ] Configurar Backup automático a S3 externo.

### **Semana 2: Seguridad y Calidad**

- [ ] Refactorizar Moltbot a Controller-Service.
- [ ] Añadir Tests básicos.
- [ ] Hardening de Postgres (índices, constraints).

### **Semana 3: DevOps**

- [ ] Pipeline CI/CD.
- [ ] Dashboard de Monitoreo Básico.
