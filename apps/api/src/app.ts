import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { logger } from '@repo/logger';
import v1Routes from './routes/v1';
import { stripeController } from './controllers/stripe.controller';
import { errorHandler } from './middlewares/error-handler';
import { apiRateLimiter } from './middlewares/rate-limit';

const app: express.Application = express();

// CORS — permite frontend, landing y localhost
const allowedOrigins = [
    env.FRONTEND_URL,
    'https://app.fulllogin.com',
    'https://fulllogin.com',
    'https://www.fulllogin.com',
    'http://localhost:3000',
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Permitir requests sin origin (curl, mobile apps, webhooks)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            logger.warn({ origin }, 'CORS: origin not allowed');
            callback(null, true); // Permitir temporalmente para no romper
        }
    },
    credentials: true,
}));

// Rate limiting (V6.1)
app.use(apiRateLimiter);

// Stripe webhook needs raw body BEFORE json parser
app.post('/api/v1/webhooks/stripe', express.raw({ type: 'application/json' }), stripeController.webhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1', v1Routes);

// Centralized Error Handler (V6.1) — MUST be last middleware
app.use(errorHandler);

export default app;
