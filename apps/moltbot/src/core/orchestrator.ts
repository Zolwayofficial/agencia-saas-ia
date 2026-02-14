/**
 * Orquestador de IA - Decide si responder o llamar a herramientas
 */

import { logger } from '../utils/logger';
import { llm } from './llm';
import { memory } from './memory';

interface MessageInput {
    channel: string;
    conversationId: string;
    message: string;
    sender: any;
    accountId?: string;
    instance?: string;
}

class Orchestrator {
    async processMessage(input: MessageInput): Promise<void> {
        const { channel, conversationId, message, sender } = input;

        logger.info(`Procesando mensaje`, { channel, conversationId });

        try {
            // 1. Recuperar contexto de memoria
            const context = await memory.getContext(conversationId);

            // 2. Generar respuesta con LLM
            const response = await llm.generateResponse({
                message,
                context,
                systemPrompt: this.getSystemPrompt(channel),
            });

            // 3. Guardar en memoria
            await memory.saveMessage(conversationId, {
                role: 'user',
                content: message,
            });
            await memory.saveMessage(conversationId, {
                role: 'assistant',
                content: response,
            });

            // 4. Enviar respuesta (TODO: implementar por canal)
            logger.info(`Respuesta generada`, { channel, response: response.substring(0, 100) });

        } catch (error) {
            logger.error('Error en orquestador:', error);
            throw error;
        }
    }

    private getSystemPrompt(channel: string): string {
        return `Eres un asistente de IA amigable y profesional para MiNuevaLLC.
Respondes preguntas sobre el negocio y ayudas a los clientes.
Canal actual: ${channel}
Responde de forma concisa y útil.`;
    }
}

export const orchestrator = new Orchestrator();
