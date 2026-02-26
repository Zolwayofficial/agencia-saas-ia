'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Icons } from '@/components/icons';
import Link from 'next/link';

// ── iOS primitives ────────────────────────────────────────────

function IOSCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', ...style }}>
            {children}
        </div>
    );
}

function SectionHeader({ children, sub }: { children: React.ReactNode; sub?: string }) {
    return (
        <div style={{ marginBottom: 8, marginTop: 28, paddingLeft: 4 }}>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0 }}>
                {children}
            </p>
            {sub && <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0', opacity: 0.7 }}>{sub}</p>}
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', fontSize: 15, borderRadius: 9,
    border: '1px solid rgba(60,60,67,0.18)', background: 'rgba(118,118,128,0.06)',
    color: '#000', fontFamily: 'inherit', outline: 'none', lineHeight: 1.4,
    boxSizing: 'border-box',
};

// ── Page ──────────────────────────────────────────────────────

export default function MarketingPage() {
    const [instances, setInstances] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [campaignName, setCampaignName] = useState('');
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Todas');

    useEffect(() => {
        api.getInstances()
            .then(data => setInstances(data.instances || []))
            .catch(() => setInstances([]))
            .finally(() => setLoading(false));
    }, []);

    const activeInstances = instances.filter(i =>
        i.status === 'open' || i.connectionEstado === 'CONNECTED'
    ).length;
    const warmupLevel = activeInstances > 0 ? 3 : 0;
    const FILTERS = ['Todas', 'Activas', 'Pausadas', 'Completadas'];

    if (loading) {
        return (
            <div style={{ maxWidth: 860, margin: '0 auto', padding: 8 }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ height: 80, borderRadius: 12, background: 'rgba(120,120,128,0.08)', marginBottom: 12 }} />
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
                        Crecimiento
                    </p>
                    <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5, color: '#000', lineHeight: 1.15, margin: 0 }}>
                        Motor de Campañas
                    </h1>
                    <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 400 }}>
                        Envío masivo inteligente con protección anti-bloqueo.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                        padding: '10px 20px', borderRadius: 10, border: 'none',
                        background: 'var(--brand-primary)', color: '#fff',
                        fontSize: 15, fontWeight: 600, cursor: 'pointer',
                        fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(52,201,123,0.3)',
                    }}
                >
                    <Icons.Plus size={17} />
                    Crear Campaña
                </button>
            </div>

            {/* ── Motor + Nodos ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 12 }}>

                {/* Motor de Envío */}
                <IOSCard style={{ padding: '18px 18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 10,
                            background: 'rgba(52,201,123,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--brand-primary)', flexShrink: 0,
                        }}>
                            <Icons.Rocket size={22} />
                        </div>
                        <div>
                            <p style={{ fontSize: 15, fontWeight: 600, color: '#000', margin: 0 }}>Estado del Motor de Envío</p>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '1px 0 0' }}>
                                Calibración de velocidad y protección activa
                            </p>
                        </div>
                    </div>

                    {/* Warmup bar */}
                    <div style={{ background: 'rgba(120,120,128,0.07)', borderRadius: 10, padding: '14px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                Canal de Calentamiento (Nivel {warmupLevel}/5)
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-primary)' }}>
                                {warmupLevel * 20}% Óptimo
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: 4, height: 6, marginBottom: 16 }}>
                            {[1,2,3,4,5].map(lv => (
                                <div key={lv} style={{
                                    flex: 1, borderRadius: 3,
                                    background: lv <= warmupLevel ? 'var(--brand-primary)' : 'rgba(120,120,128,0.15)',
                                    transition: 'background 0.4s',
                                }} />
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, paddingTop: 14, borderTop: '1px solid rgba(60,60,67,0.1)' }}>
                            {[
                                { label: 'Velocidad',   value: '120', unit: 'MSG/HR' },
                                { label: 'Rotación',    value: 'Activo', color: 'var(--brand-primary)' },
                                { label: 'Protección',  value: 'Alta', icon: true },
                            ].map(s => (
                                <div key={s.label}>
                                    <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', margin: '0 0 4px', opacity: 0.7 }}>
                                        {s.label}
                                    </p>
                                    <p style={{ fontSize: 17, fontWeight: 700, color: s.color ?? '#000', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {s.icon && <Icons.Security size={16} color="var(--brand-primary)" />}
                                        {s.value}
                                        {s.unit && <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginLeft: 3 }}>{s.unit}</span>}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </IOSCard>

                {/* Nodos disponibles */}
                <IOSCard style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', margin: '0 0 10px', opacity: 0.8 }}>
                            Nodos Disponibles
                        </p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
                            <span style={{ fontSize: 48, fontWeight: 700, color: '#000', letterSpacing: -2, lineHeight: 1 }}>
                                {activeInstances}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Nodos</span>
                        </div>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            fontSize: 12, fontWeight: 600, color: 'var(--brand-primary)',
                            background: 'rgba(52,201,123,0.1)', padding: '4px 10px', borderRadius: 20,
                        }}>
                            <Icons.WhatsApp size={13} />
                            {activeInstances} WhatsApp Listos
                        </div>
                    </div>
                    <Link
                        href="/dashboard/whatsapp"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            padding: '9px 14px', borderRadius: 9, marginTop: 16,
                            border: '1.5px solid rgba(52,201,123,0.35)',
                            background: 'rgba(52,201,123,0.06)',
                            color: 'var(--brand-primary)', fontSize: 13, fontWeight: 600,
                            textDecoration: 'none',
                        }}
                    >
                        Optimizar Nodos
                        <Icons.External size={13} />
                    </Link>
                </IOSCard>
            </div>

            {/* ── Historial de Campañas ── */}
            <SectionHeader sub="Registro de ejecución de campañas">Historial de Campañas</SectionHeader>

            {/* Segmented Control */}
            <div style={{ display: 'inline-flex', background: 'rgba(118,118,128,0.12)', borderRadius: 9, padding: 2, marginBottom: 12 }}>
                {FILTERS.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '6px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
                            fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
                            background: filter === f ? '#fff' : 'transparent',
                            color: filter === f ? '#000' : 'var(--text-secondary)',
                            boxShadow: filter === f ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                            transition: 'all 0.2s', outline: 'none',
                        }}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <IOSCard>
                {/* Table header */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 80px 80px',
                    padding: '10px 16px', borderBottom: '1px solid rgba(60,60,67,0.1)',
                    background: 'rgba(120,120,128,0.04)',
                }}>
                    {['Campaña', 'Canal', 'Estado', 'Enviados', 'Resultado'].map(h => (
                        <span key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {h}
                        </span>
                    ))}
                </div>
                {/* Empty state */}
                <div style={{ textAlign: 'center', padding: '60px 32px' }}>
                    <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.25 }}>🚀</div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', margin: 0, opacity: 0.5 }}>
                        No hay campañas creadas
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '6px 0 0', opacity: 0.4 }}>
                        Crea tu primera campaña para empezar a enviar mensajes masivos.
                    </p>
                </div>
            </IOSCard>

            <div style={{ height: 32 }} />

            {/* ── Modal Nueva Campaña ── */}
            {showModal && (
                <div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 100,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 20, background: 'rgba(0,0,0,0.4)',
                        backdropFilter: 'blur(8px)',
                    }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: '#fff', borderRadius: 16,
                            width: '100%', maxWidth: 480,
                            overflow: 'hidden',
                            boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
                        }}
                    >
                        {/* Modal header */}
                        <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(60,60,67,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ fontSize: 17, fontWeight: 600, color: '#000', margin: 0 }}>Nueva Campaña</p>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    width: 28, height: 28, borderRadius: '50%', border: 'none',
                                    background: 'rgba(120,120,128,0.12)', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--text-secondary)', fontSize: 16,
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal body */}
                        <div style={{ padding: '20px' }}>
                            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                                Nombre de la Campaña
                            </label>
                            <input
                                type="text"
                                value={campaignName}
                                onChange={e => setCampaignName(e.target.value)}
                                placeholder="Ej: Promo_Febrero_2026"
                                style={inputStyle}
                            />

                            <div style={{
                                marginTop: 16, padding: '12px 14px', borderRadius: 10,
                                background: 'rgba(52,201,123,0.07)',
                                border: '1px solid rgba(52,201,123,0.2)',
                            }}>
                                <p style={{ fontSize: 13, color: 'var(--brand-primary)', margin: 0, lineHeight: 1.5 }}>
                                    <strong>Nota:</strong> La rotación anti-bloqueo distribuirá automáticamente el tráfico entre todos los nodos WhatsApp autorizados para garantizar la seguridad y continuidad.
                                </p>
                            </div>
                        </div>

                        {/* Modal actions */}
                        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(60,60,67,0.1)', display: 'flex', gap: 10 }}>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    flex: 1, padding: '11px', borderRadius: 10,
                                    border: '1.5px solid rgba(60,60,67,0.2)',
                                    background: 'transparent', color: '#000',
                                    fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    flex: 1, padding: '11px', borderRadius: 10,
                                    border: 'none', background: 'var(--brand-primary)', color: '#fff',
                                    fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                                    boxShadow: '0 2px 8px rgba(52,201,123,0.3)',
                                }}
                            >
                                Crear Campaña
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
