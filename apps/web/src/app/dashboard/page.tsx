'use client';

import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';

export default function DashboardPage() {
    const { organization } = useAuth();
    const [balance, setBalance] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.getBalance(), api.getHistory(10)])
            .then(([bal, hist]) => {
                setBalance(bal);
                setHistory(hist.transactions || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const msgPercent = balance?.usage
        ? Math.min(100, (balance.usage.messagesUsed / balance.usage.messagesLimit) * 100)
        : 0;
    const agentPercent = balance?.usage && balance.usage.agentRunsLimit > 0
        ? Math.min(100, (balance.usage.agentRunsUsed / balance.usage.agentRunsLimit) * 100)
        : 0;

    const getProgressClass = (pct: number) =>
        pct >= 95 ? 'progress-fill danger' : pct >= 70 ? 'progress-fill warning' : 'progress-fill';

    if (loading) {
        return <div style={{ color: 'var(--text-secondary)', padding: '2rem' }}>Cargando dashboard...</div>;
    }

    return (
        <>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">
                {organization?.name} — Plan {balance?.plan?.name || 'Sin plan'}
            </p>

            {/* KPI Cards */}
            <div className="grid-stats">
                {/* Messages */}
                <div className="stat-card">
                    <div className="stat-label">📨 Mensajes WhatsApp</div>
                    <div className="stat-value">
                        {balance?.usage?.messagesUsed?.toLocaleString() || 0}
                        <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                            {' '}/ {balance?.usage?.messagesLimit?.toLocaleString() || 0}
                        </span>
                    </div>
                    <div className="progress-bar">
                        <div className={getProgressClass(msgPercent)} style={{ width: `${msgPercent}%` }} />
                    </div>
                    <div className="stat-detail">{Math.round(msgPercent)}% utilizado este mes</div>
                </div>

                {/* Agent Runs */}
                <div className="stat-card">
                    <div className="stat-label">🤖 Ejecuciones IA</div>
                    <div className="stat-value">
                        {balance?.usage?.agentRunsUsed || 0}
                        <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                            {' '}/ {balance?.usage?.agentRunsLimit === -1 ? '∞' : balance?.usage?.agentRunsLimit || 0}
                        </span>
                    </div>
                    {balance?.usage?.agentRunsLimit !== -1 && (
                        <div className="progress-bar">
                            <div className={getProgressClass(agentPercent)} style={{ width: `${agentPercent}%` }} />
                        </div>
                    )}
                    <div className="stat-detail">
                        {balance?.usage?.agentRunsLimit === -1 ? 'Ilimitado' : `${Math.round(agentPercent)}% utilizado`}
                    </div>
                </div>

                {/* Plan */}
                <div className="stat-card">
                    <div className="stat-label">💳 Plan Actual</div>
                    <div className="stat-value">{balance?.plan?.name || 'Sin plan'}</div>
                    <div className="stat-detail">
                        ${balance?.plan?.priceMonthly || 0}/mes — {balance?.plan?.maxInstances || 0} instancia(s)
                    </div>
                </div>

                {/* Commissions */}
                <div className="stat-card">
                    <div className="stat-label">🤝 Comisiones Acumuladas</div>
                    <div className="stat-value" style={{ color: 'var(--status-success)' }}>
                        ${(balance?.commissions || 0).toFixed(2)}
                    </div>
                    <div className="stat-detail">Ganancias de tu red de referidos</div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="glass-card">
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Últimas Transacciones</h2>
                {history.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No hay transacciones aún.</p>
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
                                    <td>{tx.description}</td>
                                    <td style={{ color: tx.amount >= 0 ? 'var(--status-success)' : 'var(--status-danger)' }}>
                                        {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)}
                                    </td>
                                    <td style={{ color: 'var(--text-muted)' }}>
                                        {new Date(tx.createdAt).toLocaleDateString('es')}
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
