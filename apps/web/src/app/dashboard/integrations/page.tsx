'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';

type IntegrationStatus = 'connected' | 'error' | 'setup';

interface Integration {
    id: string;
    name: string;
    icon: string;
    description: string;
    category: string;
    color: string;
    status: IntegrationStatus;
    detail: string;
    docs?: string;
}

const INTEGRATIONS: Integration[] = [
    // Core Platform
    { id: 'chatwoot', name: 'Chatwoot Enterprise', icon: '💬', description: 'Inbox multicanal · 10 canales · Enterprise features', category: 'Plataforma Core', color: '#1F93FF', status: 'connected', detail: 'Activo', docs: 'https://chatwoot.com/docs' },
    { id: 'evolution', name: 'Evolution API', icon: '📱', description: 'WhatsApp Business · Multi-instancia · SmartSend™', category: 'Plataforma Core', color: '#25D366', status: 'connected', detail: 'Activo', docs: 'https://doc.evolution-api.com' },
    { id: 'n8n', name: 'n8n Workflows', icon: '🔄', description: 'Automatización · 400+ nodos · No-code', category: 'Plataforma Core', color: '#EA4B71', status: 'connected', detail: 'Activo', docs: 'https://docs.n8n.io' },
    { id: 'livekit', name: 'LiveKit (Voz IA)', icon: '🎙️', description: 'Agente de voz · SIP Trunk · Whisper STT', category: 'Plataforma Core', color: '#6366f1', status: 'setup', detail: 'Configurable', docs: 'https://docs.livekit.io' },

    // AI
    { id: 'openai', name: 'OpenAI / GPT', icon: '🤖', description: 'LLM · GPT-4 · Embeddings · Function calling', category: 'Inteligencia Artificial', color: '#10a37f', status: 'connected', detail: 'Vía LiteLLM', docs: 'https://platform.openai.com/docs' },
    { id: 'litellm', name: 'LiteLLM Router', icon: '⚡', description: 'Proxy multi-modelo · Fallbacks · Cost tracking', category: 'Inteligencia Artificial', color: '#f59e0b', status: 'connected', detail: 'Activo', docs: 'https://docs.litellm.ai' },
    { id: 'whisper', name: 'Whisper STT', icon: '🎤', description: 'Transcripción de audio · Tiempo real', category: 'Inteligencia Artificial', color: '#8b5cf6', status: 'setup', detail: 'Configurable', docs: 'https://platform.openai.com/docs/guides/speech-to-text' },

    // Ecommerce & CRM
    { id: 'stripe', name: 'Stripe Payments', icon: '💳', description: 'Suscripciones · One-time · Facturas · Portal', category: 'Pagos & CRM', color: '#635BFF', status: 'connected', detail: 'Activo', docs: 'https://stripe.com/docs' },
    { id: 'shopify', name: 'Shopify', icon: '🛒', description: 'E-commerce · Pedidos · Inventario · Notificaciones', category: 'Pagos & CRM', color: '#95BF47', status: 'setup', detail: 'No configurado', docs: 'https://shopify.dev/docs' },
    { id: 'hubspot', name: 'HubSpot CRM', icon: '🏢', description: 'Contactos · Deals · Marketing automation', category: 'Pagos & CRM', color: '#FF7A59', status: 'setup', detail: 'No configurado', docs: 'https://developers.hubspot.com' },

    // Analytics & Scheduling
    { id: 'ganalytics', name: 'Google Analytics', icon: '📊', description: 'Tracking · Eventos · Reportes', category: 'Analytics & Scheduling', color: '#E37400', status: 'setup', detail: 'No configurado', docs: 'https://analytics.google.com' },
    { id: 'calendly', name: 'Calendly / OpenTable', icon: '📅', description: 'Citas · Reservas · Recordatorios', category: 'Analytics & Scheduling', color: '#006BFF', status: 'setup', detail: 'No configurado', docs: 'https://developer.calendly.com' },
];

const STATUS_CONFIG: Record<IntegrationStatus, { label: string; badgeClass: string; dot: string }> = {
    connected: { label: 'Conectado', badgeClass: 'success', dot: '#10b981' },
    error: { label: 'Error', badgeClass: 'danger', dot: '#ef4444' },
    setup: { label: 'Disponible', badgeClass: 'neutral', dot: 'var(--text-muted)' },
};

const CATEGORIES = [...new Set(INTEGRATIONS.map(i => i.category))];

export default function IntegrationsPage() {
    const [waInstances, setWaInstances] = useState<any[]>([]);
    const [filter, setFilter] = useState<IntegrationStatus | 'all'>('all');

    useEffect(() => {
        api.getInstances().then(d => setWaInstances(d.instances || [])).catch(() => { });
    }, []);

    // Enrich WA status based on actual instances
    const enriched = INTEGRATIONS.map(i =>
        i.id === 'evolution'
            ? { ...i, status: (waInstances.length > 0 ? 'connected' : 'setup') as IntegrationStatus, detail: waInstances.length > 0 ? `${waInstances.length} instancia(s)` : 'Sin instancias' }
            : i
    );

    const filtered = filter === 'all' ? enriched : enriched.filter(i => i.status === filter);
    const connectedCount = enriched.filter(i => i.status === 'connected').length;
    const errorCount = enriched.filter(i => i.status === 'error').length;

    return (
        <>
            <h1 className="page-title">🔗 Integraciones</h1>
            <p className="page-subtitle">
                {connectedCount} activas · {enriched.length - connectedCount} disponibles · Conecta toda tu pila tecnológica
            </p>

            {/* Summary Row */}
            <div className="grid-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1.5rem' }}>
                <div className="stat-card">
                    <div className="stat-label">✅ Activas</div>
                    <div className="stat-value" style={{ color: '#10b981' }}>{connectedCount}</div>
                    <div className="stat-detail">Integraciones funcionando</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">🔧 Disponibles</div>
                    <div className="stat-value" style={{ color: 'var(--text-muted)' }}>{enriched.filter(i => i.status === 'setup').length}</div>
                    <div className="stat-detail">Listas para configurar</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">⚠️ Con error</div>
                    <div className="stat-value" style={{ color: errorCount > 0 ? '#ef4444' : 'var(--text-muted)' }}>{errorCount}</div>
                    <div className="stat-detail">Requieren atención</div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {(['all', 'connected', 'setup', 'error'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={filter === f ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
                        style={{ textTransform: 'capitalize' }}
                    >
                        {f === 'all' ? `Todas (${enriched.length})` : f === 'connected' ? `Activas (${connectedCount})` : f === 'setup' ? `Disponibles (${enriched.filter(i => i.status === 'setup').length})` : `Errores (${errorCount})`}
                    </button>
                ))}
            </div>

            {/* Integration Cards by Category */}
            {CATEGORIES.map((cat) => {
                const items = filtered.filter(i => i.category === cat);
                if (items.length === 0) return null;
                return (
                    <div key={cat} style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                            {cat}
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                            {items.map((intg) => {
                                const sc = STATUS_CONFIG[intg.status];
                                return (
                                    <div key={intg.id} style={{
                                        padding: '1.25rem',
                                        background: intg.status === 'connected' ? `${intg.color}08` : 'var(--bg-glass)',
                                        border: `1px solid ${intg.status === 'connected' ? intg.color + '30' : 'var(--border-subtle)'}`,
                                        borderRadius: 'var(--radius-md)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.75rem',
                                        transition: 'all 0.15s ease',
                                    }}>
                                        {/* Header */}
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                            <div style={{
                                                width: 40, height: 40, borderRadius: 10,
                                                background: `${intg.color}18`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.25rem', flexShrink: 0,
                                            }}>
                                                {intg.icon}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{intg.name}</div>
                                                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.4, marginTop: '0.1rem' }}>{intg.description}</div>
                                            </div>
                                            <span className={`badge ${sc.badgeClass}`} style={{ flexShrink: 0, fontSize: '0.68rem' }}>
                                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.dot, display: 'inline-block', marginRight: '0.3rem' }} />
                                                {sc.label}
                                            </span>
                                        </div>

                                        {/* Footer */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                                            <span style={{ fontSize: '0.75rem', color: intg.status === 'connected' ? intg.color : 'var(--text-muted)', fontWeight: 500 }}>
                                                {intg.detail}
                                            </span>
                                            {intg.docs && (
                                                <a href={intg.docs} target="_blank" rel="noreferrer"
                                                    style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 500 }}>
                                                    Docs →
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </>
    );
}
