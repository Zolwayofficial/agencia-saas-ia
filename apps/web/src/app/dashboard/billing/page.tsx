'use client';

import { Suspense, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useSearchParams, useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';

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
        features: ['1 Nodo WhatsApp', '1,000 Mensajes / mes', 'Protocolos IA Basicos', 'Soporte por Email'],
        recommended: false,
    },
    {
        id: 'plan_pro',
        name: 'Professional',
        price: 79,
        features: ['3 Nodos WhatsApp', '10,000 Mensajes / mes', 'GPT-4 Avanzado', 'Soporte Prioritario', 'Marca Blanca'],
        recommended: true,
    },
    {
        id: 'plan_agency',
        name: 'Agency Elite',
        price: 199,
        features: ['10 Nodos WhatsApp', 'Mensajes Ilimitados', 'Agentes IA Personalizados', 'Acceso API Completo', 'Infraestructura Enterprise'],
        recommended: false,
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
            <div className="animate-pulse space-y-8 p-8 max-w-7xl mx-auto">
                <div className="h-10 w-64 bg-gray-100 rounded-lg" />
                <div className="grid grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-gray-100 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    const currentPlanName = sub?.plan?.name || 'Plan Gratuito';
    const isActive = sub?.status === 'active';

    return (
        <div className="animate-in max-w-7xl mx-auto">
            {/* Header section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 tracking-widest uppercase">
                            Facturacion
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold font-display tracking-tight text-gradient">Facturacion y Capacidad</h1>
                    <p className="text-muted text-sm mt-1 font-medium italic opacity-60">
                        Gestiona tus recursos y suscripcion.
                    </p>
                </div>
                {isActive && (
                    <button
                        className="btn-premium btn-premium-outline !py-2.5"
                        onClick={handlePortal}
                        disabled={!!processing}
                    >
                        <Icons.Settings size={14} />
                        Portal de Suscripcion
                    </button>
                )}
            </header>

            {/* Usage Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <div className="glass-panel stat-card-premium">
                    <div className="label">Plan Actual</div>
                    <div className="flex items-baseline gap-2 mb-3">
                        <span className="value text-gradient">{currentPlanName}</span>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest border ${isActive ? 'bg-success/5 text-success border-success/20' : 'bg-warning/5 text-warning border-warning/20'
                        }`}>
                        <div className={`w-1 h-1 rounded-full ${isActive ? 'bg-success' : 'bg-warning'}`} />
                        {isActive ? 'ACTIVO' : 'PENDIENTE'}
                    </div>
                </div>

                <div className="glass-panel stat-card-premium overflow-hidden">
                    <div className="label mb-2">Mensajes Utilizados</div>
                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="value">{sub?.messagesUsed.toLocaleString() || '0'}</span>
                        <span className="text-xs font-bold text-muted opacity-40 uppercase tracking-widest">
                            / {sub?.messagesLimit === -1 ? '∞' : sub?.messagesLimit.toLocaleString() || '1,000'}
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-50/50 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-primary transition-all duration-1000 shadow-[0_0_10px_rgba(var(--brand-primary-rgb),0.3)]"
                            style={{ width: `${Math.min(((sub?.messagesUsed || 0) / (sub?.messagesLimit || 1000)) * 100, 100)}%` }} />
                    </div>
                </div>

                <div className="glass-panel stat-card-premium overflow-hidden">
                    <div className="label mb-2">Ejecuciones IA</div>
                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="value">{sub?.agentRunsUsed.toLocaleString() || '0'}</span>
                        <span className="text-xs font-bold text-muted opacity-40 uppercase tracking-widest">
                            / {sub?.agentRunsLimit === -1 ? '∞' : sub?.agentRunsLimit.toLocaleString() || '100'}
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-50/50 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-primary transition-all duration-1000 shadow-[0_0_10px_rgba(var(--brand-primary-rgb),0.3)]"
                            style={{ width: `${Math.min(((sub?.agentRunsUsed || 0) / (sub?.agentRunsLimit || 100)) * 100, 100)}%` }} />
                    </div>
                </div>
            </section>

            {/* Plans Selection */}
            <div className="text-center mb-12">
                <h2 className="text-xs font-black tracking-[0.3em] text-muted uppercase mb-4 opacity-60 italic">Planes Disponibles</h2>
                <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-brand-primary to-transparent mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {PLANS.map((plan) => (
                    <div key={plan.id} className={`group relative glass-panel p-8 flex flex-col transition-all duration-500 hover:-translate-y-2 ${plan.recommended ? 'border-brand-primary/30 bg-gray-50/30' : 'border-gray-200'
                        }`}>
                        {plan.recommended && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-primary text-white text-[9px] font-black tracking-[0.2em] rounded-full uppercase shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.4)]">
                                Recomendado
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className="text-lg font-bold font-display text-header mb-1 group-hover:text-brand-primary transition-colors">{plan.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-header">${plan.price}</span>
                                <span className="text-xs font-bold text-muted uppercase tracking-widest opacity-40">/ mes</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-10 flex-1">
                            {plan.features.map((feat) => (
                                <div key={feat} className="flex items-start gap-3">
                                    <div className="mt-1 w-4 h-4 rounded-full bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
                                        <Icons.Check size={10} className="text-brand-primary" />
                                    </div>
                                    <span className="text-xs font-medium text-muted leading-tight">{feat}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            className={`btn-premium w-full !py-3.5 ${plan.recommended ? 'btn-premium-primary shadow-[0_10px_30px_-10px_rgba(var(--brand-primary-rgb),0.3)]' : 'btn-premium-outline'}`}
                            onClick={() => handleSubscribe(plan.id)}
                            disabled={!!processing || (isActive && sub?.plan?.name === plan.name)}
                        >
                            {processing === plan.id ? 'Procesando...' :
                                (isActive && sub?.plan?.name === plan.name) ? 'Plan Activo' : 'Seleccionar Plan'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function BillingPage() {
    return (
        <Suspense fallback={
            <div className="animate-pulse space-y-8 p-8 max-w-7xl mx-auto">
                <div className="h-10 w-64 bg-gray-100 rounded-lg" />
            </div>
        }>
            <BillingContent />
        </Suspense>
    );
}
