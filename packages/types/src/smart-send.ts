export interface SendMessagePayload {
    idempotencyKey?: string;
    instanceId: string;
    to: string;
    text: string;
    organizationId: string;
    priority: 'high' | 'normal' | 'low';
}

export type InstanceHealth = 'WARMUP' | 'ACTIVE' | 'THROTTLED' | 'BANNED';

export interface WhatsAppInstance {
    id: string;
    phoneNumber: string;
    health: InstanceHealth;
    organizationId: string;
    messagesLast24h: number;
    isNew: boolean;
}
