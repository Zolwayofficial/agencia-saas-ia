'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Icons } from '@/components/icons';
import Link from 'next/link';

// ── Style tokens ──────────────────────────────────────────────────────────────
const F: React.CSSProperties = {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
};
const card: React.CSSProperties = {
    ...F,
    background:   '#FFFFFF',
    borderRadius: 20,
    boxShadow:    '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
    overflow:     'hidden',
};
const label11: React.CSSProperties = {
    ...F,
    fontSize:      '0.6875rem',
    fontWeight:    600,
    letterSpacing: '0.07em',
    textTransform: 'uppercase' as const,
    color:         'rgba(60,60,67,0.50)',
};
const sep: React.CSSProperties = {
    height: '0.5px',
    background: 'rgba(60,60,67,0.10)',
    margin: '0 16px',
};

const DAYS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

const FUNNEL = [
    { label: 'Mensajes recibidos', value: '1,248', pct: 100, color: '#C7C7CC' },
    { label: 'Filtro IA',          value: '1,120', pct: 90,  color: '#007AFF' },
    { label: 'Resolución IA',      value: '942',   pct: 75,  color: '#AF52DE' },
    { label: 'Conversiones',       value: '312',   pct: 25,  color: '#34C759' },
];

export default function AnalyticsPage() {
    const [tasks,   setTasks]   = useState<any[]>([]);
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

    const vol: number[] = balance?.stats?.messageVolume || [120, 450, 310, 890, 640, 1100, 750];
    const maxVol = Math.max(...vol, 1);

    const kpis = [
        {
            label:  'Volumen Semanal',
            value:  vol.reduce((a: number, b: number) => a + b, 0).toLocaleString(),
            badge:  '+24.8%',
            badgeColor: '#34C759',
            icon:   Icons.TrendingUp,
            accent: '#34C759',
            spark:  [0.3, 0.5, 0.4, 0.7, 0.6, 0.9, 0.75],
        },
        {
            label:  'Tasa de Éxito IA',
            value:  `${(balance?.stats?.successRate || 84.2).toFixed(1)}%`,
            badge:  'Óptimo',
            badgeColor: '#007AFF',
            icon:   Icons.AI,
            accent: '#007AFF',
            spark:  [0.6, 0.7, 0.65, 0.75, 0.8, 0.85, 0.84],
        },
        {
            label:  'Ahorro de Tiempo',
            value:  `${(balance?.stats?.timeSavedHours || 32.4).toFixed(1)}h`,
            badge:  'Estimado',
            badgeColor: '#FF9500',
            icon:   Icons.Cpu,
            accent: '#FF9500',
            spark:  [0.4, 0.5, 0.45, 0.6, 0.55, 0.7, 0.65],
        },
        {
            label:  'Uso de Capacidad',
            value:  `${Math.round(((balance?.usage?.messagesUsed || 1240) / (balance?.usage?.messagesLimit || 5000)) * 100)}%`,
            badge:  'Activo',
            badgeColor: '#8E8E93',
            icon:   Icons.Credits,
            accent: '#8E8E93',
            spark:  [0.1, 0.12, 0.11, 0.15, 0.13, 0.14, 0.12],
        },
    ];

    if (loading) {
        return (
            <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ height: 42, width: 220, background: '#f0f0f5', borderRadius: 12 }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                    {[1,2,3,4].map(i => <div key={i} style={{ height: 110, background: '#f0f0f5', borderRadius: 20 }} />)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
                    <div style={{ height: 340, background: '#f0f0f5', borderRadius: 20 }} />
                    <div style={{ height: 340, background: '#f0f0f5', borderRadius: 20 }} />
                </div>
            </div>
        );
    }

    return (
        <div
            className="animate-in"
            style={{ ...F, maxWidth: 1100, margin: '0 auto', padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: 20 }}
        >

            {/* ── Header ─────────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <span style={{
                        display: 'inline-block', marginBottom: 8,
                        padding: '2px 8px', borderRadius: 6,
                        background: 'rgba(0,122,255,0.10)', color: '#007AFF',
                        fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
                    }}>
                        Núcleo de Inteligencia
                    </span>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#1C1C1E', lineHeight: 1.1, margin: 0 }}>
                        Analítica Estratégica
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: 'rgba(60,60,67,0.50)', marginTop: 4, fontWeight: 400 }}>
                        Métricas de rendimiento y análisis operativo.
                    </p>
                </div>
                <button style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '9px 16px', borderRadius: 12, border: 'none',
                    background: 'rgba(0,0,0,0.06)', color: '#1C1C1E',
                    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                }}>
                    <Icons.Download size={14} />
                    Exportar Datos
                </button>
            </div>

            {/* ── KPI Cards ──────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                {kpis.map((k, i) => (
                    <div key={i} style={{ ...card, padding: '18px 20px 14px' }}>
                        {/* Top row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <span style={label11}>{k.label}</span>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: `${k.accent}18`, color: k.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <k.icon size={14} />
                            </div>
                        </div>
                        {/* Value */}
                        <div style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.04em', color: '#1C1C1E', lineHeight: 1 }}>
                            {k.value}
                        </div>
                        {/* Badge */}
                        <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 7px', borderRadius: 20, background: `${k.badgeColor}14` }}>
                            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: k.badgeColor }}>{k.badge}</span>
                        </div>
                        {/* Sparkline */}
                        <div style={{ marginTop: 12, display: 'flex', alignItems: 'flex-end', gap: 3, height: 28 }}>
                            {k.spark.map((h, si) => (
                                <div key={si} style={{
                                    flex: 1, borderRadius: '3px 3px 0 0',
                                    height: `${h * 100}%`,
                                    background: k.accent,
                                    opacity: si === k.spark.length - 1 ? 0.9 : 0.20 + si * 0.08,
                                    transition: 'opacity 0.2s',
                                }} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Chart Row ──────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>

                {/* Bar Chart */}
                <div style={{ ...card, padding: '22px 24px 20px' }}>
                    {/* Chart header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                        <div>
                            <div style={label11}>Volumen de Mensajes</div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(60,60,67,0.35)', marginTop: 2 }}>Ventana de 7 días</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 20, background: 'rgba(52,201,123,0.08)' }}>
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34C759', boxShadow: '0 0 5px #34C759' }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34C759' }}>Tráfico entrante</span>
                        </div>
                    </div>

                    {/* Bars */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 200, padding: '0 4px' }}>
                        {vol.map((v: number, i: number) => {
                            const h   = (v / maxVol) * 100;
                            const hov = hoveredBar === i;
                            return (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}
                                    onMouseEnter={() => setHoveredBar(i)}
                                    onMouseLeave={() => setHoveredBar(null)}>
                                    {/* Tooltip */}
                                    <div style={{
                                        fontSize: '0.75rem', fontWeight: 700, color: '#34C759',
                                        opacity: hov ? 1 : 0, transition: 'opacity 0.15s',
                                        background: 'rgba(52,201,123,0.10)', padding: '2px 6px', borderRadius: 6,
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {v.toLocaleString()}
                                    </div>
                                    {/* Bar */}
                                    <div style={{
                                        width: '100%',
                                        height: `${h}%`,
                                        borderRadius: '6px 6px 0 0',
                                        background: hov
                                            ? '#34C759'
                                            : 'linear-gradient(to top, rgba(52,201,123,0.35) 0%, rgba(52,201,123,0.15) 100%)',
                                        transition: 'background 0.15s, transform 0.15s',
                                        transform: hov ? 'scaleX(1.05)' : 'none',
                                        transformOrigin: 'bottom',
                                    }} />
                                    {/* Day label */}
                                    <div style={{ ...label11, fontSize: '0.625rem', letterSpacing: '0.05em' }}>{DAYS[i]}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Conversion Funnel */}
                <div style={{ ...card, padding: '22px 20px' }}>
                    <div style={{ ...label11, marginBottom: 20 }}>Embudo de Conversión</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {FUNNEL.map((step, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3A3A3C', letterSpacing: '-0.01em' }}>
                                        {step.label}
                                    </span>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.02em' }}>
                                        {step.value}
                                    </span>
                                </div>
                                {/* Progress track */}
                                <div style={{ height: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${step.pct}%`,
                                        borderRadius: 3,
                                        background: step.color,
                                        boxShadow: step.pct < 100 ? `0 0 8px ${step.color}60` : 'none',
                                        transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Conversion Rate — iOS stat widget */}
                    <div style={{ marginTop: 24, padding: '16px', borderRadius: 14, background: 'rgba(52,201,123,0.07)' }}>
                        <div style={{ ...label11, marginBottom: 6 }}>Tasa de Conversión</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                            <span style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.04em', color: '#1C1C1E', lineHeight: 1 }}>24.9%</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34C759' }}>↑ Activo</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Activity Log ───────────────────────────────── */}
            <div style={card}>
                {/* Header */}
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

                {/* Table head */}
                <div style={{ ...sep, margin: '0' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px 100px', gap: 0, padding: '10px 20px', background: 'rgba(0,0,0,0.015)' }}>
                    {['ID', 'Modelo / Estado', 'Duración', 'Resultado'].map(h => (
                        <div key={h} style={{ ...label11, fontSize: '0.625rem' }}>{h}</div>
                    ))}
                </div>
                <div style={sep} />

                {/* Rows */}
                {tasks.length === 0 ? (
                    <div style={{ padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icons.Analytics size={20} style={{ color: 'rgba(60,60,67,0.25)' }} />
                        </div>
                        <span style={{ fontSize: '0.875rem', color: 'rgba(60,60,67,0.30)', fontWeight: 500 }}>
                            No hay datos de actividad
                        </span>
                    </div>
                ) : (
                    tasks.map((task, i) => (
                        <div key={task.id}>
                            <div style={{
                                display: 'grid', gridTemplateColumns: '80px 1fr 120px 100px',
                                padding: '14px 20px', alignItems: 'center',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.02)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                            >
                                {/* ID */}
                                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(60,60,67,0.40)' }}>
                                    #{task.id.slice(0, 6).toUpperCase()}
                                </div>
                                {/* Model + status */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                        background: task.status === 'COMPLETED' ? '#34C759' : '#FF9500',
                                        boxShadow: task.status === 'COMPLETED' ? '0 0 5px #34C75960' : '0 0 5px #FF950060',
                                    }} />
                                    <div>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1C1C1E' }}>Agente IA</div>
                                        <div style={{ fontSize: '0.6875rem', color: 'rgba(60,60,67,0.40)', marginTop: 1 }}>
                                            {new Date(task.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} · Procesado
                                        </div>
                                    </div>
                                </div>
                                {/* Duration */}
                                <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'rgba(60,60,67,0.55)' }}>1,248 ms</div>
                                {/* Result */}
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center',
                                    padding: '4px 10px', borderRadius: 20,
                                    background: task.status === 'COMPLETED' ? 'rgba(52,201,123,0.10)' : 'rgba(255,149,0,0.10)',
                                    color: task.status === 'COMPLETED' ? '#25a562' : '#cc7700',
                                    fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.03em',
                                }}>
                                    {task.status === 'COMPLETED' ? 'Óptimo' : 'En proceso'}
                                </div>
                            </div>
                            {i < tasks.length - 1 && <div style={sep} />}
                        </div>
                    ))
                )}
            </div>

        </div>
    );
}
