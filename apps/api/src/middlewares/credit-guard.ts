import { Request, Response, NextFunction } from 'express';
import { prisma } from '@repo/database';
import { logger } from '@repo/logger';

/**
 * Moltbot Finance — Plan Guard Middleware (Modelo Suscripción)
 * Verifica si la organización tiene un plan activo y no ha excedido sus límites mensuales.
 * Detecta automáticamente si la petición es de WhatsApp o de Agentes IA.
 */
export async function creditGuard(req: Request, res: Response, next: NextFunction) {
    try {
        const orgId = (req as any).organizationId;

        if (!orgId) {
            return res.status(401).json({ error: 'Organization not identified' });
        }

        const org = await prisma.organization.findUnique({
            where: { id: orgId },
            include: { plan: true },
        });

        if (!org) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        // Sin plan = sin servicio
        if (!org.plan) {
            logger.warn({ orgId }, 'Plan guard: no active plan');
            return res.status(402).json({
                error: 'NO_PLAN',
                message: 'No tienes un plan activo. Elige un plan para continuar.',
            });
        }

        // Detectar tipo de operación por la ruta
        const isWhatsApp = req.path.includes('/whatsapp');
        const isAgent = req.path.includes('/agents');

        if (isWhatsApp) {
            // Verificar límite de mensajes
            if (org.messagesUsedThisMonth >= org.plan.messagesIncluded) {
                logger.warn({
                    orgId,
                    used: org.messagesUsedThisMonth,
                    limit: org.plan.messagesIncluded,
                }, 'Plan guard: message limit reached');
                return res.status(402).json({
                    error: 'MESSAGE_LIMIT_REACHED',
                    message: 'Has alcanzado tu límite de mensajes este mes. Upgradea tu plan.',
                    used: org.messagesUsedThisMonth,
                    limit: org.plan.messagesIncluded,
                    plan: org.plan.name,
                });
            }
        }

        if (isAgent) {
            // -1 = ilimitado
            if (org.plan.agentRunsIncluded !== -1 && org.agentRunsUsedThisMonth >= org.plan.agentRunsIncluded) {
                logger.warn({
                    orgId,
                    used: org.agentRunsUsedThisMonth,
                    limit: org.plan.agentRunsIncluded,
                }, 'Plan guard: agent run limit reached');
                return res.status(402).json({
                    error: 'AGENT_LIMIT_REACHED',
                    message: 'Has alcanzado tu límite de ejecuciones IA este mes. Upgradea tu plan.',
                    used: org.agentRunsUsedThisMonth,
                    limit: org.plan.agentRunsIncluded,
                    plan: org.plan.name,
                });
            }
        }

        // Inyectar datos del plan en el request para uso posterior
        (req as any).plan = org.plan;

        next();
    } catch (error) {
        logger.error(error, 'Plan guard error');
        next(error);
    }
}
