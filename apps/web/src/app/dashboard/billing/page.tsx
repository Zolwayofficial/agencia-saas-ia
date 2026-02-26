'use client';

import { Suspense, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useSearchParams, useRouter } from 'next/navigation';

interface Plan {
    id: string;
    name: string;
    priceMonthly: number;
    messagesIncluded: number;
    agentRunsIncluded: number;
    maxInstances: number;
}

interface Subscription {
    plan: Plan | null;
    status: string;
    messagesUsed: number;
    messagesLimit: number;
    agentRunsUsed: number;
    agentRunsLimit: number;
    billingCycleStart: string;
}

const PLANS = [
    {
        id: 'plan_starter',
        name: 'Starter',
        price: 29,
        features: ['1 Nodo WhatsApp', '1,000 Mensajes / mes', 'Protocolos IA Básicos', 'Soporte por Email'],
        recommended: false,
        color: '#34C759',
    },
    {
        id: 'plan_pro',
        name: 'Professional',
        price: 79,
        features: ['3 Nodos WhatsApp', '10,000 Mensajes / mes', 'GPT-4 Avanzado', 'Soporte Prioritario', 'Marca Blanca'],
        recommended: true,
        color: 'var(--brand-primary, #5abf8a)',
    },
    {
        id: 'plan_agency',
        name: 'Agency Elite',
        price: 199,
        features: ['10 Nodos WhatsApp', 'Mensajes Ilimitados', 'Agentes IA Personalizados', 'Acceso API Completo', 'Infraestructura Enterprise'],
        recommended: false,
        color: '#AF52DE',
    },
];

function BillingContent() {
    const [sub, setSub] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        fetchSubscription();
        if (searchParams.get('checkout') === 'success') {
            router.replace('/dashboard/billing');
        }
    }, [searchParams]);

    const fetchSubscription = async () => {
        try {
            const data = await api.get('/billing/subscription');
            setSub(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (planId: string) => {
        setProcessing(planId);
        try {
            const { url } = await api.post('/billing/checkout', { planId });
            if (url) window.location.href = url;
        } catch (err: any) {
            console.error(err);
        } finally {
            setProcessing(null);
        }
    };

    const handlePortal = async () => {
        setProcessing('portal');
        try {
            const { url } = await api.post('/billing/portal', {});
            if (url) window.location.href = url;
        } catch (err: any) {
            console.error(err);
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '24px', background: '#F2F2F7', minHeight: '100vh' }}>
                <div style={{ height: 32, width: 200, background: '#E5E5EA', borderRadius: 8, marginBottom: 24 }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ height: 110, background: '#E5E5EA', borderRadius: 12 }} />
                    ))}
                </div>
            </div>
        );
    }

    const currentPlanName = sub?.plan?.name || 'Plan Gratuito';
    const isActive = sub?.status === 'active';
    const messagesUsed = sub?.messagesUsed || 0;
    const messagesLimit = sub?.messagesLimit || 1000;
    const runsUsed = sub?.agentRunsUsed || 0;
    const runsLimit = sub?.agentRunsLimit || 100;
    const messagesPct = Math.min((messagesUsed / messagesLimit) * 100, 100);
    const runsPct = Math.min((runsUsed / runsLimit) * 100, 100);

    return (
        <div style={{ background: '#F2F2F7', minHeight: '100vh', padding: '28px 24px 48px', fontFamily: '-apple-system, "Inter", sans-serif' }}>

            {/* Page Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                        Facturación
                    </p>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1C1C1E', letterSpacing: -0.5, margin: 0 }}>
                        Plan y Capacidad
                    </h1>
                </div>
                {isActive && (
                    <button
                        onClick={handlePortal}
                        disabled={!!processing}
                        style={{
                            background: 'var(--brand-primary, #5abf8a)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 20,
                            padding: '9px 18px',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            opacity: processing ? 0.6 : 1,
                        }}
                    >
                        Gestionar suscripción
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>

                {/* Plan Actual */}
                <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <p style={{ fontSize: 12, fontWeight: 500, color: '#8E8E93', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Plan Actual
                    </p>
                    <p style={{ fontSize: 22, fontWeight: 700, color: '#1C1C1E', margin: '0 0 10px' }}>
                        {currentPlanName}
                    </p>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: isActive ? 'rgba(52,199,89,0.12)' : 'rgba(255,149,0,0.12)',
                        color: isActive ? '#34C759' : '#FF9500',
                        borderRadius: 20, padding: '3px 10px',
                        fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                    }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? '#34C759' : '#FF9500', display: 'inline-block' }} />
                        {isActive ? 'ACTIVO' : 'PENDIENTE'}
                    </span>
                </div>

                {/* Mensajes */}
                <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <p style={{ fontSize: 12, fontWeight: 500, color: '#8E8E93', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Mensajes
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
                        <span style={{ fontSize: 28, fontWeight: 700, color: '#1C1C1E' }}>{messagesUsed.toLocaleString()}</span>
                        <span style={{ fontSize: 13, color: '#8E8E93' }}>/ {messagesLimit === -1 ? '∞' : messagesLimit.toLocaleString()}</span>
                    </div>
                    <div style={{ height: 4, background: '#F2F2F7', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${messagesPct}%`, background: messagesPct > 80 ? '#FF3B30' : 'var(--brand-primary, #5abf8a)', borderRadius: 2, transition: 'width 0.6s ease' }} />
                    </div>
                </div>

                {/* Ejecuciones IA */}
                <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <p style={{ fontSize: 12, fontWeight: 500, color: '#8E8E93', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Ejecuciones IA
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
                        <span style={{ fontSize: 28, fontWeight: 700, color: '#1C1C1E' }}>{runsUsed.toLocaleString()}</span>
                        <span style={{ fontSize: 13, color: '#8E8E93' }}>/ {runsLimit === -1 ? '∞' : runsLimit.toLocaleString()}</span>
                    </div>
                    <div style={{ height: 4, background: '#F2F2F7', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${runsPct}%`, background: runsPct > 80 ? '#FF3B30' : '#AF52DE', borderRadius: 2, transition: 'width 0.6s ease' }} />
                    </div>
                </div>
            </div>

            {/* Section Header */}
            <p style={{ fontSize: 13, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, paddingLeft: 4 }}>
                Planes Disponibles
            </p>

            {/* Plan Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {PLANS.map((plan) => {
                    const isCurrentPlan = isActive && sub?.plan?.name === plan.name;
                    return (
                        <div key={plan.id} style={{
                            background: '#fff',
                            borderRadius: 16,
                            padding: '24px 20px 20px',
                            boxShadow: plan.recommended
                                ? `0 4px 20px rgba(0,122,255,0.12)`
                                : '0 1px 3px rgba(0,0,0,0.06)',
                            border: plan.recommended ? '2px solid var(--brand-primary, #5abf8a)' : '1px solid rgba(60,60,67,0.1)',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            {plan.recommended && (
                                <div style={{
                                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                                    background: 'var(--brand-primary, #5abf8a)', color: '#fff',
                                    fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                                    padding: '4px 12px', borderRadius: 20,
                                    textTransform: 'uppercase', whiteSpace: 'nowrap',
                                }}>
                                    Más Popular
                                </div>
                            )}

                            {/* Plan name + price */}
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: plan.color, display: 'inline-block', flexShrink: 0 }} />
                                    <span style={{ fontSize: 16, fontWeight: 700, color: '#1C1C1E' }}>{plan.name}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                    <span style={{ fontSize: 36, fontWeight: 800, color: '#1C1C1E', letterSpacing: -1 }}>${plan.price}</span>
                                    <span style={{ fontSize: 13, color: '#8E8E93', fontWeight: 500 }}>/mes</span>
                                </div>
                            </div>

                            {/* Separator */}
                            <div style={{ height: 1, background: 'rgba(60,60,67,0.1)', marginBottom: 16 }} />

                            {/* Features */}
                            <div style={{ flex: 1, marginBottom: 20 }}>
                                {plan.features.map((feat) => (
                                    <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid rgba(60,60,67,0.06)' }}>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <circle cx="8" cy="8" r="8" fill={plan.color} fillOpacity="0.12" />
                                            <path d="M5 8l2 2 4-4" stroke={plan.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span style={{ fontSize: 13, color: '#3C3C43', fontWeight: 500 }}>{feat}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Button */}
                            <button
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={!!processing || isCurrentPlan}
                                style={{
                                    width: '100%',
                                    padding: '13px',
                                    borderRadius: 12,
                                    border: 'none',
                                    background: isCurrentPlan
                                        ? 'rgba(60,60,67,0.08)'
                                        : plan.recommended
                                            ? 'var(--brand-primary, #5abf8a)'
                                            : `rgba(0,122,255,0.08)`,
                                    color: isCurrentPlan
                                        ? '#8E8E93'
                                        : plan.recommended
                                            ? '#fff'
                                            : 'var(--brand-primary, #5abf8a)',
                                    fontSize: 15,
                                    fontWeight: 600,
                                    cursor: isCurrentPlan ? 'default' : 'pointer',
                                    opacity: processing === plan.id ? 0.6 : 1,
                                    transition: 'opacity 0.2s',
                                    fontFamily: '-apple-system, "Inter", sans-serif',
                                }}
                            >
                                {processing === plan.id
                                    ? 'Procesando...'
                                    : isCurrentPlan
                                        ? '✓ Plan Actual'
                                        : 'Seleccionar Plan'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function BillingPage() {
    return (
        <Suspense fallback={
            <div style={{ padding: 24, background: '#F2F2F7', minHeight: '100vh' }}>
                <div style={{ height: 32, width: 200, background: '#E5E5EA', borderRadius: 8 }} />
            </div>
        }>
            <BillingContent />
        </Suspense>
    );
}
