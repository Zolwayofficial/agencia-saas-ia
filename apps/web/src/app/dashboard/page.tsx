'use client';

import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import Link from 'next/link';

// Channel status cards with real-feeling data
const CHANNELS = [
    { id: 'whatsapp', name: 'WhatsApp', icon: '📱', color: '#25D366', status: 'connected', conversations: 0, label: 'Instancias activas' },
    { id: 'instagram', name: 'Instagram DM', icon: '📸', color: '#E1306C', status: 'setup', conversations: 0, label: 'No configurado' },
    { id: 'telegram', name: 'Telegram', icon: '✈️', color: '#0088cc', status: 'setup', conversations: 0, label: 'No configurado' },
    { id: 'facebook', name: 'Facebook', icon: '💬', color: '#1877F2', status: 'setup', conversations: 0, label: 'No configurado' },
    { id: 'email', name: 'Email', icon: '📧', color: '#EA4335', status: 'setup', conversations: 0, label: 'No configurado' },
    { id: 'discord', name: 'Discord', icon: '🎮', color: '#5865F2', status: 'setup', conversations: 0, label: 'No configurado' },
];

const QUICK_ACTIONS = [
    { href: '/dashboard/inbox', icon: '💬', label: 'Ver Inbox', color: '#50CD95' },
    { href: '/dashboard/marketing', icon: '🚀', label: 'Nueva Campaña', color: '#3b82f6' },
    { href: '/dashboard/whatsapp', icon: '📱', label: 'Conectar Canal', color: '#25D366' },
    { href: '/dashboard/integrations', icon: '🔗', label: 'Integraciones', color: '#f59e0b' },
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

    // Inject real WA count into channels
    const enrichedChannels = CHANNELS.map((c) =>
        c.id === 'whatsapp'
            ? { ...c, conversations: instances.length, label: `${instances.length} instancia(s) activa(s)`, status: instances.length > 0 ? 'connected' : 'setup' }
            : c
    );

    const connectedCount = enrichedChannels.filter((c) => c.status === 'connected').length;

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
                {[1, 2, 3].map((i) => (
                    <div key={i} style={{ height: 80, background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', animation: 'pulse 1.5s infinite' }} />
                ))}
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span>⚡</span>
                    Command Center
                </h1>
                <p className="page-subtitle">
                    {organization?.name} · Plan <strong style={{ color: 'var(--brand-primary)' }}>{balance?.plan?.name || 'Sin plan'}</strong>
                </p>
            </div>

            {/* KPI Row */}
            <div className="grid-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="stat-card">
                    <div className="stat-label">📨 Mensajes del Mes</div>
                    <div className="stat-value">
                        {(balance?.usage?.messagesUsed || 0).toLocaleString()}
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                            {' '}/ {(balance?.usage?.messagesLimit || 0).toLocaleString()}
                        </span>
                    </div>
                    <div className="progress-bar" style={{ marginTop: '0.5rem' }}>
                        <div className="progress-fill" style={{ width: `${msgPercent}%` }} />
                    </div>
                    <div className="stat-detail">{Math.round(msgPercent)}% utilizado</div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">💬 Canales Activos</div>
                    <div className="stat-value" style={{ color: connectedCount > 0 ? 'var(--status-success)' : 'var(--text-muted)' }}>
                        {connectedCount}
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}> / {CHANNELS.length}</span>
                    </div>
                    <div className="stat-detail">
                        {connectedCount === 0 ? 'Conecta tu primer canal →' : `${CHANNELS.length - connectedCount} disponibles para conectar`}
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">🤖 Ejecuciones IA</div>
                    <div className="stat-value">
                        {balance?.usage?.agentRunsUsed || 0}
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                            {' '}/ {balance?.usage?.agentRunsLimit === -1 ? '∞' : balance?.usage?.agentRunsLimit || 0}
                        </span>
                    </div>
                    <div className="stat-detail">
                        {balance?.usage?.agentRunsLimit === -1 ? 'Ilimitado (plan actual)' : 'Este período'}
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">🤝 Comisiones</div>
                    <div className="stat-value" style={{ color: 'var(--status-success)' }}>
                        ${(balance?.commissions || 0).toFixed(2)}
                    </div>
                    <div className="stat-detail">Ganancias acumuladas de referidos</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    ACCIONES RÁPIDAS
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
                    {QUICK_ACTIONS.map((action) => (
                        <Link
                            key={action.href}
                            href={action.href}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '1rem 0.75rem',
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-sm)',
                                textDecoration: 'none',
                                color: 'var(--text-secondary)',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                transition: 'all 0.15s ease',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLAnchorElement).style.borderColor = action.color;
                                (e.currentTarget as HTMLAnchorElement).style.color = action.color;
                                (e.currentTarget as HTMLAnchorElement).style.background = `${action.color}15`;
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border-subtle)';
                                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)';
                                (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-elevated)';
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>{action.icon}</span>
                            <span>{action.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Channel Status Grid */}
            <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        CANALES DE COMUNICACIÓN
                    </h2>
                    <Link href="/dashboard/inbox" style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 500 }}>
                        Ver todos →
                    </Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    {enrichedChannels.map((ch) => (
                        <div key={ch.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            background: ch.status === 'connected' ? `${ch.color}12` : 'var(--bg-elevated)',
                            border: `1px solid ${ch.status === 'connected' ? ch.color + '40' : 'var(--border-subtle)'}`,
                            borderRadius: 'var(--radius-sm)',
                        }}>
                            <span style={{ fontSize: '1.25rem' }}>{ch.icon}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{ch.name}</div>
                                <div style={{ fontSize: '0.75rem', color: ch.status === 'connected' ? ch.color : 'var(--text-muted)' }}>
                                    {ch.label}
                                </div>
                            </div>
                            <span style={{
                                width: 8, height: 8, borderRadius: '50%',
                                background: ch.status === 'connected' ? '#10b981' : 'var(--text-muted)',
                                flexShrink: 0,
                            }} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        ÚLTIMAS TRANSACCIONES
                    </h2>
                    <Link href="/dashboard/billing" style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 500 }}>
                        Ver todas →
                    </Link>
                </div>
                {history.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💳</div>
                        <p style={{ fontSize: '0.9rem' }}>No hay transacciones aún</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>Descripción</th>
                                <th>Monto</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((tx) => (
                                <tr key={tx.id}>
                                    <td>
                                        <span className={`badge ${tx.type === 'COMMISSION' ? 'success' : tx.type === 'SUBSCRIPTION' ? 'info' : 'neutral'}`}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.875rem' }}>{tx.description}</td>
                                    <td style={{ color: tx.amount >= 0 ? 'var(--status-success)' : 'var(--status-danger)', fontWeight: 600 }}>
                                        {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)}
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                        {new Date(tx.createdAt).toLocaleDateString('es', { dateStyle: 'short' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}
