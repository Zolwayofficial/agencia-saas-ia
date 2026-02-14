-- =========================================
-- PostgreSQL - Schema Inicial V3.3
-- MiNuevaLLC - Agencia SaaS IA
-- =========================================

-- Tabla de Usuarios/Clientes
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    whatsapp_number VARCHAR(50),
    dashboard_config JSONB, -- Aquí Moltbot edita el dashboard
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de Referidos
CREATE TABLE affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE,
    wallet_balance DECIMAL(10,2) DEFAULT 0
);

-- Tabla de Conversaciones
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id INTEGER REFERENCES clients(id),
    channel VARCHAR(20) NOT NULL,
    status VARCHAR(30) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para rendimiento
CREATE INDEX idx_clients_whatsapp ON clients(whatsapp_number);
CREATE INDEX idx_affiliates_code ON affiliates(code);
CREATE INDEX idx_conversations_client ON conversations(client_id);
