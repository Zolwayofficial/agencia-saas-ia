// Billing & Plan Types — Modelo Suscripción
export interface PlanTier {
    id: string;
    name: string;
    priceMonthly: number;
    messagesIncluded: number;
    agentRunsIncluded: number; // -1 = ilimitado
    maxInstances: number;
}

export interface SubscriptionUsage {
    messagesUsed: number;
    messagesLimit: number;
    agentRunsUsed: number;
    agentRunsLimit: number;
    billingCycleStart: Date;
}

export interface CreditTransaction {
    id: string;
    organizationId: string;
    amount: number;
    type: 'CHARGE' | 'RECHARGE' | 'COMMISSION' | 'REFUND' | 'SUBSCRIPTION';
    description: string;
    createdAt: Date;
}
