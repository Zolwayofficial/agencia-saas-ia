'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';

// Professional SVG Icons
const Icons = {
    BarChart: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" /></svg>
    ),
    Activity: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
    ),
    History: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>
    ),
    TrendingUp: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
    ),
};

export default function AnalyticsPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getTasks(10)
            .then(data => setTasks(data.tasks || []))
            .catch(() => setTasks([]))
            .finally(() => setLoading(false));
    }, []);

    // Mock data for beautiful charts
    const messageVolume = [42, 58, 44, 95, 67, 89, 110];
    const maxVolume = Math.max(...messageVolume);

    if (loading) {
        return <div className="loading-skeleton" />;
    }

    return (
        <>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icons.BarChart />
                    Analytics & Insights
                </h1>
                <p className="page-subtitle">Monitoreo en tiempo real del rendimiento de tus agentes y volumen de mensajes.</p>
            </div>

            <div className="grid-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Mensajes / Semana', value: '7,432', trend: '+12%', color: '#50CD95' },
                    { label: 'Tasa de Éxito IA', value: '98.4%', trend: 'Estable', color: '#3b82f6' },
                    { label: 'Ahorro de Tiempo', value: '142h', trend: '+5h hoy', color: '#f59e0b' },
                    { label: 'Uso de Créditos', value: '64%', trend: 'Normal', color: '#ffffff' },
                ].map((stat, i) => (
                    <div key={i} className="stat-card">
                        <div className="stat-label">{stat.label}</div>
                        <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            {stat.value}
                            <span style={{ fontSize: '0.75rem', color: stat.color, fontWeight: 600 }}>{stat.trend}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '2px', height: '20px', marginTop: '1rem', alignItems: 'flex-end' }}>
                            {[20, 40, 30, 60, 40, 80, 50, 90].map((h, i) => (
                                <div key={i} style={{ flex: 1, height: `${h}%`, background: stat.color, opacity: 0.3, borderRadius: '1px' }} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Main Volume Chart */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Volumen de Mensajes (7 días)
                        </h3>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '2px', background: 'var(--brand-primary)' }} /> Total Enviados
                            </span>
                        </div>
                    </div>
                    <div style={{
                        height: '240px',
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: '1rem',
                        padding: '0 1rem',
                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        {messageVolume.map((vol, i) => {
                            const height = (vol / maxVolume) * 100;
                            return (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '100%',
                                        height: `${height}%`,
                                        background: 'linear-gradient(to top, rgba(80, 205, 149, 0.1), var(--brand-primary))',
                                        borderRadius: '6px 6px 2px 2px',
                                        position: 'relative',
                                        transition: 'all 0.3s ease'
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.2)'}
                                        onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
                                    >
                                        <div style={{
                                            position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)',
                                            fontSize: '0.7rem', fontWeight: 700, color: 'var(--brand-primary)'
                                        }}>
                                            {vol}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][i]}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Funnel */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
                        Embudo de Conversión
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { label: 'Recibidos', value: '1,248', p: 100, color: 'rgba(255,255,255,0.1)' },
                            { label: 'IA Procesada', value: '1,120', p: 90, color: 'rgba(59,130,246,0.2)' },
                            { label: 'Resolución IA', value: '942', p: 75, color: 'rgba(80, 205, 149, 0.3)' },
                            { label: 'Venta/Cita', value: '312', p: 25, color: 'var(--brand-primary)' },
                        ].map((step, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
                                    <span style={{ fontWeight: 600 }}>{step.label}</span>
                                    <span style={{ color: 'var(--text-muted)' }}>{step.value}</span>
                                </div>
                                <div style={{ height: 32, width: '100%', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${step.p}%`, background: step.color, borderRadius: '6px', transition: 'width 1s ease-out' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Executions */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Últimas Ejecuciones de Agentes IA
                    </h3>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Icons.History /> Actualizado hace 2 min
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Agente ID</th>
                                <th>Estado</th>
                                <th>Modelo</th>
                                <th>Duración</th>
                                <th>Resultado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map(task => (
                                <tr key={task.id}>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{task.id.slice(0, 8)}...</td>
                                    <td>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 700,
                                            background: task.status === 'COMPLETED' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                            color: task.status === 'COMPLETED' ? '#10b981' : '#f59e0b',
                                            border: `1px solid ${task.status === 'COMPLETED' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`
                                        }}>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>GPT-4o-mini</td>
                                    <td style={{ fontSize: '0.8rem' }}>1.2s</td>
                                    <td style={{ fontSize: '0.8rem', fontWeight: 500 }}>Éxito</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
