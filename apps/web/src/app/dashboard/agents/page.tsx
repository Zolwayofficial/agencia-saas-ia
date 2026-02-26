'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Icons } from '@/components/icons';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    PENDING: { label: 'Pendiente',      color: 'var(--text-secondary)',  bg: 'rgba(120,120,128,0.12)', dot: 'rgba(120,120,128,0.5)' },
    RUNNING: { label: 'Procesando',     color: '#007AFF',                bg: 'rgba(0,122,255,0.1)',    dot: '#007AFF' },
    SUCCESS: { label: 'Exitoso',        color: 'var(--brand-primary)',   bg: 'rgba(52,201,123,0.1)',   dot: 'var(--brand-primary)' },
    ERROR:   { label: 'Error',          color: '#FF3B30',                bg: 'rgba(255,59,48,0.1)',    dot: '#FF3B30' },
    TIMEOUT: { label: 'Tiempo agotado', color: '#FF9500',                bg: 'rgba(255,149,0,0.1)',    dot: '#FF9500' },
};

function IOSCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', ...style }}>{children}</div>;
}

export default function AgentsPage() {
    const [tasks,   setTasks]   = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadTasks = () => {
        api.getTasks(50)
            .then((data) => setTasks(data.tasks || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadTasks();
        const interval = setInterval(loadTasks, 10_000);
        return () => clearInterval(interval);
    }, []);

    const runningCount = tasks.filter(t => t.status === 'RUNNING').length;
    const successCount = tasks.filter(t => t.status === 'SUCCESS').length;
    const errorCount   = tasks.filter(t => t.status === 'ERROR').length;

    return (
        <div style={{ maxWidth: 860, margin: '0 auto' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--brand-primary)', marginBottom: 6 }}>
                        Núcleo de Inteligencia
                    </p>
                    <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5, color: '#000', lineHeight: 1.15, margin: 0 }}>
                        Agentes IA
                    </h1>
                    <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 4 }}>
                        Monitoreo en tiempo real de ejecuciones de agentes IA.
                    </p>
                </div>
                {/* Live indicator */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '7px 14px', borderRadius: 20,
                    background: 'rgba(52,201,123,0.1)', border: '1px solid rgba(52,201,123,0.25)',
                    fontSize: 13, fontWeight: 600, color: 'var(--brand-primary)',
                }}>
                    <span style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: 'var(--brand-primary)', display: 'inline-block',
                        boxShadow: '0 0 0 2px rgba(52,201,123,0.3)',
                        animation: 'pulse 2s infinite',
                    }} />
                    Sincronizando
                </div>
            </div>

            {/* ── Stats row (only when there are tasks) ── */}
            {tasks.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
                    {[
                        { label: 'Total',       value: tasks.length,  color: '#000' },
                        { label: 'En curso',     value: runningCount,  color: '#007AFF' },
                        { label: 'Exitosos',     value: successCount,  color: 'var(--brand-primary)' },
                        { label: 'Errores',      value: errorCount,    color: '#FF3B30' },
                    ].map(s => (
                        <IOSCard key={s.label} style={{ padding: '14px 16px' }}>
                            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', margin: '0 0 5px' }}>
                                {s.label}
                            </p>
                            <p style={{ fontSize: 26, fontWeight: 700, color: s.color, margin: 0, letterSpacing: -0.5 }}>
                                {s.value}
                            </p>
                        </IOSCard>
                    ))}
                </div>
            )}

            {/* ── Task list ── */}
            <IOSCard>
                {loading ? (
                    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[1,2,3,4].map(i => (
                            <div key={i} style={{ height: 52, borderRadius: 9, background: 'rgba(120,120,128,0.08)' }} />
                        ))}
                    </div>
                ) : tasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '72px 32px' }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: '50%',
                            background: 'rgba(120,120,128,0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px',
                        }}>
                            <Icons.Agents size={32} color="rgba(120,120,128,0.4)" />
                        </div>
                        <p style={{ fontSize: 17, fontWeight: 600, color: '#000', margin: '0 0 8px' }}>Sin Tareas</p>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, maxWidth: 320, lineHeight: 1.55, marginLeft: 'auto', marginRight: 'auto' }}>
                            No se detectaron ejecuciones de agentes. Ejecuta tu primer agente IA vía API para ver los resultados aquí.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Table header */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '140px 1fr 60px 80px 100px',
                            padding: '10px 18px',
                            borderBottom: '1px solid rgba(60,60,67,0.1)',
                            background: 'rgba(120,120,128,0.04)',
                        }}>
                            {['Estado', 'Modelo', 'Pasos', 'Duración', 'Hora'].map(h => (
                                <span key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    {h}
                                </span>
                            ))}
                        </div>

                        {/* Rows */}
                        {tasks.map((task, i) => {
                            const s = STATUS_MAP[task.status] || STATUS_MAP.PENDING;
                            return (
                                <div key={task.id} style={{
                                    display: 'grid', gridTemplateColumns: '140px 1fr 60px 80px 100px',
                                    padding: '13px 18px', alignItems: 'center',
                                    borderBottom: i < tasks.length - 1 ? '1px solid rgba(60,60,67,0.08)' : 'none',
                                }}>
                                    {/* Status badge */}
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                        padding: '4px 10px', borderRadius: 20,
                                        background: s.bg, width: 'fit-content',
                                    }}>
                                        <span style={{
                                            width: 6, height: 6, borderRadius: '50%',
                                            background: s.dot, display: 'inline-block',
                                            ...(task.status === 'RUNNING' ? { animation: 'pulse 1.2s infinite' } : {}),
                                        }} />
                                        <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.label}</span>
                                    </div>

                                    {/* Model */}
                                    <span style={{
                                        fontSize: 13, fontWeight: 600,
                                        fontFamily: 'monospace', color: '#000',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    }}>
                                        {task.model || '—'}
                                    </span>

                                    {/* Steps */}
                                    <span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>
                                        {task.stepsUsed ?? '0'}
                                    </span>

                                    {/* Duration */}
                                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                                        {task.durationMs ? `${(task.durationMs / 1000).toFixed(2)}s` : '—'}
                                    </span>

                                    {/* Time */}
                                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                                        {new Date(task.createdAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                                    </span>
                                </div>
                            );
                        })}
                    </>
                )}
            </IOSCard>

            <div style={{ height: 32 }} />
        </div>
    );
}
