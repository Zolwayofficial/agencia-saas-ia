'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';

// Professional SVG Icons
const Icons = {
    Copy: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
    ),
    Check: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
    ),
    Share: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" x2="12" y1="2" y2="15" /></svg>
    ),
    UserPlus: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>
    ),
    TrendingUp: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
    ),
};

export default function ReferralsPage() {
    const [referral, setReferral] = useState<any>(null);
    const [network, setNetwork] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        Promise.all([
            api.getMyCode().catch(() => null),
            api.getNetwork().catch(() => null),
        ])
            .then(([ref, net]) => {
                setReferral(ref);
                setNetwork(net);
            })
            .finally(() => setLoading(false));
    }, []);

    const copyLink = () => {
        const link = `${window.location.origin}/register?ref=${referral?.code || ''}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
                <div style={{ height: 40, width: '200px', background: 'var(--bg-glass)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ flex: 1, height: 120, background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', animation: 'pulse 1.5s infinite' }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="page-title">🤝 Programa de Referidos</h1>
                <p className="page-subtitle">Gana el 20% de comisión recurrente y vitalicia por cada agencia que refieras</p>
            </div>

            <div className="grid-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginBottom: '1.5rem' }}>
                {/* Referral Code Card */}
                <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <div className="stat-label">Tu Código de Invitación</div>
                        <div style={{
                            marginTop: '0.5rem',
                            padding: '1rem',
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)',
                            fontFamily: 'monospace',
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            color: 'var(--brand-primary)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            {referral?.code || 'NO-CODE'}
                        </div>
                    </div>
                    <button
                        onClick={copyLink}
                        className="btn btn-primary"
                        style={{ marginTop: '1.25rem', width: '100%', gap: '0.5rem' }}
                    >
                        {copied ? <Icons.Check /> : <Icons.Copy />}
                        {copied ? '¡Enlace Copiado!' : 'Copiar Enlace de Afiliado'}
                    </button>
                </div>

                {/* Flat Commission Card */}
                <div className="stat-card">
                    <div className="stat-label">Modelo de Comisión</div>
                    <div className="stat-value" style={{ color: 'var(--status-success)', fontSize: '2.5rem' }}>
                        20%
                    </div>
                    <div className="stat-detail" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        Directa y Vitalicia
                    </div>
                    <div style={{
                        marginTop: '0.75rem',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        padding: '0.5rem',
                        background: 'rgba(16,185,129,0.05)',
                        border: '1px solid rgba(16,185,129,0.2)',
                        borderRadius: '4px'
                    }}>
                        Ganas por cada renovación que realice tu invitado. Sin límites, sin niveles complejos.
                    </div>
                </div>

                {/* Performance Card */}
                <div className="stat-card">
                    <div className="stat-label">Tus Resultados</div>
                    <div className="stat-value">{network?.referrals?.length || 0}</div>
                    <div className="stat-detail">Agencias Activas</div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pendientes</div>
                            <div style={{ fontWeight: 600 }}>0</div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tasa Conv.</div>
                            <div style={{ fontWeight: 600 }}>0%</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Steps Section */}
            <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                    🎯 Cómo Maximizar tus Ganancias
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: '50%', background: 'rgba(80,205,149,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)', flexShrink: 0
                        }}>
                            <Icons.Share />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>1. Difunde el enlace</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.4 }}>
                                Comparte en tus redes, comunidades o con agencias aliadas.
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: '50%', background: 'rgba(59,130,246,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0
                        }}>
                            <Icons.UserPlus />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>2. Registro y Prueba</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.4 }}>
                                Recibe seguimiento en tiempo real cuando un invitado se registre.
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: '50%', background: 'rgba(16,185,129,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0
                        }}>
                            <Icons.TrendingUp />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>3. Ingreso Recurrente</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.4 }}>
                                Cobra el 20% neto de cada factura pagada por tus referidos.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Projections */}
            <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>💰 Proyección de Ingresos (20%)</h3>
                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'var(--bg-elevated)', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                        Valores estimados basados en planes promedio
                    </span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nº Agencias Invitadas</th>
                                <th>Plan Promedio Tarifa</th>
                                <th>Tu Comisión Mensual</th>
                                <th>Tu Ingreso Anual</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { count: 5, avg: 79, color: 'var(--text-primary)' },
                                { count: 10, avg: 149, color: 'var(--text-primary)' },
                                { count: 25, avg: 149, color: 'var(--brand-primary)', bold: true },
                                { count: 50, avg: 199, color: 'var(--status-success)', bold: true },
                            ].map((row) => (
                                <tr key={row.count} style={{ fontWeight: row.bold ? 600 : 400 }}>
                                    <td>{row.count} agencias</td>
                                    <td style={{ color: 'var(--text-muted)' }}>${row.avg} / mes</td>
                                    <td style={{ color: row.color }}>${(row.count * row.avg * 0.20).toFixed(0)}</td>
                                    <td style={{ color: row.color, fontWeight: row.bold ? 700 : 600 }}>
                                        ${(row.count * row.avg * 0.20 * 12).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
