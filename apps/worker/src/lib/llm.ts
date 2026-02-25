/**
 * LLM Client — Comunicación con modelos de lenguaje
 * Soporta Ollama (local) y LiteLLM proxy (multi-modelo).
 * En producción usa LiteLLM que rutea a GPT-4, Claude, Llama, etc.
 */

const LLM_URL = process.env.LLM_API_URL || 'http://localhost:11434';
const LLM_API_KEY = process.env.LLM_API_KEY || '';
const LLM_MODEL = process.env.LLM_MODEL || 'llama3.1';

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    tool_call_id?: string;
}

interface ChatCompletionResponse {
    content: string;
    model: string;
    tokensUsed: number;
}

export interface ToolCall {
    id: string;
    name: string;
    arguments: Record<string, any>;
}

export interface ToolCallResponse {
    content: string;
    toolCalls?: ToolCall[];
    model: string;
    tokensUsed: number;
}

// ── Industry-specific system prompts ──────────────────────

const INDUSTRY_PROMPTS: Record<string, string> = {
    restaurantes: `Eres un asistente virtual de un restaurante. Ayudas con:
- Reservas: preguntas fecha, hora, número de personas
- Menú: describes platillos, precios, ingredientes, alérgenos
- Pedidos: tomas pedidos para delivery o takeout
- Horarios: informas horarios de apertura
Sé amable, conciso y profesional. Responde en español.`,

    ecommerce: `Eres un asistente de atención al cliente de una tienda online. Ayudas con:
- Estado de pedidos: rastreo y tiempos de entrega
- Devoluciones: proceso y políticas
- Productos: disponibilidad, tallas, colores
- Pagos: métodos aceptados y problemas
Sé útil, claro y resolutivo. Responde en español.`,

    agencias: `Eres un asistente virtual de una agencia de servicios profesionales. Ayudas con:
- Cotizaciones: recopilas requerimientos del cliente
- Servicios: explicas los servicios disponibles
- Agenda: programar reuniones y seguimientos
- Proyectos: informas estado de proyectos activos
Sé profesional y conciso. Responde en español.`,

    salud: `Eres un asistente virtual de una clínica o consultorio médico. Ayudas con:
- Citas: agendar, reagendar o cancelar consultas
- Horarios: informas disponibilidad de doctores
- Recordatorios: confirmar citas próximas
- Información general: ubicación, servicios, seguros aceptados
IMPORTANTE: No proveas diagnósticos ni consejos médicos. Siempre recomienda consultar al médico.
Sé empático y profesional. Responde en español.`,

    educacion: `Eres un asistente virtual de una institución educativa. Ayudas con:
- Inscripciones: proceso, requisitos, fechas
- Cursos: horarios, profesores, planes de estudio
- Pagos: colegiaturas, becas, planes de pago
- Información general: campus, contacto, eventos
Sé claro y paciente. Responde en español.`,

    inmobiliarias: `Eres un asistente virtual de una inmobiliaria. Ayudas con:
- Propiedades: descripciones, precios, ubicación, fotos
- Visitas: agendar recorridos de propiedades
- Requisitos: documentos para renta o compra
- Financiamiento: opciones de crédito y enganche
Sé profesional y detallado. Responde en español.`,

    belleza: `Eres un asistente virtual de un salón de belleza o spa. Ayudas con:
- Citas: agendar servicios, verificar disponibilidad
- Servicios: descripciones, precios, duración
- Promociones: ofertas y paquetes especiales
- Recordatorios: confirmar próximas citas
Sé amigable y atento/a. Responde en español.`,

    default: `Eres un asistente virtual inteligente para un negocio. Ayudas a responder consultas de clientes de forma profesional, amable y concisa. Responde siempre en español. Si no sabes algo, sugiere al cliente contactar directamente al negocio.`,
};

export function getSystemPrompt(industry?: string): string {
    return INDUSTRY_PROMPTS[industry || 'default'] || INDUSTRY_PROMPTS.default;
}

// ── LLM API Client ──────────────────────────────────────

export const llmClient = {
    /**
     * Chat completion — compatible con OpenAI API format.
     * Funciona con Ollama (/api/chat), LiteLLM (/chat/completions), y OpenAI.
     */
    async chat(messages: ChatMessage[], options?: {
        model?: string;
        temperature?: number;
        maxTokens?: number;
    }): Promise<ChatCompletionResponse> {
        const model = options?.model || LLM_MODEL;
        const isOllama = LLM_URL.includes('11434');

        if (isOllama) {
            return this.chatOllama(messages, model, options);
        } else {
            return this.chatOpenAI(messages, model, options);
        }
    },

    /**
     * Ollama-native format (/api/chat)
     */
    async chatOllama(messages: ChatMessage[], model: string, options?: any): Promise<ChatCompletionResponse> {
        const res = await fetch(`${LLM_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model,
                messages,
                stream: false,
                options: {
                    temperature: options?.temperature ?? 0.7,
                    num_predict: options?.maxTokens ?? 300,
                },
            }),
        });

        if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
        const data = await res.json() as any;

        return {
            content: data.message?.content || '',
            model: data.model || model,
            tokensUsed: (data.eval_count || 0) + (data.prompt_eval_count || 0),
        };
    },

    /**
     * OpenAI-compatible format (/v1/chat/completions)
     * Works with LiteLLM, OpenAI, Azure, etc.
     */
    async chatOpenAI(messages: ChatMessage[], model: string, options?: any): Promise<ChatCompletionResponse> {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (LLM_API_KEY) headers['Authorization'] = `Bearer ${LLM_API_KEY}`;

        const res = await fetch(`${LLM_URL}/v1/chat/completions`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model,
                messages,
                temperature: options?.temperature ?? 0.7,
                max_tokens: options?.maxTokens ?? 300,
            }),
        });

        if (!res.ok) throw new Error(`LLM API error: ${res.status}`);
        const data = await res.json() as any;

        const choice = data.choices?.[0];
        return {
            content: choice?.message?.content || '',
            model: data.model || model,
            tokensUsed: data.usage?.total_tokens || 0,
        };
    },

    /**
     * Simple one-shot response for WhatsApp messages.
     */
    async respond(userMessage: string, industry?: string): Promise<string> {
        const systemPrompt = getSystemPrompt(industry);

        const result = await this.chat([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
        ]);

        return result.content.trim();
    },

    /**
     * Chat completion with tool/function calling support.
     * Compatible with Ollama (/api/chat) and OpenAI format (/v1/chat/completions).
     * MCP tools are passed as OpenAI-style function definitions.
     */
    async chatWithTools(messages: ChatMessage[], tools: any[], options?: {
        model?: string;
        temperature?: number;
        maxTokens?: number;
    }): Promise<ToolCallResponse> {
        const model = options?.model || LLM_MODEL;
        const isOllama = LLM_URL.includes('11434');

        if (isOllama) {
            return this.chatOllamaWithTools(messages, tools, model, options);
        } else {
            return this.chatOpenAIWithTools(messages, tools, model, options);
        }
    },

    /**
     * Ollama with tool calling (/api/chat with tools parameter)
     */
    async chatOllamaWithTools(messages: ChatMessage[], tools: any[], model: string, options?: any): Promise<ToolCallResponse> {
        const res = await fetch(`${LLM_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model,
                messages,
                tools,
                stream: false,
                options: {
                    temperature: options?.temperature ?? 0.3,
                    num_predict: options?.maxTokens ?? 2000,
                },
            }),
        });

        if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
        const data = await res.json() as any;

        const message = data.message || {};
        const toolCalls: ToolCall[] = (message.tool_calls || []).map((tc: any, i: number) => ({
            id: `call_${i}_${Date.now()}`,
            name: tc.function?.name || tc.name,
            arguments: tc.function?.arguments || tc.arguments || {},
        }));

        return {
            content: message.content || '',
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
            model: data.model || model,
            tokensUsed: (data.eval_count || 0) + (data.prompt_eval_count || 0),
        };
    },

    /**
     * OpenAI-compatible with tool calling (/v1/chat/completions with tools)
     */
    async chatOpenAIWithTools(messages: ChatMessage[], tools: any[], model: string, options?: any): Promise<ToolCallResponse> {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (LLM_API_KEY) headers['Authorization'] = `Bearer ${LLM_API_KEY}`;

        const res = await fetch(`${LLM_URL}/v1/chat/completions`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model,
                messages,
                tools,
                tool_choice: 'auto',
                temperature: options?.temperature ?? 0.3,
                max_tokens: options?.maxTokens ?? 2000,
            }),
        });

        if (!res.ok) throw new Error(`LLM API error: ${res.status}`);
        const data = await res.json() as any;

        const choice = data.choices?.[0];
        const message = choice?.message || {};
        const toolCalls: ToolCall[] = (message.tool_calls || []).map((tc: any) => ({
            id: tc.id || `call_${Date.now()}`,
            name: tc.function?.name,
            arguments: typeof tc.function?.arguments === 'string'
                ? JSON.parse(tc.function.arguments)
                : tc.function?.arguments || {},
        }));

        return {
            content: message.content || '',
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
            model: data.model || model,
            tokensUsed: data.usage?.total_tokens || 0,
        };
    },
};
