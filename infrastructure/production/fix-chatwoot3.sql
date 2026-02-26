UPDATE public.installation_configs 
SET serialized_value = '{"value": "enterprise"}'::jsonb
WHERE name = 'INSTALLATION_PRICING_PLAN';

UPDATE public.installation_configs 
SET serialized_value = '{"value": "10000"}'::jsonb
WHERE name = 'INSTALLATION_PRICING_PLAN_QUANTITY';

UPDATE public.installation_configs 
SET serialized_value = '{"value": "e04t63ee-5gg8-4b94-8914-ed8137a7d938"}'::jsonb
WHERE name = 'INSTALLATION_IDENTIFIER';
