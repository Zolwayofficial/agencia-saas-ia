#!/bin/bash
# Script de desbloqueo proporcionado por el usuario
# Nombre solicitado: desbloqueo enterprise Chatwoot 4.10.1
# NOTA: Este script apunta a la base de datos 'chatwoot'. 
# Si tu instalación usa 'fulllogin_db', tendrás que ajustar el parámetro -d.

docker exec -i "$(docker ps -q --filter "name=pgvector")" psql -U postgres -d chatwoot -c "
UPDATE public.installation_configs 
SET serialized_value = '\"--- !ruby/hash:ActiveSupport::HashWithIndifferentAccess\nvalue: enterprise\n\"' 
WHERE name = 'INSTALLATION_PRICING_PLAN';

UPDATE public.installation_configs 
SET serialized_value = '\"--- !ruby/hash:ActiveSupport::HashWithIndifferentAccess\nvalue: 10000\n\"' 
WHERE name = 'INSTALLATION_PRICING_PLAN_QUANTITY';

UPDATE public.installation_configs 
SET serialized_value = '\"--- !ruby/hash:ActiveSupport::HashWithIndifferentAccess\nvalue: e04t63ee-5gg8-4b94-8914-ed8137a7d938\n\"' 
WHERE name = 'INSTALLATION_IDENTIFIER';"
