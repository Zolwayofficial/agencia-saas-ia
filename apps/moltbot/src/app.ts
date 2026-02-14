/**
 * 🧠 Moltbot - El Cerebro
 * Entry point del orquestador de IA
 */

import express from 'express';
import { config } from './config';
import { logger } from './utils/logger';

// Importar rutas
import chatwootWebhook from './api/webhooks/chatwoot';
import lagoWebhook from './api/webhooks/lago';
import n8nWebhook from './api/webhooks/n8n';
import evolutionWebhook from './api/webhooks/evolution';
import analyticsRoutes from './api/routes/analytics';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Webhooks
app.use('/webhook/chatwoot', chatwootWebhook);
app.use('/webhook/lago', lagoWebhook);
app.use('/webhook/n8n', n8nWebhook);
app.use('/webhook/evolution', evolutionWebhook);

// API Routes
app.use('/api/analytics', analyticsRoutes);

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Error no manejado:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
const PORT = config.port || 3001;
app.listen(PORT, () => {
    logger.info(`🧠 Moltbot iniciado en puerto ${PORT}`);
});
