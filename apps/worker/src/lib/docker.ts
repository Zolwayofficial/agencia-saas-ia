/**
 * Docker Client (Dockerode wrapper)
 * Crea y destruye contenedores efímeros para agentes OpenClaw.
 * Cada agente corre aislado: sin red, con límite de RAM, y se auto-destruye.
 */

import Docker from 'dockerode';
import { logger } from '@repo/logger';

const docker = new Docker();

const AGENT_IMAGE = process.env.OPENCLAW_IMAGE || 'openclaw-runner:latest';
const AGENT_MEMORY_MB = parseInt(process.env.AGENT_MEMORY_MB || '512', 10);
const AGENT_NETWORK = process.env.AGENT_NETWORK || 'none';

export interface AgentContainerResult {
    statusCode: number;
    logs: string;
    durationMs: number;
}

export const dockerClient = {
    /**
     * Ejecuta un agente en un contenedor Docker efímero (jaula aislada).
     * - Sin acceso a red (NetworkMode: 'none')
     * - Límite de memoria configurable
     * - Se auto-destruye al terminar (AutoRemove: true)
     */
    async runAgent(taskId: string, model: string, maxSteps: number, timeout: number): Promise<AgentContainerResult> {
        const startTime = Date.now();

        logger.info({ taskId, model, maxSteps, image: AGENT_IMAGE }, 'Docker: creating ephemeral container');

        const container = await docker.createContainer({
            Image: AGENT_IMAGE,
            Cmd: ['python', 'main.py', '--task', taskId, '--model', model, '--max-steps', String(maxSteps)],
            HostConfig: {
                Memory: AGENT_MEMORY_MB * 1024 * 1024,
                NetworkMode: AGENT_NETWORK,
                AutoRemove: true,
            },
            Labels: {
                'saas.agent.task': taskId,
                'saas.agent.model': model,
            },
        });

        await container.start();
        logger.info({ taskId, containerId: container.id }, 'Docker: container started');

        // Esperar a que termine, con timeout de seguridad
        const waitPromise = container.wait();
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Agent timeout after ${timeout}ms`)), timeout)
        );

        let statusCode: number;
        let logs = '';

        try {
            const result = await Promise.race([waitPromise, timeoutPromise]);
            statusCode = result.StatusCode;

            // Capturar logs antes de que AutoRemove destruya el contenedor
            try {
                const logStream = await container.logs({ stdout: true, stderr: true, follow: false });
                logs = logStream.toString().slice(0, 5000); // Limitar a 5KB
            } catch {
                logs = '(logs unavailable - container already removed)';
            }
        } catch (err) {
            // Timeout: intentar matar el contenedor
            logger.warn({ taskId }, 'Docker: agent timed out, killing container');
            try {
                await container.kill();
            } catch {
                // Container may already be removed
            }
            statusCode = -1;
            logs = `Agent killed: timeout after ${timeout}ms`;
        }

        const durationMs = Date.now() - startTime;
        logger.info({ taskId, statusCode, durationMs }, 'Docker: container finished');

        return { statusCode, logs, durationMs };
    },
};
