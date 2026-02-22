'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';

// Professional SVG Icons
const Icons = {
    MessageSquare: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
    ),
    Smartphone: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
    ),
    ExternalLink: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" x2="21" y1="14" y2="3" /></svg>
    ),
    Zap: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#50CD95" stroke="#50CD95" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
    ),
};

const CHANNEL_ICONS: Record<string, ((props: any) => JSX.Element)> = {
    whatsapp: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 16.92v3c0 1.1-.9 2-2 2a18.75 18.75 0 0 1-8.28-2.95 18.23 18.23 0 0 1-5.75-5.75A18.75 18.75 0 0 1 2.08 4c0-1.1.9-2 2-2h3c1.1 0 2 .9 2 2 0 .5-.2 1-.5 1.4L6.75 6.75a9 9 0 0 0 8.5 8.5l1.35-1.83c.4-.3.9-.5 1.4-.5 1.1 0 2 .9 2 2z" /></svg>
    ),
    instagram: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
    ),
    telegram: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
    ),
    facebook: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
    ),
    email: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
    ),
    twitter: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
    ),
    line: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8Z" /></svg>
    ),
    sms: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8Z" /><path d="m22 9-10 7L2 9" /></svg>
    ),
};

const CHANNELS = [
    { id: 'whatsapp', name: 'WhatsApp', icon: CHANNEL_ICONS.whatsapp, color: '#25D366', status: 'connected' },
    { id: 'instagram', name: 'Instagram DM', icon: CHANNEL_ICONS.instagram, color: '#E1306C', status: 'setup' },
    { id: 'telegram', name: 'Telegram', icon: CHANNEL_ICONS.telegram, color: '#0088cc', status: 'setup' },
    { id: 'facebook', name: 'Facebook Messenger', icon: CHANNEL_ICONS.facebook, color: '#1877F2', status: 'setup' },
    { id: 'email', name: 'Email Omnicanal', icon: CHANNEL_ICONS.email, color: '#EA4335', status: 'setup' },
    { id: 'twitter', name: 'X / Twitter DM', icon: CHANNEL_ICONS.twitter, color: '#ffffff', status: 'setup' },
    { id: 'line', name: 'LINE', icon: CHANNEL_ICONS.line, color: '#06C755', status: 'setup' },
    { id: 'sms', name: 'SMS / Twilio', icon: CHANNEL_ICONS.sms, color: '#F22F46', status: 'setup' },
];

export default function InboxPage() {
    const [instances, setInstances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getInstances()
            .then(data => setInstances(data.instances || []))
            .catch(() => setInstances([]))
            .finally(() => setLoading(false));
    }, []);

    const enrichedChannels = CHANNELS.map(c =>
        c.id === 'whatsapp'
            ? { ...c, status: instances.length > 0 ? 'connected' : 'setup', details: `${instances.length} instancia(s)` }
            : { ...c, details: 'Configuración pendiente' }
    );

    return (
        <>
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Icons.MessageSquare />
                        Inbox Multicanal
                    </h1>
                    <p className="page-subtitle">Gestiona todas tus conversaciones desde una única plataforma unificada.</p>
                </div>
                <a
                    href="https://chat.fulllogin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ gap: '0.5rem' }}
                >
                    <Icons.ExternalLink />
                    Abrir Consola Chatwoot
                </a>
            </div>

            <div className="grid-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="stat-card">
                    <div className="stat-label">Conversaciones del Mes</div>
                    <div className="stat-value">1,248</div>
                    <span style={{ fontSize: '0.75rem', color: '#10b981' }}>+18% vs mes anterior</span>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Tiempo de Respuesta IA</div>
                    <div className="stat-value">14s</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Promedio total</span>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Canales Conectados</div>
                    <div className="stat-value">{enrichedChannels.filter(c => c.status === 'connected').length} / 8</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sincronización activa</span>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Inbox Salud</div>
                    <div className="stat-value" style={{ color: 'var(--status-success)' }}>Excelente</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Latencia &lt; 50ms</span>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(80, 205, 149, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)', border: '1px solid rgba(80, 205, 149, 0.2)' }}>
                <div style={{
                    width: 60, height: 60, borderRadius: '50%', background: 'rgba(80, 205, 149, 0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--brand-primary)'
                }}>
                    <Icons.Zap />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Chatwoot Enterprise Unlock</h2>
                <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 1.5rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    Tu cuenta tiene activadas todas las capacidades de la versión Enterprise. Soporte oficial para equipos grandes, analítica avanzada y automatizaciones ilimitadas.
                </p>
                <button className="btn btn-ghost btn-sm" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Explorar documentación técnica</button>
            </div>

            <div className="glass-card">
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    CANALES DISPONIBLES
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {enrichedChannels.map(channel => (
                        <div key={channel.id} style={{
                            padding: '1.25rem',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                            }}
                        >
                            <div style={{
                                width: 44, height: 44, borderRadius: '10px', background: `${channel.color}15`, color: channel.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {(() => {
                                    const Icon = channel.icon;
                                    return <Icon />;
                                })()}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{channel.name}</div>
                                <div style={{ fontSize: '0.75rem', color: channel.status === 'connected' ? channel.color : 'var(--text-muted)', marginTop: '0.15rem' }}>
                                    {channel.details}
                                </div>
                            </div>
                            <div style={{
                                padding: '0.25rem 0.6rem', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 700,
                                background: channel.status === 'connected' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                                color: channel.status === 'connected' ? '#10b981' : 'var(--text-muted)',
                                border: `1px solid ${channel.status === 'connected' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)'}`
                            }}>
                                {channel.status === 'connected' ? 'ACTIVO' : 'NO CONECTADO'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
