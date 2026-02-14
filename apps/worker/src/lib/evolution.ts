/**
 * Evolution API HTTP Client
 * Wrapper para comunicarse con Evolution API (WhatsApp Gateway).
 */

const EVOLUTION_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY || '';

export const evolutionApi = {
    async sendText(instanceId: string, to: string, text: string) {
        const res = await fetch(`${EVOLUTION_URL}/message/sendText/${instanceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': EVOLUTION_KEY,
            },
            body: JSON.stringify({ number: to, text }),
        });
        if (!res.ok) throw new Error(`Evolution API error: ${res.status}`);
        return res.json();
    },

    async setPresence(instanceId: string, presence: 'composing' | 'paused') {
        await fetch(`${EVOLUTION_URL}/chat/updatePresence/${instanceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'apikey': EVOLUTION_KEY,
            },
            body: JSON.stringify({ presence }),
        });
    },
};
