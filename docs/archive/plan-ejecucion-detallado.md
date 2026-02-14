# 📋 Plan de Ejecución Detallado - 12 Semanas

> **OBJETIVO:** Evitar desviaciones. Seguir este plan AL PIE DE LA LETRA.  
> **Regla de Oro:** Si no está en este documento, NO lo hagas hasta completar las 12 semanas.

---

## 🎯 **FASE 1: FUNDACIÓN (Semanas 1-3)**

---

### **SEMANA 1: Infraestructura Base**

**Objetivo Único:** VPS corriendo + WhatsApp conectado

#### **DÍA 1 (Lunes) - Setup VPS**

**Tiempo:** 4 horas

**Tareas exactas:**

1. [ ] **09:00-09:30** Provisionar VPS
   - Ir a hetzner.com
   - Plan: CPX31 (4 vCPU, 12GB RAM, €12/mes)
   - Datacenter: Falkenstein (Alemania)
   - OS: Ubuntu 22.04 LTS
   - **Deliverable:** IP del VPS anotada

2. [ ] **09:30-10:00** Configurar dominio
   - Opción A: Comprar en Porkbun ($10/año)
   - Opción B: Usar gratis en duckdns.org
   - Crear records A:

     ```
     @ → TU_IP
     *.minuevallc.com → TU_IP
     ```

   - **Deliverable:** Domain apuntando a IP (verificar con `dig`)

3. [ ] **10:00-11:00** Conectar por SSH y actualizar

   ```bash
   ssh root@TU_IP
   apt update && apt upgrade -y
   apt install -y curl git vim wget htop
   reboot
   ```

   - **Deliverable:** Sistema actualizado

4. [ ] **11:00-12:00** Instalar Docker

   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   docker --version  # Debe mostrar: Docker version 24+
   docker compose version  # Debe mostrar: Docker Compose version v2+
   ```

   - **Deliverable:** Docker instalado y funcionando

5. [ ] **13:00-14:00** Configurar firewall

   ```bash
   ufw allow 22/tcp
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw allow 81/tcp
   ufw enable
   ufw status  # Verificar reglas
   ```

   - **Deliverable:** Firewall configurado

**Criterio de éxito Día 1:** SSH funciona, Docker instalado, firewall activo

---

#### **DÍA 2 (Martes) - Docker Compose**

**Tiempo:** 6 horas

**Tareas exactas:**

1. [ ] **09:00-09:30** Clonar repo en VPS

   ```bash
   cd /root
   git clone https://github.com/Zolwayofficial/agencia-saas-ia.git
   cd agencia-saas-ia/docker
   ls -la  # Verificar archivos
   ```

2. [ ] **09:30-10:30** Configurar .env

   ```bash
   cp .env.example .env
   nano .env
   ```

   **Valores EXACTOS a poner:**

   ```bash
   # Generar passwords seguros
   openssl rand -hex 32  # Ejecutar 5 veces
   
   # Copiar output a .env
   POSTGRES_USER=saas_admin
   POSTGRES_PASSWORD=[OUTPUT_1]
   POSTGRES_DB=saas_db
   NC_JWT_SECRET=[OUTPUT_2]
   N8N_USER=admin
   N8N_PASSWORD=[OUTPUT_3]
   N8N_HOST=n8n.minuevallc.com
   N8N_ENCRYPTION_KEY=[OUTPUT_4]
   EVOLUTION_API_KEY=[OUTPUT_5]
   GROQ_API_KEY=  # Dejar vacío por ahora
   DIFY_SECRET_KEY=[OUTPUT_1]  # Reusar
   DOMAIN=minuevallc.com
   ```

   - **Deliverable:** `.env` configurado correctamente

3. [ ] **10:30-11:00** Simplificar docker-compose (SOLO servicios críticos)

   **EDITAR `docker-compose.yml`** - Comentar servicios no-críticos:

   ```yaml
   # Comentar estos servicios para Semana 1:
   # - moltbot (no se usa hasta Semana 2)
   # - dify (no se usa hasta Semana 5)
   # - metabase (no se usa hasta Semana 8)
   # - appsmith (no se usa hasta Semana 3)
   ```

   **Servicios activos Semana 1:**
   - nginx-proxy
   - postgres
   - nocodb
   - n8n
   - evolution-api
   - uptime-kuma
   - autoheal

4. [ ] **11:00-12:00** Primera subida de Docker

   ```bash
   docker compose up -d
   docker compose ps  # Ver estado
   docker compose logs -f  # Ver logs (Ctrl+C para salir)
   ```

   **Si hay errores:**

   ```bash
   docker compose logs nombre_del_servicio
   # Arreglar y reintentar:
   docker compose down
   docker compose up -d
   ```

5. [ ] **13:00-15:00** Troubleshooting y verificación

   **Verificar cada servicio:**

   ```bash
   # PostgreSQL
   docker exec -it postgres psql -U saas_admin -d saas_db -c "SELECT version();"
   
   # NocoDB
   curl http://localhost:8080/api/v1/health
   
   # n8n
   curl http://localhost:5678/healthz
   
   # Evolution API
   curl http://localhost:8080/health
   ```

   **Todos deben responder OK**

   - **Deliverable:** Todos los servicios UP (healthy)

**Criterio de éxito Día 2:** `docker compose ps` muestra todos verde/healthy

---

#### **DÍA 3 (Miércoles) - SSL + Subdominios**

**Tiempo:** 5 horas

**Tareas exactas:**

1. [ ] **09:00-09:30** Acceder a Nginx Proxy Manager
   - Navegador: `http://TU_IP:81`
   - Login inicial:
     - Email: `admin@example.com`
     - Pass: `changeme`
   - **INMEDIATAMENTE cambiar password**

2. [ ] **09:30-12:00** Configurar 6 subdominios con SSL

   **Por CADA subdominio, hacer lo siguiente:**

   **Subdominio 1: n8n.minuevallc.com**

   ```
   Proxy Hosts → Add Proxy Host
   
   Details:
   - Domain Names: n8n.minuevallc.com
   - Scheme: http
   - Forward Hostname/IP: n8n
   - Forward Port: 5678
   - ✅ Block Common Exploits
   - ✅ Websockets Support
   
   SSL:
   - ✅ Force SSL
   - ✅ HTTP/2 Support
   - SSL Certificate: Request a new SSL Certificate
   - Email: tu_email@gmail.com
   - ✅ I Agree to the Let's Encrypt TOS
   
   Save
   ```

   **Verificar:** `https://n8n.minuevallc.com` debe mostrar login de n8n (candado verde)

   **Subdominio 2: crm.minuevallc.com**

   ```
   Same steps, pero:
   - Domain: crm.minuevallc.com
   - Forward to: nocodb
   - Port: 8080
   ```

   **Subdominio 3: api.minuevallc.com**

   ```
   - Domain: api.minuevallc.com
   - Forward to: evolution-api
   - Port: 8080
   ```

   **Subdominio 4: status.minuevallc.com**

   ```
   - Domain: status.minuevallc.com
   - Forward to: uptime-kuma
   - Port: 3001
   ```

   **Subdominio 5: admin.minuevallc.com**

   ```
   - Domain: admin.minuevallc.com
   - Forward to: nginx-proxy
   - Port: 81
   ```

   **Subdominio 6: <www.minuevallc.com>** (landing)

   ```
   - Domain: www.minuevallc.com, minuevallc.com
   - Forward to: TU_IP
   - Port: 8080  # Servidor de landing page
   ```

3. [ ] **13:00-14:00** Verificación completa

   **Abrir en navegador cada uno:**
   - <https://n8n.minuevallc.com> → Login n8n ✅
   - <https://crm.minuevallc.com> → Login NocoDB ✅
   - <https://api.minuevallc.com> → "Welcome to Evolution API" ✅
   - <https://status.minuevallc.com> → Uptime Kuma ✅
   - <https://admin.minuevallc.com> → Nginx Proxy Manager ✅

   **Todos deben tener CANDADO VERDE (SSL)**

**Criterio de éxito Día 3:** 5 subdominios funcionando con SSL válido

---

#### **DÍA 4 (Jueves) - WhatsApp Conexión**

**Tiempo:** 4 horas

**Tareas exactas:**

1. [ ] **09:00-09:30** Obtener API key de Groq
   - Ir a: <https://console.groq.com>
   - Crear cuenta (gratis)
   - API Keys → Create API Key
   - Nombre: "MiNuevaLLC Production"
   - Copiar key (empieza con `gsk_`)
   - **Actualizar .env:**

   ```bash
   nano /root/agencia-saas-ia/docker/.env
   # Cambiar línea:
   GROQ_API_KEY=gsk_TU_KEY_AQUI
   
   # Reiniciar servicios
   docker compose restart
   ```

2. [ ] **09:30-10:30** Crear instancia de WhatsApp

   **Desde terminal local (PowerShell):**

   ```bash
   # Reemplazar TU_API_KEY con el de tu .env
   curl -X POST https://api.minuevallc.com/instance/create `
     -H "apikey: TU_EVOLUTION_API_KEY" `
     -H "Content-Type: application/json" `
     -d '{
       "instanceName": "principal",
       "qrcode": true,
       "integration": "WHATSAPP-BAILEYS"
     }'
   ```

   **Debe responder:**

   ```json
   {
     "instance": {
       "instanceName": "principal",
       "status": "created"
     }
   }
   ```

3. [ ] **10:30-11:00** Obtener QR Code

   ```bash
   curl https://api.minuevallc.com/instance/qrcode/principal `
     -H "apikey: TU_EVOLUTION_API_KEY"
   ```

   **Copiar el campo `base64`** y pegarlo en:
   - <https://codebeautify.org/base64-to-image-converter>
   - Ver QR code generado

4. [ ] **11:00-11:15** Escanear QR con WhatsApp
   - WhatsApp → Menú (3 puntos) → Dispositivos vinculados
   - Vincular dispositivo
   - Escanear QR de la pantalla

   **Debe decir:** "Dispositivo vinculado correctamente"

5. [ ] **11:15-11:30** Verificar conexión

   ```bash
   curl https://api.minuevallc.com/instance/connectionState/principal `
     -H "apikey: TU_EVOLUTION_API_KEY"
   ```

   **Debe responder:**

   ```json
   {
     "instance": {
       "instanceName": "principal",
       "state": "open"
     }
   }
   ```

   **Si dice "open" = ÉXITO ✅**

6. [ ] **11:30-12:00** Test de envío manual

   ```bash
   curl -X POST https://api.minuevallc.com/message/sendText/principal `
     -H "apikey: TU_EVOLUTION_API_KEY" `
     -H "Content-Type: application/json" `
     -d '{
       "number": "TU_NUMERO_DE_PRUEBA",
       "text": "Hola! Este es un test desde Evolution API"
     }'
   ```

   **Verificar:** Mensaje recibido en WhatsApp ✅

**Criterio de éxito Día 4:** WhatsApp conectado, mensaje enviado exitosamente

---

#### **DÍA 5 (Viernes) - Primer Workflow n8n**

**Tiempo:** 6 horas

**Tareas EXACTAS:**

1. [ ] **09:00-10:00** Configurar credenciales en n8n

   - Abrir: <https://n8n.minuevallc.com>
   - Login: admin / TU_PASSWORD
   - Settings → Credentials → Add Credential

   **Credencial 1: Evolution API**

   ```
   Type: HTTP Header Auth
   Name: Evolution API
   Header Name: apikey
   Header Value: TU_EVOLUTION_API_KEY
   ```

   **Credencial 2: Groq**

   ```
   Type: HTTP Header Auth  
   Name: Groq API
   Header Name: Authorization
   Header Value: Bearer TU_GROQ_API_KEY
   ```

2. [ ] **10:00-12:00** Crear workflow "WhatsApp → Groq → Respuesta"

   **Paso a paso en n8n:**

   **Nodo 1: Webhook**

   ```
   Add node → Trigger → Webhook
   HTTP Method: POST
   Path: webhook/whatsapp
   
   Test webhook:
   - Click "Listen for test event"
   - Desde terminal:
   curl -X POST https://n8n.minuevallc.com/webhook/whatsapp \
     -H "Content-Type: application/json" \
     -d '{"message": "test"}'
   ```

   **Nodo 2: Extraer datos**

   ```
   Add node → Data transformation → Set
   Mode: Manual Mapping
   
   Mappings:
   - phone: {{ $json.data.key.remoteJid }}
   - message: {{ $json.data.message.conversation }}
   - messageId: {{ $json.data.key.id }}
   ```

   **Nodo 3: Llamar a Groq**

   ```
   Add node → HTTP Request
   Method: POST
   URL: https://api.groq.com/openai/v1/chat/completions
   Authentication: Groq API (credencial creada)
   
   Body (JSON):
   {
     "model": "llama-3.1-8b-instant",
     "messages": [
       {
         "role": "system",
         "content": "Eres un asistente amigable y útil."
       },
       {
         "role": "user",
         "content": "{{ $json.message }}"
       }
     ],
     "max_tokens": 500
   }
   ```

   **Nodo 4: Extraer respuesta**

   ```
   Add node → Data transformation → Set
   Mode: Manual Mapping
   
   Mappings:
   - reply: {{ $json.choices[0].message.content }}
   ```

   **Nodo 5: Enviar respuesta a WhatsApp**

   ```
   Add node → HTTP Request
   Method: POST
   URL: https://api.minuevallc.com/message/sendText/principal
   Authentication: Evolution API
   
   Body (JSON):
   {
     "number": "{{ $('Nodo 2').item.json.phone }}",
     "text": "{{ $json.reply }}"
   }
   ```

   **Conectar nodos:**
   Webhook → Set → Groq → Set → WhatsApp

   **Guardar workflow:** Nombre: "WhatsApp AI Assistant"

3. [ ] **13:00-14:00** Configurar webhook en Evolution

   ```bash
   curl -X POST https://api.minuevallc.com/webhook/set/principal `
     -H "apikey: TU_EVOLUTION_API_KEY" `
     -H "Content-Type: application/json" `
     -d '{
       "url": "https://n8n.minuevallc.com/webhook/whatsapp",
       "webhook_by_events": false,
       "events": [
         "MESSAGES_UPSERT"
       ]
     }'
   ```

4. [ ] **14:00-15:00** TESTING COMPLETO

   **Test 1:** Envía mensaje a tu WhatsApp vinculado
   - "Hola, ¿cómo estás?"
   - **Esperar respuesta del bot (5-10 seg)**
   - ✅ Debe responder algo coherente

   **Test 2:** Pregunta simple
   - "¿Qué día es hoy?"
   - ✅ Debe responder correctamente

   **Test 3:** Conversación
   - "Cuéntame un chiste"
   - (Después de respuesta) "Cuéntame otro"
   - ✅ Debe mantener contexto

**Criterio de éxito Día 5:** Bot responde en WhatsApp con IA en <10 segundos

---

### **RESUMEN SEMANA 1**

**Checklist final:**

- [ ] VPS corriendo (24/7 uptime)
- [ ] Docker Compose: 6 servicios activos
- [ ] SSL funcionando (5 subdominios con candado verde)
- [ ] WhatsApp conectado (estado = "open")
- [ ] n8n workflow funcionando
- [ ] Bot responde mensajes con IA

**Si TODOS están ✅ → Pasar a Semana 2**

**Si alguno falla → NO avanzar, arreglarlo primero**

---

---

### **SEMANA 2: CRM + Guardar Conversaciones**

**Objetivo Único:** Base de datos funcionando + Conversaciones guardadas

#### **DÍA 1 (Lunes) - Setup NocoDB Schema**

**Tiempo:** 6 horas

**Tareas exactas:**

1. [ ] **09:00-10:00** Login y exploración de NocoDB
   - Abrir: <https://crm.minuevallc.com>
   - Crear cuenta admin
   - Explorar UI

2. [ ] **10:00-12:00** Crear tablas base

   **Tabla 1: partners** (tus clientes)

   ```
   Click "Add New Table"
   Name: partners
   
   Campos:
   1. id (auto, primary key) ✅ Ya existe
   2. name (SingleLineText) - Nombre del negocio
   3. email (Email)
   4. phone (PhoneNumber)
   5. subscription_tier (SingleSelect)
      Options: basic, pro, enterprise
   6. config_mode (SingleSelect)
      Options: template, custom, advanced
   7. vertical (SingleSelect)
      Options: restaurant, ecommerce, agency, other
   8. status (SingleSelect)
      Options: active, paused, cancelled
   9. created_at (DateTime) - Default: now()
   10. whatsapp_instance (SingleLineText)
   ```

   **Tabla 2: contacts** (usuarios finales)

   ```
   Name: contacts
   
   Campos:
   1. id (auto)
   2. partner_id (LinkToAnotherRecord → partners)
   3. phone (PhoneNumber)
   4. name (SingleLineText)
   5. first_seen (DateTime)
   6. last_seen (DateTime)
   7. message_count (Number)
   8. metadata (LongText) - JSON con datos extra
   ```

   **Tabla 3: conversations** (hilos de chat)

   ```
   Name: conversations
   
   Campos:
   1. id (auto)
   2. partner_id (LinkToAnotherRecord → partners)
   3. contact_id (LinkToAnotherRecord → contacts)
   4. started_at (DateTime)
   5. last_message_at (DateTime)
   6. message_count (Number)
   7. status (SingleSelect)
      Options: open, closed, archived
   ```

   **Tabla 4: messages** (mensajes individuales)

   ```
   Name: messages
   
   Campos:
   1. id (auto)
   2. conversation_id (LinkToAnotherRecord → conversations)
   3. sender_type (SingleSelect)
      Options: user, bot, human
   4. message_text (LongText)
   5. timestamp (DateTime)
   6. response_time_ms (Number)
   ```

3. [ ] **13:00-15:00** Crear partner de prueba

   **Agregar registro manual en tabla partners:**

   ```
   name: "Test Restaurant"
   email: tu_email@gmail.com
   phone: +1234567890
   subscription_tier: pro
   config_mode: template
   vertical: restaurant
   status: active
   whatsapp_instance: principal
   ```

   **Copiar el ID generado** (lo necesitarás para workflows)

**Criterio de éxito Día 1:** 4 tablas creadas, 1 partner de prueba insertado

---

#### **DÍA 2 (Martes) - n8n: Guardar en DB**

**Tiempo:** 6 horas

**Tareas exactas:**

1. [ ] **09:00-10:00** Configurar credenciales NocoDB en n8n

   - n8n → Credentials → Add Credential

   ```
   Type: NocoDB API Token
   Name: NocoDB CRM
   
   Base URL: https://crm.minuevallc.com
   API Token: 
   ```

   **Para obtener API Token:**
   - NocoDB → Click tu perfil (arriba derecha)
   - Account Settings → Tokens
   - Create New Token
   - Name: "n8n Integration"
   - Copy token generado

2. [ ] **10:00-12:00** Modificar workflow existente

   **Abrir workflow "WhatsApp AI Assistant"**

   **Agregar ANTES de Groq:**

   **Nodo nuevo: "Buscar/Crear Contact"**

   ```
   Add node → NocoDB
   Operation: List Records
   Table: contacts
   Filter: phone = {{ $('Set Phone').item.json.phone }}
   
   If not found:
   Operation: Create Record
   Table: contacts
   Fields:
     phone: {{ $('Set Phone').item.json.phone }}
     partner_id: 1  # ID del partner de prueba
     first_seen: {{ $now }}
     last_seen: {{ $now }}
     message_count: 1
   ```

   **Nodo nuevo: "Buscar/Crear Conversation"**

   ```
   Add node → NocoDB
   Operation: List Records
   Table: conversations
   Filter: contact_id = {{ $('Buscar/Crear Contact').item.json.id }} AND status = 'open'
   
   If not found:
   Operation: Create Record
   Table: conversations
   Fields:
     partner_id: 1
     contact_id: {{ $('Buscar/Crear Contact').item.json.id }}
     started_at: {{ $now }}
     last_message_at: {{ $now }}
     message_count: 1
     status: open
   ```

   **Nodo nuevo: "Guardar Mensaje Usuario"**

   ```
   Add node → NocoDB
   Operation: Create Record
   Table: messages
   Fields:
     conversation_id: {{ $('Buscar/Crear Conversation').item.json.id }}
     sender_type: user
     message_text: {{ $('Set Phone').item.json.message }}
     timestamp: {{ $now }}
   ```

   **DESPUÉS de responder, agregar:**

   **Nodo nuevo: "Guardar Mensaje Bot"**

   ```
   Add node → NocoDB
   Operation: Create Record
   Table: messages
   Fields:
     conversation_id: {{ $('Buscar/Crear Conversation').item.json.id }}
     sender_type: bot
     message_text: {{ $('Set Reply').item.json.reply }}
     timestamp: {{ $now }}
     response_time_ms: {{ $('Groq').item.json.response_time }}
   ```

   **Nuevo flujo completo:**

   ```
   Webhook →
   Set Phone →
   Buscar/Crear Contact →
   Buscar/Crear Conversation →
   Guardar Mensaje Usuario →
   Groq →
   Set Reply →
   Guardar Mensaje Bot →
   Enviar WhatsApp
   ```

   **Guardar workflow**

3. [ ] **13:00-14:00** Testing completo

   **Test 1:** Enviar mensaje a WhatsApp
   - "Hola, soy nuevo"
   - Verificar en NocoDB:
     - ✅ Nuevo contact creado
     - ✅ Nueva conversation creada
     - ✅ 2 messages (user + bot)

   **Test 2:** Segundo mensaje del mismo usuario
   - "¿Cómo estás?"
   - Verificar:
     - ✅ Contact NO duplicado (mismo)
     - ✅ Conversation MISMA (open)
     - ✅ 2 messages NUEVOS agregados (total 4)

4. [ ] **14:00-15:00** Crear vista en NocoDB

   **Vista: "Conversaciones Activas"**
   - Tabla conversations
   - Filter: status = 'open'
   - Sort: last_message_at DESC
   - Campos visibles:
     - Contact name
     - Last message
     - Message count
     - Started at

**Criterio de éxito Día 2:** Mensajes de WhatsApp se guardan automáticamente en NocoDB

---

#### **DÍA 3 (Miércoles) - SmartSend™ Rate Limiting**

**Tiempo:** 5 horas

**Tareas exactas:**

1. [ ] **09:00-10:00** Crear tabla de usage

   **NocoDB → Nueva tabla: partner_usage**

   ```
   Campos:
   1. id (auto)
   2. partner_id (LinkToAnotherRecord → partners)
   3. date (Date) - Default: today
   4. messages_sent (Number) - Default: 0
   5. messages_received (Number) - Default: 0
   6. last_message_timestamp (DateTime)
   ```

2. [ ] **10:00-12:00** Workflow de Rate Limiting

   **Nuevo workflow: "SmartSend Rate Limiter"**

   **Nodo 1: Webhook**

   ```
   Path: webhook/rate-limit-check
   Method: POST
   Body esperado:
   {
     "partner_id": 1,
     "phone": "+1234567890"
   }
   ```

   **Nodo 2: Get Today's Usage**

   ```
   NocoDB → List Records
   Table: partner_usage
   Filter: partner_id = {{ $json.partner_id }} AND date = today
   ```

   **Nodo 3: IF - Check Limit**

   ```
   IF node
   Condition: {{ $('Get Usage').item.json.messages_sent < 500 }}
   
   TRUE → Allow message
   FALSE → Block (return error)
   ```

   **Nodo 4a (TRUE branch): Update Usage**

   ```
   NocoDB → Update Record
   Table: partner_usage
   Increment: messages_sent += 1
   Update: last_message_timestamp = now
   ```

   **Nodo 4b (FALSE): Return Error**

   ```
   Respond to Webhook
   Status: 429
   Body: {
     "error": "Rate limit exceeded",
     "limit": 500,
     "reset_at": "tomorrow 00:00"
   }
   ```

   **Nodo 5 (TRUE): Random Delay**

   ```
   Function node
   Code:
   const delay = Math.floor(Math.random() * 6000) + 2000; // 2-8 seg
   await new Promise(resolve => setTimeout(resolve, delay));
   return items;
   ```

   **Nodo 6: Return OK**

   ```
   Respond to Webhook
   Status: 200
   Body: {
     "allowed": true,
     "delay_applied_ms": {{ $('Random Delay').item.json.delay }}
   }
   ```

3. [ ] **13:00-14:00** Integrar con workflow principal

   **Modificar "WhatsApp AI Assistant"**

   **AGREGAR al inicio (después de Webhook):**

   **Nodo: "Check Rate Limit"**

   ```
   HTTP Request
   Method: POST
   URL: https://n8n.minuevallc.com/webhook/rate-limit-check
   Body:
   {
     "partner_id": 1,
     "phone": "{{ $('Set Phone').item.json.phone }}"
   }
   ```

   **IF → Check if allowed**

   ```
   Condition: {{ $('Check Rate Limit').item.json.allowed === true }}
   
   TRUE → Continuar workflow normal
   FALSE → Responder "Límite excedido, intenta mañana"
   ```

4. [ ] **14:00-15:00** Testing de límites

   **Test 1:** Enviar 5 mensajes rápidos
   - Verificar delays entre respuestas (2-8 seg random)
   - ✅ Todas las respuestas deben llegar

   **Test 2:** Verificar contador en partner_usage
   - ✅ messages_sent debe ser = 5

**Criterio de éxito Día 3:** Rate limiting funciona, delays aleatorios aplicados

---

#### **DÍA 4 (Jueves) - Telegram Integration**

**Tiempo:** 5 horas

**Tareas exactas:**

1. [ ] **09:00-09:30** Crear bot de Telegram

   - Telegram → Buscar @BotFather
   - Enviar: `/newbot`
   - Nombre: "MiNuevaLLC Bot"
   - Username: `minuevallc_bot` (debe ser único)
   - **Copiar token** (formato: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

2. [ ] **09:30-10:30** Configurar webhook en Telegram

   ```bash
   curl -X POST "https://api.telegram.org/bot<TU_TOKEN>/setWebhook" \
     -d "url=https://n8n.minuevallc.com/webhook/telegram"
   ```

   **Debe responder:**

   ```json
   {"ok":true,"result":true,"description":"Webhook was set"}
   ```

3. [ ] **10:30-12:00** Crear workflow Telegram en n8n

   **Nuevo workflow: "Telegram AI Assistant"**

   **Nodo 1: Webhook**signal

   ```
   Path: webhook/telegram
   Method: POST
   ```

   **Nodo 2: Extract Data**

   ```
   Set node
   Mappings:
   - chat_id: {{ $json.message.chat.id }}
   - message: {{ $json.message.text }}
   - username: {{ $json.message.from.username }}
   ```

   **Nodo 3: Groq** (igual que WhatsApp)

   **Nodo 4: Send Reply**

   ```
   HTTP Request
   Method: POST
   URL: https://api.telegram.org/bot<TU_TOKEN>/sendMessage
   Body:
   {
     "chat_id": "{{ $('Extract Data').item.json.chat_id }}",
     "text": "{{ $('Groq').item.json.reply }}"
   }
   ```

4. [ ] **13:00-14:00** Testing

   - Buscar tu bot en Telegram
   - Enviar: `/start`
   - Enviar: "Hola, ¿cómo estás?"
   - ✅ Debe responder con IA

5. [ ] **14:00-15:00** Guardar en DB (igual que WhatsApp)

   - Copiar nodos de guardar en NocoDB
   - Adaptar para Telegram
   - Test: Verificar que se guarda en conversations

**Criterio de éxito Día 4:** Bot de Telegram respondiendo y guardando en DB

---

#### **DÍA 5 (Viernes) - Dashboard Básico**

**Tiempo:** 6 horas

**Tareas exactas:**

1. [ ] **09:00-11:00** Explorar NocoDB DirectUI

   **Crear vistas útiles:**

   **Vista 1: "Dashboard Principal"**
   - Tabla: conversations
   - Type: Kanban
   - Group by: status
   - Mostrar: contact name, last message, message count

   **Vista 2: "Mensajes del Día"**
   - Tabla: messages
   - Filter: timestamp > today 00:00
   - Sort: timestamp DESC
   - Group by: sender_type

2. [ ] **11:00-13:00** Crear queries de métricas

   **En PostgreSQL (vía adminer o psql):**

   ```sql
   -- Total conversaciones hoy
   SELECT COUNT(*) 
   FROM conversations 
   WHERE started_at >= CURRENT_DATE;
   
   -- Tiempo promedio de respuesta
   SELECT AVG(response_time_ms) / 1000 as avg_response_sec
   FROM messages
   WHERE sender_type = 'bot'
   AND timestamp >= CURRENT_DATE;
   
   -- Top contactos activos
   SELECT c.phone, c.name, COUNT(m.id) as message_count
   FROM contacts c
   JOIN conversations cv ON cv.contact_id = c.id
   JOIN messages m ON m.conversation_id = cv.id
   WHERE m.timestamp >= CURRENT_DATE - INTERVAL '7 days'
   GROUP BY c.id
   ORDER BY message_count DESC
   LIMIT 10;
   ```

3. [ ] **14:00-15:00** Documentar setup

   **Crear: `docs/week-2-recap.md`**

   ```markdown
   # Semana 2 - Recap
   
   ## Completado
   - ✅ NocoDB schema (4 tablas)
   - ✅ Workflows guardan en DB
   - ✅ Rate limiting implementado
   - ✅ Telegram integrado
   - ✅ Dashboard básico
   
   ## Métricas
   - Conversaciones guardadas: X
   - Mensajes totales: Y
   - Canales activos: 2 (WhatsApp, Telegram)
   
   ## Siguiente semana
   - Diseño de template vertical
   ```

**Criterio de éxito Día 5:** Dashboard muestra conversaciones en tiempo real

---

### **RESUMEN SEMANA 2**

**Checklist final:**

- [ ] 4 tablas en NocoDB funcionando
- [ ] Conversaciones se guardan automáticamente
- [ ] Rate limiting activo (500 msg/día)
- [ ] Telegram bot funcionando
- [ ] Dashboard básico operativo
- [ ] 2 canales activos (WhatsApp + Telegram)

**Si TODOS ✅ → Pasar a Semana 3**

---

### **SEMANA 3: Diseño Template Vertical #1**

**Objetivo:** Especificar completamente el primer template (Lead Qualifier)

#### **DÍA 1 (Lunes) - Research & Spec**

**Tiempo:** 6 horas

1. [ ] **09:00-12:00** Investigar lead qualification
   - Ver 5-10 landing pages de agencias
   - Anotar preguntas comunes que hacen
   - Identificar campos críticos para calificar

2. [ ] **13:00-15:00** Escribir especificación

   **Crear: `docs/template-lead-qualifier-spec.md`**

   ```markdown
   # Template: Lead Qualifier para Agencias
   
   ## Flujo 1: Saludo + Calificación Inicial
   Keywords: "hola", "info", "servicios", "ayuda"
   
   Bot responde:
   "¡Hola! 👋 Soy el asistente de [Agencia].
   
   ¿En qué podemos ayudarte hoy?
   1️⃣ Desarrollo web
   2️⃣ Marketing digital  
   3️⃣ Diseño
   4️⃣ Otro"
   
   User responde: "1"
   
   Bot: "Perfecto! ¿Cuál es tu presupuesto aproximado?
   a) Menos de $5,000
   b) $5,000 - $15,000
   c) $15,000 - $50,000
   d) Más de $50,000"
   
   ... continuar flujo
   
   ## Flujo 2: Agendar Llamada
   ## Flujo 3: Enviar a CRM
   ## Flujo 4: Follow-up Automático
   ## Flujo 5: Handoff a Humano
   ```

**Criterio de éxito Día 1:** Spec completa escrita y revisada

---

#### **DÍA 2-3 (Martes-Miércoles) - Implementación Flujo 1**

**Tiempo:** 12 horas

**No entro en detalle comando por comando, pero entregables:**

- [ ] Workflow n8n: "Lead Qualifier - Flujo 1"
- [ ] Sistema de estados (conversación multi-paso)
- [ ] Validación de respuestas
- [ ] Guardar en NocoDB con lead_score
- [ ] Testing con 5 escenarios diferentes

---

#### **DÍA 4 (Jueves) - Implementación Flujos 2-3**

- [ ] Flujo 2: Calendly embed para agendar
- [ ] Flujo 3: Webhook a CRM (HubSpot/Pipedrive)

---

#### **DÍA 5 (Viernes) - Testing + Docs**

- [ ] Test end-to-end completo
- [ ] Video demo (5 min)
- [ ] Documentación del template

---

## 🎯 **SEMANAS 4-12: RESUMEN EJECUTIVO** (Alto Nivel)

A partir de aquí, menos detalle día por día, pero entregables CLAROS por semana.

---

### **SEMANA 4: Onboarding Wizard**

**Objetivo:** Sistema de registro automático

**Entregables:**

- [ ] Página de signup (email/password)
- [ ] Wizard de selección de vertical
- [ ] Instalador automático de template
- [ ] Email de bienvenida
- [ ] Tutorial interactivo (tooltips)

**Criterio de éxito:** Usuario puede registrarse y tener bot funcionando en 5 minutos

---

### **SEMANA 5: Template #2 - Restaurantes**

**Objetivo:** Segundo vertical implementado

**Entregables:**

- [ ] 5 flujos de restaurante
- [ ] Detector de reservas (NLP)
- [ ] Menú visual (carrusel WhatsApp)
- [ ] CRM específico (tabla reservations, orders)
- [ ] Testing con 2 restaurantes

**Criterio de éxito:** Template restaurante funcionando end-to-end

---

### **SEMANA 6: Inteligencia Colectiva v1**

**Objetivo:** Primeros benchmarks cross-cliente

**Entregables:**

- [ ] Tabla `vertical_insights` en PostgreSQL
- [ ] Workflow nocturno de cálculo
- [ ] Dashboard mostrando percentiles
- [ ] 3 insights accionables por vertical

**Criterio de éxito:** "Tu métrica vs. promedio" mostrándose en dashboard

---

### **SEMANA 7: Landing Page + Stripe**

**Objetivo:** Poder vender

**Entregables:**

- [ ] Landing actualizada con copy nuevo
- [ ] Screenshots reales del producto
- [ ] Stripe configurado (3 planes)
- [ ] Checkout funcionando
- [ ] Webhook de subscripción

**Criterio de éxito:** Primera venta de prueba completada

---

### **SEMANA 8: Discord + Instagram**

**Objetivo:** Canales 3 y 4

**Entregables:**

- [ ] Discord bot funcionando
- [ ] Instagram basic display API (DMs)
- [ ] Workflows integrados
- [ ] 4 canales activos

**Criterio de éxito:** 4 canales respondiendo simultáneamente

---

### **SEMANA 9: Beta Launch**

**Objetivo:** 20 beta testers

**Entregables:**

- [ ] Sistema de invitaciones
- [ ] Onboarding emails automáticos
- [ ] Dashboard de métricas internas
- [ ] 20 invites enviados

**Criterio de éxito:** 10 usuarios activos usando el producto

---

### **SEMANA 10: Feedback Loop**

**Objetivo:** Refinar basado en feedback

**Entregables:**

- [ ] 10 sesiones 1:1 con beta users
- [ ] Reporte de bugs encontrados
- [ ] Top 5 features más pedidas implementadas
- [ ] NPS calculado

**Criterio de éxito:** NPS > 50, bugs críticos = 0

---

### **SEMANA 11: White-Label Beta**

**Objetivo:** Preparar partner program

**Entregables:**

- [ ] Multi-tenant en NocoDB
- [ ] Subdominios por partner
- [ ] Dashboard de agencia
- [ ] Billing automation (Stripe Connect)

**Criterio de éxito:** 1 agencia piloto usando white-label

---

### **SEMANA 12: Lanzamiento Público 🚀**

**Objetivo:** GO LIVE

**Entregables:**

- [ ] Product Hunt launch
- [ ] Help center completo
- [ ] API docs publicados
- [ ] Chat support configurado
- [ ] Post en LinkedIn/Twitter

**Criterio de éxito:** 25 clientes pagos, $1,500 MRR

---

## 📊 **TRACKING SEMANAL**

Usa esta tabla para marcar tu progreso:

| Semana | Objetivo | Status | Notas |
|--------|----------|--------|-------|
| 1 | Infraestructura + WhatsApp | ⏳ | |
| 2 | CRM + Telegram | ⏳ | |
| 3 | Template #1 | ⏳ | |
| 4 | Onboarding | ⏳ | |
| 5 | Template #2 | ⏳ | |
| 6 | Inteligencia colectiva | ⏳ | |
| 7 | Landing + Stripe | ⏳ | |
| 8 | Discord + IG | ⏳ | |
| 9 | Beta launch | ⏳ | |
| 10 | Feedback | ⏳ | |
| 11 | White-label | ⏳ | |
| 12 | Lanzamiento 🚀 | ⏳ | |

**Leyenda:** ⏳ Pendiente | 🔄 En progreso | ✅ Completado | ❌ Bloqueado

---

## ⚠️ **REGLAS DE ORO**

1. **NO agregar features no listadas aquí hasta Semana 12**
2. **Si te atoras >2 días en algo → Simplifica o skip**
3. **Crítico = Semanas 1-7, Nice-to-have = Semanas 8-11**
4. **Cada viernes: Review semanal y commit a GitHub**
5. **Si adelantas tiempo: NO agregar scope, adelantar siguiente semana**

---

## 🎯 **PRÓXIMO PASO**

**AHORA MISMO:**

1. [ ] Guardar este documento localmente
2. [ ] Imprimir o tener siempre abierto
3. [ ] Empezar Semana 1 → Día 1 → Tarea 1

**¿Listo para empezar con Semana 1, Día 1? 🚀**
