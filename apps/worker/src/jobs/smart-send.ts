/**
 * SmartSend Job — Anti-Ban WhatsApp Messaging
 * Flujo: Verificar salud → Simular "escribiendo..." → Jitter → Enviar → Cobrar → Registrar
 */

import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '@repo/database';
import { logger } from '@repo/logger';
import { SendMessagePayload } from '@repo/types';
import { evolutionApi } from '../lib/evolution';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Warmup: números nuevos envían más lento (1 msg/min)
const WARMUP_LIMITER = { max: 1, duration: 60_000 };
// Normal: 10 msgs/min por worker
const NORMAL_LIMITER = { max: 10, duration: 60_000 };

export function createSmartSendWorker(connection: IORedis) {
    const worker = new Worker<SendMessagePayload>('whatsapp-send', async (job: Job<SendMessagePayload>) => {
        const { instanceId, to, text, organizationId, priority } = job.data;
        logger.info({ jobId: job.id, to, instanceId }, 'SmartSend: starting');

        // ── [V6.1] Idempotency check ────────────────────────────
        if (job.data.idempotencyKey) {
            const existing = await prisma.sentMessage.findUnique({
                where: { idempotencyKey: job.data.idempotencyKey },
            });
            if (existing) {
                logger.info({ idempotencyKey: job.data.idempotencyKey }, 'SmartSend: duplicate detected, skipping');
                return;
            }
        }

        // ── 1. Verificar salud de la instancia ──────────────────
        const instance = await prisma.whatsappInstance.findUnique({
            where: { id: instanceId },
        });

        if (!instance) {
            throw new Error(`Instance ${instanceId} not found`);
        }

        if (instance.health === 'BANNED') {
            logger.error({ instanceId }, 'SmartSend: instance is BANNED, skipping');
            throw new Error(`Instance ${instanceId} is banned`);
        }

        if (instance.health === 'THROTTLED') {
            logger.warn({ instanceId }, 'SmartSend: instance is THROTTLED, applying extra delay');
            await new Promise((r) => setTimeout(r, 10_000)); // 10s extra
        }

        // ── 2. Simular "escribiendo..." ─────────────────────────
        try {
            await evolutionApi.setPresence(instanceId, 'composing');
        } catch (err) {
            logger.warn({ instanceId, err }, 'SmartSend: failed to set presence (non-fatal)');
        }

        // ── 3. Jitter Anti-Bot (2s a 7s aleatorio) ──────────────
        const jitter = Math.random() * 5_000 + 2_000;
        await new Promise((r) => setTimeout(r, jitter));

        // ── 4. Enviar mensaje via Evolution API ─────────────────
        await evolutionApi.sendText(instanceId, to, text);
        logger.info({ to, instanceId, delay: Math.round(jitter) }, 'SmartSend: message sent');

        // ── 5. Quitar estado "escribiendo" ──────────────────────
        try {
            await evolutionApi.setPresence(instanceId, 'paused');
        } catch {
            // Non-fatal
        }

        // ── 6. Incrementar contador mensual de uso ──────────────
        await prisma.organization.update({
            where: { id: organizationId },
            data: { messagesUsedThisMonth: { increment: 1 } },
        });

        // ── [V6.1] 7. Registrar para idempotencia ───────────────
        await prisma.sentMessage.create({
            data: {
                idempotencyKey: job.data.idempotencyKey || null,
                organizationId,
                instanceId,
                to,
                jobId: job.id,
                status: 'sent',
            },
        });

        // ── 7. Incrementar contador de mensajes de instancia ────
        await prisma.whatsappInstance.update({
            where: { id: instanceId },
            data: { messagesLast24h: { increment: 1 } },
        });

        logger.info({ jobId: job.id, to }, 'SmartSend: complete');
    }, {
        connection,
        concurrency: 3,
        limiter: NORMAL_LIMITER,
    });

    worker.on('failed', async (job, err) => {
        logger.error({ jobId: job?.id, err: err.message }, 'SmartSend: job failed');

        // [V6.1] DLQ: persist permanently failed jobs
        if (job && job.attemptsMade >= 3) {
            try {
                await prisma.failedMessage.create({
                    data: {
                        organizationId: job.data.organizationId,
                        jobId: job.id,
                        payload: job.data as any,
                        error: err.message,
                        attempts: job.attemptsMade,
                    },
                });
                logger.warn({ jobId: job.id }, 'SmartSend: moved to DLQ after max retries');
            } catch (dlqErr) {
                logger.error({ jobId: job.id, dlqErr }, 'SmartSend: failed to save to DLQ');
            }
        }
    });

    return worker;
}
