/**
 * Knowledge Base & Agent Config Controller
 * CRUD para la base de conocimiento del negocio y configuracion del agente AI.
 */

import { Request, Response } from 'express';
import { prisma } from '@repo/database';
import { logger } from '@repo/logger';

export const knowledgeController = {
    // ── Knowledge Entries CRUD ────────────────────────────

    /** GET /knowledge — Lista entradas de la KB */
    async listEntries(req: Request, res: Response) {
        try {
            const orgId = (req as any).organizationId;
            const { category, active } = req.query;

            const where: any = { organizationId: orgId };
            if (category) where.category = category;
            if (active !== undefined) where.isActive = active === 'true';

            const entries = await prisma.knowledgeEntry.findMany({
                where,
                orderBy: [{ category: 'asc' }, { createdAt: 'desc' }],
            });

            const categories = [...new Set(entries.map(e => e.category))];

            return res.json({
                entries,
                total: entries.length,
                categories,
            });
        } catch (error) {
            logger.error({ error }, 'Error listing knowledge entries');
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Error al obtener entradas.' });
        }
    },

    /** POST /knowledge — Crear entrada */
    async createEntry(req: Request, res: Response) {
        try {
            const orgId = (req as any).organizationId;
            const { category, title, content } = req.body;

            if (!title || !content) {
                return res.status(400).json({ error: 'VALIDATION', message: 'title y content son requeridos.' });
            }

            const entry = await prisma.knowledgeEntry.create({
                data: {
                    organizationId: orgId,
                    category: category || 'general',
                    title,
                    content,
                },
            });

            return res.status(201).json(entry);
        } catch (error) {
            logger.error({ error }, 'Error creating knowledge entry');
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Error al crear entrada.' });
        }
    },

    /** PUT /knowledge/:id — Actualizar entrada */
    async updateEntry(req: Request, res: Response) {
        try {
            const orgId = (req as any).organizationId;
            const { id } = req.params;
            const { category, title, content, isActive } = req.body;

            const existing = await prisma.knowledgeEntry.findFirst({
                where: { id, organizationId: orgId },
            });

            if (!existing) {
                return res.status(404).json({ error: 'NOT_FOUND', message: 'Entrada no encontrada.' });
            }

            const updated = await prisma.knowledgeEntry.update({
                where: { id },
                data: {
                    ...(category !== undefined && { category }),
                    ...(title !== undefined && { title }),
                    ...(content !== undefined && { content }),
                    ...(isActive !== undefined && { isActive }),
                },
            });

            return res.json(updated);
        } catch (error) {
            logger.error({ error }, 'Error updating knowledge entry');
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Error al actualizar entrada.' });
        }
    },

    /** DELETE /knowledge/:id — Eliminar entrada */
    async deleteEntry(req: Request, res: Response) {
        try {
            const orgId = (req as any).organizationId;
            const { id } = req.params;

            const existing = await prisma.knowledgeEntry.findFirst({
                where: { id, organizationId: orgId },
            });

            if (!existing) {
                return res.status(404).json({ error: 'NOT_FOUND', message: 'Entrada no encontrada.' });
            }

            await prisma.knowledgeEntry.delete({ where: { id } });

            return res.json({ success: true, message: 'Entrada eliminada.' });
        } catch (error) {
            logger.error({ error }, 'Error deleting knowledge entry');
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Error al eliminar entrada.' });
        }
    },

    // ── Agent Config ─────────────────────────────────────

    /** GET /knowledge/agent-config — Obtener config del agente */
    async getAgentConfig(req: Request, res: Response) {
        try {
            const orgId = (req as any).organizationId;

            let config = await prisma.agentConfig.findUnique({
                where: { organizationId: orgId },
            });

            // Si no existe, crear uno con defaults
            if (!config) {
                config = await prisma.agentConfig.create({
                    data: { organizationId: orgId },
                });
            }

            return res.json(config);
        } catch (error) {
            logger.error({ error }, 'Error getting agent config');
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Error al obtener config.' });
        }
    },

    /** PUT /knowledge/agent-config — Actualizar config del agente */
    async updateAgentConfig(req: Request, res: Response) {
        try {
            const orgId = (req as any).organizationId;
            const { agentName, systemPrompt, welcomeMessage, tone, language, maxHistoryMessages, isActive } = req.body;

            const config = await prisma.agentConfig.upsert({
                where: { organizationId: orgId },
                create: {
                    organizationId: orgId,
                    ...(agentName !== undefined && { agentName }),
                    ...(systemPrompt !== undefined && { systemPrompt }),
                    ...(welcomeMessage !== undefined && { welcomeMessage }),
                    ...(tone !== undefined && { tone }),
                    ...(language !== undefined && { language }),
                    ...(maxHistoryMessages !== undefined && { maxHistoryMessages }),
                    ...(isActive !== undefined && { isActive }),
                },
                update: {
                    ...(agentName !== undefined && { agentName }),
                    ...(systemPrompt !== undefined && { systemPrompt }),
                    ...(welcomeMessage !== undefined && { welcomeMessage }),
                    ...(tone !== undefined && { tone }),
                    ...(language !== undefined && { language }),
                    ...(maxHistoryMessages !== undefined && { maxHistoryMessages }),
                    ...(isActive !== undefined && { isActive }),
                },
            });

            return res.json(config);
        } catch (error) {
            logger.error({ error }, 'Error updating agent config');
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Error al actualizar config.' });
        }
    },

    // ── Conversation History (read-only para dashboard) ──

    /** GET /knowledge/conversations — Ver historial de conversaciones */
    async listConversations(req: Request, res: Response) {
        try {
            const orgId = (req as any).organizationId;
            const { contactPhone, limit } = req.query;

            if (contactPhone) {
                // Mensajes de un contacto especifico
                const messages = await prisma.conversationMessage.findMany({
                    where: { organizationId: orgId, contactPhone: contactPhone as string },
                    orderBy: { createdAt: 'desc' },
                    take: Number(limit) || 50,
                });

                return res.json({ messages: messages.reverse(), total: messages.length });
            }

            // Lista de contactos unicos con ultimo mensaje
            const contacts = await prisma.$queryRaw`
                SELECT DISTINCT ON ("contactPhone")
                    "contactPhone", "content", "role", "createdAt", "instanceName"
                FROM conversation_messages
                WHERE "organizationId" = ${orgId}
                ORDER BY "contactPhone", "createdAt" DESC
            ` as any[];

            return res.json({ contacts, total: contacts.length });
        } catch (error) {
            logger.error({ error }, 'Error listing conversations');
            return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Error al obtener conversaciones.' });
        }
    },
};
