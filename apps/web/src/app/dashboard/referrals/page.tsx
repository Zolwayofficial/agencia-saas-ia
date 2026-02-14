'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';

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
        return <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>Cargando referidos...</div>;
    }

    return (
        <>
            <h1 className="page-title">🤝 Programa de Referidos</h1>
            <p className="page-subtitle">Gana comisiones recurrentes por cada agencia que refieras</p>

            <div className="grid-stats">
                {/* Referral Code */}
                <div className="stat-card">
                    <div className="stat-label">Tu Código de Referido</div>
                    <div className="stat-value" style={{ fontSize: '1.5rem', fontFamily: 'monospace' }}>
                        {referral?.code || '—'}
                    </div>
                    <button
                        onClick={copyLink}
                        className="btn btn-primary"
                        style={{ marginTop: '1rem', width: '100%' }}
                    >
                        {copied ? '✅ Copiado!' : '📋 Copiar Link de Invitación'}
                    </button>
                </div>

                {/* Commission Rates */}
                <div className="stat-card">
                    <div className="stat-label">Tus Comisiones</div>
                    <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
                        <div>
                            <div className="stat-value" style={{ color: 'var(--status-success)' }}>
                                {referral?.level1Percent || 20}%
                            </div>
                            <div className="stat-detail">Nivel 1 (Directo)</div>
                        </div>
                        <div>
                            <div className="stat-value" style={{ color: 'var(--brand-accent)' }}>
                                {referral?.level2Percent || 5}%
                            </div>
                            <div className="stat-detail">Nivel 2 (Indirecto)</div>
                        </div>
                    </div>
                </div>

                {/* Network Size */}
                <div className="stat-card">
                    <div className="stat-label">Tu Red</div>
                    <div className="stat-value">{network?.referrals?.length || 0}</div>
                    <div className="stat-detail">Agencias referidas</div>
                </div>
            </div>

            {/* How it works */}
            <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>💡 ¿Cómo funciona?</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>1️⃣</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Comparte tu link</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                            Envía tu link de invitación a otras agencias
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>2️⃣</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Ellos se registran</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                            Comienzan gratis y upgradean cuando quieran
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>3️⃣</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Ganas cada mes</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                            20% recurrente mientras paguen su plan
                        </div>
                    </div>
                </div>
            </div>

            {/* Earnings Table */}
            <div className="glass-card">
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>📊 Tabla de Ganancias Potenciales</h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Referidos</th>
                            <th>Plan Promedio</th>
                            <th>Ingreso/mes</th>
                            <th>Ingreso/año</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>5</td>
                            <td>Starter ($29)</td>
                            <td style={{ color: 'var(--status-success)' }}>$29/mes</td>
                            <td style={{ color: 'var(--status-success)' }}>$348/año</td>
                        </tr>
                        <tr>
                            <td>10</td>
                            <td>Pro ($79)</td>
                            <td style={{ color: 'var(--status-success)' }}>$158/mes</td>
                            <td style={{ color: 'var(--status-success)' }}>$1,896/año</td>
                        </tr>
                        <tr>
                            <td>20</td>
                            <td>Mixto (~$50)</td>
                            <td style={{ color: 'var(--status-success)' }}>$200/mes</td>
                            <td style={{ color: 'var(--status-success)' }}>$2,400/año</td>
                        </tr>
                        <tr>
                            <td>50</td>
                            <td>Mixto (~$50)</td>
                            <td style={{ color: 'var(--status-success)', fontWeight: 700 }}>$500/mes</td>
                            <td style={{ color: 'var(--status-success)', fontWeight: 700 }}>$6,000/año</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
}
