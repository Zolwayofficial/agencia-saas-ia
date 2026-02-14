/**
 * Email Service — Notificaciones por correo
 * Usa Resend API para enviar emails transaccionales.
 * Si RESEND_API_KEY no está configurado, solo logea (modo desarrollo).
 */

import { logger } from '@repo/logger';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'FullLogin <noreply@fulllogin.com>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

async function send(to: string, subject: string, html: string): Promise<void> {
    if (!RESEND_API_KEY) {
        logger.info({ to, subject }, '[DEV] Email would be sent (no RESEND_API_KEY)');
        return;
    }

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({ from: EMAIL_FROM, to, subject, html }),
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(`Resend API error ${res.status}: ${JSON.stringify(body)}`);
        }

        logger.info({ to, subject }, 'Email sent successfully');
    } catch (error) {
        logger.error({ error, to, subject }, 'Failed to send email');
    }
}

// ── Email Templates ─────────────────────────────────────────

const sharedStyles = `
  body { font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #e0e0e0; margin: 0; padding: 20px; }
  .container { max-width: 520px; margin: 0 auto; background: #13131a; border: 1px solid #2a2a3a; border-radius: 12px; padding: 32px; }
  .logo { font-size: 24px; font-weight: 700; color: #a78bfa; margin-bottom: 24px; }
  h1 { font-size: 20px; color: #fff; margin: 0 0 16px; }
  p { line-height: 1.6; color: #a0a0b0; margin: 0 0 16px; }
  .btn { display: inline-block; background: linear-gradient(135deg, #8b5cf6, #a78bfa); color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; }
  .footer { margin-top: 32px; font-size: 12px; color: #555; text-align: center; }
  .highlight { color: #a78bfa; font-weight: 600; }
`;

export const emailService = {
    /**
     * Email de bienvenida al registrarse
     */
    sendWelcome: (to: string, name: string) =>
        send(to, '🎉 Bienvenido a FullLogin', `
            <html><head><style>${sharedStyles}</style></head><body>
            <div class="container">
                <div class="logo">⚡ FullLogin</div>
                <h1>¡Bienvenido, ${name}!</h1>
                <p>Tu cuenta está lista. Conecta tu WhatsApp y activa tu asistente IA en minutos.</p>
                <p>
                    <a href="${FRONTEND_URL}/dashboard/whatsapp" class="btn">📱 Conectar WhatsApp</a>
                </p>
                <p>Si necesitas ayuda, responde a este email o contáctanos por WhatsApp.</p>
                <div class="footer">FullLogin — Automatización inteligente para tu negocio</div>
            </div>
            </body></html>
        `),

    /**
     * Confirmación de pago
     */
    sendPaymentConfirmation: (to: string, planName: string, amount: number) =>
        send(to, '✅ Pago confirmado — FullLogin', `
            <html><head><style>${sharedStyles}</style></head><body>
            <div class="container">
                <div class="logo">⚡ FullLogin</div>
                <h1>Pago confirmado</h1>
                <p>Tu suscripción al plan <span class="highlight">${planName}</span> ha sido activada.</p>
                <p>Monto: <span class="highlight">$${amount.toFixed(2)} USD/mes</span></p>
                <p>Ya puedes disfrutar de todas las funcionalidades de tu plan.</p>
                <p>
                    <a href="${FRONTEND_URL}/dashboard" class="btn">Ir al Dashboard</a>
                </p>
                <div class="footer">Puedes gestionar tu suscripción desde el dashboard en cualquier momento.</div>
            </div>
            </body></html>
        `),

    /**
     * Alerta de desconexión de WhatsApp
     */
    sendWhatsAppDisconnected: (to: string, instanceName: string) =>
        send(to, '⚠️ WhatsApp desconectado — FullLogin', `
            <html><head><style>${sharedStyles}</style></head><body>
            <div class="container">
                <div class="logo">⚡ FullLogin</div>
                <h1>⚠️ WhatsApp desconectado</h1>
                <p>Tu instancia <span class="highlight">${instanceName}</span> se ha desconectado.</p>
                <p>Mientras esté desconectada, no podrás recibir ni responder mensajes automaticamente.</p>
                <p>
                    <a href="${FRONTEND_URL}/dashboard/whatsapp" class="btn">Reconectar ahora</a>
                </p>
                <div class="footer">Este es un mensaje automático. No respondas a este email.</div>
            </div>
            </body></html>
        `),

    /**
     * Alerta de uso elevado (70%, 85%, 95%)
     */
    sendUsageAlert: (to: string, percentage: number, resource: string) =>
        send(to, `⚠️ ${percentage}% de ${resource} usado — FullLogin`, `
            <html><head><style>${sharedStyles}</style></head><body>
            <div class="container">
                <div class="logo">⚡ FullLogin</div>
                <h1>Alerta de uso: ${percentage}%</h1>
                <p>Has usado el <span class="highlight">${percentage}%</span> de tu límite mensual de <span class="highlight">${resource}</span>.</p>
                <p>Considera actualizar tu plan para evitar interrupciones en el servicio.</p>
                <p>
                    <a href="${FRONTEND_URL}/dashboard/billing" class="btn">Ver opciones de plan</a>
                </p>
                <div class="footer">FullLogin — Automatización inteligente para tu negocio</div>
            </div>
            </body></html>
        `),
};
