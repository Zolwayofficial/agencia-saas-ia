import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '@repo/database';
import { logger } from '@repo/logger';
import { generateToken } from '../middlewares/auth';
import { RegisterSchema, LoginSchema, TwentyClient } from '@repo/types';
import { IntegrationsService } from '../services/integrations.service';
import { ChatwootService } from '../services/chatwoot.service';

const SALT_ROUNDS = 12;
const TRIAL_DAYS = 7;

/**
 * Helper: obtiene el plan efectivo de una org considerando el trial.
 * Si el trial esta activo, usa los limites del plan trial (Pro).
 * Si expiro o no existe, usa el plan base (Gratis o el que tenga).
 */
async function getEffectivePlan(org: any) {
    // Plan Admin = siempre ilimitado, sin trial
    if (org.plan?.name === 'Admin') return org.plan;

    // Si tiene suscripcion activa pagada, usar ese plan
    if (org.subscriptionStatus === 'active' && org.plan) return org.plan;

    // Si tiene trial activo, usar el plan del trial
    if (org.trialEndsAt && org.trialPlanId) {
        const now = new Date();
        const trialEnd = new Date(org.trialEndsAt);
        if (trialEnd > now) {
            const trialPlan = await prisma.plan.findUnique({ where: { id: org.trialPlanId } });
            if (trialPlan) return trialPlan;
        }
    }

    // Fallback: plan base de la org (Gratis)
    return org.plan;
}

export { getEffectivePlan };

export const authController = {
    /**
     * POST /api/v1/auth/register
     * Crea usuario + organizacion con plan Gratis + Trial Pro 7 dias.
     * Modelo ManyChat: onboarding sin friccion.
     */
    register: async (req: Request, res: Response) => {
        try {
            const parsed = RegisterSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    error: 'VALIDATION_ERROR',
                    details: parsed.error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                });
            }

            const { email, password, name, organizationName, referralCode } = parsed.data;

            const isEmailValid = await IntegrationsService.validateEmail(email);
            if (!isEmailValid) {
                return res.status(400).json({
                    error: 'INVALID_EMAIL_DOMAIN',
                    message: 'Lo sentimos, no permitimos correos temporales o invalidos.'
                });
            }

            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing) {
                return res.status(409).json({
                    error: 'EMAIL_EXISTS',
                    message: 'Este correo ya esta registrado.',
                });
            }

            // Buscar planes: Gratis (base) y Pro (trial)
            const [freePlan, proPlan] = await Promise.all([
                prisma.plan.findUnique({ where: { name: 'Gratis' } }),
                prisma.plan.findUnique({ where: { name: 'Pro' } }),
            ]);

            if (!freePlan) {
                logger.error('Plan Gratis no encontrado en la BD. Ejecuta el seed.');
                return res.status(500).json({ error: 'Error de configuracion del sistema.' });
            }

            const slug = organizationName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const trialEnd = new Date();
            trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);

            const result = await prisma.$transaction(async (tx: any) => {
                const org = await tx.organization.create({
                    data: {
                        name: organizationName,
                        slug: `${slug}-${Date.now().toString(36)}`,
                        referredBy: referralCode || null,
                        planId: freePlan.id,
                        subscriptionStatus: 'trial',
                        trialEndsAt: trialEnd,
                        trialPlanId: proPlan?.id || null,
                        billingCycleStart: new Date(),
                    },
                });

                const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

                const user = await tx.user.create({
                    data: {
                        email,
                        passwordHash,
                        name: name || null,
                        role: 'ADMIN',
                        organizationId: org.id,
                    },
                });

                return { user, org };
            });

            const token = generateToken({
                userId: result.user.id,
                organizationId: result.org.id,
                role: result.user.role,
            });

            logger.info({ userId: result.user.id, orgId: result.org.id, trialEnds: trialEnd }, 'New user registered with trial');

            try {
                logger.info({ orgId: result.org.id }, 'Twenty CRM: Provisioning workspace skipped');
            } catch (err) {
                logger.error({ err }, 'Failed to provision Twenty CRM workspace');
            }

            // Provisionar cuenta en Chatwoot (async, no bloquea el registro)
            ChatwootService.provisionAccount({
                email,
                name: name || email.split('@')[0],
                organizationName,
                password,
            }).then(cwResult => {
                if (cwResult) {
                    logger.info({ chatwootAccountId: cwResult.accountId, orgId: result.org.id }, 'Chatwoot account provisioned');
                }
            }).catch(err => {
                logger.error({ err }, 'Failed to provision Chatwoot account');
            });

            import('@repo/email').then(({ emailService }) => {
                emailService.sendWelcome(email, name || 'Usuario');
            }).catch(err => logger.error({ err }, 'Failed to send welcome email'));

            const trialDaysLeft = Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

            res.status(201).json({
                token,
                user: { id: result.user.id, email: result.user.email, name: result.user.name, role: result.user.role },
                organization: { id: result.org.id, name: result.org.name, slug: result.org.slug },
                trial: {
                    active: true,
                    plan: 'Pro',
                    daysLeft: trialDaysLeft,
                    endsAt: trialEnd.toISOString(),
                    message: `Bienvenido! Tienes ${trialDaysLeft} dias gratis con todas las funciones Pro.`,
                },
            });
        } catch (error) {
            logger.error(error, 'Error en registro');
            res.status(500).json({ error: 'Error al crear cuenta' });
        }
    },

    /**
     * POST /api/v1/auth/login
     */
    login: async (req: Request, res: Response) => {
        try {
            const parsed = LoginSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    error: 'VALIDATION_ERROR',
                    details: parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
                });
            }

            const { email, password } = parsed.data;
            const user = await prisma.user.findUnique({
                where: { email },
                include: { organization: { include: { plan: true } } },
            });

            if (!user) {
                return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Correo o contrasena incorrectos.' });
            }

            if (!user.passwordHash) {
                return res.status(401).json({ error: "USE_GOOGLE", message: "Esta cuenta usa Google Sign-In. Inicia sesion con Google." });
            }
            const passwordValid = await bcrypt.compare(password, user.passwordHash);
            if (!passwordValid) {
                return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Correo o contrasena incorrectos.' });
            }

            const token = generateToken({ userId: user.id, organizationId: user.organizationId, role: user.role });
            logger.info({ userId: user.id }, 'User logged in');

            if (!user.organization) {
                return res.status(500).json({ error: 'DATA_INTEGRITY_ERROR', message: 'Tu usuario no tiene una organizacion vinculada.' });
            }

            const org = user.organization as any;
            let trial = null;
            if (org.trialEndsAt) {
                const now = new Date();
                const trialEnd = new Date(org.trialEndsAt);
                const isActive = trialEnd > now;
                const daysLeft = isActive ? Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
                trial = {
                    active: isActive,
                    plan: 'Pro',
                    daysLeft,
                    endsAt: trialEnd.toISOString(),
                    message: isActive
                        ? `Te quedan ${daysLeft} dia(s) de prueba Pro.`
                        : 'Tu prueba Pro ha terminado. Elige un plan para seguir disfrutando todas las funciones.',
                };
            }

            res.json({
                token,
                user: { id: user.id, email: user.email, name: user.name, role: user.role },
                organization: {
                    id: user.organization.id,
                    name: user.organization.name,
                    slug: user.organization.slug,
                    balance: user.organization.creditBalance,
                    plan: user.organization.plan?.name || 'Sin plan',
                },
                trial,
            });
        } catch (error: any) {
            logger.error(error, 'Error en login');
            res.status(500).json({ error: 'Error al iniciar sesion' });
        }
    },

    /**
     * GET /api/v1/auth/me
     */
    me: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).userId;
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { organization: { include: { plan: true } } },
            });

            if (!user) return res.status(404).json({ error: 'User not found' });

            const org = user.organization as any;
            const effectivePlan = await getEffectivePlan(org);
            let trial = null;

            if (org.trialEndsAt) {
                const now = new Date();
                const trialEnd = new Date(org.trialEndsAt);
                const isActive = trialEnd > now;
                const daysLeft = isActive ? Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
                trial = { active: isActive, daysLeft, endsAt: trialEnd.toISOString() };
            }

            const planLabel = effectivePlan
                ? (org.trialEndsAt && new Date(org.trialEndsAt) > new Date() && org.trialPlanId === effectivePlan.id
                    ? `${effectivePlan.name} (Trial)`
                    : effectivePlan.name)
                : 'Sin plan';

            res.json({
                user: { id: user.id, email: user.email, name: user.name, role: user.role },
                organization: {
                    id: user.organization.id,
                    name: user.organization.name,
                    balance: user.organization.creditBalance,
                    plan: planLabel,
                },
                trial,
            });
        } catch (error) {
            logger.error(error, 'Error obteniendo perfil');
            res.status(500).json({ error: 'Error al obtener perfil' });
        }
    },
};
