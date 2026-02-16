/**
 * Evolution API HTTP Client (API-side)
 * Full instance management: create, connect (QR), status, delete, logout.
 */

const EVOLUTION_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY || '';

const headers = {
    'Content-Type': 'application/json',
    'apikey': EVOLUTION_KEY,
};

async function evoFetch(path: string, options: RequestInit = {}): Promise<any> {
    const res = await fetch(`${EVOLUTION_URL}${path}`, {
        ...options,
        headers: { ...headers, ...(options.headers || {}) },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
        const msg = (body as any)?.message || (body as any)?.error || `HTTP ${res.status}`;
        throw new Error(`Evolution API: ${msg}`);
    }
    return body;
}

export const evolutionApi = {
    /**
     * Create a new WhatsApp instance in Evolution API.
     * After creation, call connect() to get the QR code.
     */
    async createInstance(instanceName: string, webhookUrl: string) {
        return evoFetch('/instance/create', {
            method: 'POST',
            body: JSON.stringify({
                instanceName,
                integration: 'WHATSAPP-BAILEYS',
                qrcode: true,
                webhook: {
                    url: webhookUrl,
                    events: [
                        'CONNECTION_UPDATE',
                        'MESSAGES_UPSERT',
                        'QRCODE_UPDATED',
                    ],
                    byEvents: false,
                },
            }),
        });
    },

    /**
     * Connect an instance and get QR code.
     * Returns { base64, code } where base64 is the QR image.
     */
    async connectInstance(instanceName: string) {
        return evoFetch(`/instance/connect/${instanceName}`, {
            method: 'GET',
        });
    },

    /**
     * Get connection state of an instance.
     * Returns { instance: { state: 'open' | 'close' | 'connecting' } }
     */
    async getInstanceStatus(instanceName: string) {
        return evoFetch(`/instance/connectionState/${instanceName}`, {
            method: 'GET',
        });
    },

    /**
     * Fetch all instances from Evolution API.
     */
    async fetchAllInstances() {
        return evoFetch('/instance/fetchInstances', {
            method: 'GET',
        });
    },

    /**
     * Logout an instance (disconnects WhatsApp but keeps the instance).
     */
    async logoutInstance(instanceName: string) {
        return evoFetch(`/instance/logout/${instanceName}`, {
            method: 'DELETE',
        });
    },

    /**
     * Delete an instance entirely from Evolution API.
     */
    async deleteInstance(instanceName: string) {
        return evoFetch(`/instance/delete/${instanceName}`, {
            method: 'DELETE',
        });
    },

    /**
     * Send a text message.
     */
    async sendText(instanceName: string, to: string, text: string) {
        return evoFetch(`/message/sendText/${instanceName}`, {
            method: 'POST',
            body: JSON.stringify({ number: to, text }),
        });
    },

    /**
     * Set typing/paused presence.
     */
    async setPresence(instanceName: string, presence: 'composing' | 'paused') {
        return evoFetch(`/chat/updatePresence/${instanceName}`, {
            method: 'PUT',
            body: JSON.stringify({ presence }),
        });
    },
};
