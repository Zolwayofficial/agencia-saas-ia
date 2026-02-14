/**
 * Cliente de Qdrant para memoria vectorial (RAG)
 */

import axios from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';

interface Message {
    role: string;
    content: string;
}

class MemoryClient {
    private baseUrl: string;
    private conversationCache: Map<string, Message[]>;

    constructor() {
        this.baseUrl = config.qdrantUrl;
        this.conversationCache = new Map();
    }

    async getContext(conversationId: string): Promise<string> {
        // Obtener mensajes previos del cache
        const messages = this.conversationCache.get(conversationId) || [];

        // Formatear como contexto
        return messages
            .slice(-5) // Últimos 5 mensajes
            .map(m => `${m.role}: ${m.content}`)
            .join('\n');
    }

    async saveMessage(conversationId: string, message: Message): Promise<void> {
        const messages = this.conversationCache.get(conversationId) || [];
        messages.push(message);

        // Limitar a últimos 20 mensajes
        if (messages.length > 20) {
            messages.shift();
        }

        this.conversationCache.set(conversationId, messages);

        // TODO: Persistir en Qdrant para RAG avanzado
        logger.debug('Mensaje guardado en memoria', { conversationId });
    }

    async searchSimilar(query: string, limit: number = 5): Promise<string[]> {
        // TODO: Implementar búsqueda vectorial en Qdrant
        return [];
    }
}

export const memory = new MemoryClient();
