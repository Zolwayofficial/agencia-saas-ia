/**
 * AI Response Job
 * Procesa mensajes entrantes de WhatsApp y genera respuestas automáticas con IA.
 * Flow: Incoming msg → LLM → SmartSend reply
 */

import { logger } from '@repo/logger';
import { llmClient } from '../lib/llm';
import { evolutionApi } from '../lib/evolution';

interface AiResponsePayload {
    instanceName: string;
    to: string;              // remoteJid (número del usuario)
    userMessage: string;
    organizationId: string;
    industry?: string;
}

export async function processAiResponse(payload: AiResponsePayload): Promise<void> {
    const { instanceName, to, userMessage, organizationId, industry } = payload;

    logger.info({ instanceName, to, msgPreview: userMessage.substring(0, 60) }, 'Processing AI response');

    try {
        // ── 1. Show "typing" indicator ──────────────────────
        await evolutionApi.setPresence(instanceName, 'composing');

        // ── 2. Generate AI response ─────────────────────────
        const aiResponse = await llmClient.respond(userMessage, industry);

        if (!aiResponse) {
            logger.warn({ to }, 'LLM returned empty response, skipping');
            await evolutionApi.setPresence(instanceName, 'paused');
            return;
        }

        // ── 3. Simulate human typing delay ──────────────────
        // ~50ms per character, but cap between 1s and 8s
        const typingDelay = Math.min(Math.max(aiResponse.length * 50, 1000), 8000);
        await sleep(typingDelay);

        // ── 4. Send reply via Evolution API ─────────────────
        const cleanNumber = to.replace('@s.whatsapp.net', '').replace('@g.us', '');
        await evolutionApi.sendText(instanceName, cleanNumber, aiResponse);

        logger.info({
            to: cleanNumber,
            responseLength: aiResponse.length,
            org: organizationId,
        }, 'AI response sent');

        // ── 5. Stop typing indicator ────────────────────────
        await evolutionApi.setPresence(instanceName, 'paused');

    } catch (error) {
        logger.error({ error, to, instanceName }, 'Error processing AI response');
        // Don't throw — we don't want the job to retry and spam the user
        try {
            await evolutionApi.setPresence(instanceName, 'paused');
        } catch { /* ignore */ }
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
