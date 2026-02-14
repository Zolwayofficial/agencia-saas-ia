/**
 * Stripe Controller — Pagos y Suscripciones
 * Maneja Checkout, portal de facturación, y webhooks de Stripe.
 */

import { Request, Response } from 'express';
import Stripe from 'stripe';
import { logger } from '@repo/logger';
import { prisma } from '@repo/database';
import { env } from '../config/env';
import { emailService } from '../services/email.service';

const stripe = env.STRIPE_SECRET_KEY
    ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' as any })
    : null;

function requireStripe(res: Response): Stripe | null {
    if (!stripe) {
        res.status(503).json({ error: 'Stripe no está configurado. Agrega STRIPE_SECRET_KEY.' });
        return null;
    }
    return stripe;
}

export const stripeController = {
    /**
     * POST /api/v1/billing/checkout
     * Crear una sesión de Stripe Checkout para suscribirse a un plan.
     */
    createCheckout: async (req: Request, res: Response) => {
        const s = requireStripe(res);
        if (!s) return;

        try {
            const { planId } = req.body;
            const user = (req as any).user;

            const org = await prisma.organization.findUnique({
                where: { id: user.organizationId },
            });
            if (!org) return res.status(404).json({ error: 'Organización no encontrada' });

            const plan = await prisma.plan.findUnique({ where: { id: planId } });
            if (!plan) return res.status(404).json({ error: 'Plan no encontrado' });
            if (!plan.stripePriceId) return res.status(400).json({ error: 'Plan sin precio en Stripe' });

            // Create or reuse Stripe customer
            let customerId = org.stripeCustomerId;
            if (!customerId) {
                const customer = await s.customers.create({
                    email: user.email,
                    name: org.name,
                    metadata: { organizationId: org.id },
                });
                customerId = customer.id;
                await prisma.organization.update({
                    where: { id: org.id },
                    data: { stripeCustomerId: customerId },
                });
            }

            const session = await s.checkout.sessions.create({
                customer: customerId,
                mode: 'subscription',
                payment_method_types: ['card'],
                line_items: [{ price: plan.stripePriceId, quantity: 1 }],
                success_url: `${env.FRONTEND_URL}/dashboard?checkout=success`,
                cancel_url: `${env.FRONTEND_URL}/dashboard?checkout=cancel`,
                metadata: { organizationId: org.id, planId: plan.id },
                subscription_data: {
                    metadata: { organizationId: org.id, planId: plan.id },
                },
            });

            res.json({ url: session.url });
        } catch (error) {
            logger.error(error, 'Error creating Stripe checkout');
            res.status(500).json({ error: 'Error creando sesión de pago' });
        }
    },

    /**
     * POST /api/v1/billing/portal
     * Abrir el portal de facturación de Stripe para gestionar la suscripción.
     */
    createPortal: async (req: Request, res: Response) => {
        const s = requireStripe(res);
        if (!s) return;

        try {
            const user = (req as any).user;
            const org = await prisma.organization.findUnique({
                where: { id: user.organizationId },
            });

            if (!org?.stripeCustomerId) {
                return res.status(400).json({ error: 'No tienes una suscripción activa' });
            }

            const session = await s.billingPortal.sessions.create({
                customer: org.stripeCustomerId,
                return_url: `${env.FRONTEND_URL}/dashboard/billing`,
            });

            res.json({ url: session.url });
        } catch (error) {
            logger.error(error, 'Error creating billing portal');
            res.status(500).json({ error: 'Error abriendo portal de facturación' });
        }
    },

    /**
     * GET /api/v1/billing/subscription
     * Obtener estado de la suscripción actual.
     */
    getSubscription: async (req: Request, res: Response) => {
        try {
            const user = (req as any).user;
            const org = await prisma.organization.findUnique({
                where: { id: user.organizationId },
                include: { plan: true },
            });

            if (!org) return res.status(404).json({ error: 'Organización no encontrada' });

            res.json({
                plan: org.plan,
                status: org.subscriptionStatus,
                messagesUsed: org.messagesUsedThisMonth,
                messagesLimit: org.plan?.messagesIncluded || 0,
                agentRunsUsed: org.agentRunsUsedThisMonth,
                agentRunsLimit: org.plan?.agentRunsIncluded || 0,
                billingCycleStart: org.billingCycleStart,
            });
        } catch (error) {
            logger.error(error, 'Error getting subscription');
            res.status(500).json({ error: 'Error obteniendo suscripción' });
        }
    },

    /**
     * POST /api/v1/webhooks/stripe
     * Webhook de Stripe — procesa eventos de suscripción.
     * NOTA: Esta ruta usa express.raw() para verificar la firma.
     */
    webhook: async (req: Request, res: Response) => {
        if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
            return res.status(503).json({ error: 'Stripe webhooks not configured' });
        }

        let event: Stripe.Event;
        try {
            const sig = req.headers['stripe-signature'] as string;
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err: any) {
            logger.error({ err }, 'Stripe webhook signature verification failed');
            return res.status(400).json({ error: `Webhook error: ${err.message}` });
        }

        logger.info({ type: event.type }, 'Stripe webhook received');

        try {
            switch (event.type) {
                // ── Checkout completed → Activate subscription ──
                case 'checkout.session.completed': {
                    const session = event.data.object as Stripe.Checkout.Session;
                    const orgId = session.metadata?.organizationId;
                    const planId = session.metadata?.planId;

                    if (orgId && planId) {
                        await prisma.organization.update({
                            where: { id: orgId },
                            data: {
                                planId,
                                stripeSubscriptionId: session.subscription as string,
                                subscriptionStatus: 'active',
                            },
                        });

                        // Log transaction
                        const plan = await prisma.plan.findUnique({ where: { id: planId } });
                        if (plan) {
                            await prisma.creditTransaction.create({
                                data: {
                                    organizationId: orgId,
                                    amount: -plan.priceMonthly,
                                    type: 'SUBSCRIPTION',
                                    description: `Suscripción ${plan.name} activada`,
                                },
                            });
                        }

                        // Send confirmation email
                        const user = await prisma.user.findFirst({ where: { organizationId: orgId } });
                        if (user?.email && plan) {
                            await emailService.sendPaymentConfirmation(user.email, plan.name, plan.priceMonthly);
                        }

                        logger.info({ orgId, planId }, 'Subscription activated via Stripe');
                    }
                    break;
                }

                // ── Invoice paid → Renewal ──
                case 'invoice.paid': {
                    const invoice = event.data.object as Stripe.Invoice;
                    const subId = invoice.subscription as string;

                    if (subId) {
                        await prisma.organization.updateMany({
                            where: { stripeSubscriptionId: subId },
                            data: {
                                subscriptionStatus: 'active',
                                messagesUsedThisMonth: 0,
                                agentRunsUsedThisMonth: 0,
                                billingCycleStart: new Date(),
                            },
                        });
                        logger.info({ subId }, 'Subscription renewed');
                    }
                    break;
                }

                // ── Payment failed ──
                case 'invoice.payment_failed': {
                    const invoice = event.data.object as Stripe.Invoice;
                    const subId = invoice.subscription as string;

                    if (subId) {
                        await prisma.organization.updateMany({
                            where: { stripeSubscriptionId: subId },
                            data: { subscriptionStatus: 'past_due' },
                        });
                        logger.warn({ subId }, 'Subscription payment failed');
                    }
                    break;
                }

                // ── Subscription canceled ──
                case 'customer.subscription.deleted': {
                    const sub = event.data.object as Stripe.Subscription;
                    await prisma.organization.updateMany({
                        where: { stripeSubscriptionId: sub.id },
                        data: {
                            subscriptionStatus: 'canceled',
                            stripeSubscriptionId: null,
                        },
                    });
                    logger.info({ subId: sub.id }, 'Subscription canceled');
                    break;
                }

                // ── Subscription updated (plan change) ──
                case 'customer.subscription.updated': {
                    const sub = event.data.object as Stripe.Subscription;
                    const newPriceId = sub.items.data[0]?.price?.id;

                    if (newPriceId) {
                        const plan = await prisma.plan.findUnique({
                            where: { stripePriceId: newPriceId },
                        });
                        if (plan) {
                            await prisma.organization.updateMany({
                                where: { stripeSubscriptionId: sub.id },
                                data: {
                                    planId: plan.id,
                                    subscriptionStatus: sub.status === 'active' ? 'active' : sub.status,
                                },
                            });
                            logger.info({ planId: plan.id }, 'Subscription plan updated');
                        }
                    }
                    break;
                }

                default:
                    logger.debug({ type: event.type }, 'Unhandled Stripe event');
            }

            res.json({ received: true });
        } catch (error) {
            logger.error(error, 'Error processing Stripe webhook');
            res.status(500).json({ error: 'Webhook processing failed' });
        }
    },
};
