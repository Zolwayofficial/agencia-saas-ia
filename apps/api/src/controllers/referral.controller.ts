import { Request, Response } from 'express';
import { prisma } from '@repo/database';
import { logger } from '@repo/logger';

export const referralController = {
    /**
     * GET /api/v1/referrals/my-code
     * Obtiene el código de referido de la organización.
     */
    getMyCode: async (req: Request, res: Response) => {
        try {
            const orgId = (req as any).organizationId;

            let referral = await prisma.referralCode.findUnique({
                where: { organizationId: orgId },
            });

            // Auto-crear código si no existe
            if (!referral) {
                const org = await prisma.organization.findUnique({ where: { id: orgId } });
                referral = await prisma.referralCode.create({
                    data: {
                        code: `REF-${org?.slug?.toUpperCase() || orgId.slice(0, 6)}`,
                        organizationId: orgId,
                    },
                });
            }

            res.json({
                code: referral.code,
                level1Percent: referral.level1Percent,
            });
        } catch (error) {
            logger.error(error, 'Error obteniendo código de referido');
            res.status(500).json({ error: 'Error al obtener código' });
        }
    },

    /**
     * GET /api/v1/referrals/network
     * Lista los referidos (socios invitados) de la organización.
     */
    getNetwork: async (req: Request, res: Response) => {
        try {
            const orgId = (req as any).organizationId;

            const referral = await prisma.referralCode.findUnique({
                where: { organizationId: orgId },
            });

            if (!referral) return res.json({ referrals: [], total: 0 });

            // Buscar organizaciones que fueron referidas por este código
            const referred = await prisma.organization.findMany({
                where: { referredBy: referral.code },
                select: { id: true, name: true, slug: true, createdAt: true },
            });

            res.json({ referrals: referred, total: referred.length });
        } catch (error) {
            logger.error(error, 'Error obteniendo red de referidos');
            res.status(500).json({ error: 'Error al obtener red' });
        }
    },
};
