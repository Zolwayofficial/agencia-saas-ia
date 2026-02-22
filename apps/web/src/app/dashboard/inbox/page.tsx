'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import Link from 'next/link';

const ALL_CHANNELS = [
    {
        id: 'whatsapp', name: 'WhatsApp Business', icon: '📱', color: '#25D366',
        description: 'Instancias vía Evolution API', setup: true,
        docs: 'https://chatwoot.com/docs', configPath: '/dashboard/whatsapp',
    },
    {
        id: 'instagram', name: 'Instagram DM', icon: '📸', color: '#E1306C',
        description: 'Mensajes directos de Instagram', setup: false,
        docs: 'https://chatwoot.com/docs', configPath: '#',
    },
    {
        id: 'telegram', name: 'Telegram', icon: '✈️', color: '#0088cc',
        description: 'Bot de Telegram', setup: false,
        docs: 'https://chatwoot.com/docs', configPath: '#',
    },
    {
        id: 'facebook', name: 'Facebook Messenger', icon: '💬', color: '#1877F2',
        description: 'Mensajes de página de Facebook', setup: false,
        docs: 'https://chatwoot.com/docs', configPath: '#',
    },
    {
        id: 'email', name: 'Email (IMAP/SMTP)', icon: '📧', color: '#EA4335',
        description: 'Bandeja de email empresarial', setup: false,
        docs: 'https://chatwoot.com/docs', configPath: '#',
    },
    {
        id: 'twitter', name: 'X / Twitter DM', icon: '🐦', color: '#1DA1F2',
        description: 'Mensajes directos de X', setup: false,
        docs: 'https://chatwoot.com/docs', configPath: '#',
    },
    {
        id: 'line', name: 'LINE', icon: '💚', color: '#00B900',
        description: 'Mensajería LINE Business', setup: false,
        docs: 'https://chatwoot.com/docs', configPath: '#',
    },
    {
        id: 'sms', name: 'SMS / Twilio', icon: '📟', color: '#F22F46',
        description: 'SMS masivos con Twilio', setup: false,
        docs: 'https://chatwoot.com/docs', configPath: '#',
    },
];

const INBOX_STATS = [
    { label: 'Abiertas', value: '--', icon: '📂', color: '#f59e0b' },
    { label: 'Resueltas Hoy', value: '--', icon: '✅', color: '#10b981' },
    { label: 'Pendientes', value: '--', icon: '⏳', color: '#3b82f6' },
    { label: 'Sin Asignar', value: '--', icon: '🔴', color: '#ef4444' },
];

export default function InboxPage() {
    const [instances, setInstances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [chatwootUrl] = useState<string>(
        typeof window !== 'undefined' && window.location.hostname.includes('fulllogin')
            ? 'https://chat.fulllogin.com'
            : '#'
    );

    useEffect(() => {
        api.getInstances()
            .then((data) => setInstances(data.instances || []))
            .catch(() => setInstances([]))
            .finally(() => setLoading(false));
    }, []);

    const enriched = ALL_CHANNELS.map((ch) =>
        ch.id === 'whatsapp'
            ? { ...ch, setup: instances.length > 0, subLabel: `${instances.length} instancia(s)` }
            : { ...ch, subLabel: 'Sin conectar' }
    );

    const connected = enriched.filter((c) => c.setup).length;

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                    <h1 className="page-title">💬 Inbox Multicanal</h1>
                    <p className="page-subtitle">
                        Todos tus canales de comunicación en un solo lugar · powered by <strong>Chatwoot Enterprise</strong>
                    </p>
                </div>
                {chatwootUrl !== '#' && (
                    <a href={chatwootUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                        Abrir Chatwoot →
                    </a>
                )}
            </div>

            {/* Stats */}
            <div className="grid-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
                {INBOX_STATS.map((s) => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-label">{s.icon} {s.label}</div>
                        <div className="stat-value" style={{ color: s.color, fontSize: '1.75rem' }}>{s.value}</div>
                        <div className="stat-detail">Requiere Chatwoot conectado</div>
                    </div>
                ))}
            </div>

            {/* Channels Grid */}
            <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>
                        📡 Canales Disponibles
                        <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                            {connected} de {enriched.length} conectados
                        </span>
                    </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                    {enriched.map((ch) => (
                        <div key={ch.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem 1.25rem',
                            background: ch.setup ? `${ch.color}10` : 'var(--bg-elevated)',
                            border: `1px solid ${ch.setup ? ch.color + '50' : 'var(--border-subtle)'}`,
                            borderRadius: 'var(--radius-sm)',
                            position: 'relative',
                        }}>
                            <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{ch.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{ch.name}</div>
                                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{ch.description}</div>
                                <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: ch.setup ? ch.color : 'var(--text-muted)', fontWeight: 500 }}>
                                    {(ch as any).subLabel}
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.7rem', fontWeight: 600,
                                    background: ch.setup ? 'rgba(16,185,129,0.15)' : 'rgba(148,163,184,0.12)',
                                    color: ch.setup ? '#10b981' : 'var(--text-muted)',
                                }}>
                                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                                    {ch.setup ? 'Conectado' : 'Disponible'}
                                </span>
                                {ch.setup ? (
                                    <Link href={ch.configPath} style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', textDecoration: 'none' }}>
                                        Gestionar →
                                    </Link>
                                ) : (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Próximamente</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chatwoot Embed CTA */}
            <div className="glass-card" style={{
                background: 'linear-gradient(135deg, rgba(80,205,149,0.08), rgba(61,184,131,0.04))',
                border: '1px solid rgba(80,205,149,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
            }}>
                <div style={{ fontSize: '3rem' }}>🏆</div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                        Chatwoot Enterprise — incluido en tu plan
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Bandeja unificada, asignación de agentes, respuestas rápidas, notas privadas, reportes CSAT, etiquetas, y más.
                        Accede directamente desde tu subdominio de Chatwoot.
                    </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {chatwootUrl !== '#' ? (
                        <a href={chatwootUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
                            Abrir Chatwoot
                        </a>
                    ) : (
                        <button className="btn btn-primary" disabled style={{ opacity: 0.5 }}>
                            chat.tu-dominio.com
                        </button>
                    )}
                    <a href="https://www.chatwoot.com/docs/user-guide" target="_blank" rel="noreferrer"
                        style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none', textAlign: 'center' }}>
                        Ver documentación →
                    </a>
                </div>
            </div>
        </>
    );
}
