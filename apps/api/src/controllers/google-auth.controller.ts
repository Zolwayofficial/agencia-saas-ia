import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@repo/database';
import { logger } from '@repo/logger';
import { generateToken } from '../middlewares/auth';
import { env } from '../config/env';
import { ChatwootService } from '../services/chatwoot.service';

const TRIAL_DAYS = 7;

const googleClient = env.GOOGLE_CLIENT_ID
    ? new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET)
    : null;

export const googleAuthController = {
    /**
     * POST /api/v1/auth/google
     * Login o registro con Google (One Tap / Sign In with Google).
     *
     * Body: { credential: string } (Google ID token del frontend)
     *
     * Flujo:
     * - Verifica el ID token con Google
     * - Si el usuario existe (por googleId o email) -> login
     * - Si no existe -> registro automatico con plan Gratis + trial Pro 7 dias
     */
    authenticate: async (req: Request, res: Response) => {
        if (!googleClient || !env.GOOGLE_CLIENT_ID) {
            return res.status(503).json({
                error: 'GOOGLE_NOT_CONFIGURED',
                message: 'Google Sign-In no esta configurado. Agrega GOOGLE_CLIENT_ID.',
            });
        }

        try {
            const { credential, code, redirectUri } = req.body;

            if (!credential && !code) {
                return res.status(400).json({
                    error: 'MISSING_CREDENTIAL',
                    message: 'Se requiere credential o code de Google.',
                });
            }

            let payload;

            if (code) {
                // Authorization Code flow
                const { tokens } = await googleClient.getToken({
                    code,
                    redirect_uri: redirectUri || `${req.headers.origin}/auth/google/callback`,
                });
                const ticket = await googleClient.verifyIdToken({
                    idToken: tokens.id_token!,
                    audience: env.GOOGLE_CLIENT_ID,
                });
                payload = ticket.getPayload();
            } else {
                // ID Token flow (One Tap)
                const ticket = await googleClient.verifyIdToken({
                    idToken: credential,
                    audience: env.GOOGLE_CLIENT_ID,
                });
                payload = ticket.getPayload();
            }
            if (!payload || !payload.email) {
                return res.status(401).json({
                    error: 'INVALID_GOOGLE_TOKEN',
                    message: 'Token de Google invalido o sin email.',
                });
            }

            const { sub: googleId, email, name, picture } = payload;

            // Buscar usuario existente por googleId o email
            let user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { googleId: googleId },
                        { email: email },
                    ],
                },
                include: { organization: { include: { plan: true } } },
            });

            let isNewUser = false;

            if (user) {
                // Usuario existente: actualizar googleId si no lo tenia
                if (!user.googleId) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { googleId },
                    });
                }

                // Recargar con org
                user = await prisma.user.findUnique({
                    where: { id: user.id },
                    include: { organization: { include: { plan: true } } },
                }) as any;
            } else {
                // Usuario nuevo: registro automatico
                isNewUser = true;

                const [freePlan, proPlan] = await Promise.all([
                    prisma.plan.findUnique({ where: { name: 'Gratis' } }),
                    prisma.plan.findUnique({ where: { name: 'Pro' } }),
                ]);

                if (!freePlan) {
                    logger.error('Plan Gratis no encontrado en la BD.');
                    return res.status(500).json({ error: 'Error de configuracion del sistema.' });
                }

                const orgName = name ? `${name}'s Workspace` : `Workspace ${Date.now().toString(36)}`;
                const slug = orgName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                const trialEnd = new Date();
                trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);

                const result = await prisma.$transaction(async (tx: any) => {
                    const org = await tx.organization.create({
                        data: {
                            name: orgName,
                            slug: `${slug}-${Date.now().toString(36)}`,
                            planId: freePlan.id,
                            subscriptionStatus: 'trial',
                            trialEndsAt: trialEnd,
                            trialPlanId: proPlan?.id || null,
                            billingCycleStart: new Date(),
                        },
                    });

                    const newUser = await tx.user.create({
                        data: {
                            email: email!,
                            googleId,
                            passwordHash: null,
                            name: name || null,
                            role: 'ADMIN',
                            organizationId: org.id,
                        },
                    });

                    return { user: newUser, org };
                });

                user = await prisma.user.findUnique({
                    where: { id: result.user.id },
                    include: { organization: { include: { plan: true } } },
                }) as any;

                logger.info({ userId: result.user.id, orgId: result.org.id }, 'New user registered via Google');

                // Enviar email de bienvenida
                import('@repo/email').then(({ emailService }) => {
                    emailService.sendWelcome(email!, name || 'Usuario');
                }).catch(err => logger.error({ err }, 'Failed to send welcome email'));

                // Provisionar cuenta en Chatwoot
                ChatwootService.provisionAccount({
                    email: email!,
                    name: name || email!.split('@')[0],
                    organizationName: orgName,
                }).then(cwResult => {
                    if (cwResult) {
                        logger.info({ chatwootAccountId: cwResult.accountId, userId: result.user.id }, 'Chatwoot account provisioned (Google)');
                    }
                }).catch(err => {
                    logger.error({ err }, 'Failed to provision Chatwoot account (Google)');
                });
            }

            if (!user || !user.organization) {
                return res.status(500).json({ error: 'Error al procesar la cuenta.' });
            }

            const token = generateToken({
                userId: user.id,
                organizationId: user.organizationId,
                role: user.role,
            });

            logger.info({ userId: user.id, isNewUser }, 'Google auth successful');

            // Calcular trial
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
                    message: isNewUser
                        ? `Bienvenido! Tienes ${daysLeft} dias gratis con todas las funciones Pro.`
                        : isActive
                            ? `Te quedan ${daysLeft} dia(s) de prueba Pro.`
                            : 'Tu prueba Pro ha terminado.',
                };
            }

            res.status(isNewUser ? 201 : 200).json({
                token,
                isNewUser,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
                organization: {
                    id: user.organization.id,
                    name: user.organization.name,
                    slug: (user.organization as any).slug,
                    plan: user.organization.plan?.name || 'Sin plan',
                },
                trial,
            });
        } catch (error: any) {
            if (error.message?.includes('Token used too late') || error.message?.includes('Invalid token')) {
                return res.status(401).json({
                    error: 'EXPIRED_GOOGLE_TOKEN',
                    message: 'El token de Google ha expirado. Intenta de nuevo.',
                });
            }
            logger.error(error, 'Error en Google auth');
            res.status(500).json({ error: 'Error al autenticar con Google' });
        }
    },
};
