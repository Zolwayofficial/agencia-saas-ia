/**
 * Rutas de Analytics para Appsmith
 */

import { Router, Request, Response } from 'express';
import { logger } from '../../utils/logger';

const router = Router();

// Obtener métricas generales
router.get('/metrics', async (req: Request, res: Response) => {
    try {
        // TODO: Consultar desde PostgreSQL
        const metrics = {
            totalConversations: 0,
            aiHandledRate: 0,
            averageResponseTime: 0,
            activeUsers: 0,
        };

        res.json(metrics);
    } catch (error) {
        logger.error('Error obteniendo métricas:', error);
        res.status(500).json({ error: 'Error interno' });
    }
});

// Obtener datos de referidos
router.get('/referrals/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        // TODO: Consultar desde PostgreSQL
        const referralData = {
            totalReferrals: 0,
            totalEarnings: 0,
            pendingPayout: 0,
            referralCode: '',
        };

        res.json(referralData);
    } catch (error) {
        logger.error('Error obteniendo datos de referidos:', error);
        res.status(500).json({ error: 'Error interno' });
    }
});

export default router;
