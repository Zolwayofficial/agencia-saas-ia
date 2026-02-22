import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { AppError } from './error-handler';

export const requireWebhookAuth = (req: Request, res: Response, next: NextFunction) => {
    // Si hay una API key global configurada, la requerimos
    // Evolution API manda un header apikey o apiKey
    if (env.EVOLUTION_API_KEY) {
        const apiKeyParam = req.headers['apikey'] || req.headers['x-api-key'] || req.headers['api-key'] || req.query.apikey;

        if (!apiKeyParam || apiKeyParam !== env.EVOLUTION_API_KEY) {
            return next(new AppError(401, 'UNAUTHORIZED_WEBHOOK', 'Invalid webhook API key'));
        }
    }

    next();
};
