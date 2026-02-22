import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '@repo/database';
import { logger } from '@repo/logger';
import { generateToken } from '../middlewares/auth';
import { RegisterSchema, LoginSchema, TwentyClient } from '@repo/types';
import { IntegrationsService } from '../services/integrations.service';

const SALT_ROUNDS = 12;

export const authController = {
    /**
     * POST /api/v1/auth/register
     * Crea un usuario y su organización, devuelve JWT.
     * [V6.1] Validación con Zod.
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

            // [FREE API] Validar correo con Disify
            const isEmailValid = await IntegrationsService.validateEmail(email);
            if (!isEmailValid) {
                return res.status(400).json({
                    error: 'INVALID_EMAIL_DOMAIN',
                    message: 'Lo sentimos, no permitimos correos temporales o inválidos.'
                });
            }

            // Verificar si el email ya existe
            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing) {
                return res.status(409).json({
                    error: 'EMAIL_EXISTS',
                    message: 'Este correo ya está registrado.',
                });
            }

            // Crear organización + usuario en una transacción
            const slug = organizationName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

            const result = await prisma.$transaction(async (tx: any) => {
                const org = await tx.organization.create({
                    data: {
                        name: organizationName,
                        slug: `${slug}-${Date.now().toString(36)}`,
                        referredBy: referralCode || null,
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

            logger.info({ userId: result.user.id, orgId: result.org.id }, 'New user registered');

            // Provisionar Workspace en Twenty CRM
            try {
                const twenty = new TwentyClient({
                    serverUrl: process.env.TWENTY_SERVER_URL || "http://twenty-server:3000",
                    apiKey: process.env.TWENTY_API_KEY || ""
                });

                // TODO: Dependiente de si usamos internal API o system admin token 
                // para inyectar workspaces programáticamente en Twenty. 
                // Por ahora logueamos la intención.
                logger.info({ orgId: result.org.id }, 'Twenty CRM: Provisioning workspace skipped (needs root config)');

            } catch (err) {
                logger.error({ err }, 'Failed to provision Twenty CRM workspace');
            }

            // Send welcome email
            import('@repo/email').then(({ emailService }) => {
                emailService.sendWelcome(email, name || 'Usuario');
            }).catch(err => logger.error({ err }, 'Failed to send welcome email'));

            res.status(201).json({
                token,
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    name: result.user.name,
                    role: result.user.role,
                },
                organization: {
                    id: result.org.id,
                    name: result.org.name,
                    slug: result.org.slug,
                },
            });
        } catch (error) {
            logger.error(error, 'Error en registro');
            res.status(500).json({ error: 'Error al crear cuenta' });
        }
    },

    /**
     * POST /api/v1/auth/login
     * Valida credenciales y devuelve JWT.
     */
    /**
     * [V6.1] Validación con Zod.
     */
    login: async (req: Request, res: Response) => {
        try {
            const parsed = LoginSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    error: 'VALIDATION_ERROR',
                    details: parsed.error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                });
            }

            const { email, password } = parsed.data;

            const user = await prisma.user.findUnique({
                where: { email },
                include: { organization: true },
            });

            if (!user) {
                return res.status(401).json({
                    error: 'INVALID_CREDENTIALS',
                    message: 'Correo o contraseña incorrectos.',
                });
            }

            const passwordValid = await bcrypt.compare(password, user.passwordHash);
            if (!passwordValid) {
                return res.status(401).json({
                    error: 'INVALID_CREDENTIALS',
                    message: 'Correo o contraseña incorrectos.',
                });
            }

            const token = generateToken({
                userId: user.id,
                organizationId: user.organizationId,
                role: user.role,
            });

            logger.info({ userId: user.id }, 'User logged in');

            if (!user.organization) {
                logger.error({ userId: user.id }, 'User found but organization is null');
                return res.status(500).json({
                    error: 'DATA_INTEGRITY_ERROR',
                    message: 'Tu usuario no tiene una organización vinculada.',
                    debug: 'user.organization is null'
                });
            }

            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
                organization: {
                    id: user.organization.id,
                    name: user.organization.name,
                    slug: user.organization.slug,
                    balance: user.organization.creditBalance,
                },
            });
        } catch (error: any) {
            logger.error(error, 'Error en login');
            res.status(500).json({ error: 'Error al iniciar sesión' });
        }
    },

    /**
     * GET /api/v1/auth/me
     * Retorna datos del usuario actual (requiere token).
     */
    me: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).userId;
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { organization: { include: { plan: true } } },
            });

            if (!user) return res.status(404).json({ error: 'User not found' });

            res.json({
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
                organization: {
                    id: user.organization.id,
                    name: user.organization.name,
                    balance: user.organization.creditBalance,
                    plan: user.organization.plan?.name || 'Sin plan',
                },
            });
        } catch (error) {
            logger.error(error, 'Error obteniendo perfil');
            res.status(500).json({ error: 'Error al obtener perfil' });
        }
    },
};
