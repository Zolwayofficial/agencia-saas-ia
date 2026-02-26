'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Icons } from '@/components/icons';

function IOSCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', ...style }}>{children}</div>;
}

function SectionHeader({ children, sub }: { children: React.ReactNode; sub?: string }) {
    return (
        <div style={{ marginBottom: 8, marginTop: 28, paddingLeft: 4 }}>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0 }}>{children}</p>
            {sub && <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0', opacity: 0.7 }}>{sub}</p>}
        </div>
    );
}

const PROJECTIONS = [
    { count: 5,  avg: 79  },
    { count: 10, avg: 149 },
    { count: 25, avg: 149 },
    { count: 50, avg: 199 },
];

export default function ReferralsPage() {
    const [referral, setReferral]   = useState<any>(null);
    const [network,  setNetwork]    = useState<any>(null);
    const [loading,  setLoading]    = useState(true);
    const [copied,   setCopied]     = useState(false);

    useEffect(() => {
        Promise.all([
            api.getMyCode().catch(() => null),
            api.getNetwork().catch(() => null),
        ]).then(([ref, net]) => { setReferral(ref); setNetwork(net); })
          .finally(() => setLoading(false));
    }, []);

    const copyLink = () => {
        const link = `${window.location.origin}/register?ref=${referral?.code || ''}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    if (loading) {
        return (
            <div style={{ maxWidth: 860, margin: '0 auto' }}>
                {[1,2,3].map(i => (
                    <div key={i} style={{ height: 80, borderRadius: 12, background: 'rgba(120,120,128,0.08)', marginBottom: 12 }} />
                ))}
            </div>
        );
    }

    const activeReferrals = network?.referrals?.length || 0;

    return (
        <div style={{ maxWidth: 860, margin: '0 auto' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--brand-primary)', marginBottom: 6 }}>
                        Programa de Referidos
                    </p>
                    <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5, color: '#000', lineHeight: 1.15, margin: 0 }}>
                        Programa de Referidos
                    </h1>
                    <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 4 }}>
                        Multiplica tus ingresos invitando a otros a la plataforma.
                    </p>
                </div>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px', borderRadius: 20,
                    background: 'rgba(52,201,123,0.1)',
                    border: '1px solid rgba(52,201,123,0.25)',
                    fontSize: 12, fontWeight: 600, color: 'var(--brand-primary)',
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-primary)', display: 'inline-block' }} />
                    Programa Activo
                </div>
            </div>

            {/* ── Top 3 cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>

                {/* Tu código */}
                <IOSCard style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14 }}>
                    <div>
                        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', margin: '0 0 10px' }}>
                            Tu Código de Referido
                        </p>
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 12px', borderRadius: 9,
                            background: 'rgba(52,201,123,0.06)',
                            border: '1px solid rgba(52,201,123,0.2)',
                        }}>
                            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: 'var(--brand-primary)', letterSpacing: '0.05em' }}>
                                {referral?.code || 'REF-FULLLOGIN'}
                            </span>
                            <Icons.QrCode size={15} color="var(--brand-primary)" style={{ opacity: 0.5 }} />
                        </div>
                    </div>
                    <button
                        onClick={copyLink}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                            padding: '10px', borderRadius: 10, border: 'none',
                            background: copied ? 'rgba(52,201,123,0.1)' : 'var(--brand-primary)',
                            color: copied ? 'var(--brand-primary)' : '#fff',
                            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                            transition: 'all 0.2s',
                        }}
                    >
                        {copied ? <Icons.Check size={14} /> : <Icons.Copy size={14} />}
                        {copied ? 'Link Copiado' : 'Copiar Link'}
                    </button>
                </IOSCard>

                {/* Comisión */}
                <IOSCard style={{ padding: '18px' }}>
                    <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', margin: '0 0 10px' }}>
                        Comisión
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 40, fontWeight: 700, color: 'var(--brand-primary)', letterSpacing: -1, lineHeight: 1 }}>20%</span>
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>de por vida</span>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#000', margin: '6px 0 4px' }}>Comisión Directa</p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                        Ganas el 20% de cada pago que hagan tus referidos. Sin complicaciones.
                    </p>
                </IOSCard>

                {/* Tu red */}
                <IOSCard style={{ padding: '18px' }}>
                    <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', margin: '0 0 10px' }}>
                        Tu Red
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
                        <span style={{ fontSize: 40, fontWeight: 700, color: '#000', letterSpacing: -1, lineHeight: 1 }}>{activeReferrals}</span>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>referidos activos</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {[
                            { label: 'Pendientes', value: '0' },
                            { label: 'Conversión',  value: '0%' },
                        ].map(s => (
                            <div key={s.label} style={{ padding: '10px 12px', borderRadius: 9, background: 'rgba(120,120,128,0.07)' }}>
                                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', margin: '0 0 4px' }}>{s.label}</p>
                                <p style={{ fontSize: 17, fontWeight: 700, color: '#000', margin: 0 }}>{s.value}</p>
                            </div>
                        ))}
                    </div>
                </IOSCard>
            </div>

            {/* ── Cómo funciona ── */}
            <SectionHeader>Cómo Funciona</SectionHeader>
            <IOSCard>
                {[
                    { icon: Icons.Share,      step: '1', label: 'Comparte tu link',    desc: 'Comparte tu link en redes sociales, comunidades y grupos.',                     color: 'var(--brand-primary)' },
                    { icon: Icons.UserPlus,   step: '2', label: 'Se registran',         desc: 'Tus invitados se registran con tu código. Sigue el progreso aquí.',             color: '#007AFF' },
                    { icon: Icons.TrendingUp, step: '3', label: 'Ganas comisiones',     desc: 'Recibes el 20% neto por cada suscripción activa de tus referidos.',             color: 'var(--brand-primary)' },
                ].map((s, i) => (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 14,
                        padding: '16px 18px',
                        borderBottom: i < 2 ? '1px solid rgba(60,60,67,0.1)' : 'none',
                    }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                            background: `${s.color}15`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: s.color,
                        }}>
                            <s.icon size={20} />
                        </div>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: s.color, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                Paso {s.step}
                            </p>
                            <p style={{ fontSize: 15, fontWeight: 600, color: '#000', margin: '0 0 3px' }}>{s.label}</p>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
                        </div>
                    </div>
                ))}
            </IOSCard>

            {/* ── Proyección de ingresos ── */}
            <SectionHeader sub="Estimación de rendimiento anual">Proyección de Ingresos</SectionHeader>
            <IOSCard>
                {/* Table header */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
                    padding: '10px 18px',
                    borderBottom: '1px solid rgba(60,60,67,0.1)',
                    background: 'rgba(120,120,128,0.04)',
                }}>
                    {['Referidos', 'Plan Promedio', 'Ingreso Mensual', 'Ingreso Anual Est.'].map(h => (
                        <span key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</span>
                    ))}
                </div>
                {PROJECTIONS.map((row, i) => {
                    const monthly = row.count * row.avg * 0.20;
                    const annual  = monthly * 12;
                    const highlight = row.count >= 25;
                    return (
                        <div key={i} style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
                            padding: '14px 18px',
                            borderBottom: i < PROJECTIONS.length - 1 ? '1px solid rgba(60,60,67,0.08)' : 'none',
                            background: highlight ? 'rgba(52,201,123,0.03)' : 'transparent',
                        }}>
                            <span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>{row.count} referidos</span>
                            <span style={{ fontSize: 15, color: 'var(--text-secondary)' }}>${row.avg} prom.</span>
                            <span style={{ fontSize: 15, fontWeight: 600, color: highlight ? 'var(--brand-primary)' : '#000' }}>
                                ${monthly.toLocaleString()}
                            </span>
                            <span style={{ fontSize: 15, fontWeight: 700, color: highlight ? 'var(--brand-primary)' : '#000' }}>
                                ${annual.toLocaleString()}
                            </span>
                        </div>
                    );
                })}
                <div style={{ padding: '12px 18px', borderTop: '1px solid rgba(60,60,67,0.08)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icons.Credits size={13} color="var(--brand-primary)" />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Programa V1.0 · Comisión 20% de por vida</span>
                </div>
            </IOSCard>

            <div style={{ height: 32 }} />
        </div>
    );
}
