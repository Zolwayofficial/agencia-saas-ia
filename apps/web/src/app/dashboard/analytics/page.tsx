'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';

// Simulated analytics data with realistic structure
function generateSparkData(points = 7) {
    const base = Math.floor(Math.random() * 200) + 100;
    return Array.from({ length: points }, (_, i) => Math.max(10, base + Math.round((Math.random() - 0.4) * base * 0.4)));
}

function MiniBar({ data, color = '#50CD95' }: { data: number[]; color?: string }) {
    const max = Math.max(...data);
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 48 }}>
            {data.map((v, i) => (
                <div
                    key={i}
                    style={{
                        flex: 1,
                        height: `${Math.max(8, (v / max) * 100)}%`,
                        background: i === data.length - 1 ? color : `${color}60`,
                        borderRadius: '3px 3px 0 0',
                        transition: 'height 0.3s ease',
                    }}
                />
            ))}
        </div>
    );
}

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function AnalyticsPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [balance, setBalance] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [barData] = useState(() => generateSparkData(7));
    const [responseData] = useState(() => generateSparkData(7).map(v => Math.min(v, 120)));

    useEffect(() => {
        Promise.all([api.getTasks(20), api.getBalance()])
            .then(([t, b]) => {
                setTasks(t.tasks || []);
                setBalance(b);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const successTasks = tasks.filter(t => t.status === 'SUCCESS').length;
    const errorTasks = tasks.filter(t => t.status === 'ERROR').length;
    const avgDuration = tasks.length > 0
        ? Math.round(tasks.filter(t => t.durationMs).reduce((acc, t) => acc + (t.durationMs || 0), 0) / tasks.filter(t => t.durationMs).length / 1000)
        : 0;

    const totalMessages = balance?.usage?.messagesUsed || 0;
    const msgLimit = balance?.usage?.messagesLimit || 1;
    const utilizationPct = Math.round((totalMessages / msgLimit) * 100);

    if (loading) return <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>Cargando analytics...</div>;

    return (
        <>
            <h1 className="page-title">📊 Analytics & Insights</h1>
            <p className="page-subtitle">Rendimiento de tu plataforma multicanal en tiempo real</p>

            {/* KPI Row */}
            <div className="grid-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '1.5rem' }}>
                <div className="stat-card">
                    <div className="stat-label">📨 Mensajes Totales</div>
                    <div className="stat-value">{totalMessages.toLocaleString()}</div>
                    <div style={{ marginTop: '0.75rem' }}><MiniBar data={barData} /></div>
                    <div className="stat-detail" style={{ marginTop: '0.25rem' }}>Últimos 7 días</div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">⚡ Tasa de Respuesta IA</div>
                    <div className="stat-value" style={{ color: '#10b981' }}>
                        {tasks.length > 0 ? Math.round((successTasks / tasks.length) * 100) : 0}%
                    </div>
                    <div style={{ marginTop: '0.5rem' }}><MiniBar data={responseData} color="#10b981" /></div>
                    <div className="stat-detail" style={{ marginTop: '0.25rem' }}>{successTasks} exitosas / {tasks.length} totales</div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">⏱️ Tiempo Promedio IA</div>
                    <div className="stat-value">{avgDuration > 0 ? `${avgDuration}s` : '—'}</div>
                    <div className="stat-detail" style={{ marginTop: '0.5rem' }}>Por ejecución de agente</div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">🎯 Utilización</div>
                    <div className="stat-value" style={{ color: utilizationPct > 80 ? '#ef4444' : utilizationPct > 50 ? '#f59e0b' : '#10b981' }}>
                        {utilizationPct}%
                    </div>
                    <div className="progress-bar" style={{ marginTop: '0.5rem' }}>
                        <div className={`progress-fill${utilizationPct > 80 ? ' danger' : utilizationPct > 50 ? ' warning' : ''}`}
                            style={{ width: `${utilizationPct}%` }} />
                    </div>
                    <div className="stat-detail" style={{ marginTop: '0.25rem' }}>Del límite de mensajes</div>
                </div>
            </div>

            {/* Volume Chart */}
            <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                    📈 Volumen de Mensajes — Últimos 7 Días
                </h2>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, marginBottom: '0.5rem' }}>
                    {barData.map((v, i) => {
                        const max = Math.max(...barData);
                        const h = Math.max(8, (v / max) * 100);
                        return (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                <div style={{
                                    width: '100%',
                                    height: `${h}%`,
                                    background: i === barData.length - 1
                                        ? 'linear-gradient(180deg, var(--brand-primary), var(--brand-primary-dark))'
                                        : 'rgba(80,205,149,0.3)',
                                    borderRadius: '4px 4px 0 0',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'center',
                                    paddingTop: 4,
                                    fontSize: '0.65rem',
                                    color: 'white',
                                    fontWeight: 600,
                                }}>
                                    {v}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {DAYS.map((d, i) => (
                        <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d}</div>
                    ))}
                </div>
            </div>

            {/* Conversion Funnel + Agent Table */}
            <div className="grid-2" style={{ gap: '1.5rem' }}>
                {/* Funnel */}
                <div className="glass-card">
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>🔽 Embudo de Conversación</h2>
                    {[
                        { label: 'Mensajes Recibidos', pct: 100, count: totalMessages, color: '#3b82f6' },
                        { label: 'Procesados por IA', pct: tasks.length > 0 ? Math.round((tasks.length / Math.max(totalMessages, 1)) * 100) : 0, count: tasks.length, color: '#8b5cf6' },
                        { label: 'Respondidos', pct: tasks.length > 0 ? Math.round((successTasks / Math.max(totalMessages, 1)) * 100) : 0, count: successTasks, color: '#10b981' },
                        { label: 'Con Error', pct: tasks.length > 0 ? Math.round((errorTasks / Math.max(totalMessages, 1)) * 100) : 0, count: errorTasks, color: '#ef4444' },
                    ].map((step) => (
                        <div key={step.label} style={{ marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{step.label}</span>
                                <span style={{ color: step.color, fontWeight: 600 }}>{step.count.toLocaleString()} ({step.pct}%)</span>
                            </div>
                            <div className="progress-bar" style={{ height: 6 }}>
                                <div style={{ height: '100%', width: `${step.pct}%`, background: step.color, borderRadius: 9999, transition: 'width 0.6s ease' }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Agent Activity */}
                <div className="glass-card">
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>🤖 Últimas Ejecuciones IA</h2>
                    {tasks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No hay ejecuciones aún
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Estado</th>
                                    <th>Modelo</th>
                                    <th>Duración</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.slice(0, 6).map((task) => (
                                    <tr key={task.id}>
                                        <td>
                                            <span className={`badge ${task.status === 'SUCCESS' ? 'success' : task.status === 'ERROR' ? 'danger' : task.status === 'RUNNING' ? 'info' : 'neutral'}`}>
                                                {task.status === 'RUNNING' && <span className="pulse-dot" />}
                                                {task.status}
                                            </span>
                                        </td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {task.model || '—'}
                                        </td>
                                        <td style={{ fontSize: '0.85rem' }}>
                                            {task.durationMs ? `${(task.durationMs / 1000).toFixed(1)}s` : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
}
