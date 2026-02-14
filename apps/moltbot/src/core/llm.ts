/**
 * Cliente de LiteLLM para llamadas a modelos de IA
 */

import axios from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';

interface GenerateParams {
    message: string;
    context?: string;
    systemPrompt?: string;
    model?: string;
}

class LLMClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = config.litellmUrl;
    }

    async generateResponse(params: GenerateParams): Promise<string> {
        const { message, context = '', systemPrompt = '', model = 'gpt-3.5-turbo' } = params;

        try {
            const messages = [
                { role: 'system', content: systemPrompt },
            ];

            if (context) {
                messages.push({ role: 'system', content: `Contexto previo:\n${context}` });
            }

            messages.push({ role: 'user', content: message });

            const response = await axios.post(`${this.baseUrl}/chat/completions`, {
                model,
                messages,
                temperature: 0.7,
                max_tokens: 500,
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            logger.error('Error llamando a LiteLLM:', error);
            throw error;
        }
    }
}

export const llm = new LLMClient();
