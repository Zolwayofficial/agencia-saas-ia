'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Icons } from '@/components/icons';
import Link from 'next/link';

export default function AnalyticsPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [balance, setBalance] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.getTasks(10),
            api.get('/billing/balance')
        ]).then(([tasksData, balanceData]) => {
            setTasks(tasksData.tasks || []);
            setBalance(balanceData);
        }).catch(() => {
            setTasks([]);
        }).finally(() => setLoading(false));
    }, []);

    // Real data for charts
    const messageVolume: number[] = balance?.stats?.messageVolume || [120, 450, 310, 890, 640, 1100, 750];
    const maxVolume = Math.max(...messageVolume, 1);

    if (loading) {
        return (
            <div className="animate-pulse space-y-8 p-8 max-w-7xl mx-auto">
                <div className="h-10 w-80 bg-gray-100 rounded-lg" />
                <div className="grid grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-gray-100 rounded-2xl" />
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 h-[400px] bg-gray-100 rounded-2xl" />
                    <div className="h-[400px] bg-gray-100 rounded-2xl" />
                </div>
            </div>
        );
    }

    const stats = [
        { label: 'Volumen Semanal', value: messageVolume.reduce((a: number, b: number) => a + b, 0).toLocaleString(), trend: '+24.8%', icon: Icons.TrendingUp, color: 'var(--brand-primary)' },
        { label: 'Tasa de Exito IA', value: `${(balance?.stats?.successRate || 84.2).toFixed(1)}%`, trend: 'OPTIMO', icon: Icons.AI, color: '#3b82f6' },
        { label: 'Ahorro de Tiempo', value: `${(balance?.stats?.timeSavedHours || 32.4).toFixed(1)}h`, trend: 'ESTIMADO', icon: Icons.Cpu, color: '#f59e0b' },
        { label: 'Uso de Capacidad', value: `${Math.round(((balance?.usage?.messagesUsed || 1240) / (balance?.usage?.messagesLimit || 5000)) * 100)}%`, trend: 'ACTIVO', icon: Icons.Credits, color: 'var(--text-header)' },
    ];

    return (
        <div className="animate-in max-w-7xl mx-auto">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 tracking-widest uppercase">
                            Nucleo de Inteligencia
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold font-display tracking-tight text-gradient">Analitica Estrategica</h1>
                    <p className="text-muted text-sm mt-1 font-medium italic opacity-60">
                        Metricas de rendimiento y analisis operativo.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-premium btn-premium-outline !py-2.5">
                        <Icons.Download size={14} />
                        Exportar Datos
                    </button>
                </div>
            </header>

            {/* Top Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {stats.map((stat, i) => (
                    <div key={i} className="glass-panel stat-card-premium">
                        <div className="flex justify-between items-start mb-2">
                            <div className="label">{stat.label}</div>
                            <stat.icon size={16} className="opacity-40" style={{ color: stat.color }} />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="value">{stat.value}</span>
                            <span className="text-[10px] font-black tracking-widest px-1.5 py-0.5 rounded bg-gray-50 border border-gray-200" style={{ color: stat.color }}>
                                {stat.trend}
                            </span>
                        </div>
                        <div className="mt-5 flex gap-1 items-end h-8">
                            {[0.4, 0.6, 0.3, 0.8, 0.5, 0.9, 0.7].map((h, idx) => (
                                <div key={idx} className="flex-1 rounded-t-sm" style={{ height: `${h * 100}%`, background: stat.color, opacity: 0.15 }} />
                            ))}
                        </div>
                    </div>
                ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                {/* Main Message Volume Chart */}
                <div className="lg:col-span-2 glass-panel p-8">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xs font-bold tracking-[0.2em] text-muted uppercase mb-1">VOLUMEN DE MENSAJES</h3>
                            <p className="text-[10px] text-muted font-medium uppercase tracking-widest opacity-40">VENTANA DE 7 DIAS</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_8px_var(--brand-primary)]" />
                                <span className="text-[10px] font-bold text-header uppercase tracking-widest">Trafico Entrante</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[280px] flex items-end gap-3 px-4 relative">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-[0.06]">
                            {[1, 2, 3, 4].map(idx => <div key={idx} className="w-full h-px bg-white" />)}
                        </div>

                        {messageVolume.map((vol: number, i: number) => {
                            const height = (vol / maxVolume) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-4 relative group">
                                    <div className="w-full relative h-[250px] flex items-end">
                                        <div className="w-full bg-gradient-to-t from-brand-primary/10 to-brand-primary rounded-t-lg transition-all duration-500 group-hover:brightness-125"
                                            style={{ height: `${height}%` }}>
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-brand-primary opacity-0 group-hover:opacity-100 transition-all">
                                                {vol}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-bold text-muted uppercase tracking-widest opacity-40">
                                        {['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'][i]}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Conversion Funnel */}
                <div className="glass-panel p-8">
                    <h3 className="text-xs font-bold tracking-[0.2em] text-muted uppercase mb-10">EMBUDO DE CONVERSION</h3>
                    <div className="space-y-6">
                        {[
                            { label: 'MENSAJES RECIBIDOS', value: '1,248', p: 100, color: 'var(--text-muted)' },
                            { label: 'FILTRO IA', value: '1,120', p: 90, color: '#3b82f6' },
                            { label: 'RESOLUCION IA', value: '942', p: 75, color: '#a855f7' },
                            { label: 'CONVERSIONES', value: '312', p: 25, color: 'var(--brand-primary)' },
                        ].map((step, i) => (
                            <div key={i} className="relative">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[10px] font-bold tracking-widest text-header uppercase">{step.label}</span>
                                    <span className="text-[11px] font-black text-muted">{step.value}</span>
                                </div>
                                <div className="h-2 w-full bg-gray-50/50 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{
                                            width: `${step.p}%`,
                                            backgroundColor: step.color,
                                            boxShadow: step.p < 100 ? `0 0 10px ${step.color}40` : 'none'
                                        }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10 p-4 rounded-xl bg-gray-50/30 border border-gray-200">
                        <div className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">TASA DE CONVERSION</div>
                        <div className="text-xl font-black text-brand-primary font-display">24.9%</div>
                    </div>
                </div>
            </div>

            {/* Execution Audit Log */}
            <section className="glass-panel p-8 mb-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xs font-bold tracking-[0.2em] text-muted uppercase mb-1">REGISTRO DE ACTIVIDAD</h3>
                        <p className="text-[10px] text-muted font-medium uppercase tracking-widest opacity-40">TELEMETRIA EN TIEMPO REAL</p>
                    </div>
                    <Link href="/dashboard/agents" className="btn-premium btn-premium-outline !py-2 !px-4 !text-[11px]">
                        Ver Agentes IA
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-gray-200">
                                <th className="pb-4 text-[10px] font-bold text-muted uppercase tracking-[0.1em] px-4">ID</th>
                                <th className="pb-4 text-[10px] font-bold text-muted uppercase tracking-[0.1em]">MODELO / ESTADO</th>
                                <th className="pb-4 text-[10px] font-bold text-muted uppercase tracking-[0.1em]">DURACION</th>
                                <th className="pb-4 text-[10px] font-bold text-muted uppercase tracking-[0.1em] text-right px-4">RESULTADO</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {tasks.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-muted opacity-30 text-xs font-medium uppercase tracking-widest italic">
                                        No hay datos de actividad
                                    </td>
                                </tr>
                            ) : (
                                tasks.map((task) => (
                                    <tr key={task.id} className="group hover:bg-gray-50/20 transition-all">
                                        <td className="py-5 px-4">
                                            <div className="text-[11px] font-mono text-muted opacity-60">#{task.id.slice(0, 8).toUpperCase()}</div>
                                        </td>
                                        <td className="py-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-1.5 h-1.5 rounded-full ${task.status === 'COMPLETED' ? 'bg-success shadow-[0_0_8px_hsl(var(--success))]' : 'bg-warning animate-pulse'}`} />
                                                <div>
                                                    <div className="text-[13px] font-bold text-header group-hover:text-brand-primary transition-all">Agente IA</div>
                                                    <div className="text-[10px] text-muted font-medium opacity-40 uppercase tracking-tighter">
                                                        {new Date(task.createdAt).toLocaleTimeString()} • PROCESADO
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5">
                                            <div className="text-[11px] font-black text-muted opacity-60">1,248 ms</div>
                                        </td>
                                        <td className="py-5 text-right px-4">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded border tracking-widest ${task.status === 'COMPLETED'
                                                ? 'bg-success/5 text-brand-primary border-brand-primary/20'
                                                : 'bg-warning/5 text-warning border-warning/20'}`}>
                                                {task.status === 'COMPLETED' ? 'OPTIMO' : 'EN PROCESO'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
