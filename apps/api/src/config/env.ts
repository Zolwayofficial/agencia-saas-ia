import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3001),
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().default('redis://localhost:6379'),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    EVOLUTION_API_URL: z.string().default('http://localhost:8080'),
    EVOLUTION_API_KEY: z.string().optional(),
    API_BASE_URL: z.string().default('http://localhost:3001'),
    // Stripe
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    FRONTEND_URL: z.string().default('http://localhost:3000'),
    // Email
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().default('FullLogin <noreply@fulllogin.com>'),
});

export const env = envSchema.parse(process.env);
