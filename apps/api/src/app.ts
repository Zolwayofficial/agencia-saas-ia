import express from 'express';
import cors from 'cors';
import { logger } from '@repo/logger';
import v1Routes from './routes/v1';
import { stripeController } from './controllers/stripe.controller';

const app = express();

// Global Middleware
app.use(cors());

// Stripe webhook needs raw body BEFORE json parser
app.post('/api/v1/webhooks/stripe', express.raw({ type: 'application/json' }), stripeController.webhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1', v1Routes);

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error(err, 'Unhandled error');
    res.status(500).json({ error: 'Internal server error' });
});

export default app;
