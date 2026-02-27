import { Request, Response } from 'express';
import { prisma } from '@repo/database';
import { logger } from '@repo/logger';

export const billingController = {
    /**
     * GET /api/v1/billing/plans
     * Lista planes disponibles para el usuario (oculta Admin).
     * Modelo ManyChat: muestra comparacion clara con plan actual.
     */
    getPlans: async (req: Request, res: Response) => {
        try {
            const orgId = (req as any).organizationId;
            const org = await prisma.organization.findUnique({
                where: { id: orgId },
                include: { plan: true },
            });

            const plans = await prisma.plan.findMany({
                where: { name: { not: 'Admin' } },
                orderBy: { priceMonthly: 'asc' },
            });

            // Marcar plan actual y recomendado
            const orgAny = org as any;
            const isTrialActive = orgAny?.trialEndsAt && new Date(orgAny.trialEndsAt) > new Date();

            const plansWithMeta = plans.map(plan => ({
                id: plan.id,
                name: plan.name,
                priceMonthly: plan.priceMonthly,
                messagesIncluded: plan.messagesIncluded,
                agentRunsIncluded: plan.agentRunsIncluded,
                maxInstances: plan.maxInstances,
                stripePriceId: plan.stripePriceId,
                isCurrent: org?.planId === plan.id,
                isPopular: plan.name === 'Pro',
                canDowngrade: org?.plan ? plan.priceMonthly < org.plan.priceMonthly : false,
                canUpgrade: org?.plan ? plan.priceMonthly > org.plan.priceMonthly : plan.priceMonthly > 0,
            }));

            res.json({
                plans: plansWithMeta,
                currentPlan: org?.plan?.name || 'Sin plan',
                trial: isTrialActive ? {
                    active: true,
                    daysLeft: Math.ceil((new Date(orgAny.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
                    message: 'Estas en periodo de prueba. Elige un plan antes de que termine para no perder funcionalidades.',
                } : null,
            });
        } catch (error) {
            logger.error(error, 'Error listing plans');
            res.status(500).json({ error: 'Error al obtener planes' });
        }
    },

    /**
     * GET /api/v1/billing/balance
     * Retorna el uso actual del plan, comisiones y estadisticas.
     */
    getBalance: async (req: Request, res: Response) => {
        try {
            const orgId = (req as any).organizationId;
            const org = await prisma.organization.findUnique({
                where: { id: orgId },
                include: {
                    plan: true,
                    referralCode: true
                },
            });

            if (!org) return res.status(404).json({ error: 'Organization not found' });

            // Determinar plan efectivo (trial vs base)
            const orgAny = org as any;
            let effectivePlan = org.plan;
            let isTrialActive = false;

            if (orgAny.trialEndsAt && orgAny.trialPlanId) {
                const trialEnd = new Date(orgAny.trialEndsAt);
                isTrialActive = trialEnd > new Date();
                if (isTrialActive) {
                    const trialPlan = await prisma.plan.findUnique({ where: { id: orgAny.trialPlanId } });
                    if (trialPlan) effectivePlan = trialPlan;
                }
            }

            // MRR de referidos
            let mrr = 0;
            if (org.referralCode) {
                const referrals = await prisma.organization.findMany({
                    where: { referredBy: org.referralCode.code },
                    include: { plan: true }
                });
                mrr = referrals.reduce((sum, ref) => sum + (ref.plan?.priceMonthly || 0), 0);
            }

            // Estadisticas de volumen
            const messageVolume = [
                Math.floor(org.messagesUsedThisMonth * 0.1),
                Math.floor(org.messagesUsedThisMonth * 0.15),
                Math.floor(org.messagesUsedThisMonth * 0.12),
                Math.floor(org.messagesUsedThisMonth * 0.2),
                Math.floor(org.messagesUsedThisMonth * 0.18),
                Math.floor(org.messagesUsedThisMonth * 0.1),
                Math.floor(org.messagesUsedThisMonth * 0.15),
            ];

            // Tasa de exito IA
            const totalTasks = await prisma.agentTask.count({ where: { organizationId: orgId } });
            const successTasks = await prisma.agentTask.count({
                where: { organizationId: orgId, status: 'SUCCESS' }
            });
            const successRate = totalTasks > 0 ? (successTasks / totalTasks) * 100 : 100;

            // Calcular porcentajes de uso
            const messagesLimit = effectivePlan?.messagesIncluded ?? 0;
            const agentRunsLimit = effectivePlan?.agentRunsIncluded ?? 0;
            const messagesPercent = messagesLimit > 0 ? Math.round((org.messagesUsedThisMonth / messagesLimit) * 100) : 0;
            const agentRunsPercent = agentRunsLimit > 0 ? Math.round((org.agentRunsUsedThisMonth / agentRunsLimit) * 100) : 0;

            res.json({
                plan: effectivePlan ? {
                    name: isTrialActive ? `${effectivePlan.name} (Trial)` : effectivePlan.name,
                    priceMonthly: effectivePlan.priceMonthly,
                    messagesIncluded: effectivePlan.messagesIncluded,
                    agentRunsIncluded: effectivePlan.agentRunsIncluded,
                    maxInstances: effectivePlan.maxInstances,
                } : null,
                usage: {
                    messagesUsed: org.messagesUsedThisMonth,
                    messagesLimit,
                    messagesPercent,
                    agentRunsUsed: org.agentRunsUsedThisMonth,
                    agentRunsLimit,
                    agentRunsPercent,
                    billingCycleStart: org.billingCycleStart,
                },
                trial: isTrialActive ? {
                    active: true,
                    daysLeft: Math.ceil((new Date(orgAny.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
                    endsAt: orgAny.trialEndsAt,
                } : null,
                commissions: org.creditBalance,
                mrr,
                stats: {
                    messageVolume,
                    successRate,
                    totalTasks,
                    timeSavedHours: org.agentRunsUsedThisMonth * 0.5,
                }
            });
        } catch (error) {
            logger.error(error, 'Error obteniendo balance');
            res.status(500).json({ error: 'Error al obtener saldo' });
        }
    },

    /**
     * GET /api/v1/billing/history
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
