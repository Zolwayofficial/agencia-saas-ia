import { z } from 'zod';

export const SendMessageSchema = z.object({
    instanceId: z.string().min(1, 'instanceId es requerido'),
    to: z.string().regex(/^\d{10,15}$/, 'Formato de teléfono inválido (10-15 dígitos)'),
    text: z.string().min(1, 'El mensaje no puede estar vacío').max(4096, 'Máximo 4096 caracteres'),
    priority: z.enum(['high', 'normal', 'low']).default('normal'),
    idempotencyKey: z.string().uuid('Debe ser un UUID válido').optional(),
});

export type SendMessageDTO = z.infer<typeof SendMessageSchema>;

export const CreateInstanceSchema = z.object({
    displayName: z.string().min(1).max(100).optional(),
});

export type CreateInstanceDTO = z.infer<typeof CreateInstanceSchema>;
