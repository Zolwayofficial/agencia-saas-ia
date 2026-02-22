/**
 * Compliance Job — Sistema de Alertas por Uso de Plan
 * Monitorea el consumo mensual (mensajes + agentes) y alerta cuando se acercan al límite.
 */

import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '@repo/database';
import { logger } from '@repo/logger';

interface CompliancePayload {
    organizationId: string;
}

// Umbrales de alerta (porcentaje de uso del plan)
const ALERT_THRESHOLDS = [
    { percent: 70, level: 'WARNING' as const, message: '⚠️ Has usado el 70% de tus mensajes mensuales.' },
    { percent: 85, level: 'CRITICAL' as const, message: '🚨 Has usado el 85% de tus mensajes. Considera upgradear.' },
    { percent: 95, level: 'EMERGENCY' as const, message: '🔴 Solo te queda 5% de mensajes. Tu servicio se pausará pronto.' },
];

export function createComplianceWorker(connection: IORedis) {
    const worker = new Worker<CompliancePayload>('compliance', async (job: Job<CompliancePayload>) => {
        const { organizationId } = job.data;

        const org = await prisma.organization.findUnique({
            where: { id: organizationId },
            include: { plan: true },
        });

        if (!org || !org.plan) {
            logger.warn({ organizationId }, 'Compliance: org or plan not found');
            return;
        }

        // ── Verificar uso de mensajes ───────────────────────────
        const messagesLimit = org.plan.messagesIncluded;
        const messagesUsed = org.messagesUsedThisMonth;
        const messageUsagePercent = messagesLimit > 0 ? (messagesUsed / messagesLimit) * 100 : 0;

        logger.info({
            organizationId,
            messagesUsed,
            messagesLimit,
            usagePercent: Math.round(messageUsagePercent),
        }, 'Compliance: checking message usage');

        // Evaluar alertas de mensajes
        for (const threshold of ALERT_THRESHOLDS) {
            if (messageUsagePercent >= threshold.percent) {
                logger.warn({
                    organizationId,
                    level: threshold.level,
                    resource: 'messages',
                    usagePercent: Math.round(messageUsagePercent),
                    used: messagesUsed,
                    limit: messagesLimit,
                }, `Compliance: ALERT ${threshold.level} — ${threshold.message}`);

                // ── Enviar notificación real [V6.1] ──────────────────
                try {
                    const admin = await prisma.user.findFirst({
                        where: { organizationId, role: 'ADMIN' },
                    });

                    if (admin?.email) {
                        const { emailService } = await import('@repo/email');
                        await emailService.sendUsageAlert(admin.email, threshold.percent, 'mensajes WhatsApp');
                        logger.info({ organizationId, email: admin.email }, 'Compliance: email alert sent');
                    }
                } catch (emailErr) {
                    logger.error({ organizationId, emailErr }, 'Compliance: failed to send email alert');
                }
            }
        }

        // ── Verificar uso de agentes IA ─────────────────────────
        if (org.plan.agentRunsIncluded !== -1) {
            const agentLimit = org.plan.agentRunsIncluded;
            const agentUsed = org.agentRunsUsedThisMonth;
            const agentUsagePercent = agentLimit > 0 ? (agentUsed / agentLimit) * 100 : 0;

            if (agentUsagePercent >= 85) {
                logger.warn({
                    organizationId,
                    resource: 'agent_runs',
                    used: agentUsed,
                    limit: agentLimit,
                    usagePercent: Math.round(agentUsagePercent),
                }, 'Compliance: agent run usage above 85%');
            }
        }

        // ── Si alcanzó 100% de mensajes, throttle instancias ────
        if (messagesUsed >= messagesLimit) {
            await prisma.whatsappInstance.updateMany({
                where: { organizationId, health: { not: 'BANNED' } },
                data: { health: 'THROTTLED' },
            });
            logger.error({ organizationId }, 'Compliance: message limit reached — instances THROTTLED');
        }
    }, { connection });

    worker.on('failed', (job, err) => {
        logger.error({ jobId: job?.id, err: err.message }, 'Compliance: job failed');
    });

    return worker;
}
