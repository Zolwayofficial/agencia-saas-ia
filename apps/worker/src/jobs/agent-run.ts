/**
 * Agent Runner Job — Ejecuta agentes OpenClaw en contenedores Docker aislados
 * Flujo: Marcar RUNNING → Crear jaula Docker → Esperar resultado → Actualizar DB
 */

import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '@repo/database';
import { logger } from '@repo/logger';
import { OpenClawConfig, TaskResult } from '@repo/types';
import { dockerClient } from '../lib/docker';

const COST_PER_AGENT_RUN = parseFloat(process.env.COST_PER_AGENT_RUN || '0.50');

export function createAgentWorker(connection: IORedis) {
    const worker = new Worker<OpenClawConfig>('agent-run', async (job: Job<OpenClawConfig>) => {
        const { taskId, model, maxSteps, timeout, organizationId } = job.data;
        logger.info({ jobId: job.id, taskId, model }, 'Agent: starting execution');

        // ── 1. Marcar tarea como RUNNING ────────────────────────
        await prisma.agentTask.update({
            where: { id: taskId },
            data: { status: 'RUNNING' },
        });

        // ── 2. Ejecutar agente en jaula Docker ──────────────────
        let result: TaskResult;
        try {
            const containerResult = await dockerClient.runAgent(taskId, model, maxSteps, timeout);

            if (containerResult.statusCode === 0) {
                result = {
                    status: 'success',
                    output: containerResult.logs,
                    stepsUsed: maxSteps, // TODO: Parse from agent output
                    durationMs: containerResult.durationMs,
                };
            } else if (containerResult.statusCode === -1) {
                result = {
                    status: 'timeout',
                    output: containerResult.logs,
                    stepsUsed: 0,
                    durationMs: containerResult.durationMs,
                };
            } else {
                result = {
                    status: 'error',
                    output: containerResult.logs,
                    stepsUsed: 0,
                    durationMs: containerResult.durationMs,
                };
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            logger.error({ taskId, err: errorMessage }, 'Agent: container execution failed');
            result = {
                status: 'error',
                output: errorMessage,
                stepsUsed: 0,
                durationMs: 0,
            };
        }

        // ── 3. Actualizar resultado en DB ───────────────────────
        await prisma.agentTask.update({
            where: { id: taskId },
            data: {
                status: result.status === 'success' ? 'SUCCESS' : result.status === 'timeout' ? 'TIMEOUT' : 'ERROR',
                output: result.output.slice(0, 10_000), // Limitar a 10KB
                stepsUsed: result.stepsUsed,
                durationMs: result.durationMs,
                completedAt: new Date(),
            },
        });

        // ── 4. Cobrar por la ejecución ──────────────────────────
        await prisma.$transaction([
            prisma.organization.update({
                where: { id: organizationId },
                data: { creditBalance: { decrement: COST_PER_AGENT_RUN } },
            }),
            prisma.creditTransaction.create({
                data: {
                    organizationId,
                    amount: -COST_PER_AGENT_RUN,
                    type: 'CHARGE',
                    description: `Agent run: ${model} (${result.status})`,
                },
            }),
        ]);

        logger.info({ taskId, status: result.status, durationMs: result.durationMs }, 'Agent: execution complete');

        return result;
    }, {
        connection,
        concurrency: 2, // Máximo 2 agentes simultáneos (proteger RAM)
    });

    worker.on('failed', (job, err) => {
        logger.error({ jobId: job?.id, err: err.message }, 'Agent: job failed');
    });

    return worker;
}
