import { Request, Response } from 'express';

export const healthController = {
    check: (_req: Request, res: Response) => {
        res.json({
            status: 'ok',
            service: 'api',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });
    },
};
