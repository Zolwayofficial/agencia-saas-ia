-- Fix Chatwoot Enterprise Plan
-- Run with: docker cp fix-chatwoot.sql production-postgres-1:/tmp/ && docker exec production-postgres-1 psql -U fulllogin -d chatwoot_db -f /tmp/fix-chatwoot.sql

UPDATE public.installation_configs SET serialized_value = '"--- !ruby/hash:ActiveSupport::HashWithIndifferentAccess\nvalue: enterprise\n"' WHERE name = 'INSTALLATION_PRICING_PLAN';
UPDATE public.installation_configs SET serialized_value = '"--- !ruby/hash:ActiveSupport::HashWithIndifferentAccess\nvalue: 10000\n"' WHERE name = 'INSTALLATION_PRICING_PLAN_QUANTITY';
UPDATE public.installation_configs SET serialized_value = '"--- !ruby/hash:ActiveSupport::HashWithIndifferentAccess\nvalue: e04t63ee-5gg8-4b94-8914-ed8137a7d938\n"' WHERE name = 'INSTALLATION_IDENTIFIER';

SELECT name, serialized_value FROM installation_configs WHERE name IN ('INSTALLATION_PRICING_PLAN', 'INSTALLATION_PRICING_PLAN_QUANTITY', 'INSTALLATION_IDENTIFIER');
