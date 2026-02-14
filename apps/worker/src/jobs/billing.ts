/**
 * Billing Job — Modelo Suscripción Mensual + Comisiones de Referidos
 * Acciones:
 *   - subscription-renew: Cobrar plan + pagar comisiones + reiniciar contadores
 *   - recalculate: Recalcular comisiones acumuladas
 */

import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '@repo/database';
import { logger } from '@repo/logger';

interface BillingPayload {
    organizationId: string;
    action: 'subscription-renew' | 'recalculate';
}

export function createBillingWorker(connection: IORedis) {
    const worker = new Worker<BillingPayload>('billing', async (job: Job<BillingPayload>) => {
        const { organizationId, action } = job.data;
        logger.info({ jobId: job.id, organizationId, action }, 'Billing: processing');

        switch (action) {
            case 'subscription-renew': {
                // ── 1. Obtener organización y su plan ────────────────
                const org = await prisma.organization.findUnique({
                    where: { id: organizationId },
                    include: { plan: true },
                });

                if (!org?.plan) {
                    logger.warn({ organizationId }, 'Billing: no plan found, skipping');
                    return;
                }

                // ── 2. Registrar cobro de suscripción ────────────────
                await prisma.creditTransaction.create({
                    data: {
                        organizationId,
                        amount: -org.plan.priceMonthly,
                        type: 'SUBSCRIPTION',
                        description: `Suscripción mensual: Plan ${org.plan.name} ($${org.plan.priceMonthly}/mes)`,
                    },
                });

                // ── 3. Pagar comisiones de referidos ─────────────────
                if (org.referredBy) {
                    await payReferralCommissions(organizationId, org.referredBy, org.plan.priceMonthly);
                }

                // ── 4. Reiniciar contadores mensuales ────────────────
                await prisma.organization.update({
                    where: { id: organizationId },
                    data: {
                        messagesUsedThisMonth: 0,
                        agentRunsUsedThisMonth: 0,
                        billingCycleStart: new Date(),
                    },
                });

                // ── 5. Reiniciar contadores de instancias ────────────
                await prisma.whatsappInstance.updateMany({
                    where: { organizationId },
                    data: { messagesLast24h: 0 },
                });

                logger.info({
                    organizationId,
                    plan: org.plan.name,
                    price: org.plan.priceMonthly,
                }, 'Billing: subscription renewed + counters reset');
                break;
            }

            case 'recalculate': {
                // Recalcular comisiones acumuladas (solo COMMISSION type)
                const commissions = await prisma.creditTransaction.aggregate({
                    where: { organizationId, type: 'COMMISSION' },
                    _sum: { amount: true },
                });

                const totalCommissions = commissions._sum.amount || 0;
                await prisma.organization.update({
                    where: { id: organizationId },
                    data: { creditBalance: totalCommissions },
                });

                logger.info({ organizationId, totalCommissions }, 'Billing: recalculated commissions');
                break;
            }
        }
    }, { connection });

    worker.on('failed', (job, err) => {
        logger.error({ jobId: job?.id, err: err.message }, 'Billing: job failed');
    });

    return worker;
}

/**
 * Calcula y acredita comisiones de referidos (2 niveles).
 * Nivel 1: 20% al referidor directo
 * Nivel 2: 5% al referidor del referidor
 */
async function payReferralCommissions(
    payingOrgId: string,
    referralCode: string,
    planPrice: number,
) {
    // ── Nivel 1: Referidor directo ───────────────────────────
    const level1Referral = await prisma.referralCode.findUnique({
        where: { code: referralCode },
        include: { organization: true },
    });

    if (!level1Referral) return;

    const level1Commission = planPrice * (level1Referral.level1Percent / 100);

    await prisma.$transaction([
        prisma.organization.update({
            where: { id: level1Referral.organizationId },
            data: { creditBalance: { increment: level1Commission } },
        }),
        prisma.creditTransaction.create({
            data: {
                organizationId: level1Referral.organizationId,
                amount: level1Commission,
                type: 'COMMISSION',
                description: `Comisión Nivel 1 (${level1Referral.level1Percent}%) — Suscripción de referido`,
            },
        }),
    ]);

    logger.info({
        referrerId: level1Referral.organizationId,
        payingOrgId,
        commission: level1Commission,
        level: 1,
    }, 'Billing: Level 1 referral commission paid');

    // ── Nivel 2: Referidor del referidor ─────────────────────
    if (level1Referral.organization.referredBy) {
        const level2Referral = await prisma.referralCode.findUnique({
            where: { code: level1Referral.organization.referredBy },
        });

        if (level2Referral) {
            const level2Commission = planPrice * (level1Referral.level2Percent / 100);

            await prisma.$transaction([
                prisma.organization.update({
                    where: { id: level2Referral.organizationId },
                    data: { creditBalance: { increment: level2Commission } },
                }),
                prisma.creditTransaction.create({
                    data: {
                        organizationId: level2Referral.organizationId,
                        amount: level2Commission,
                        type: 'COMMISSION',
                        description: `Comisión Nivel 2 (${level1Referral.level2Percent}%) — Suscripción de referido indirecto`,
                    },
                }),
            ]);

            logger.info({
                referrerId: level2Referral.organizationId,
                payingOrgId,
                commission: level2Commission,
                level: 2,
            }, 'Billing: Level 2 referral commission paid');
        }
    }
}
