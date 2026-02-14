import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '@repo/logger';

interface JwtPayload {
    userId: string;
    organizationId: string;
    role: string;
}

/**
 * Auth Middleware — Valida JWT y extrae identidad del usuario.
 * Inyecta `userId`, `organizationId` y `role` en el request.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'UNAUTHORIZED',
                message: 'Token de acceso requerido.',
            });
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

        // Inyectar datos del usuario en el request
        (req as any).userId = decoded.userId;
        (req as any).organizationId = decoded.organizationId;
        (req as any).role = decoded.role;

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                error: 'TOKEN_EXPIRED',
                message: 'El token ha expirado. Inicia sesión nuevamente.',
            });
        }

        logger.warn({ error }, 'Auth middleware: token inválido');
        return res.status(401).json({
            error: 'INVALID_TOKEN',
            message: 'Token inválido.',
        });
    }
}

/**
 * Genera un JWT firmado con los datos del usuario.
 */
export function generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
}
