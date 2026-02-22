import rateLimit from 'express-rate-limit';
import { prisma } from '@repo/database';
import { logger } from '@repo/logger';

/**
 * [V6.1] Rate limiter dinámico por organización.
 * Limita peticiones por minuto basándose en el organizationId del JWT.
 * Busca el límite en base al Plan de la organización.
 * Si no hay orgId (rutas públicas), limita por IP al valor por defecto.
 */
export const apiRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: async (req: any, res) => {
        const organizationId = req.organizationId;

        // Si no hay organización (ej. endpoints públicos), límite estricto por defecto
        if (!organizationId) {
            return 60;
        }

        try {
            const org = await prisma.organization.findUnique({
                where: { id: organizationId },
                include: { plan: true },
            });

            // Retorna el rateLimit del plan, o 60 como fallback seguro
            return org?.plan?.rateLimit ?? 60;
        } catch (error) {
            logger.error(error, 'Error fetching organization plan for rate limit');
            return 60;
        }
    },
    keyGenerator: (req) => (req as any).organizationId || req.ip || 'unknown',
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Has excedido el límite de peticiones de tu plan. Intenta de nuevo en un minuto.',
    },
});
