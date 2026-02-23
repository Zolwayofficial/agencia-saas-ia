import { Router } from 'express';
import { healthController } from '../controllers/health.controller';
import { authController } from '../controllers/auth.controller';
import { whatsappController } from '../controllers/whatsapp.controller';
import { agentController } from '../controllers/agent.controller';
import { webhookController } from '../controllers/webhook.controller';
import { billingController } from '../controllers/billing.controller';
import { referralController } from '../controllers/referral.controller';
import { stripeController } from '../controllers/stripe.controller';
import { authMiddleware } from '../middlewares/auth';
import { creditGuard } from '../middlewares/credit-guard';
import { requireWebhookAuth } from '../middlewares/webhook-auth';

const router: Router = Router();

// ─── Public ──────────────────────────────────────────
router.get('/health', healthController.check);

// ─── Auth (público, sin token) ───────────────────────
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// ─── Webhooks (no auth, validados por API key del servicio) ──
router.post('/webhooks/evolution', requireWebhookAuth, webhookController.evolution);
router.post('/webhooks/chatwoot', requireWebhookAuth, webhookController.chatwoot);

// ─── Protected (requiere auth) ───────────────────────
router.use(authMiddleware);

// Auth (protegido)
router.get('/auth/me', authController.me);

// Billing & Stripe
router.get('/billing/balance', billingController.getBalance);
router.get('/billing/history', billingController.getHistory);
router.get('/billing/plans', stripeController.getPlans);
router.get('/billing/subscription', stripeController.getSubscription);
router.post('/billing/checkout', stripeController.createCheckout);
router.post('/billing/portal', stripeController.createPortal);

// Referrals
router.get('/referrals/my-code', referralController.getMyCode);
router.get('/referrals/network', referralController.getNetwork);

// WhatsApp - Instance Management
router.post('/whatsapp/instances', whatsappController.createInstance);
router.get('/whatsapp/instances', whatsappController.listInstances);
router.get('/whatsapp/instances/:id/qr', whatsappController.getQrCode);
router.post('/whatsapp/instances/:id/logout', whatsappController.logoutInstance);
router.delete('/whatsapp/instances/:id', whatsappController.deleteInstance);

// WhatsApp - Messaging (requiere auth + saldo)
router.post('/whatsapp/send', creditGuard, whatsappController.send);

// Agents (requiere auth + saldo para ejecutar)
router.post('/agents/run', creditGuard, agentController.run);
router.get('/agents/tasks', agentController.getTasks);
router.get('/agents/tasks/:id', agentController.getTask);

export default router;
