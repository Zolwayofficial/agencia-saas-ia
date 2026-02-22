import { Request, Response, NextFunction } from 'express';
import { logger } from '@repo/logger';
import { ZodError } from 'zod';

/**
 * AppError — Error operacional con código de estado y código de error.
 * Úsalo en controllers/services para errores controlados.
 */
export class AppError extends Error {
    constructor(
        public statusCode: number,
        public code: string,
        message: string,
        public isOperational = true
    ) {
        super(message);
        this.name = 'AppError';
    }
}

/**
 * errorHandler — Middleware centralizado de errores.
 * Captura ZodErrors (validación), AppErrors (operacionales) y errores inesperados.
 * DEBE registrarse como último middleware en app.ts.
 */
export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
) {
    // Errores de validación Zod
    if (err instanceof ZodError) {
        return res.status(400).json({
            error: 'VALIDATION_ERROR',
            details: err.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message,
            })),
        });
    }

    // Errores operacionales (controlados)
    if (err instanceof AppError && err.isOperational) {
        return res.status(err.statusCode).json({
            error: err.code,
            message: err.message,
        });
    }

    // Errores inesperados — loguear y devolver genérico
    logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');
    res.status(500).json({ error: 'INTERNAL_ERROR', debug: err?.message || String(err), stack: err?.stack?.split('\n').slice(0, 5) });
}
