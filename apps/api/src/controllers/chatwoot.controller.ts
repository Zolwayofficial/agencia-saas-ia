import { Request, Response } from 'express';
import { prisma } from '@repo/database';
import { logger } from '@repo/logger';

const CHATWOOT_URL = process.env.CHATWOOT_URL || 'http://chatwoot:3000';
const CHATWOOT_PLATFORM_TOKEN = process.env.CHATWOOT_PLATFORM_TOKEN || '';
const CHATWOOT_ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID || '1';
const CHATWOOT_FRONTEND_URL = process.env.CHATWOOT_FRONTEND_URL || 'https://chat.fulllogin.com';

async function chatwootFetch(path: string, options: RequestInit = {}): Promise<any> {
    const res = await fetch(`${CHATWOOT_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'api_access_token': CHATWOOT_PLATFORM_TOKEN,
            ...(options.headers || {}),
        },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
        logger.error({ status: res.status, body, path }, 'Chatwoot API error');
        throw new Error(`Chatwoot API: ${res.status}`);
    }
    return body;
}

export const chatwootController = {
    /**
     * GET /chatwoot/sso — Genera SSO token y devuelve URL de auto-login.
     * Si el usuario no existe en Chatwoot, lo crea automáticamente.
     */
    async sso(req: Request, res: Response) {
        try {
            const orgId = (req as any).organizationId;
            const userId = (req as any).userId;

            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                return res.status(404).json({ error: 'USER_NOT_FOUND' });
            }

            let chatwootUserId = user.chatwootUserId ? Number(user.chatwootUserId) : null;

            if (!chatwootUserId) {
                // Crear usuario en Chatwoot via Platform API
                try {
                    const newUser = await chatwootFetch('/platform/api/v1/users', {
                        method: 'POST',
                        body: JSON.stringify({
                            name: user.name || user.email.split('@')[0],
                            email: user.email,
                            password: `CW_${Date.now()}@Sx`,
                            custom_attributes: { fulllogin_org: orgId },
                        }),
                    });
                    chatwootUserId = newUser.id;
                } catch {
                    // User might already exist — search by getting all users
                    // If create fails with 422, the email already exists in Chatwoot
                    // Try to find user by checking our admin user (id=2) or search
                    const allUsers = await chatwootFetch(
                        `/platform/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/account_users`
                    );
                    if (Array.isArray(allUsers)) {
                        const found = allUsers.find((au: any) => au.email === user.email);
                        if (found) chatwootUserId = found.user_id || found.id;
                    }
                }

                if (!chatwootUserId) {
                    // Last resort: the admin user we created during setup
                    if (user.email === 'admin@fulllogin.com') {
                        chatwootUserId = 2;
                    } else {
                        return res.status(500).json({ error: 'CHATWOOT_USER_CREATE_FAILED' });
                    }
                }

                // Asignar al account si es usuario nuevo
                try {
                    await chatwootFetch(
                        `/platform/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/account_users`,
                        {
                            method: 'POST',
                            body: JSON.stringify({ user_id: chatwootUserId, role: 'agent' }),
                        }
                    );
                } catch {
                    // Already assigned, ignore
                }

                // Guardar en nuestra DB
                await prisma.user.update({
                    where: { id: userId },
                    data: { chatwootUserId: String(chatwootUserId) },
                });
            }

            // Generar SSO URL — GET request, returns { url: "https://..." }
            const ssoData = await chatwootFetch(
                `/platform/api/v1/users/${chatwootUserId}/login`
            );

            // ssoData.url = "https://chat.fulllogin.com/app/login?email=...&sso_auth_token=..."
            const ssoUrl = ssoData.url || '';

            if (!ssoUrl) {
                return res.status(500).json({ error: 'SSO_TOKEN_FAILED' });
            }

            return res.json({ url: ssoUrl });
        } catch (error: any) {
            logger.error({ error: error.message }, 'Chatwoot SSO error');
            return res.status(500).json({
                error: 'SSO_ERROR',
                message: 'No se pudo generar el acceso a Chatwoot.',
            });
        }
    },
};
