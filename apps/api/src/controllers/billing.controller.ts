import { Request, Response } from 'express';
import { prisma } from '@repo/database';
import { logger } from '@repo/logger';

export const billingController = {
    /**
     * GET /api/v1/billing/balance
     * Retorna el uso actual del plan y comisiones acumuladas.
     */
    getBalance: async (req: Request, res: Response) => {
        try {
            const orgId = (req as any).organizationId;
            const org = await prisma.organization.findUnique({
                where: { id: orgId },
                include: { plan: true },
            });

            if (!org) return res.status(404).json({ error: 'Organization not found' });

            res.json({
                plan: org.plan ? {
                    name: org.plan.name,
                    priceMonthly: org.plan.priceMonthly,
                    messagesIncluded: org.plan.messagesIncluded,
                    agentRunsIncluded: org.plan.agentRunsIncluded,
                    maxInstances: org.plan.maxInstances,
                } : null,
                usage: {
                    messagesUsed: org.messagesUsedThisMonth,
                    messagesLimit: org.plan?.messagesIncluded ?? 0,
                    agentRunsUsed: org.agentRunsUsedThisMonth,
                    agentRunsLimit: org.plan?.agentRunsIncluded ?? 0,
                    billingCycleStart: org.billingCycleStart,
                },
                commissions: org.creditBalance, // Comisiones de referidos acumuladas
            });
        } catch (error) {
            logger.error(error, 'Error obteniendo balance');
            res.status(500).json({ error: 'Error al obtener saldo' });
        }
    },

    /**
     * GET /api/v1/billing/history
     * Historial de transacciones (suscripciones + comisiones).
     */
    getHistory: async (req: Request, res: Response) => {
        try {
            const orgId = (req as any).organizationId;
            const limit = Number(req.query.limit) || 50;

            const transactions = await prisma.creditTransaction.findMany({
                where: { organizationId: orgId },
                orderBy: { createdAt: 'desc' },
                take: limit,
            });

            res.json({ transactions, count: transactions.length });
        } catch (error) {
            logger.error(error, 'Error obteniendo historial');
            res.status(500).json({ error: 'Error al obtener historial' });
        }
    },
};
