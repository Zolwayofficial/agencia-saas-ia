'use client';

import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import Link from 'next/link';

// Professional SVG Icons
const Icons = {
    Zap: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
    ),
    MessageSquare: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
    ),
    Rocket: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3" /><path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5" /></svg>
    ),
    Smartphone: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
    ),
    Link: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
    ),
    ChevronRight: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
    ),
    Bell: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
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
    discord: (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><path d="M9 16c1 .5 3 .5 4 0" /><path d="M17 21v-4a7 7 0 0 1 1-2" /><path d="M7 21v-4a7 7 0 0 0-1-2" /><path d="M14 4.5l1-1.5h1l-1 1.5" /><path d="M10 4.5L9 3H8l1 1.5" /></svg>
    ),
};

const CHANNELS = [
    { id: 'whatsapp', name: 'WhatsApp', icon: CHANNEL_ICONS.whatsapp, color: '#25D366', status: 'connected', label: 'Instancias activas' },
    { id: 'instagram', name: 'Instagram DM', icon: CHANNEL_ICONS.instagram, color: '#E1306C', status: 'setup', label: 'No configurado' },
    { id: 'telegram', name: 'Telegram', icon: CHANNEL_ICONS.telegram, color: '#0088cc', status: 'setup', label: 'No configurado' },
    { id: 'facebook', name: 'Facebook', icon: CHANNEL_ICONS.facebook, color: '#1877F2', status: 'setup', label: 'No configurado' },
    { id: 'email', name: 'Email', icon: CHANNEL_ICONS.email, color: '#EA4335', status: 'setup', label: 'No configurado' },
    { id: 'discord', name: 'Discord', icon: CHANNEL_ICONS.discord, color: '#5865F2', status: 'setup', label: 'No configurado' },
];

const QUICK_ACTIONS = [
    { href: '/dashboard/inbox', Icon: Icons.MessageSquare, label: 'Ver Inbox', color: '#50CD95' },
    { href: '/dashboard/marketing', Icon: Icons.Rocket, label: 'Nueva Campaña', color: '#3b82f6' },
    { href: '/dashboard/whatsapp', Icon: Icons.Smartphone, label: 'Conectar Canal', color: '#25D366' },
    { href: '/dashboard/integrations', Icon: Icons.Link, label: 'Integraciones', color: '#f59e0b' },
];

export default function DashboardPage() {
    const { organization } = useAuth();
    const [balance, setBalance] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [instances, setInstances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.getBalance(),
            api.getHistory(5),
            api.getInstances().catch(() => ({ instances: [] })),
        ])
            .then(([bal, hist, inst]) => {
                setBalance(bal);
                setHistory(hist.transactions || []);
                setInstances(inst.instances || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const msgPercent = balance?.usage
        ? Math.min(100, (balance.usage.messagesUsed / balance.usage.messagesLimit) * 100)
        : 0;

    const enrichedChannels = CHANNELS.map((c) =>
        c.id === 'whatsapp'
            ? { ...c, label: `${instances.length} instancia(s) activa(s)`, status: instances.length > 0 ? 'connected' : 'setup' }
            : c
    );

    const connectedCount = enrichedChannels.filter((c) => c.status === 'connected').length;

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
                <div style={{ height: 40, width: 300, background: 'var(--bg-glass)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} style={{ height: 120, background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', animation: 'pulse 1.5s infinite' }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.75rem' }}>
                        <Icons.Zap />
                        Command Center
                    </h1>
                    <p className="page-subtitle" style={{ fontSize: '1rem', marginTop: '0.25rem' }}>
                        {organization?.name} <span style={{ color: 'var(--text-muted)', margin: '0 0.5rem' }}>•</span>
                        Plan <strong style={{ color: 'var(--brand-primary)' }}>{balance?.plan?.name || 'SaaS Agency'}</strong>
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-ghost" style={{ padding: '0.5rem', position: 'relative' }}>
                        <Icons.Bell />
                        <span style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, background: '#ef4444', borderRadius: '50%', border: '2px solid var(--bg-base)' }} />
                    </button>
                    <Link href="/dashboard/billing" className="btn btn-primary btn-sm">Upgrade Plan</Link>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="stat-card" style={{ padding: '1.5rem' }}>
                    <div className="stat-label">Ingresos Recurrentes (MRR)</div>
                    <div className="stat-value" style={{ fontSize: '2rem' }}>
                        ${(balance?.mrr || 0).toLocaleString()}
                        <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 500, marginLeft: '0.5rem' }}>+12%</span>
                    </div>
                    <div className="stat-detail">Proyección estimada de facturación</div>
                </div>

                <div className="stat-card" style={{ padding: '1.5rem' }}>
                    <div className="stat-label">Mensajes Enviados</div>
                    <div className="stat-value">
                        {(balance?.usage?.messagesUsed || 0).toLocaleString()}
                    </div>
                    <div className="progress-bar" style={{ marginTop: '0.75rem', height: 6 }}>
                        <div className="progress-fill" style={{ width: `${msgPercent}%`, background: msgPercent > 80 ? 'var(--status-danger)' : 'var(--brand-primary)' }} />
                    </div>
                    <div className="stat-detail" style={{ marginTop: '0.5rem' }}>{Math.round(msgPercent)}% del cupo mensual</div>
                </div>

                <div className="stat-card" style={{ padding: '1.5rem' }}>
                    <div className="stat-label">Tasa de Resolución IA</div>
                    <div className="stat-value" style={{ color: 'var(--status-success)' }}>84.2%</div>
                    <div className="stat-detail">Casos cerrados por agentes sin intervención</div>
                </div>

                <div className="stat-card" style={{ padding: '1.5rem' }}>
                    <div className="stat-label">Comisiones Acumuladas</div>
                    <div className="stat-value">
                        ${(balance?.commissions || 0).toFixed(2)}
                    </div>
                    <div className="stat-detail">Ganancias netas de referidos</div>
                </div>
            </div>

            {/* Middle Section: Quick Actions & Channels */}
            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Quick Actions */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '1.25rem' }}>
                        OPERACIONES RÁPIDAS
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        {QUICK_ACTIONS.map((action) => (
                            <Link
                                key={action.href}
                                href={action.href}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '1.25rem 0.5rem',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    color: 'rgba(255,255,255,0.7)',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'pointer',
                                    textAlign: 'center'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = action.color;
                                    e.currentTarget.style.color = 'white';
                                    e.currentTarget.style.background = `${action.color}10`;
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{ color: action.color }}>
                                    {(() => {
                                        const Icon = action.Icon;
                                        return <Icon />;
                                    })()}
                                </div>
                                <span>{action.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Channel Status */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h2 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                            ESTADO DE CANALES
                        </h2>
                        <Link href="/dashboard/inbox" style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            Gestionar Omnicanal <Icons.ChevronRight />
                        </Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
                        {enrichedChannels.map((ch) => (
                            <div key={ch.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '12px',
                                transition: 'all 0.2s ease'
                            }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: '10px',
                                    background: `${ch.color}15`, color: ch.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {(() => {
                                        const Icon = ch.icon;
                                        return <Icon />;
                                    })()}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'white' }}>{ch.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: ch.status === 'connected' ? ch.color : 'rgba(255,255,255,0.3)', marginTop: '0.1rem' }}>
                                        {ch.label}
                                    </div>
                                </div>
                                <div style={{
                                    width: 6, height: 6, borderRadius: '50%',
                                    background: ch.status === 'connected' ? '#10b981' : 'rgba(255,255,255,0.1)',
                                    boxShadow: ch.status === 'connected' ? '0 0 8px #10b981' : 'none'
                                }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Recent Activity */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                        HISTORIAL FINANCIERO
                    </h2>
                    <Link href="/dashboard/billing" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontWeight: 500 }}>
                        Ver extracto completo
                    </Link>
                </div>
                {history.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.2)' }}>
                        <div style={{ marginBottom: '0.5rem' }}><Icons.Zap /></div>
                        <p style={{ fontSize: '0.9rem' }}>No se registran transacciones recientes</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Concepto</th>
                                    <th>Referencia</th>
                                    <th>Importe</th>
                                    <th>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((tx) => (
                                    <tr key={tx.id}>
                                        <td>
                                            <span style={{
                                                fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px',
                                                background: tx.type === 'COMMISSION' ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)',
                                                color: tx.type === 'COMMISSION' ? '#10b981' : '#3b82f6',
                                                border: `1px solid ${tx.type === 'COMMISSION' ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.2)'}`
                                            }}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>{tx.description}</td>
                                        <td style={{ color: tx.amount >= 0 ? '#10b981' : '#ef4444', fontWeight: 700, fontSize: '0.9rem' }}>
                                            {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                                        </td>
                                        <td style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
                                            {new Date(tx.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
