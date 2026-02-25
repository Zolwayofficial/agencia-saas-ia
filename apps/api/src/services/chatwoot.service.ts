import { logger } from '@repo/logger';
import http from 'http';

const CHATWOOT_HOST = process.env.CHATWOOT_HOST || 'chatwoot';
const CHATWOOT_PORT = parseInt(process.env.CHATWOOT_PORT || '3000');
const CHATWOOT_PLATFORM_TOKEN = process.env.CHATWOOT_PLATFORM_TOKEN || '';

function chatwootRequest(method: string, path: string, data?: any): Promise<any> {
    return new Promise((resolve, reject) => {
        const body = data ? JSON.stringify(data) : undefined;
        const req = http.request({
            hostname: CHATWOOT_HOST,
            port: CHATWOOT_PORT,
            path: `/platform/api/v1${path}`,
            method,
            headers: {
                'Content-Type': 'application/json',
                'api_access_token': CHATWOOT_PLATFORM_TOKEN,
                ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
            },
        }, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => responseBody += chunk);
            res.on('end', () => {
                try {
                    const parsed = responseBody ? JSON.parse(responseBody) : {};
                    if (res.statusCode && res.statusCode >= 400) {
                        reject(new Error(`Chatwoot API ${res.statusCode}: ${responseBody}`));
                    } else {
                        resolve(parsed);
                    }
                } catch {
                    resolve(responseBody);
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

export const ChatwootService = {
    /**
     * Provisiona una cuenta completa en Chatwoot para un nuevo usuario registrado.
     * 1. Crea la cuenta (organizacion)
     * 2. Crea el usuario
     * 3. Vincula usuario como administrador de la cuenta
     */
    async provisionAccount(params: {
        email: string;
        name: string;
        organizationName: string;
        password?: string;
    }): Promise<{ accountId: number; userId: number; accessToken: string } | null> {
        if (!CHATWOOT_PLATFORM_TOKEN) {
            logger.warn('CHATWOOT_PLATFORM_TOKEN not set, skipping Chatwoot provisioning');
            return null;
        }

        try {
            // 1. Crear cuenta (organizacion) en espanol y zona horaria LATAM
            const account = await chatwootRequest('POST', '/accounts', {
                name: params.organizationName,
                locale: 'es',
            });

            // Actualizar zona horaria de la cuenta
            await chatwootRequest('PATCH', `/accounts/${account.id}`, {
                timezone: 'America/Mexico_City',
            }).catch(() => {});

            logger.info({ chatwootAccountId: account.id }, 'Chatwoot account created');

            // 2. Crear usuario
            const user = await chatwootRequest('POST', '/users', {
                name: params.name || params.email.split('@')[0],
                email: params.email,
                password: params.password || `CW_${Date.now()}_${Math.random().toString(36).slice(2)}!`,
                custom_attributes: {},
            });
            logger.info({ chatwootUserId: user.id }, 'Chatwoot user created');

            // 3. Vincular usuario a cuenta como admin
            await chatwootRequest('POST', `/accounts/${account.id}/account_users`, {
                user_id: user.id,
                role: 'administrator',
            });
            logger.info({ chatwootAccountId: account.id, chatwootUserId: user.id }, 'Chatwoot user linked to account');

            return {
                accountId: account.id,
                userId: user.id,
                accessToken: user.access_token,
            };
        } catch (error) {
            logger.error({ error }, 'Failed to provision Chatwoot account');
            return null;
        }
    },
};
