/**
 * Servicio de Afiliados - Gestión de referidos y comisiones
 */

import { logger } from '../utils/logger';

interface CommissionParams {
    affiliateId: string;
    amount: number;
    type: 'first_payment' | 'recurring' | 'bonus';
    referralId: string;
}

class AffiliateService {
    private defaultCommissionRate = 0.20; // 20%

    async processCommission(params: CommissionParams): Promise<void> {
        const { affiliateId, amount, type, referralId } = params;
        const commission = amount * this.defaultCommissionRate;

        logger.info(`Procesando comisión`, {
            affiliateId,
            amount,
            commission,
            type,
        });

        // TODO: Insertar en PostgreSQL
        // INSERT INTO commissions (affiliate_id, referral_id, amount, type, status)
        // VALUES ($1, $2, $3, $4, 'pending')

        // TODO: Actualizar totales del afiliado
        // UPDATE affiliates SET 
        //   total_earnings = total_earnings + $1,
        //   pending_payout = pending_payout + $1
        // WHERE id = $2

        logger.info(`Comisión registrada: $${commission.toFixed(2)} para afiliado ${affiliateId}`);
    }

    async generateReferralCode(userId: string): Promise<string> {
        // Generar código único de 8 caracteres
        const code = `REF${userId.substring(0, 4).toUpperCase()}${Date.now().toString(36).slice(-4).toUpperCase()}`;

        // TODO: Guardar en PostgreSQL
        // UPDATE users SET referral_code = $1 WHERE id = $2

        return code;
    }

    async getReferralStats(affiliateId: string): Promise<object> {
        // TODO: Consultar desde PostgreSQL
        return {
            totalReferrals: 0,
            convertedReferrals: 0,
            totalEarnings: 0,
            pendingPayout: 0,
            commissionRate: this.defaultCommissionRate,
        };
    }
}

export const affiliateService = new AffiliateService();
