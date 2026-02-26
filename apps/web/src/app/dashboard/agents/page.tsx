'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Icons } from '@/components/icons';

const STATUS_MAP: Record<string, { label: string; class: string; icon: any }> = {
    PENDING: { label: 'PENDIENTE', class: 'neutral', icon: Icons.Credits },
    RUNNING: { label: 'PROCESANDO', class: 'info', icon: Icons.AI },
    SUCCESS: { label: 'EXITOSO', class: 'success', icon: Icons.Check },
    ERROR: { label: 'ERROR', class: 'danger', icon: Icons.Logout },
    TIMEOUT: { label: 'TIEMPO AGOTADO', class: 'warning', icon: Icons.Clock },
};

export default function AgentsPage() {
    const [tasks, setTasks] = useState<any[]>([]);
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
                    <h1 className="text-4xl font-bold font-display tracking-tight text-gradient">Agentes IA</h1>
                    <p className="text-muted text-sm mt-1 font-medium italic opacity-60">
                        Monitoreo en tiempo real de ejecuciones de agentes IA.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="glass-panel px-4 py-2 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                        <span className="text-[10px] font-black tracking-widest text-header uppercase">Sincronizando</span>
                    </div>
                </div>
            </header>

            <div className="glass-panel overflow-hidden border-gray-200">
                {loading ? (
                    <div className="p-12 space-y-4 animate-pulse">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-10 bg-gray-100 rounded-lg w-full" />
                        ))}
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-24 px-8">
                        <div className="w-20 h-20 bg-gray-50/30 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Icons.Agents size={32} className="text-muted opacity-20" />
                        </div>
                        <h3 className="text-lg font-bold text-header mb-2">Sin Tareas</h3>
                        <p className="text-xs text-muted max-w-sm mx-auto opacity-60 italic leading-relaxed">
                            No se detectaron ejecuciones de agentes. Ejecuta tu primer agente IA via API para ver los resultados aqui.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] text-muted uppercase">Estado</th>
                                    <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] text-muted uppercase">Modelo</th>
                                    <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] text-muted uppercase">Pasos</th>
                                    <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] text-muted uppercase">Duracion</th>
                                    <th className="px-8 py-5 text-[10px] font-black tracking-[0.2em] text-muted uppercase text-right">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tasks.map((task) => {
                                    const status = STATUS_MAP[task.status] || STATUS_MAP.PENDING;
                                    return (
                                        <tr key={task.id} className="group hover:bg-gray-50/20 transition-all">
                                            <td className="px-8 py-4">
                                                <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-[9px] font-black tracking-widest border 
                                                    ${task.status === 'RUNNING' ? 'bg-info/10 text-info border-info/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]' :
                                                        task.status === 'SUCCESS' ? 'bg-success/10 text-success border-success/20' :
                                                            task.status === 'ERROR' ? 'bg-danger/10 text-danger border-danger/20' :
                                                                'bg-gray-100 text-muted border-gray-200'}`}>
                                                    {task.status === 'RUNNING' && <div className="w-1 h-1 rounded-full bg-info animate-ping" />}
                                                    {status.label}
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1 h-3 bg-brand-primary/20 rounded-full" />
                                                    <span className="text-xs font-mono font-bold text-header uppercase tracking-tight opacity-80">{task.model}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className="text-xs font-black text-header">{task.stepsUsed || '0'}</span>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className="text-xs font-bold text-muted tabular-nums">
                                                    {task.durationMs ? `${(task.durationMs / 1000).toFixed(2)}s` : '—'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <span className="text-[10px] font-bold text-muted uppercase opacity-40">
                                                    {new Date(task.createdAt).toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
