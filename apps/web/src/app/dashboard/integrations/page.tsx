'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Icons } from '@/components/icons';

const INTEGRATIONS = [
    { id: 'chatwoot',  name: 'Chatwoot',           cat: 'Infraestructura Principal', status: 'connected', desc: 'Plataforma omnicanal de soporte y atención al cliente.',                color: '#1F93FF' },
    { id: 'evolution', name: 'WhatsApp Evolution',  cat: 'Infraestructura Principal', status: 'connected', desc: 'API de mensajería para nodos WhatsApp.',                               color: '#25D366' },
    { id: 'n8n',       name: 'n8n Workflow',         cat: 'Infraestructura Principal', status: 'connected', desc: 'Automatización de flujos de trabajo y lógica multi-paso.',             color: '#EA4B71' },
    { id: 'openai',    name: 'OpenAI (GPT-4)',        cat: 'Modelos IA',                status: 'connected', desc: 'Modelo de lenguaje avanzado para agentes IA autónomos.',              color: '#10A37F' },
    { id: 'livekit',   name: 'LiveKit Voice',         cat: 'Modelos IA',                status: 'setup',     desc: 'Agentes de voz en tiempo real de baja latencia.',                    color: '#FF6B35' },
    { id: 'litellm',   name: 'LiteLLM Proxy',         cat: 'Modelos IA',                status: 'connected', desc: 'Orquestación y balanceo de carga entre proveedores de modelos.',     color: '#7C3AED' },
    { id: 'stripe',    name: 'Stripe Payments',       cat: 'Pagos y CRM',               status: 'setup',     desc: 'Pasarela de pagos y gestión de suscripciones.',                      color: '#635BFF' },
    { id: 'shopify',   name: 'Shopify Store',          cat: 'Pagos y CRM',               status: 'setup',     desc: 'Integración nativa con catálogo y logística e-commerce.',           color: '#96BF48' },
    { id: 'hubspot',   name: 'HubSpot CRM',            cat: 'Pagos y CRM',               status: 'setup',     desc: 'Sincronización y seguimiento de leads de ventas.',                  color: '#FF7A59' },
    { id: 'ga4',       name: 'Google Analytics',       cat: 'Herramientas',              status: 'connected', desc: 'Telemetría de eventos y métricas de uso.',                          color: '#F9AB00' },
    { id: 'calendly',  name: 'Calendly',               cat: 'Herramientas',              status: 'setup',     desc: 'Programación autónoma de demos y citas.',                           color: '#006BFF' },
    { id: 'opentable', name: 'OpenTable',              cat: 'Herramientas',              status: 'setup',     desc: 'Integración con sistema de reservas para restaurantes.',            color: '#DA3743' },
];

const CATEGORIES = ['Infraestructura Principal', 'Modelos IA', 'Pagos y CRM', 'Herramientas'];

function IOSCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', ...style }}>{children}</div>;
}

function SectionHeader({ children }: { children: React.ReactNode }) {
    return (
        <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: '28px 0 8px 4px' }}>
            {children}
        </p>
    );
}

export default function IntegrationsPage() {
    const [instances, setInstances] = useState<any[]>([]);
    const [loading,   setLoading]   = useState(true);
    const [filter,    setFilter]    = useState('Todas');

    useEffect(() => {
        api.getInstances()
            .then(data => setInstances(data.instances || []))
            .catch(() => setInstances([]))
            .finally(() => setLoading(false));
    }, []);

    const list = INTEGRATIONS.map(i =>
        i.id === 'evolution' ? { ...i, status: instances.length > 0 ? 'connected' : 'setup' } : i
    );

    const filtered = filter === 'Todas'     ? list
                   : filter === 'Activas'   ? list.filter(i => i.status === 'connected')
                   : list.filter(i => i.status === 'setup');

    const connectedCount = list.filter(i => i.status === 'connected').length;

    if (loading) {
        return (
            <div style={{ maxWidth: 860, margin: '0 auto' }}>
                {[1,2,3].map(i => (
                    <div key={i} style={{ height: 72, borderRadius: 12, background: 'rgba(120,120,128,0.08)', marginBottom: 10 }} />
                ))}
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 860, margin: '0 auto' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--brand-primary)', marginBottom: 6 }}>
                        Integraciones
                    </p>
                    <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5, color: '#000', lineHeight: 1.15, margin: 0 }}>
                        Integraciones
                    </h1>
                    <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 4 }}>
                        Conecta tu plataforma con servicios de terceros.
                    </p>
                </div>
                {/* Active count badge */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px', borderRadius: 20,
                    background: 'rgba(52,201,123,0.1)', border: '1px solid rgba(52,201,123,0.25)',
                    fontSize: 13, fontWeight: 600, color: 'var(--brand-primary)',
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-primary)', display: 'inline-block' }} />
                    {connectedCount} de {list.length} activas
                </div>
            </div>

            {/* ── Segmented Control ── */}
            <div style={{ display: 'inline-flex', background: 'rgba(118,118,128,0.12)', borderRadius: 9, padding: 2, marginBottom: 20 }}>
                {['Todas', 'Activas', 'Pendientes'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: '6px 18px', borderRadius: 7, border: 'none', cursor: 'pointer',
                        fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
                        background: filter === f ? '#fff' : 'transparent',
                        color: filter === f ? '#000' : 'var(--text-secondary)',
                        boxShadow: filter === f ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                        transition: 'all 0.2s', outline: 'none',
                    }}>
                        {f}
                    </button>
                ))}
            </div>

            {/* ── Grouped by category ── */}
            {CATEGORIES.map(cat => {
                const items = filtered.filter(i => i.cat === cat);
                if (items.length === 0) return null;
                return (
                    <div key={cat}>
                        <SectionHeader>{cat}</SectionHeader>
                        <IOSCard>
                            {items.map((item, idx) => (
                                <div key={item.id} style={{
                                    display: 'flex', alignItems: 'center', gap: 14,
                                    padding: '13px 16px',
                                    borderBottom: idx < items.length - 1 ? '1px solid rgba(60,60,67,0.1)' : 'none',
                                }}>
                                    {/* Color dot icon */}
                                    <div style={{
                                        width: 38, height: 38, borderRadius: 9, flexShrink: 0,
                                        background: `${item.color}18`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Icons.Link size={18} color={item.color} />
                                    </div>

                                    {/* Text */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 15, fontWeight: 500, color: '#000', margin: 0 }}>{item.name}</p>
                                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '1px 0 0' }}>{item.desc}</p>
                                    </div>

                                    {/* Status + action */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                                        <span style={{
                                            display: 'flex', alignItems: 'center', gap: 4,
                                            fontSize: 12, fontWeight: 600,
                                            color: item.status === 'connected' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                                        }}>
                                            <span style={{
                                                width: 6, height: 6, borderRadius: '50%', display: 'inline-block',
                                                background: item.status === 'connected' ? 'var(--brand-primary)' : 'rgba(120,120,128,0.4)',
                                            }} />
                                            {item.status === 'connected' ? 'Activo' : 'Pendiente'}
                                        </span>

                                        <button style={{
                                            padding: '6px 14px', borderRadius: 8, border: 'none',
                                            cursor: 'pointer', fontFamily: 'inherit',
                                            fontSize: 13, fontWeight: 600,
                                            background: item.status === 'connected'
                                                ? 'rgba(120,120,128,0.1)'
                                                : 'var(--brand-primary)',
                                            color: item.status === 'connected' ? 'var(--text-secondary)' : '#fff',
                                            transition: 'opacity 0.15s',
                                        }}>
                                            {item.status === 'connected' ? 'Configurar' : 'Activar'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </IOSCard>
                    </div>
                );
            })}

            {/* ── Solicitar integración ── */}
            <div style={{
                marginTop: 24, padding: '14px 18px', borderRadius: 12,
                border: '1.5px dashed rgba(60,60,67,0.2)',
                display: 'flex', alignItems: 'center', gap: 14,
                background: 'rgba(120,120,128,0.03)',
            }}>
                <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(120,120,128,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-secondary)',
                }}>
                    <Icons.Plus size={18} />
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 500, color: '#000', margin: 0 }}>Solicitar Integración</p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '1px 0 0' }}>
                        Solicita una integración personalizada para tu negocio.
                    </p>
                </div>
                <button style={{
                    padding: '7px 16px', borderRadius: 9,
                    border: '1.5px solid rgba(52,201,123,0.35)',
                    background: 'rgba(52,201,123,0.06)',
                    color: 'var(--brand-primary)',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                    Solicitar
                </button>
            </div>

            <div style={{ height: 32 }} />
        </div>
    );
}
