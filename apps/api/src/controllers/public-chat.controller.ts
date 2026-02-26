import { Request, Response } from 'express';
import { prisma } from '@repo/database';
import { logger } from '@repo/logger';

/**
 * Public Chat Controller — No auth required.
 * Powers the landing page chat widget.
 * Uses the default org's Knowledge Base + LLM to respond.
 */

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://ollama:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1';

// Simple in-memory session store (visitor conversations)
const sessions = new Map<string, { messages: Array<{ role: string; content: string }>; lastActive: number }>();

// Clean old sessions every 30 min
setInterval(() => {
    const now = Date.now();
    for (const [id, session] of sessions) {
        if (now - session.lastActive > 30 * 60 * 1000) sessions.delete(id);
    }
}, 30 * 60 * 1000);

async function getKnowledgeContext(orgId: string): Promise<string> {
    const entries = await prisma.knowledgeEntry.findMany({
        where: { organizationId: orgId },
        take: 20,
        orderBy: { updatedAt: 'desc' },
    });
    if (entries.length === 0) return '';
    return entries.map((e: any) => `[${e.category}] ${e.title}: ${e.content}`).join('\n\n');
}

async function callOllama(messages: Array<{ role: string; content: string }>): Promise<string> {
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            messages,
            stream: false,
            options: { temperature: 0.7, num_predict: 500 },
        }),
    });
    if (!res.ok) throw new Error(`Ollama: ${res.status}`);
    const data = await res.json() as any;
    return data.message?.content || 'Lo siento, no pude procesar tu mensaje.';
}

export const publicChatController = {
    async chat(req: Request, res: Response) {
        try {
            const { message, sessionId } = req.body;

            if (!message || typeof message !== 'string' || message.trim().length === 0) {
                return res.status(400).json({ error: 'Message is required' });
            }

            const sid = sessionId || `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

            // Get or create session
            let session = sessions.get(sid);
            if (!session) {
                session = { messages: [], lastActive: Date.now() };
                sessions.set(sid, session);
            }
            session.lastActive = Date.now();

            // Get the default org (FullLogin's own org) for Knowledge Base
            const defaultOrg = await prisma.organization.findFirst({
                where: { slug: 'fulllogin' },
            });

            const orgId = defaultOrg?.id || '';

            // Build system prompt with knowledge
            const knowledge = orgId ? await getKnowledgeContext(orgId) : '';

            const systemPrompt = `Eres el asistente virtual de Full Login, una plataforma de IA multicanal para negocios.

SOBRE FULL LOGIN:
- Plataforma SaaS que automatiza la atención al cliente con IA en WhatsApp, Instagram, TikTok y más de 8 canales.
- Permite a las empresas responder automáticamente 24/7, agendar citas, vender y cobrar.
- Tiene agentes de IA que aprenden del negocio del cliente.
- Planes desde gratuito hasta Enterprise.
- Website: fulllogin.com

${knowledge ? `CONOCIMIENTO ADICIONAL:\n${knowledge}\n` : ''}
INSTRUCCIONES:
- Responde en español, de forma breve y profesional.
- Sé amigable y entusiasta sobre los beneficios de Full Login.
- Si preguntan por precios, invítalos a ver la sección de precios en fulllogin.com o a registrarse para la prueba gratis.
- Si quieren hablar con un humano, diles que pueden escribir a contacto@fulllogin.com o por WhatsApp.
- No inventes información que no tengas.
- Máximo 2-3 oraciones por respuesta.`;

            // Build messages array
            const chatMessages = [
                { role: 'system', content: systemPrompt },
                ...session.messages.slice(-10), // Last 10 messages for context
                { role: 'user', content: message.trim() },
            ];

            const reply = await callOllama(chatMessages);

            // Save to session
            session.messages.push({ role: 'user', content: message.trim() });
            session.messages.push({ role: 'assistant', content: reply });

            // Keep session manageable
            if (session.messages.length > 20) {
                session.messages = session.messages.slice(-14);
            }

            return res.json({
                reply,
                sessionId: sid,
            });
        } catch (error: any) {
            logger.error({ error: error.message }, 'Public chat error');
            return res.status(500).json({
                reply: 'Disculpa, estoy teniendo problemas técnicos. Por favor intenta de nuevo o escríbenos a contacto@fulllogin.com.',
                sessionId: req.body.sessionId || null,
            });
        }
    },
};
