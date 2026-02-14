/**
 * Webhook para recibir eventos de Lago (Billing)
 */

import { Router, Request, Response } from 'express';
import { logger } from '../../utils/logger';
import { billingService } from '../../services/billing_service';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const { event_type, data } = req.body;

        logger.info(`Lago event: ${event_type}`, { customerId: data?.customer?.external_id });

        switch (event_type) {
            case 'invoice.paid':
                await billingService.handlePaymentReceived(data);
                break;

            case 'subscription.started':
                await billingService.handleSubscriptionStarted(data);
                break;

            case 'subscription.canceled':
                await billingService.handleSubscriptionCanceled(data);
                break;

            default:
                logger.debug(`Evento Lago no manejado: ${event_type}`);
        }

        res.status(200).json({ received: true });
    } catch (error) {
        logger.error('Error procesando webhook Lago:', error);
        res.status(500).json({ error: 'Error interno' });
    }
});

export default router;
