/**
 * Configuración centralizada desde variables de entorno
 */

import dotenv from 'dotenv';

dotenv.config();

export const config = {
    // Server
    port: parseInt(process.env.PORT || '3001'),
    nodeEnv: process.env.NODE_ENV || 'development',

    // Database
    dbUrl: process.env.DB_URL || 'postgres://user:pass@localhost:5432/agencia',

    // Redis
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

    // LiteLLM
    litellmUrl: process.env.LITELLM_URL || 'http://localhost:4000',

    // Chatwoot
    chatwootApiUrl: process.env.CHATWOOT_API_URL || 'http://localhost:3000',
    chatwootApiKey: process.env.CHATWOOT_API_KEY || '',

    // Lago
    lagoApiUrl: process.env.LAGO_API_URL || 'http://localhost:3000',
    lagoApiKey: process.env.LAGO_API_KEY || '',

    // Qdrant
    qdrantUrl: process.env.QDRANT_URL || 'http://localhost:6333',

    // Logging
    logLevel: process.env.LOG_LEVEL || 'info',
};
