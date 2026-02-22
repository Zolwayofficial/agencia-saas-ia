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
 * Calcula y acredita comisiones de referidos (Nivel 1 único).
 * Pago: 20% al referidor directo.
 */
async function payReferralCommissions(
    payingOrgId: string,
    referralCode: string,
    planPrice: number,
) {
    const referral = await prisma.referralCode.findUnique({
        where: { code: referralCode },
    });

    if (!referral) return;

    const commission = planPrice * (referral.level1Percent / 100);

    await prisma.$transaction([
        prisma.organization.update({
            where: { id: referral.organizationId },
            data: { creditBalance: { increment: commission } },
        }),
        prisma.creditTransaction.create({
            data: {
                organizationId: referral.organizationId,
                amount: commission,
                type: 'COMMISSION',
                description: `Comisión de Referido (${referral.level1Percent}%) — Suscripción de organización apoyada`,
            },
        }),
    ]);

    logger.info({
        referrerId: referral.organizationId,
        payingOrgId,
        commission,
    }, 'Billing: Referral commission paid (Level 1)');
}
