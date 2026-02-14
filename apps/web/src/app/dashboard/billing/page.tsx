'use client';

import { useState, useEffect } from 'react';
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
        id: 'plan_starter', // Placeholder, se reemplazará con ID real de DB
        name: 'Starter',
        price: 29,
        features: ['1 WhatsApp', '1,000 Mensajes/mes', 'Respuestas IA Básicas', 'Soporte por Email'],
        recommended: false,
    },
    {
        id: 'plan_pro',
        name: 'Pro',
        price: 79,
        features: ['3 WhatsApps', '10,000 Mensajes/mes', 'IA Avanzada (GPT-4)', 'Soporte Prioritario', 'Remover marca de agua'],
        recommended: true,
    },
    {
        id: 'plan_agency',
        name: 'Agency',
        price: 199,
        features: ['10 WhatsApps', 'Ilimitado Mensajes', 'IA Personalizada', 'API Access', 'Marca Blanca total'],
        recommended: false,
    },
];

export default function BillingPage() {
    const [sub, setSub] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        fetchSubscription();
        if (searchParams.get('checkout') === 'success') {
            // Limpiar URL
            router.replace('/dashboard/billing');
            alert('✅ Suscripción activada correctamente');
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
        // En producción, buscaríamos el ID real del plan en la DB
        // Por ahora simulamos que el backend resuelve el plan correcto
        setProcessing(planId);
        try {
            // Primero obtenemos el ID real del plan desde la API (o usamos un mapping si ya lo tenemos)
            // Aquí asumimos que el backend maneja la lógica o que los IDs coinciden
            // Para este MVP, vamos a usar el ID que tenemos o buscarlo
            const { url } = await api.post('/billing/checkout', { planId });
            if (url) window.location.href = url;
        } catch (err: any) {
            alert('Error: ' + err.message);
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
            alert('Error: ' + err.message);
        } finally {
            setProcessing(null);
        }
    };

    if (loading) return <div className="page-loading">Cargando facturación...</div>;

    const currentPlanName = sub?.plan?.name || 'Gratuito';
    const isActive = sub?.status === 'active';

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">💳 Facturación y Planes</h1>
                    <p className="page-subtitle">Gestiona tu suscripción y métodos de pago</p>
                </div>
                {isActive && (
                    <button
                        className="btn btn-ghost"
                        onClick={handlePortal}
                        disabled={!!processing}
                    >
                        {processing === 'portal' ? 'Cargando...' : '⚙️ Gestionar Suscripción'}
                    </button>
                )}
            </div>

            {/* Usage Stats */}
            <div className="grid-3 mb-8">
                <div className="glass-card">
                    <h3>Plan Actual</h3>
                    <div className="text-2xl font-bold text-gradient-primary mb-2">{currentPlanName}</div>
                    <span className={`badge ${isActive ? 'success' : 'warning'}`}>
                        {sub?.status === 'active' ? 'Activo' : sub?.status || 'Inactivo'}
                    </span>
                </div>
                <div className="glass-card">
                    <h3>Mensajes WhatsApp</h3>
                    <div className="text-2xl font-bold mb-2">
                        {sub?.messagesUsed.toLocaleString()} / {sub?.messagesLimit === -1 ? '∞' : sub?.messagesLimit.toLocaleString()}
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${Math.min(((sub?.messagesUsed || 0) / (sub?.messagesLimit || 1)) * 100, 100)}%`
                            }}
                        ></div>
                    </div>
                </div>
                <div className="glass-card">
                    <h3>Respuestas IA</h3>
                    <div className="text-2xl font-bold mb-2">
                        {sub?.agentRunsUsed.toLocaleString()} / {sub?.agentRunsLimit === -1 ? '∞' : sub?.agentRunsLimit.toLocaleString()}
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${Math.min(((sub?.agentRunsUsed || 0) / (sub?.agentRunsLimit || 1)) * 100, 100)}%`
                            }}
                        ></div>
                    </div>
                </div>
            </div>

            <h2 className="section-title text-center mb-8">Planes Disponibles</h2>

            <div className="grid-3">
                {PLANS.map((plan) => (
                    <div key={plan.name} className={`glass-card plan-card ${plan.recommended ? 'recommended' : ''}`}>
                        {plan.recommended && <div className="plan-badge">RECOMENDADO</div>}
                        <h3 className="plan-name">{plan.name}</h3>
                        <div className="plan-price">
                            ${plan.price}<span className="text-sm text-muted">/mes</span>
                        </div>
                        <ul className="plan-features">
                            {plan.features.map((feat) => (
                                <li key={feat}>✓ {feat}</li>
                            ))}
                        </ul>
                        <button
                            className={`btn ${plan.recommended ? 'btn-primary' : 'btn-ghost'} w-full`}
                            onClick={() => handleSubscribe(plan.id)} // Aquí deberíamos pasar el ID real
                            disabled={!!processing || (isActive && sub?.plan?.name === plan.name)}
                        >
                            {processing === plan.id ? 'Procesando...' :
                                (isActive && sub?.plan?.name === plan.name) ? 'Plan Actual' : 'Suscribirse'}
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
}
