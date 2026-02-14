/**
 * Webhook para recibir eventos de Chatwoot
 */

import { Router, Request, Response } from 'express';
import { logger } from '../../utils/logger';
import { orchestrator } from '../../core/orchestrator';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const { event, message, conversation, account } = req.body;

        logger.info(`Chatwoot event: ${event}`, { conversationId: conversation?.id });

        // Solo procesar mensajes entrantes
        if (event === 'message_created' && message?.message_type === 'incoming') {
            await orchestrator.processMessage({
                channel: 'chatwoot',
                conversationId: conversation.id,
                message: message.content,
                sender: message.sender,
                accountId: account.id,
            });
        }

        res.status(200).json({ received: true });
    } catch (error) {
        logger.error('Error procesando webhook Chatwoot:', error);
        res.status(500).json({ error: 'Error interno' });
    }
});

export default router;
