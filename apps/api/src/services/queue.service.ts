import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/env';
import type { SendMessagePayload, OpenClawConfig } from '@repo/types';

const connection = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });

const whatsappQueue = new Queue('whatsapp-send', { connection });
const agentQueue = new Queue('agent-run', { connection });
const aiResponseQueue = new Queue('ai-response', { connection });

export interface AiResponsePayload {
    instanceName: string;
    to: string;
    userMessage: string;
    organizationId: string;
    industry?: string;
}

export const queueService = {
    sendWhatsApp: (payload: SendMessagePayload) =>
        whatsappQueue.add('send', payload, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
        }),

    runAgent: (config: OpenClawConfig) =>
        agentQueue.add('execute', config, {
            attempts: 1,
        }),

    enqueueAiResponse: (payload: AiResponsePayload) =>
        aiResponseQueue.add('respond', payload, {
            attempts: 2,
            backoff: { type: 'fixed', delay: 3000 },
        }),
};
