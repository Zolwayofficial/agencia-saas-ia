'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Icons } from '@/components/icons';
import Link from 'next/link';

export default function MarketingPage() {
    const [instances, setInstances] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [campaignFilter, setCampaignFilter] = useState("Todas");

    useEffect(() => {
        api.getInstances()
            .then(data => setInstances(data.instances || []))
            .catch(() => setInstances([]))
            .finally(() => setLoading(false));
    }, []);

    const activeInstances = instances.filter(i => i.status === 'open' || i.connectionEstado === 'CONNECTED').length;
    const warmupLevel = activeInstances > 0 ? 3 : 0;

    if (loading) {
        return (
            <div className="animate-pulse space-y-8 p-8 max-w-7xl mx-auto">
                <div className="h-10 w-64 bg-gray-100 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-48 bg-gray-100 rounded-2xl md:col-span-2" />
                    <div className="h-48 bg-gray-100 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in max-w-7xl mx-auto">
            {/* Header section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 tracking-widest uppercase">
                            Crecimiento
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold font-display tracking-tight text-gradient">Motor de Campanas</h1>
                    <p className="text-muted text-sm mt-1 font-medium italic opacity-60">
                        Envio masivo inteligente con proteccion anti-bloqueo.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-premium btn-premium-primary !py-3 !px-6 shadow-[0_10px_30px_-10px_rgba(var(--brand-primary-rgb),0.3)]"
                >
                    <Icons.Plus size={18} />
                    Crear Campana
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                {/* SmartSend System */}
                <div className="lg:col-span-2 glass-panel p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20 shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.1)]">
                            <Icons.Rocket size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold font-display text-header">Estado del Motor de Envio</h2>
                            <p className="text-xs text-muted font-medium opacity-60 uppercase tracking-tight">Calibracion de velocidad y proteccion activa</p>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50/30 rounded-2xl border border-gray-200 relative overflow-hidden">
                        {/* Estado bar */}
                        <div className="flex justify-between items-end mb-3">
                            <span className="text-[10px] font-black tracking-[0.2em] text-muted uppercase">Canalo de Calentamiento (Nivel {warmupLevel}/5)</span>
                            <span className="text-[10px] font-black tracking-[0.2em] text-brand-primary uppercase">{warmupLevel * 20}% Optimo</span>
                        </div>
                        <div className="flex gap-1.5 h-2 mb-8">
                            {[1, 2, 3, 4, 5].map((level) => (
                                <div key={level} className={`flex-1 rounded-sm transition-all duration-1000 ${level <= warmupLevel
                                        ? 'bg-brand-primary shadow-[0_0_10px_rgba(var(--brand-primary-rgb),0.4)]'
                                        : 'bg-gray-100'
                                    }`} />
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-8 pt-6 border-t border-gray-200">
                            <div className="text-center md:text-left">
                                <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5 opacity-40">Velocidad</div>
                                <div className="text-xl font-black text-header">120 <span className="text-[10px] text-muted opacity-60">MSG/HR</span></div>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5 opacity-40">Rotacion</div>
                                <div className="text-xl font-black text-brand-primary">ACTIVO</div>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5 opacity-40">Proteccion</div>
                                <div className="flex items-center justify-center md:justify-start gap-2 text-xl font-black text-header">
                                    <Icons.Security size={20} className="text-brand-primary" />
                                    ALTA
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Infrastructure Stats */}
                <div className="glass-panel p-8 flex flex-col justify-between">
                    <div>
                        <h3 className="text-[10px] font-black tracking-[0.2em] text-muted uppercase mb-8 opacity-40 italic">Nodos Disponibles</h3>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-5xl font-black font-display text-gradient">{activeInstances}</span>
                            <span className="text-xs font-bold text-muted uppercase tracking-widest opacity-40">Nodos</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-brand-primary mb-8 px-3 py-1.5 rounded-full bg-brand-primary/5 border border-brand-primary/10 w-fit">
                            <Icons.WhatsApp size={14} />
                            {activeInstances} WhatsApp Listos
                        </div>
                    </div>

                    <Link href="/dashboard/whatsapp" className="btn-premium btn-premium-outline w-full justify-center text-[11px] !py-3">
                        Optimize Nodos <Icons.External size={14} className="ml-1 opacity-40" />
                    </Link>
                </div>
            </div>

            {/* Campaigns Table */}
            <section className="glass-panel p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <h3 className="text-[10px] font-black tracking-[0.2em] text-muted uppercase mb-1">Historial de Campanas</h3>
                        <p className="text-[10px] font-medium text-muted opacity-60 uppercase tracking-tighter">Registro de ejecucion de campanas</p>
                    </div>
                    <div className="flex p-1 bg-gray-50/50 rounded-xl border border-gray-200">
                        {['Todas', 'Activas', 'Pausadas', 'Completadas'].map(filter => (
                            <button key={filter} onClick={() => setCampaignFilter(filter)} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all ${filter === campaignFilter ? 'bg-brand-primary text-white shadow-[0_5px_15px_rgba(var(--brand-primary-rgb),0.2)]' : 'text-muted hover:text-header'
                                }`}>
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-gray-200">
                                <th className="pb-5 text-[10px] font-black text-muted uppercase tracking-[0.2em] px-4">Campana</th>
                                <th className="pb-5 text-[10px] font-black text-muted uppercase tracking-[0.2em]">Canal</th>
                                <th className="pb-5 text-[10px] font-black text-muted uppercase tracking-[0.2em]">Estado</th>
                                <th className="pb-5 text-[10px] font-black text-muted uppercase tracking-[0.2em] text-right">Enviados</th>
                                <th className="pb-5 text-[10px] font-black text-muted uppercase tracking-[0.2em] text-right px-4">Resultado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td colSpan={5} className="py-24 text-center">
                                    <div className="flex flex-col items-center gap-4 opacity-20">
                                        <Icons.Rocket size={48} />
                                        <p className="text-[11px] font-black tracking-[0.3em] uppercase">No hay campanas creadas</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Modal Hardware */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in transition-all">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative glass-panel w-full max-w-lg overflow-hidden p-10 animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold font-display text-header tracking-tight">Deploy New Canal</h2>
                            <button className="text-muted hover:text-header transition-colors" onClick={() => setShowModal(false)}>
                                <Icons.Logout size={18} />
                            </button>
                        </div>

                        <div className="space-y-6 mb-10">
                            <div>
                                <label className="block text-[10px] font-black tracking-[0.2em] text-muted uppercase mb-2 ml-1">Nombre de la Campana</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Promo_Febrero_2026"
                                    className="w-full bg-gray-50/50 border border-white/[0.07] rounded-xl px-5 py-3.5 text-sm text-header focus:border-brand-primary placeholder:text-muted/20 outline-none transition-all"
                                />
                            </div>
                            <div className="p-4 bg-brand-primary/5 rounded-xl border border-brand-primary/10">
                                <p className="text-[10px] font-medium text-brand-primary leading-relaxed">
                                    <span className="font-black">[NOTA]</span> La rotacion anti-bloqueo distribuira automaticamente el trafico entre todos los nodos WhatsApp autorizados para garantizar la seguridad y continuidad.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setShowModal(false)} className="btn-premium btn-premium-outline flex-1 justify-center">Cancelar</button>
                            <button onClick={() => setShowModal(false)} className="btn-premium btn-premium-primary flex-1 justify-center">Crear Campana</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
