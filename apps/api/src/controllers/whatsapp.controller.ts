import { Request, Response } from 'express';
import { logger } from '@repo/logger';
import { prisma } from '@repo/database';
import { evolutionApi } from '../lib/evolution';
import { queueService } from '../services/queue.service';
import type { SendMessagePayload } from '@repo/types';
import { env } from '../config/env';
import { SendMessageSchema, CreateInstanceSchema } from '@repo/types';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://evolution_api:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '';

export const whatsappController = {
    /**
     * POST /api/v1/whatsapp/instances
     * Create a new WhatsApp instance (checks plan limit).
     */
    createInstance: async (req: Request, res: Response) => {
        try {
            const organizationId = (req as any).organizationId;
            const { displayName } = req.body;

            // Check plan limit
            const org = await prisma.organization.findUnique({
                where: { id: organizationId },
                include: { plan: true, instances: true },
            });

            if (!org) return res.status(404).json({ error: 'Organización no encontrada' });

            const maxInstances = org.plan?.maxInstances ?? 1;
            if (org.instances.length >= maxInstances) {
                return res.status(403).json({
                    error: `Tu plan permite máximo ${maxInstances} instancia(s). Upgradea para conectar más.`,
                    current: org.instances.length,
                    limit: maxInstances,
                });
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

            // Get QR code immediately
            let qr = null;
            try {
                const connectResult = await evolutionApi.connectInstance(instanceName);
                qr = connectResult?.base64 || connectResult?.qrcode?.base64 || null;
            } catch (e) {
                logger.warn({ instanceName }, 'Could not get QR immediately, client will poll');
            }

            res.status(201).json({
                instance,
                qrCode: qr,
                message: 'Instancia creada. Escanea el QR con tu WhatsApp.',
            });
        } catch (error) {
            logger.error(error, 'Error creating WhatsApp instance');
            res.status(500).json({ error: 'Error al crear instancia' });
        }
    },

    /**
     * GET /api/v1/whatsapp/instances
     * List all WhatsApp instances for the organization.
     */
    listInstances: async (req: Request, res: Response) => {
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

            // Optionally sync status with Evolution API
            const enriched = await Promise.all(
                instances.map(async (inst) => {
                    try {
                        const status = await evolutionApi.getInstanceStatus(inst.instanceName);
                        const state = status?.instance?.state || status?.state || 'close';
                        const connStatus = state === 'open' ? 'CONNECTED' : state === 'connecting' ? 'QR_PENDING' : 'DISCONNECTED';

                        // Update DB if status changed
                        if (connStatus !== inst.connectionStatus) {
                            await prisma.whatsappInstance.update({
                                where: { id: inst.id },
                                data: {
                                    connectionStatus: connStatus as any,
                                    health: connStatus === 'CONNECTED' ? 'ACTIVE' : 'WARMUP',
                                },
                            });
                        }

                        return { ...inst, connectionStatus: connStatus };
                    } catch {
                        return inst; // Return as-is if Evolution API unreachable
                    }
                })
            );

            res.json({
                instances: enriched,
                limit: org?.plan?.maxInstances ?? 1,
                used: instances.length,
            });
        } catch (error) {
            logger.error(error, 'Error listing WhatsApp instances');
            res.status(500).json({ error: 'Error al listar instancias' });
        }
    },

    /**
     * GET /api/v1/whatsapp/instances/:id/qr
     * Get QR code for a specific instance (used for polling).
     */
    getQrCode: async (req: Request, res: Response) => {
        try {
            const organizationId = (req as any).organizationId;
            const { id } = req.params;

            const instance = await prisma.whatsappInstance.findFirst({
                where: { id, organizationId },
            });

            if (!instance) return res.status(404).json({ error: 'Instancia no encontrada' });

            // Check if already connected
            try {
                const status = await evolutionApi.getInstanceStatus(instance.instanceName);
                const state = status?.instance?.state || status?.state || 'close';

                if (state === 'open') {
                    await prisma.whatsappInstance.update({
                        where: { id },
                        data: { connectionStatus: 'CONNECTED', health: 'ACTIVE' },
                    });
                    return res.json({ status: 'CONNECTED', qrCode: null });
                }
            } catch { /* continue to get QR */ }

            // Get fresh QR
            const connectResult = await evolutionApi.connectInstance(instance.instanceName);
            const qr = connectResult?.base64 || connectResult?.qrcode?.base64 || null;

            res.json({
                status: 'QR_PENDING',
                qrCode: qr,
            });
        } catch (error) {
            logger.error(error, 'Error getting QR code');
            res.status(500).json({ error: 'Error al obtener QR' });
        }
    },

    /**
     * POST /api/v1/whatsapp/instances/:id/logout
     * Disconnect an instance (keeps it for reconnection later).
     */
    logoutInstance: async (req: Request, res: Response) => {
        try {
            const organizationId = (req as any).organizationId;
            const { id } = req.params;

            const instance = await prisma.whatsappInstance.findFirst({
                where: { id, organizationId },
            });

            if (!instance) return res.status(404).json({ error: 'Instancia no encontrada' });

            await evolutionApi.logoutInstance(instance.instanceName);

            await prisma.whatsappInstance.update({
                where: { id },
                data: { connectionStatus: 'DISCONNECTED', health: 'WARMUP' },
            });

            res.json({ message: 'WhatsApp desconectado' });
        } catch (error) {
            logger.error(error, 'Error logging out instance');
            res.status(500).json({ error: 'Error al desconectar' });
        }
    },

    /**
     * DELETE /api/v1/whatsapp/instances/:id
     * Permanently delete an instance.
     */
    deleteInstance: async (req: Request, res: Response) => {
        try {
            const organizationId = (req as any).organizationId;
            const { id } = req.params;

            const instance = await prisma.whatsappInstance.findFirst({
                where: { id, organizationId },
            });

            if (!instance) return res.status(404).json({ error: 'Instancia no encontrada' });

            // Delete from Evolution API first
            try {
                await evolutionApi.deleteInstance(instance.instanceName);
            } catch (e) {
                logger.warn({ instanceName: instance.instanceName }, 'Could not delete from Evolution API');
            }

            // Delete from database
            await prisma.whatsappInstance.delete({ where: { id } });

            res.json({ message: 'Instancia eliminada' });
        } catch (error) {
            logger.error(error, 'Error deleting instance');
            res.status(500).json({ error: 'Error al eliminar instancia' });
        }
    },

    /**
     * POST /api/v1/whatsapp/send
     * Enqueue a WhatsApp message for sending via SmartSend.
     */
    send: async (req: Request, res: Response) => {
        try {
            const payload: SendMessagePayload = {
                instanceId: req.body.instanceId,
                to: req.body.to,
                text: req.body.text,
                organizationId: (req as any).organizationId,
                priority: req.body.priority || 'normal',
            };

            const job = await queueService.sendWhatsApp(payload);

            res.status(202).json({
                message: 'Mensaje encolado para envío',
                jobId: job.id,
            });
        } catch (error) {
            logger.error(error, 'Error encolando mensaje WhatsApp');
            res.status(500).json({ error: 'Error al enviar mensaje' });
        }
    },
};
