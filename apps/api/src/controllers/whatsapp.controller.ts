import { Request, Response, NextFunction } from 'express';
import { logger } from '@repo/logger';
import { prisma } from '@repo/database';
import { evolutionApi } from '../lib/evolution';
import { queueService } from '../services/queue.service';
import type { SendMessagePayload } from '@repo/types';
import { env } from '../config/env';
import { SendMessageSchema, CreateInstanceSchema } from '@repo/types';
import { AppError } from '../middlewares/error-handler';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://evolution_api:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '';

export const whatsappController = {
    /**
     * POST /api/v1/whatsapp/instances
     * Create a new WhatsApp instance.
     */
    createInstance: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const organizationId = (req as any).organizationId;
            const parsed = CreateInstanceSchema.safeParse(req.body);

            if (!parsed.success) {
                return res.status(400).json({ error: parsed.error.flatten() });
            }

            const { displayName } = parsed.data;

            // Check plan limit
            const org = await prisma.organization.findUnique({
                where: { id: organizationId },
                include: { plan: true, instances: true },
            });

            if (!org) throw new AppError(404, 'ORG_NOT_FOUND', 'Organización no encontrada');

            const maxInstances = org.plan?.maxInstances ?? 1;
            if (org.instances.length >= maxInstances) {
                throw new AppError(403, 'PLAN_LIMIT_REACHED', `Tu plan permite máximo ${maxInstances} instancia(s).`);
            }

            // Generate unique instance name
            const instanceName = `${org.slug}-wa-${Date.now()}`;
            const webhookUrl = `${env.API_BASE_URL || 'http://localhost:3001'}/api/v1/webhooks/evolution`;

            // Create in Evolution API
            const evoResult = await evolutionApi.createInstance(instanceName, webhookUrl);
            logger.info({ instanceName, evoResult }, 'Instance created in Evolution API');

            // Save to database
            const instance = await prisma.whatsappInstance.create({
                data: {
                    instanceName,
                    displayName: displayName || `WhatsApp ${org.instances.length + 1}`,
                    organizationId,
                    connectionStatus: 'QR_PENDING',
                },
            });

            // Get QR code immediately (try from create result first, then connect)
            let qr = evoResult?.qrcode?.base64 || null;
            if (!qr) {
                try {
                    const connectResult = await evolutionApi.connectInstance(instanceName);
                    qr = connectResult?.base64 || connectResult?.qrcode?.base64 || null;
                } catch (e) {
                    logger.warn({ instanceName }, 'Could not get QR immediately, client will poll');
                }
            }
            // Strip data URI prefix if present (Evolution v2.3+ includes it)
            if (qr && qr.startsWith('data:')) {
                qr = qr.replace(/^data:image\/[^;]+;base64,/, '');
            }

            res.status(201).json({
                instance,
                qrCode: qr,
                message: 'Instancia creada. Escanea el QR con tu WhatsApp.',
            });
        } catch (err) {
            next(err);
        }
    },

    /**
     * GET /api/v1/whatsapp/instances
     */
    listInstances: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const organizationId = (req as any).organizationId;

            const org = await prisma.organization.findUnique({
                where: { id: organizationId },
                include: { plan: true },
            });

            const instances = await prisma.whatsappInstance.findMany({
                where: { organizationId },
                orderBy: { createdAt: 'desc' },
            });

            // Sync status with Evolution API
            const enriched = await Promise.all(
                instances.map(async (inst: any) => {
                    try {
                        const status = await evolutionApi.getInstanceStatus(inst.instanceName);
                        const state = status?.instance?.state || status?.state || 'close';

                        if (state === 'open') {
                            // Upgrade to CONNECTED with phone number if available
                            const ownerJid = status?.instance?.ownerJid || '';
                            const phoneNumber = ownerJid.replace('@s.whatsapp.net', '') || inst.phoneNumber || '';
                            if (inst.connectionStatus !== 'CONNECTED') {
                                await prisma.whatsappInstance.update({
                                    where: { id: inst.id },
                                    data: { connectionStatus: 'CONNECTED', health: 'ACTIVE', phoneNumber, isNew: false },
                                });
                            }
                            return { ...inst, connectionStatus: 'CONNECTED', phoneNumber };
                        }

                        // If DB already shows CONNECTED, trust it (avoids flicker during transient reconnects)
                        if (inst.connectionStatus === 'CONNECTED') {
                            return inst;
                        }

                        // Non-connected: sync normally
                        const connStatus = state === 'connecting' ? 'QR_PENDING' : 'DISCONNECTED';
                        if (connStatus !== inst.connectionStatus) {
                            await prisma.whatsappInstance.update({
                                where: { id: inst.id },
                                data: { connectionStatus: connStatus as any, health: 'WARMUP' },
                            });
                        }
                        return { ...inst, connectionStatus: connStatus };
                    } catch {
                        // Evolution API unavailable -- trust DB state
                        return inst;
                    }
                })
            );

            res.json({
                instances: enriched,
                limit: org?.plan?.maxInstances ?? 1,
                used: instances.length,
            });
        } catch (err) {
            next(err);
        }
    },

    /**
     * GET /api/v1/whatsapp/instances/:id/qr
     */
    getQrCode: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const organizationId = (req as any).organizationId;
            const { id } = req.params;

            const instance = await prisma.whatsappInstance.findFirst({
                where: { id, organizationId },
            });

            if (!instance) throw new AppError(404, 'INSTANCE_NOT_FOUND', 'Instancia no encontrada');

            // 1. Trust DB if already CONNECTED (set by webhook)
            if (instance.connectionStatus === 'CONNECTED') {
                return res.json({ status: 'CONNECTED', qrCode: null });
            }

            // 2. Check live Evolution API state
            try {
                const status = await evolutionApi.getInstanceStatus(instance.instanceName);
                const liveState = status?.instance?.state || status?.state;
                if (liveState === 'open') {
                    const ownerJid = status?.instance?.ownerJid || '';
                    const phoneNumber = ownerJid.replace('@s.whatsapp.net', '') || (instance as any).phoneNumber || '';
                    await prisma.whatsappInstance.update({
                        where: { id },
                        data: { connectionStatus: 'CONNECTED', health: 'ACTIVE', phoneNumber, isNew: false },
                    });
                    return res.json({ status: 'CONNECTED', qrCode: null });
                }
            } catch { /* instance may not exist yet */ }

            // 3. Use QR stored from webhook event
            let qr: string | null = (instance as any).qrCode || null;

            // 2. Fallback: try Evolution API connect endpoint
            if (!qr) {
                try {
                    const connectResult = await evolutionApi.connectInstance(instance.instanceName);
                    qr = connectResult?.base64 || connectResult?.qrcode?.base64 || null;
                } catch { /* ignore */ }
            }

            // Strip data URI prefix if present
            if (qr && qr.startsWith('data:')) {
                qr = qr.replace(/^data:image\/[^;]+;base64,/, '');
            }

            res.json({ status: 'QR_PENDING', qrCode: qr });
        } catch (err) {
            next(err);
        }
    },

    /**
     * POST /api/v1/whatsapp/instances/:id/logout
     */
    logoutInstance: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const organizationId = (req as any).organizationId;
            const { id } = req.params;

            const instance = await prisma.whatsappInstance.findFirst({
                where: { id, organizationId },
            });

            if (!instance) throw new AppError(404, 'INSTANCE_NOT_FOUND', 'Instancia no encontrada');

            await evolutionApi.logoutInstance(instance.instanceName);
            await prisma.whatsappInstance.update({
                where: { id },
                data: { connectionStatus: 'DISCONNECTED', health: 'WARMUP' },
            });

            res.json({ message: 'WhatsApp desconectado' });
        } catch (err) {
            next(err);
        }
    },

    /**
     * DELETE /api/v1/whatsapp/instances/:id
     */
    deleteInstance: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const organizationId = (req as any).organizationId;
            const { id } = req.params;

            const instance = await prisma.whatsappInstance.findFirst({
                where: { id, organizationId },
            });

            if (!instance) throw new AppError(404, 'INSTANCE_NOT_FOUND', 'Instancia no encontrada');

            try {
                await evolutionApi.deleteInstance(instance.instanceName);
            } catch (e) {
                logger.warn({ instanceName: instance.instanceName }, 'Evo API delete failed');
            }

            await prisma.whatsappInstance.delete({ where: { id } });
            res.json({ message: 'Instancia eliminada' });
        } catch (err) {
            next(err);
        }
    },

    /**
     * POST /api/v1/whatsapp/send
     */
    send: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = SendMessageSchema.safeParse(req.body);

            if (!parsed.success) {
                return res.status(400).json({ error: parsed.error.flatten() });
            }

            const payload: SendMessagePayload = {
                ...parsed.data,
                organizationId: (req as any).organizationId,
            };

            const job = await queueService.sendWhatsApp(payload);
            res.status(202).json({ message: 'Mensaje encolado', jobId: job.id });
        } catch (err) {
            next(err);
        }
    },
};
