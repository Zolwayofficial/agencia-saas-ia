import { Request, Response } from 'express';
import { logger } from '@repo/logger';
import { prisma } from '@repo/database';
import { queueService } from '../services/queue.service';

/**
 * Webhook Controller
 * Recibe eventos de servicios externos (Evolution API, Chatwoot).
 */
const webhookRestartCooldown = new Map();
const logoutTimestamps = new Map<string, number>(); // instanceName → timestamp of close(401)

export const webhookController = {
    /**
     * POST /api/v1/webhooks/evolution
     * Evolution API envía eventos aquí cuando llega un mensaje de WhatsApp.
     */
    evolution: async (req: Request, res: Response) => {
        try {
            const event = req.body;
            const eventType = event.event;
            const instanceName = event.instance;

            logger.info({ event: eventType, instance: instanceName }, 'Webhook Evolution recibido');

            switch (eventType) {
                // ── Connection state changed ──
                case 'connection.update': {
                    const state = event.data?.state || event.data?.connection || event.data?.statusReason;
                    logger.info({ instanceName, state, rawData: event.data }, 'WhatsApp connection update');

                    if (instanceName) {
                        if (state === 'open') {
                            // Check if this open is a phantom reconnect after manual logout (close 401)
                            const recentLogout = logoutTimestamps.get(instanceName) || 0;
                            if (Date.now() - recentLogout < 15000) {
                                logger.info({ instanceName }, 'Ignoring phantom reconnect after manual logout (close 401)');
                            } else {
                                // QR scanned & session established — mark CONNECTED
                                await prisma.whatsappInstance.updateMany({
                                    where: { instanceName },
                                    data: { connectionStatus: 'CONNECTED', health: 'ACTIVE' },
                                });
                                const phoneData: any = { qrCode: null, isNew: false };
                                if (event.data?.wuid) {
                                    phoneData.phoneNumber = event.data.wuid.replace('@s.whatsapp.net', '');
                                }
                                await prisma.whatsappInstance.updateMany({ where: { instanceName }, data: phoneData });
                                logger.info({ instanceName, phone: phoneData.phoneNumber }, 'WhatsApp connected, phone captured');
                            }
                        } else if (state === 'connecting') {
                            // 515 stream-replaced — v2.3.7 auto-reconnects.
                            // NEVER downgrade an already-CONNECTED instance back to QR_PENDING.
                            await prisma.whatsappInstance.updateMany({
                                where: { instanceName, connectionStatus: { not: 'CONNECTED' } },
                                data: { connectionStatus: 'QR_PENDING', health: 'WARMUP' },
                            });
                        } else {
                            // state === 'close' or unknown — truly disconnected
                            await prisma.whatsappInstance.updateMany({
                                where: { instanceName },
                                data: { connectionStatus: 'DISCONNECTED', health: 'WARMUP' },
                            });
                            const statusReason = event.data?.statusReason;
                            if (statusReason === 401) {
                                // Manual device removal — record timestamp to block phantom reconnect
                                logoutTimestamps.set(instanceName, Date.now());
                                logger.info({ instanceName }, 'Manual logout (401): blocking phantom reconnect for 15s');
                                // Schedule real logout after 3s to clear stored session & stop auto-reconnect loop
                                setTimeout(async () => {
                                    try {
                                        const { evolutionApi } = await import('../lib/evolution');
                                        await evolutionApi.logoutInstance(instanceName);
                                        logger.info({ instanceName }, 'Session cleared after manual device removal (401)');
                                    } catch (e: any) {
                                        logger.warn({ instanceName, err: e?.message }, 'Logout after 401 failed');
                                    }
                                    logoutTimestamps.delete(instanceName);
                                }, 3000);
                            }
                        }
                    }
                    break;
                }

                // ── New QR code generated ──
                case 'qrcode.updated': {
                    const qrBase64 = event.data?.qrcode?.base64 || event.data?.base64 || null;
                    logger.info({ instanceName, hasQr: !!qrBase64 }, 'QR code updated');
                    if (instanceName) {
                        const updateData: any = { connectionStatus: 'QR_PENDING' };
                        if (qrBase64) updateData.qrCode = qrBase64;
                        await prisma.whatsappInstance.updateMany({
                            where: { instanceName },
                            data: updateData,
                        });
                    }
                    break;
                }

                // ── Incoming message ──
                case 'messages.upsert': {
                    const message = event.data;
                    const from = message?.key?.remoteJid;
                    const text = message?.message?.conversation
                        || message?.message?.extendedTextMessage?.text
                        || '';
                    const isFromMe = message?.key?.fromMe;

                    if (!isFromMe && from && text && instanceName) {
                        logger.info({ from, text: text.substring(0, 50), instanceName }, 'Incoming WhatsApp message');

                        // Update message counter
                        await prisma.whatsappInstance.updateMany({
                            where: { instanceName },
                            data: { messagesLast24h: { increment: 1 } },
                        });

                        // Find the instance to get organizationId + industry
                        const instance = await prisma.whatsappInstance.findUnique({
                            where: { instanceName },
                            include: { organization: true },
                        });

                        if (instance) {
                            // Enqueue AI response
                            await queueService.enqueueAiResponse({
                                instanceName,
                                to: from,
                                userMessage: text,
                                organizationId: instance.organizationId,
                                industry: (instance.organization as any)?.industry || undefined,
                            });
                            logger.info({ org: instance.organizationId, from }, 'AI response enqueued');
                        }
                    }
                    break;
                }

                default:
                    logger.debug({ eventType }, 'Unhandled Evolution event');
            }

            res.status(200).json({ received: true });
        } catch (error) {
            logger.error(error, 'Error procesando webhook Evolution');
            res.status(500).json({ error: 'Webhook processing failed' });
        }
    },

    /**
     * POST /api/v1/webhooks/chatwoot
     * Chatwoot notifica cuando un agente humano responde.
     */
    chatwoot: async (req: Request, res: Response) => {
        try {
            const event = req.body;
            logger.info({ event: event.event }, 'Webhook Chatwoot recibido');

            // TODO: Si el agente respondió, pausar el bot para esa conversación
            // if (event.event === 'message_created' && event.message_type === 'outgoing') {
            //   await pauseBotForConversation(event.conversation.id);
            // }

            res.status(200).json({ received: true });
        } catch (error) {
            logger.error(error, 'Error procesando webhook Chatwoot');
            res.status(500).json({ error: 'Webhook processing failed' });
        }
    },
};
