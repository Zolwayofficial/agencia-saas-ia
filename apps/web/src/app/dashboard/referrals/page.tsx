'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Icons } from '@/components/icons';

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
            <div className="animate-pulse space-y-8 p-8 max-w-7xl mx-auto">
                <div className="h-10 w-80 bg-gray-100 rounded-lg" />
                <div className="grid grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-gray-100 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in max-w-7xl mx-auto">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 tracking-widest uppercase">
                            Programa de Referidos
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold font-display tracking-tight text-gradient">Programa de Referidos</h1>
                    <p className="text-muted text-sm mt-1 font-medium italic opacity-60">
                        Multiplica tus ingresos invitando a otros a la plataforma.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-lg bg-success/5 border border-success/20 flex items-center gap-3">
                        <Icons.Check className="text-success" size={14} />
                        <span className="text-[11px] font-black tracking-widest text-success">PROGRAMA ACTIVO</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {/* Referral Code Card */}
                <div className="glass-panel stat-card-premium flex flex-col justify-between">
                    <div>
                        <div className="label mb-4">Tu Codigo de Referido</div>
                        <div className="p-4 bg-black/30 rounded-xl border border-gray-200 flex justify-between items-center group">
                            <span className="text-lg font-mono font-black tracking-wider text-brand-primary">
                                {referral?.code || 'X7-CORE'}
                            </span>
                            <Icons.QrCode size={16} className="text-muted opacity-40" />
                        </div>
                    </div>
                    <button
                        onClick={copyLink}
                        className={`btn-premium w-full mt-6 !py-3 ${copied ? 'btn-premium-primary' : 'btn-premium-outline'}`}
                    >
                        {copied ? <Icons.Check size={14} /> : <Icons.Copy size={14} />}
                        {copied ? 'LINK COPIADO' : 'COPIAR LINK DE REFERIDO'}
                    </button>
                </div>

                {/* Flat Commission Card */}
                <div className="glass-panel stat-card-premium">
                    <div className="label mb-2">Comision</div>
                    <div className="text-4xl font-black text-brand-primary font-display mb-1 flex items-baseline gap-1">
                        20%
                        <span className="text-xs font-bold text-muted opacity-40 uppercase tracking-widest">De por vida</span>
                    </div>
                    <div className="text-[11px] font-black tracking-widest text-header uppercase mb-3">Comision Directa</div>
                    <p className="text-[10px] text-muted leading-relaxed opacity-60 italic">
                        Ganas el 20% de cada pago que hagan tus referidos. Sin complicaciones.
                    </p>
                </div>

                {/* Performance Card */}
                <div className="glass-panel stat-card-premium">
                    <div className="label mb-2">Tu Red</div>
                    <div className="text-4xl font-black text-header font-display mb-1">
                        {network?.referrals?.length || 0}
                    </div>
                    <div className="text-[11px] font-black tracking-widest text-muted uppercase opacity-40 mb-4">Referidos Activos</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50/30 border border-gray-200 rounded-lg">
                            <div className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1">Pendientes</div>
                            <div className="text-sm font-black text-header">0</div>
                        </div>
                        <div className="p-3 bg-gray-50/30 border border-gray-200 rounded-lg">
                            <div className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1">Conversion</div>
                            <div className="text-sm font-black text-header">0%</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Steps Section */}
            <section className="glass-panel p-8 mb-12">
                <h3 className="text-xs font-bold tracking-[0.2em] text-muted uppercase mb-10 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_10px_var(--brand-primary)]" />
                    Como Funciona
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        { icon: Icons.Share, label: '1. COMPARTE TU LINK', color: 'var(--brand-primary)', desc: 'Comparte tu link en redes sociales, comunidades y grupos.' },
                        { icon: Icons.UserPlus, label: '2. SE REGISTRAN', color: '#3b82f6', desc: 'Tus invitados se registran con tu codigo. Sigue el progreso aqui.' },
                        { icon: Icons.TrendingUp, label: '3. GANAS COMISIONES', color: 'var(--brand-primary)', desc: 'Recibes el 20% neto por cada suscripcion activa de tus referidos.' }
                    ].map((step, i) => (
                        <div key={i} className="flex gap-4 group">
                            <div className="w-10 h-10 rounded-full bg-gray-50/30 border border-gray-200 flex items-center justify-center shrink-0 group-hover:border-brand-primary/30 transition-all" style={{ color: step.color }}>
                                <step.icon size={18} />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-black tracking-widest text-header uppercase mb-1">{step.label}</h4>
                                <p className="text-[10px] text-muted leading-relaxed opacity-60 font-medium">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Projections Table */}
            <section className="glass-panel p-8 mb-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xs font-bold tracking-[0.2em] text-muted uppercase mb-1">PROYECCION DE INGRESOS</h3>
                        <p className="text-[10px] text-muted font-medium uppercase tracking-widest opacity-40">ESTIMACION DE RENDIMIENTO ANUAL</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded bg-gray-50/30 border border-gray-200">
                        <Icons.Credits size={12} className="text-brand-primary" />
                        <span className="text-[9px] font-bold text-muted uppercase italic tracking-widest">Programa V1.0</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-gray-200">
                                <th className="pb-4 text-[10px] font-bold text-muted uppercase tracking-[0.1em] px-4">REFERIDOS</th>
                                <th className="pb-4 text-[10px] font-bold text-muted uppercase tracking-[0.1em]">PLAN PROMEDIO</th>
                                <th className="pb-4 text-[10px] font-bold text-muted uppercase tracking-[0.1em]">INGRESO MENSUAL</th>
                                <th className="pb-4 text-[10px] font-bold text-muted uppercase tracking-[0.1em] text-right px-4">INGRESO ANUAL EST.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[
                                { count: 5, avg: 79, color: 'var(--text-header)' },
                                { count: 10, avg: 149, color: 'var(--text-header)' },
                                { count: 25, avg: 149, color: 'var(--brand-primary)', highlight: true },
                                { count: 50, avg: 199, color: 'var(--brand-primary)', highlight: true },
                            ].map((row, i) => (
                                <tr key={i} className={`group hover:bg-gray-50/20 transition-all ${row.highlight ? 'bg-brand-primary/[0.02]' : ''}`}>
                                    <td className="py-5 px-4 text-xs font-black text-header uppercase tracking-widest">{row.count} Referidos</td>
                                    <td className="py-5 text-xs font-bold text-muted opacity-60 tracking-wider">${row.avg} Promedio</td>
                                    <td className="py-5 text-xs font-black" style={{ color: row.color }}>${(row.count * row.avg * 0.20).toLocaleString()}</td>
                                    <td className="py-5 text-right px-4 text-sm font-black" style={{ color: row.color }}>
                                        ${(row.count * row.avg * 0.20 * 12).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
