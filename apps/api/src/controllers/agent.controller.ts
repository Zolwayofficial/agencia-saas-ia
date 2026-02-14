import { Request, Response } from 'express';
import { prisma } from '@repo/database';
import { logger } from '@repo/logger';
import { queueService } from '../services/queue.service';

export const agentController = {
    /**
     * POST /api/v1/agents/run
     * Crea una tarea de agente y la encola para ejecución en Docker.
     * Protegido por credit-guard (verificación de saldo).
     */
    run: async (req: Request, res: Response) => {
        try {
            const organizationId = (req as any).organizationId;
            const { model, maxSteps, timeout } = req.body;

            if (!model) {
                return res.status(400).json({
                    error: 'MISSING_FIELDS',
                    message: 'Se requiere: model.',
                });
            }

            // Crear registro de tarea en DB + incrementar uso mensual
            const [task] = await prisma.$transaction([
                prisma.agentTask.create({
                    data: {
                        organizationId,
                        model,
                        status: 'PENDING',
                    },
                }),
                prisma.organization.update({
                    where: { id: organizationId },
                    data: { agentRunsUsedThisMonth: { increment: 1 } },
                }),
            ]);

            // Encolar para ejecución en Worker
            const job = await queueService.runAgent({
                taskId: task.id,
                model,
                maxSteps: maxSteps || 10,
                timeout: timeout || 120000,
                organizationId,
            });

            logger.info({ taskId: task.id, jobId: job.id, model }, 'Agent task enqueued');

            res.status(202).json({
                message: 'Agente encolado para ejecución',
                taskId: task.id,
                jobId: job.id,
                status: 'PENDING',
            });
        } catch (error) {
            logger.error(error, 'Error encolando tarea de agente');
            res.status(500).json({ error: 'Error al ejecutar agente' });
        }
    },

    /**
     * GET /api/v1/agents/tasks
     * Lista las tareas de agentes de la organización.
     */
    getTasks: async (req: Request, res: Response) => {
        try {
            const organizationId = (req as any).organizationId;
            const limit = Number(req.query.limit) || 20;

            const tasks = await prisma.agentTask.findMany({
                where: { organizationId },
                orderBy: { createdAt: 'desc' },
                take: limit,
                select: {
                    id: true,
                    model: true,
                    status: true,
                    stepsUsed: true,
                    durationMs: true,
                    createdAt: true,
                    completedAt: true,
                },
            });

            res.json({ tasks, count: tasks.length });
        } catch (error) {
            logger.error(error, 'Error obteniendo tareas');
            res.status(500).json({ error: 'Error al listar tareas' });
        }
    },

    /**
     * GET /api/v1/agents/tasks/:id
     * Detalle de una tarea específica (incluye output).
     */
    getTask: async (req: Request, res: Response) => {
        try {
            const organizationId = (req as any).organizationId;
            const { id } = req.params;

            const task = await prisma.agentTask.findFirst({
                where: { id, organizationId },
            });

            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }

            res.json({ task });
        } catch (error) {
            logger.error(error, 'Error obteniendo detalle de tarea');
            res.status(500).json({ error: 'Error al obtener tarea' });
        }
    },
};
