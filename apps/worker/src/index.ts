/**
 * Worker Entry Point — "El Músculo"
 * Inicializa todos los BullMQ workers y gestiona su ciclo de vida.
 *
 * Workers activos:
 *   1. whatsapp-send  → SmartSend (Anti-Ban messaging)
 *   2. agent-run      → OpenClaw Agent Runner (Docker containers)
 *   3. billing        → Recarga de créditos y resets mensuales
 *   4. compliance     → Alertas 70/85/95% de uso
 *   5. ai-response    → Auto-respuesta IA para WhatsApp
 */

import IORedis from 'ioredis';
import { Worker } from 'bullmq';
import { prisma } from '@repo/database';
import { logger } from '@repo/logger';
import { createSmartSendWorker } from './jobs/smart-send';
import { createAgentWorker } from './jobs/agent-run';
import { createBillingWorker } from './jobs/billing';
import { createComplianceWorker } from './jobs/compliance';
import { processAiResponse } from './jobs/ai-response';
import { mcpClient } from './lib/mcp';

// ─── Redis Connection ─────────────────────────────────────────
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

connection.on('connect', () => logger.info('Redis: connected'));
connection.on('error', (err) => logger.error({ err }, 'Redis: connection error'));

// ─── Initialize Workers ───────────────────────────────────────
const smartSendWorker = createSmartSendWorker(connection);
const agentWorker = createAgentWorker(connection);
const billingWorker = createBillingWorker(connection);
const complianceWorker = createComplianceWorker(connection);

const aiResponseWorker = new Worker(
    'ai-response',
    async (job) => {
        await processAiResponse(job.data);
    },
    {
        connection,
        concurrency: 3,
        limiter: { max: 10, duration: 60000 }, // Max 10 responses/min
    }
);
aiResponseWorker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'AI response job failed');
});

logger.info('⚙️  Workers started: [whatsapp-send, agent-run, billing, compliance, ai-response]');

// ─── Graceful Shutdown ────────────────────────────────────────
async function shutdown() {
    logger.info('Shutting down workers...');
    await Promise.all([
        smartSendWorker.close(),
        agentWorker.close(),
        billingWorker.close(),
        complianceWorker.close(),
        aiResponseWorker.close(),
    ]);
    await mcpClient.disconnectAll();
    await prisma.$disconnect();
    await connection.quit();
    logger.info('All workers stopped. Goodbye.');
    process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
