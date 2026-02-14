/**
 * Servicio de Billing - Manejo de pagos y comisiones
 */

import { logger } from '../utils/logger';
import { affiliateService } from './affiliate_service';

class BillingService {
    async handlePaymentReceived(data: any): Promise<void> {
        const { customer, amount_cents, invoice } = data;
        const amount = amount_cents / 100;

        logger.info(`Pago recibido: $${amount}`, { customerId: customer?.external_id });

        // Procesar comisión de referido si aplica
        if (customer?.metadata?.referred_by) {
            await affiliateService.processCommission({
                affiliateId: customer.metadata.referred_by,
                amount,
                type: 'recurring',
                referralId: customer.external_id,
            });
        }

        // TODO: Activar servicios, enviar notificaciones, etc.
    }

    async handleSubscriptionStarted(data: any): Promise<void> {
        const { customer, subscription } = data;

        logger.info('Suscripción iniciada', {
            customerId: customer?.external_id,
            plan: subscription?.plan_code,
        });

        // Procesar comisión de primera vez si es referido
        if (customer?.metadata?.referred_by) {
            const firstPaymentAmount = subscription?.amount_cents / 100;

            await affiliateService.processCommission({
                affiliateId: customer.metadata.referred_by,
                amount: firstPaymentAmount,
                type: 'first_payment',
                referralId: customer.external_id,
            });
        }
    }

    async handleSubscriptionCanceled(data: any): Promise<void> {
        const { customer, subscription } = data;

        logger.info('Suscripción cancelada', {
            customerId: customer?.external_id,
            reason: subscription?.cancellation_reason,
        });

        // TODO: Pausar servicios, enviar encuesta de salida, etc.
    }
}

export const billingService = new BillingService();
