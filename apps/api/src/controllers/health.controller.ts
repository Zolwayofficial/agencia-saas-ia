import { Request, Response } from 'express';
import { prisma } from '@repo/database';
import { logger } from '@repo/logger';

export const healthController = {
    /**
     * GET /api/v1/health
     * [V6.1] Verifica conectividad de servicios (DB, API).
     */
    check: async (_req: Request, res: Response) => {
        const checks: Record<string, string> = {
            database: 'unknown',
            api: 'healthy',
        };

        try {
            await prisma.$queryRaw`SELECT 1`;
            checks.database = 'healthy';
        } catch (e) {
            checks.database = 'unhealthy';
            logger.error(e, 'Health check: database unreachable');
        }

        const allHealthy = Object.values(checks).every(s => s === 'healthy');

        res.status(allHealthy ? 200 : 503).json({
            status: allHealthy ? 'ok' : 'degraded',
            service: 'api',
            version: '6.1',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            checks,
        });
    },
};
