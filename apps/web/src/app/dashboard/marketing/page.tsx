'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';

const WARMUP_LEVELS = [
    { level: 1, label: 'Calentando', desc: '20 msgs/día — Inicio seguro', max: 20, color: '#f59e0b' },
    { level: 2, label: 'Creciendo', desc: '50 msgs/día — Sin riesgo', max: 50, color: '#3b82f6' },
    { level: 3, label: 'Activo', desc: '150 msgs/día — Estable', max: 150, color: '#8b5cf6' },
    { level: 4, label: 'Óptimo', desc: '400 msgs/día — Alta velocidad', max: 400, color: '#10b981' },
    { level: 5, label: 'Máximo', desc: '1000+ msgs/día — Elite', max: 1000, color: '#50CD95' },
];

const CAMPAIGN_STATUSES = [
    { label: 'Activas', value: 0, color: '#10b981' },
    { label: 'Programadas', value: 0, color: '#3b82f6' },
    { label: 'Completadas', value: 0, color: 'var(--text-muted)' },
    { label: 'Pausadas', value: 0, color: '#f59e0b' },
];

export default function MarketingPage() {
    const [instances, setInstances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [campaignName, setCampaignName] = useState('');
    const [campaignChannel, setCampaignChannel] = useState('whatsapp');

    useEffect(() => {
        api.getInstances()
            .then((d) => setInstances(d.instances || []))
            .catch(() => setInstances([]))
            .finally(() => setLoading(false));
    }, []);

    const activeInstances = instances.filter(i => i.status === 'CONNECTED' || i.state === 'open');

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                    <h1 className="page-title">🚀 Marketing & Campañas</h1>
                    <p className="page-subtitle">SmartSend™ · Envío masivo seguro · Anti-ban · Programación inteligente</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                    + Nueva Campaña
                </button>
            </div>

            {/* SmartSend Status */}
            <div className="glass-card" style={{
                marginBottom: '1.5rem',
                background: 'linear-gradient(135deg, rgba(80,205,149,0.06), rgba(61,184,131,0.02))',
                border: '1px solid rgba(80,205,149,0.15)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        background: 'rgba(80,205,149,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem',
                    }}>🛡️</div>
                    <div>
                        <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>SmartSend™ — Sistema Anti-Ban</h2>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            Warmup automático · Jitter de tiempo · Rotación de instancias · Límites adaptativos
                        </p>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                        <span className="badge success">
                            <span className="pulse-dot" />
                            {activeInstances.length > 0 ? 'Activo' : 'Listo'}
                        </span>
                    </div>
                </div>

                {/* Warmup Levels */}
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    NIVELES DE WARMUP
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                    {WARMUP_LEVELS.map((w, i) => (
                        <div key={w.level} style={{
                            padding: '0.75rem',
                            background: i === 0 ? `${w.color}15` : 'var(--bg-elevated)',
                            border: `1px solid ${i === 0 ? w.color + '50' : 'var(--border-subtle)'}`,
                            borderRadius: 'var(--radius-sm)',
                        }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: w.color, marginBottom: '0.2rem' }}>Nivel {w.level}</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>{w.label}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>{w.desc}</div>
                        </div>
                    ))}
                </div>

                {/* Instances */}
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        INSTANCIAS DISPONIBLES PARA ENVÍO ({instances.length})
                    </h3>
                    {loading ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Cargando...</p>
                    ) : instances.length === 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No hay instancias conectadas.</span>
                            <a href="/dashboard/whatsapp" style={{ color: 'var(--brand-primary)', fontSize: '0.85rem', textDecoration: 'none' }}>
                                Conectar WhatsApp →
                            </a>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {instances.map((inst) => (
                                <span key={inst.id} style={{
                                    padding: '0.3rem 0.75rem',
                                    background: 'rgba(80,205,149,0.1)',
                                    border: '1px solid rgba(80,205,149,0.3)',
                                    borderRadius: '9999px',
                                    fontSize: '0.8rem',
                                    color: 'var(--brand-primary)',
                                    fontWeight: 500,
                                }}>
                                    📱 {inst.name || inst.instanceName || inst.id}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Campaign Stats */}
            <div className="grid-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
                {CAMPAIGN_STATUSES.map((s) => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                        <div className="stat-detail">campañas</div>
                    </div>
                ))}
            </div>

            {/* Empty campaigns */}
            <div className="glass-card">
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>📋 Campañas</h2>
                <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Crea tu primera campaña</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: 400, margin: '0 auto 1.5rem' }}>
                        Envía mensajes masivos con SmartSend™: warmup automático, anti-ban, jitter de tiempo y rotación de números.
                    </p>
                    <button onClick={() => setShowModal(true)} className="btn btn-primary">
                        + Nueva Campaña
                    </button>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>🚀 Nueva Campaña SmartSend™</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body" style={{ alignItems: 'stretch' }}>
                            <div className="form-group">
                                <label className="form-label">Nombre de la campaña</label>
                                <input
                                    className="form-input"
                                    placeholder="Ej: Promo Diciembre 2026"
                                    value={campaignName}
                                    onChange={(e) => setCampaignName(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Canal</label>
                                <select
                                    className="form-input"
                                    value={campaignChannel}
                                    onChange={(e) => setCampaignChannel(e.target.value)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <option value="whatsapp">📱 WhatsApp</option>
                                    <option value="sms" disabled>📟 SMS (próximamente)</option>
                                    <option value="email" disabled>📧 Email (próximamente)</option>
                                </select>
                            </div>
                            <div style={{ padding: '0.75rem 1rem', background: 'rgba(80,205,149,0.08)', border: '1px solid rgba(80,205,149,0.2)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                💡 <strong>SmartSend™</strong> aplicará warmup automático y distribución inteligente para proteger tus números.
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => setShowModal(false)}>
                                Crear Campaña (próximamente)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
