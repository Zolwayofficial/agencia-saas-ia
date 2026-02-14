/**
 * Webhook para recibir eventos de Evolution API (WhatsApp)
 */

import { Router, Request, Response } from 'express';
import { logger } from '../../utils/logger';
import { orchestrator } from '../../core/orchestrator';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const { event, data, instance } = req.body;

        logger.info(`Evolution event: ${event}`, { instance });

        // Procesar mensajes entrantes
        if (event === 'messages.upsert' && data?.key?.fromMe === false) {
            const message = data.message?.conversation ||
                data.message?.extendedTextMessage?.text || '';

            if (message) {
                await orchestrator.processMessage({
                    channel: 'whatsapp',
                    conversationId: data.key.remoteJid,
                    message,
                    sender: {
                        phone: data.key.remoteJid.split('@')[0],
                        name: data.pushName || 'Usuario',
                    },
                    instance,
                });
            }
        }

        res.status(200).json({ received: true });
    } catch (error) {
        logger.error('Error procesando webhook Evolution:', error);
        res.status(500).json({ error: 'Error interno' });
    }
});

export default router;
