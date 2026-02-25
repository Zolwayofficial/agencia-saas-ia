/**
 * Agent Runner Job — Worker-orchestrated AI agent with MCP tools
 *
 * Architecture (V6.2):
 *   Worker orquesta el loop del agente directamente:
 *   1. Obtiene herramientas MCP del gateway
 *   2. Loop: LLM genera respuesta → tool calls → ejecutar via MCP → repetir
 *   3. Cobra creditos basado en steps usados
 *
 * Los contenedores Docker quedan reservados para sandboxed code execution.
 */

import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '@repo/database';
import { logger } from '@repo/logger';
import { OpenClawConfig } from '@repo/types';
import { mcpClient, McpTool } from '../lib/mcp';
import { llmClient, ChatMessage } from '../lib/llm';

const COST_PER_STEP = Number(process.env.COST_PER_AGENT_STEP || 0.1);

const AGENT_SYSTEM_PROMPT = `Eres un agente IA autónomo para una plataforma SaaS. Tienes acceso a herramientas para:
- Consultar la base de datos (solo lectura)
- Gestionar contactos y oportunidades en el CRM
- Analizar datos de la organización

Instrucciones:
- Usa las herramientas disponibles para cumplir la tarea del usuario
- Sé conciso y eficiente — minimiza pasos innecesarios
- Siempre responde en español
- Si no puedes completar una tarea, explica por qué
- Cuando termines, responde con tu resultado final sin llamar más herramientas`;

/**
 * Convert MCP tools to OpenAI function-calling format for the LLM.
 */
function mcpToolsToLlmFormat(tools: McpTool[]): any[] {
    return tools.map(t => ({
        type: 'function',
        function: {
            name: t.name,
            description: t.description || '',
            parameters: t.inputSchema || { type: 'object', properties: {} },
        },
    }));
}

export function createAgentWorker(connection: IORedis) {
    const worker = new Worker<OpenClawConfig>('agent-run', async (job: Job<OpenClawConfig>) => {
        const { taskId, model, maxSteps, timeout, organizationId, reservationId } = job.data as any;
        const startTime = Date.now();

        logger.info({ jobId: job.id, taskId, model, maxSteps }, 'Agent: starting orchestrated execution');

        // ── 1. Marcar tarea como RUNNING ────────────────────────
        const task = await prisma.agentTask.update({
            where: { id: taskId },
            data: { status: 'RUNNING' },
        });

        try {
            // ── 2. Obtener herramientas MCP ──────────────────────────
            const mcpTools = await mcpClient.getAvailableTools(organizationId);
            const llmTools = mcpToolsToLlmFormat(mcpTools);

            logger.info({ taskId, toolCount: mcpTools.length, tools: mcpTools.map(t => t.name) }, 'Agent: MCP tools loaded');

            // ── 3. Construir mensajes iniciales ──────────────────────
            const taskPrompt = (task as any).prompt || `Ejecuta la tarea del agente ${taskId} usando las herramientas disponibles.`;

            const messages: ChatMessage[] = [
                { role: 'system', content: AGENT_SYSTEM_PROMPT },
                { role: 'user', content: taskPrompt },
            ];

            // ── 4. Agent Loop: LLM + Tool Calls ─────────────────────
            let stepsUsed = 0;
            let finalOutput = '';
            const maxStepsLimit = maxSteps || 10;
            const timeoutMs = timeout || 120_000;

            while (stepsUsed < maxStepsLimit) {
                // Check timeout
                if (Date.now() - startTime > timeoutMs) {
                    finalOutput = `[TIMEOUT] Agente excedió el tiempo límite de ${timeoutMs / 1000}s después de ${stepsUsed} pasos.`;
                    logger.warn({ taskId, stepsUsed }, 'Agent: timeout reached');
                    break;
                }

                // Call LLM with tools
                const llmResult = await llmClient.chatWithTools(messages, llmTools, {
                    model,
                    temperature: 0.3,
                    maxTokens: 2000,
                });

                stepsUsed++;

                // If no tool calls, agent is done
                if (!llmResult.toolCalls || llmResult.toolCalls.length === 0) {
                    finalOutput = llmResult.content;
                    logger.info({ taskId, stepsUsed }, 'Agent: finished (no more tool calls)');
                    break;
                }

                // Add assistant message with tool calls to context
                messages.push({
                    role: 'assistant',
                    content: llmResult.content || '',
                });

                // Execute each tool call via MCP
                for (const toolCall of llmResult.toolCalls) {
                    logger.info({ taskId, tool: toolCall.name, step: stepsUsed }, 'Agent: executing tool');

                    const toolResult = await mcpClient.executeTool(
                        organizationId,
                        toolCall.name,
                        toolCall.arguments,
                    );

                    const resultText = toolResult.content
                        .map(c => c.text)
                        .join('\n');

                    // Add tool result to conversation
                    messages.push({
                        role: 'tool',
                        content: resultText,
                        tool_call_id: toolCall.id,
                    });
                }
            }

            // If we hit max steps without finishing
            if (!finalOutput && stepsUsed >= maxStepsLimit) {
                finalOutput = `[MAX_STEPS] Agente alcanzó el máximo de ${maxStepsLimit} pasos. Último contexto disponible en los logs.`;
            }

            // ── 5. Calcular costos y actualizar DB ───────────────────
            const durationMs = Date.now() - startTime;
            const totalCost = stepsUsed * COST_PER_STEP;
            const timedOut = durationMs > timeoutMs;

            await prisma.$transaction([
                prisma.agentTask.update({
                    where: { id: taskId },
                    data: {
                        status: timedOut ? 'TIMEOUT' : 'SUCCESS',
                        output: finalOutput.slice(0, 50000),
                        stepsUsed,
                        durationMs,
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
                        type: 'CHARGE',
                        description: `Agente IA: ${stepsUsed} pasos (${model})`,
                    },
                }),
                ...(reservationId ? [
                    prisma.creditReservation.update({
                        where: { id: reservationId },
                        data: { status: 'CONFIRMED' },
                    }),
                ] : []),
            ]);

            logger.info({ taskId, totalCost, stepsUsed, durationMs }, 'AgentRun: complete');

            // Clean up MCP client for this org
            await mcpClient.disconnect(organizationId);

            return { status: 'success', stepsUsed, durationMs };

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
                        data: { status: 'FAILED' },
                    }),
                ] : []),
            ]);

            await mcpClient.disconnect(organizationId);
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
