-- MCP Gateway: Read-only PostgreSQL user for agent database access
-- Run this against the agencia_saas database on the production server

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'readonly_agent') THEN
        CREATE ROLE readonly_agent WITH LOGIN PASSWORD 'r0_ag3nt_s3cur3_2024';
    END IF;
END
$$;

GRANT CONNECT ON DATABASE agencia_saas TO readonly_agent;
GRANT USAGE ON SCHEMA public TO readonly_agent;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_agent;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_agent;
