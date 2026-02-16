import rateLimit from 'express-rate-limit';

/**
 * Rate limiter por organización.
 * Limita peticiones por minuto basándose en el organizationId del JWT.
 * Si no hay orgId (rutas públicas), limita por IP.
 */
export const apiRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 60, // 60 requests por minuto por defecto
    keyGenerator: (req) => (req as any).organizationId || req.ip || 'unknown',
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Demasiadas solicitudes. Intenta de nuevo en un minuto.',
    },
});
