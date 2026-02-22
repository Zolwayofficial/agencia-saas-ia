'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';

// Professional SVG Icons
const Icons = {
    Link: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
    ),
    ChevronRight: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
    ),
    Info: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
    ),
};

const INTEGRATIONS = [
    { id: 'chatwoot', name: 'Chatwoot', cat: 'Plataforma Core', status: 'connected', desc: 'Omnicanalidad y soporte técnico avanzado' },
    { id: 'evolution', name: 'WhatsApp Evolution', cat: 'Plataforma Core', status: 'connected', desc: 'Motor de mensajería API para WhatsApp' },
    { id: 'n8n', name: 'n8n Workflow', cat: 'Plataforma Core', status: 'connected', desc: 'Automatización de flujos B2B complejos' },
    { id: 'openai', name: 'OpenAI (GPT-4)', cat: 'Inteligencia Artificial', status: 'connected', desc: 'Modelos de lenguaje para agentes inteligentes' },
    { id: 'livekit', name: 'LiveKit Voice', cat: 'Inteligencia Artificial', status: 'setup', desc: 'Agentes de voz en tiempo real con baja latencia' },
    { id: 'litellm', name: 'LiteLLM Proxy', cat: 'Inteligencia Artificial', status: 'connected', desc: 'Orquestación y balanceo de múltiples LLMs' },
    { id: 'stripe', name: 'Stripe Payments', cat: 'Pagos & CRM', status: 'setup', desc: 'Pasarela de pagos y gestión de suscripciones' },
    { id: 'shopify', name: 'Shopify Store', cat: 'Pagos & CRM', status: 'setup', desc: 'Integración de catálogo y pedidos e-commerce' },
    { id: 'hubspot', name: 'HubSpot CRM', cat: 'Pagos & CRM', status: 'setup', desc: 'Sincronización de leads y contactos de ventas' },
    { id: 'ga4', name: 'Google Analytics', cat: 'Analytics & Scheduling', status: 'connected', desc: 'Seguimiento de eventos y métricas de uso' },
    { id: 'calendly', name: 'Calendly', cat: 'Analytics & Scheduling', status: 'setup', desc: 'Agendamiento automático de citas y demos' },
    { id: 'opentable', name: 'OpenTable', cat: 'Analytics & Scheduling', status: 'setup', desc: 'Reservas automáticas para sector turismo/restaurante' },
];

export default function IntegrationsPage() {
    const [instances, setInstances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        api.getInstances()
            .then(data => setInstances(data.instances || []))
            .catch(() => setInstances([]))
            .finally(() => setLoading(false));
    }, []);

    const filtered = INTEGRATIONS.map(i => {
        if (i.id === 'evolution') return { ...i, status: instances.length > 0 ? 'connected' : 'setup' };
        return i;
    }).filter(i => {
        if (filter === 'All') return true;
        return i.status === filter.toLowerCase();
    });

    return (
        <>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icons.Link />
                    Integraciones & Conectores
                </h1>
                <p className="page-subtitle">Conecta tu ecosistema de herramientas para potenciar la automatización de tu agencia.</p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
                {['All', 'Connected', 'Setup', 'Error'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '0.6rem 1.25rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600,
                            background: filter === f ? 'var(--brand-primary)' : 'rgba(255,255,255,0.03)',
                            color: filter === f ? 'black' : 'rgba(255,255,255,0.6)',
                            border: '1px solid',
                            borderColor: filter === f ? 'var(--brand-primary)' : 'rgba(255,255,255,0.05)',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer'
                        }}
                    >
                        {f === 'All' ? 'Todas' : f === 'Connected' ? 'Conectadas' : f === 'Setup' ? 'Por Configurar' : 'Errores'}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {filtered.map(integration => (
                    <div key={integration.id} className="glass-card" style={{
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem',
                        transition: 'all 0.2s ease',
                        cursor: 'default',
                        border: integration.status === 'connected' ? '1px solid rgba(80, 205, 149, 0.15)' : '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: '12px', background: 'rgba(255,255,255,0.03)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: integration.status === 'connected' ? 'var(--brand-primary)' : 'rgba(255,255,255,0.4)',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <Icons.Link />
                            </div>
                            <span style={{
                                fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '100px',
                                background: integration.status === 'connected' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                                color: integration.status === 'connected' ? '#10b981' : 'var(--text-muted)',
                                border: `1px solid ${integration.status === 'connected' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)'}`
                            }}>
                                {integration.status === 'connected' ? 'ACTIVE' : 'READY TO SETUP'}
                            </span>
                        </div>

                        <div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>{integration.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 600, marginTop: '0.2rem', opacity: 0.8 }}>{integration.cat}</div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem', lineHeight: 1.5 }}>{integration.desc}</p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                            <button className="btn btn-ghost btn-sm" style={{ flex: 1, gap: '0.4rem', fontSize: '0.75rem' }}>
                                <Icons.Info /> Docs
                            </button>
                            <button className="btn btn-primary btn-sm" style={{
                                flex: 2,
                                background: integration.status === 'connected' ? 'rgba(255,255,255,0.05)' : 'var(--brand-primary)',
                                color: integration.status === 'connected' ? 'white' : 'black',
                                border: integration.status === 'connected' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                cursor: 'pointer'
                            }}>
                                {integration.status === 'connected' ? 'Configurado' : 'Configurar'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
