import { z } from 'zod';

export const RunAgentSchema = z.object({
    model: z.string().min(1, 'model es requerido'),
    maxSteps: z.number().int().min(1).max(100).default(10),
    timeout: z.number().int().min(5000).max(300000).default(120000),
    idempotencyKey: z.string().uuid('Debe ser un UUID válido').optional(),
});

export type RunAgentDTO = z.infer<typeof RunAgentSchema>;
