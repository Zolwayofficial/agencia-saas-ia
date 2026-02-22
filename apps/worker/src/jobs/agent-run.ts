/**
 * Agent Runner Job — Ejecuta agentes OpenClaw en contenedores Docker aislados
 * Flujo: Marcar RUNNING → Ejecutar Contenedor → Parsear Pasos → Cobrar → Actualizar DB
 */

import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '@repo/database';
import { logger } from '@repo/logger';
import { OpenClawConfig } from '@repo/types';
import { dockerClient } from '../lib/docker';
import { TwentyClient } from '../lib/twenty';

export function createAgentWorker(connection: IORedis) {
    const worker = new Worker<OpenClawConfig>('agent-run', async (job: Job<OpenClawConfig>) => {
        const { taskId, model, maxSteps, timeout, organizationId, reservationId } = job.data as any;
        logger.info({ jobId: job.id, taskId, model }, 'Agent: starting execution');

        // ── 1. Marcar tarea como RUNNING ────────────────────────
        await prisma.agentTask.update({
            where: { id: taskId },
            data: { status: 'RUNNING' },
        });

        try {
            // ── 2. Ejecutar agente en jaula Docker ──────────────────
            const mcpUrl = process.env.MCP_SERVER_URL || "http://postgres-mcp:3000/sse";
            const twentyUrl = process.env.TWENTY_SERVER_URL || "http://twenty-server:3000";
            const twentyKey = process.env.TWENTY_API_KEY || "";

            const containerResult = await dockerClient.runAgent(taskId, model, maxSteps, timeout, {
                mcpServerUrl: mcpUrl,
                envVars: {
                    TWENTY_SERVER_URL: twentyUrl,
                    TWENTY_API_KEY: twentyKey
                }
            });

            // ── 3. Parsear pasos desde los logs ─────────────────────
            const logContent = containerResult.logs || '';
            const stepMatches = logContent.match(/Step\s*(\d+)/gi);
            const stepsUsed = stepMatches
                ? Math.max(...stepMatches.map(m => parseInt(m.replace(/\D/g, ''))))
                : 1;

            // ── 4. Calcular Costos [V6.1] ───────────────────────────
            const costPerStep = Number(process.env.COST_PER_AGENT_STEP || 0.1);
            const totalCost = stepsUsed * costPerStep;

            // ── 5. Actualizar DB y Cobrar ───────────────────────────
            await prisma.$transaction([
                prisma.agentTask.update({
                    where: { id: taskId },
                    data: {
                        status: containerResult.statusCode === 0 ? 'SUCCESS' :
                            containerResult.statusCode === -1 ? 'TIMEOUT' : 'ERROR',
                        output: logContent.slice(0, 50000),
                        stepsUsed,
                        durationMs: containerResult.durationMs,
                        completedAt: new Date(),
                    },
                }),
                prisma.organization.update({
                    where: { id: organizationId },
                    data: { creditBalance: { decrement: totalCost } },
                }),
                prisma.creditTransaction.create({
                    data: {
                        organizationId,
                        amount: -totalCost,
                        type: 'USAGE',
                        description: `Agente IA: ${stepsUsed} pasos (${model})`,
                    },
                }),
                ...(reservationId ? [
                    prisma.creditReservation.update({
                        where: { id: reservationId },
                        data: { status: 'CONFIRMED' }
                    })
                ] : [])
            ]);

            logger.info({ taskId, totalCost, stepsUsed }, 'AgentRun: complete');

            return { status: 'success', stepsUsed, durationMs: containerResult.durationMs };

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            logger.error({ taskId, err: errorMessage }, 'AgentRun: critical failure');

            await prisma.$transaction([
                prisma.agentTask.update({
                    where: { id: taskId },
                    data: {
                        status: 'ERROR',
                        output: `Internal Error: ${errorMessage}`,
                        completedAt: new Date(),
                    },
                }),
                ...(reservationId ? [
                    prisma.creditReservation.update({
                        where: { id: reservationId },
                        data: { status: 'FAILED' }
                    })
                ] : [])
            ]);

            throw err;
        }
    }, {
        connection,
        concurrency: 2,
    });

    worker.on('failed', (job, err) => {
        logger.error({ jobId: job?.id, err: err.message }, 'Agent Worker: job failed permanently');
    });

    return worker;
}
