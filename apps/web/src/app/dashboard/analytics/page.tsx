'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Icons } from '@/components/icons';
import Link from 'next/link';

const F: React.CSSProperties = {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
};
const card: React.CSSProperties = {
    ...F,
    background: '#FFFFFF',
    borderRadius: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    overflow: 'hidden',
};
const label11: React.CSSProperties = {
    ...F,
    fontSize: '0.6875rem',
    fontWeight: 600,
    letterSpacing: '0.07em',
    textTransform: 'uppercase' as const,
    color: 'rgba(60,60,67,0.50)',
};
const sep: React.CSSProperties = {
    height: '0.5px',
    background: 'rgba(60,60,67,0.10)',
};

const DAYS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

function EmptyState({ message }: { message: string }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '40px 0' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(60,60,67,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.Analytics size={18} style={{ color: 'rgba(60,60,67,0.25)' }} />
            </div>
            <span style={{ fontSize: '0.8125rem', color: 'rgba(60,60,67,0.35)', fontWeight: 500 }}>{message}</span>
        </div>
    );
}

export default function AnalyticsPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [balance, setBalance] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [hoveredBar, setHoveredBar] = useState<number | null>(null);

    useEffect(() => {
        Promise.all([
            api.getTasks(10),
            api.get('/billing/balance'),
        ]).then(([t, b]) => {
            setTasks(t.tasks || []);
            setBalance(b);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ height: 42, width: 220, background: '#F2F2F7', borderRadius: 12 }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                    {[1,2,3,4].map(i => <div key={i} style={{ height: 100, background: '#F2F2F7', borderRadius: 16 }} />)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                    <div style={{ height: 300, background: '#F2F2F7', borderRadius: 16 }} />
                    <div style={{ height: 300, background: '#F2F2F7', borderRadius: 16 }} />
                </div>
            </div>
        );
    }

    // ── Real data only — no fake fallbacks ────────────────────────────────────
    const vol: number[] = (balance?.stats?.messageVolume?.length > 0 && balance.stats.messageVolume.some((v: number) => v > 0))
        ? balance.stats.messageVolume
        : [];
    const maxVol = vol.length > 0 ? Math.max(...vol, 1) : 1;
    const totalVol = vol.reduce((a: number, b: number) => a + b, 0);
    const hasVol = totalVol > 0;

    const messagesUsed = balance?.usage?.messagesUsed ?? null;
    const messagesLimit = balance?.usage?.messagesLimit ?? null;
    const capacityPct = (messagesUsed !== null && messagesLimit && messagesLimit > 0)
        ? Math.round((messagesUsed / messagesLimit) * 100)
        : null;

    const successRate = balance?.stats?.successRate ?? null;
    const timeSaved = balance?.stats?.timeSavedHours ?? null;

    // Funnel from real data only
    const funnelData = balance?.stats?.funnel ?? null;
    const conversionRate = balance?.stats?.conversionRate ?? null;

    const kpis = [
        {
            label: 'Volumen Semanal',
            value: hasVol ? totalVol.toLocaleString() : null,
            badge: hasVol ? '+activo' : null,
            badgeColor: '#34C759',
            icon: Icons.TrendingUp,
            accent: '#34C759',
        },
        {
            label: 'Tasa de Éxito IA',
            value: successRate !== null ? `${successRate.toFixed(1)}%` : null,
            badge: successRate !== null ? 'Calculado' : null,
            badgeColor: 'var(--brand-primary, #5abf8a)',
            icon: Icons.AI,
            accent: 'var(--brand-primary, #5abf8a)',
        },
        {
            label: 'Ahorro de Tiempo',
            value: timeSaved !== null ? `${timeSaved.toFixed(1)}h` : null,
            badge: timeSaved !== null ? 'Estimado' : null,
            badgeColor: '#FF9500',
            icon: Icons.Cpu,
            accent: '#FF9500',
        },
        {
            label: 'Uso de Capacidad',
            value: capacityPct !== null ? `${capacityPct}%` : null,
            badge: capacityPct !== null ? 'Activo' : null,
            badgeColor: '#8E8E93',
            icon: Icons.Credits,
            accent: '#8E8E93',
        },
    ];

    return (
        <div style={{ ...F, background: '#F2F2F7', minHeight: '100vh', padding: '28px 24px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                        Analítica
                    </p>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1C1C1E', letterSpacing: -0.5, margin: 0 }}>
                        Vista Estratégica
                    </h1>
                </div>
                <button style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '9px 16px', borderRadius: 12, border: 'none',
                    background: 'rgba(0,0,0,0.06)', color: '#1C1C1E',
                    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                }}>
                    <Icons.Download size={14} />
                    Exportar
                </button>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                {kpis.map((k, i) => (
                    <div key={i} style={{ ...card, padding: '18px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                            <span style={label11}>{k.label}</span>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: `rgba(142,142,147,0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <k.icon size={14} style={{ color: k.value ? k.accent : '#C7C7CC' }} />
                            </div>
                        </div>
                        {k.value ? (
                            <>
                                <div style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.04em', color: '#1C1C1E', lineHeight: 1 }}>
                                    {k.value}
                                </div>
                                <div style={{ marginTop: 8, display: 'inline-flex', padding: '3px 8px', borderRadius: 20, background: `rgba(142,142,147,0.08)` }}>
                                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: k.badgeColor }}>{k.badge}</span>
                                </div>
                            </>
                        ) : (
                            <div style={{ marginTop: 4 }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#C7C7CC' }}>—</div>
                                <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'rgba(60,60,67,0.30)', fontWeight: 500 }}>
                                    Sin datos aún
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Chart Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>

                {/* Bar Chart */}
                <div style={{ ...card, padding: '22px 24px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                        <div>
                            <div style={label11}>Volumen de Mensajes</div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(60,60,67,0.35)', marginTop: 2 }}>Últimos 7 días</div>
                        </div>
                        {hasVol && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 20, background: 'rgba(52,199,89,0.08)' }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34C759' }} />
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34C759' }}>Activo</span>
                            </div>
                        )}
                    </div>

                    {hasVol ? (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 180, padding: '0 4px' }}>
                            {vol.map((v: number, i: number) => {
                                const h = (v / maxVol) * 100;
                                const hov = hoveredBar === i;
                                return (
                                    <div key={i}
                                        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}
                                        onMouseEnter={() => setHoveredBar(i)}
                                        onMouseLeave={() => setHoveredBar(null)}>
                                        {hov && (
                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34C759', background: 'rgba(52,199,89,0.10)', padding: '2px 6px', borderRadius: 6, whiteSpace: 'nowrap' }}>
                                                {v.toLocaleString()}
                                            </div>
                                        )}
                                        <div style={{
                                            width: '100%', height: `${Math.max(h, 2)}%`,
                                            borderRadius: '6px 6px 0 0',
                                            background: hov ? '#34C759' : 'rgba(52,199,89,0.25)',
                                            transition: 'background 0.15s',
                                        }} />
                                        <div style={{ ...label11, fontSize: '0.625rem' }}>{DAYS[i]}</div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <>
                            <EmptyState message="Sin mensajes en los últimos 7 días" />
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', paddingBottom: 8 }}>
                                {DAYS.map(d => (
                                    <div key={d} style={{ flex: 1, textAlign: 'center' }}>
                                        <div style={{ height: 40, background: 'rgba(60,60,67,0.04)', borderRadius: '4px 4px 0 0' }} />
                                        <div style={{ ...label11, fontSize: '0.625rem', marginTop: 6 }}>{d}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Conversion Funnel */}
                <div style={{ ...card, padding: '22px 20px' }}>
                    <div style={{ ...label11, marginBottom: 20 }}>Embudo de Conversión</div>

                    {funnelData ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {funnelData.map((step: any, i: number) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3A3A3C' }}>{step.label}</span>
                                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1C1C1E' }}>{step.value.toLocaleString()}</span>
                                    </div>
                                    <div style={{ height: 5, background: 'rgba(0,0,0,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${step.pct}%`, borderRadius: 3, background: step.color, transition: 'width 0.8s ease' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState message="Sin conversiones registradas" />
                    )}

                    {/* Conversion Rate */}
                    <div style={{ marginTop: 20, padding: '16px', borderRadius: 12, background: conversionRate ? 'rgba(52,199,89,0.07)' : 'rgba(60,60,67,0.04)' }}>
                        <div style={{ ...label11, marginBottom: 6 }}>Tasa de Conversión</div>
                        {conversionRate !== null ? (
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                <span style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.04em', color: '#1C1C1E' }}>{conversionRate.toFixed(1)}%</span>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34C759' }}>↑ Activo</span>
                            </div>
                        ) : (
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#C7C7CC' }}>—</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Activity Log */}
            <div style={card}>
                <div style={{ padding: '18px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={label11}>Registro de Actividad</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(60,60,67,0.35)', marginTop: 2 }}>Telemetría en tiempo real</div>
                    </div>
                    <Link href="/dashboard/agents" style={{
                        padding: '6px 14px', borderRadius: 10,
                        background: 'rgba(0,0,0,0.05)', color: '#1C1C1E',
                        fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none',
                    }}>
                        Ver Agentes IA
                    </Link>
                </div>
                <div style={sep} />

                {/* Table head */}
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px 100px', padding: '10px 20px', background: 'rgba(0,0,0,0.015)' }}>
                    {['ID', 'Modelo / Estado', 'Duración', 'Resultado'].map(h => (
                        <div key={h} style={{ ...label11, fontSize: '0.625rem' }}>{h}</div>
                    ))}
                </div>
                <div style={sep} />

                {tasks.length === 0 ? (
                    <EmptyState message="No hay actividad registrada aún" />
                ) : (
                    tasks.map((task, i) => (
                        <div key={task.id}>
                            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px 100px', padding: '14px 20px', alignItems: 'center' }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.02)'}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(60,60,67,0.40)' }}>
                                    #{task.id.slice(0, 6).toUpperCase()}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                        background: task.status === 'COMPLETED' ? '#34C759' : '#FF9500',
                                    }} />
                                    <div>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1C1C1E' }}>Agente IA</div>
                                        <div style={{ fontSize: '0.6875rem', color: 'rgba(60,60,67,0.40)', marginTop: 1 }}>
                                            {new Date(task.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.8125rem', color: 'rgba(60,60,67,0.55)' }}>
                                    {task.durationMs ? `${task.durationMs} ms` : '—'}
                                </div>
                                <div style={{
                                    display: 'inline-flex', padding: '4px 10px', borderRadius: 20,
                                    background: task.status === 'COMPLETED' ? 'rgba(52,199,89,0.10)' : 'rgba(255,149,0,0.10)',
                                    color: task.status === 'COMPLETED' ? '#25a562' : '#cc7700',
                                    fontSize: '0.6875rem', fontWeight: 600,
                                }}>
                                    {task.status === 'COMPLETED' ? 'Completado' : 'En proceso'}
                                </div>
                            </div>
                            {i < tasks.length - 1 && <div style={sep} />}
                        </div>
                    ))
                )}
            </div>

        </div>
        </div>
    );
}
