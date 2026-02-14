/**
 * Webhook para recibir resultados de n8n
 */

import { Router, Request, Response } from 'express';
import { logger } from '../../utils/logger';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const { workflow_id, execution_id, status, data } = req.body;

        logger.info(`n8n result: ${status}`, { workflowId: workflow_id, executionId: execution_id });

        // Procesar resultado del workflow
        if (status === 'success' && data?.response) {
            // TODO: Enviar respuesta al canal correspondiente
            logger.info('Workflow completado exitosamente', { response: data.response });
        }

        res.status(200).json({ received: true });
    } catch (error) {
        logger.error('Error procesando webhook n8n:', error);
        res.status(500).json({ error: 'Error interno' });
    }
});

export default router;
