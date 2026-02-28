import { Request, Response } from 'express';
import { logger } from '@repo/logger';
import { prisma } from '@repo/database';
import { queueService } from '../services/queue.service';

/**
 * Webhook Controller
 * Recibe eventos de servicios externos (Evolution API, Chatwoot).
 */
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
                        const connStatus = state === 'open' ? 'CONNECTED'
                            : state === 'connecting' ? 'QR_PENDING'
                                : 'DISCONNECTED';
                        const health = state === 'open' ? 'ACTIVE' : 'WARMUP';

                        await prisma.whatsappInstance.updateMany({
                            where: { instanceName },
                            data: {
                                connectionStatus: connStatus as any,
                                health: health as any,
                            },
                        });

                        // If connected, try to get phone number
                        if (state === 'open' && event.data?.wuid) {
                            const phone = event.data.wuid.replace('@s.whatsapp.net', '');
                            await prisma.whatsappInstance.updateMany({
                                where: { instanceName },
                                data: { phoneNumber: phone, isNew: false },
                            });
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
