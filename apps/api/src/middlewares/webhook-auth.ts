import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { AppError } from './error-handler';

export const requireWebhookAuth = (req: Request, res: Response, next: NextFunction) => {
    // Evolution API sends its apikey in the body (not as a header)
    // So we check both headers AND body.apikey
    if (env.EVOLUTION_API_KEY) {
        const apiKeyParam =
            req.headers['apikey'] ||
            req.headers['x-api-key'] ||
            req.headers['api-key'] ||
            req.query.apikey ||
            (req.body as any)?.apikey; // Evolution API includes apikey in webhook body

        if (!apiKeyParam || apiKeyParam !== env.EVOLUTION_API_KEY) {
            return next(new AppError(401, 'UNAUTHORIZED_WEBHOOK', 'Invalid webhook API key'));
        }
    }

    next();
};
