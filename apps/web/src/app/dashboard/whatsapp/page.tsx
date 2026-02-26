'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { Icons } from '@/components/icons';

interface WhatsappInstance {
    id: string;
    instanceName: string;
    displayName: string;
    phoneNumber: string;
    connectionStatus: 'DISCONNECTED' | 'QR_PENDING' | 'CONNECTED';
    health: string;
    messagesLast24h: number;
    createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; class: string; icon: any }> = {
    CONNECTED: { label: 'CONECTADO', class: 'success', icon: Icons.Check },
    QR_PENDING: { label: 'ESPERANDO QR', class: 'warning', icon: Icons.Pending },
    DISCONNECTED: { label: 'DESCONECTADO', class: 'danger', icon: Icons.Alert },
};

export default function WhatsAppPage() {
    const [instances, setInstances] = useState<WhatsappInstance[]>([]);
    const [limit, setLimit] = useState(1);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [qrModal, setQrModal] = useState<{ instanceId: string; qrCode: string | null; name: string } | null>(null);
    const [error, setError] = useState('');
    const pollRef = useRef<NodeJS.Timeout | null>(null);
    const [connectionType, setConnectionType] = useState<'QR' | 'API'>('QR');

    const fetchInstances = useCallback(async () => {
        try {
            const data = await api.get('/whatsapp/instances');
            setInstances(data.instances || []);
            setLimit(data.limit || 1);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInstances();
        const interval = setInterval(fetchInstances, 15000);
        return () => clearInterval(interval);
    }, [fetchInstances]);

    useEffect(() => {
        if (!qrModal) {
            if (pollRef.current) clearInterval(pollRef.current);
            return;
        }
        const poll = async () => {
            try {
                const data = await api.get(`/whatsapp/instances/${qrModal.instanceId}/qr`);
                if (data.status === 'CONNECTED') {
                    setQrModal(null);
                    fetchInstances();
                } else if (data.qrCode) {
                    setQrModal((prev) => prev ? { ...prev, qrCode: data.qrCode } : null);
                }
            } catch { /* retry */ }
        };
        pollRef.current = setInterval(poll, 4000);
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [qrModal?.instanceId, fetchInstances]);

    const createInstance = async () => {
        setCreating(true);
        setError('');
        try {
            const data = await api.post('/whatsapp/instances', {
                displayName: `Nodo WhatsApp ${instances.length + 1}`,
            });
            if (data.qrCode) {
                setQrModal({
                    instanceId: data.instance.id,
                    qrCode: data.qrCode,
                    name: data.instance.displayName,
                });
            }
            fetchInstances();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    };

    const reconnect = async (inst: WhatsappInstance) => {
        try {
            const data = await api.get(`/whatsapp/instances/${inst.id}/qr`);
            if (data.status === 'CONNECTED') {
                fetchInstances();
            } else {
                setQrModal({ instanceId: inst.id, qrCode: data.qrCode, name: inst.displayName });
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const logout = async (id: string) => {
        if (!confirm('Confirmar desconexion de esta instancia?')) return;
        try {
            await api.post(`/whatsapp/instances/${id}/logout`, {});
            fetchInstances();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const deleteInstance = async (id: string) => {
        if (!confirm('Eliminar permanentemente esta instancia?')) return;
        try {
            await api.delete(`/whatsapp/instances/${id}`);
            fetchInstances();
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-8 p-8 max-w-7xl mx-auto">
                <div className="h-10 w-80 bg-gray-100 rounded-lg" />
                <div className="grid grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-48 bg-gray-100 rounded-2xl" />
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
                            Operaciones
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold font-display tracking-tight text-gradient">Nodos WhatsApp</h1>
                    <p className="text-muted text-sm mt-1 font-medium italic opacity-60">
                        Despliega y gestiona tus instancias de WhatsApp.
                    </p>
                </div>
                <div className="flex bg-black/[0.05] p-1 rounded-2xl">
                    <button
                        onClick={() => setConnectionType('QR')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all
                        ${connectionType === 'QR' ? 'bg-brand-primary text-white' : 'text-muted hover:text-header'}`}
                    >
                        <Icons.QrCode size={12} /> Codigo QR
                    </button>
                    <button
                        onClick={() => setConnectionType('API')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all
                        ${connectionType === 'API' ? 'bg-brand-primary text-white' : 'text-muted hover:text-header'}`}
                    >
                        <Icons.Enterprise size={12} /> Meta API
                    </button>
                </div>
            </header>

            {error && (
                <div className="mb-8 p-4 rounded-xl bg-danger/5 border border-danger/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                    <Icons.Alert className="text-danger" size={16} />
                    <span className="text-xs font-bold text-danger uppercase tracking-tight">{error}</span>
                </div>
            )}

            {connectionType === 'QR' ? (
                <div className="space-y-8">
                    <div className="flex justify-between items-center px-4">
                        <div>
                            <h2 className="text-xs font-black tracking-[0.2em] text-muted uppercase">Instancias Activas</h2>
                            <p className="text-[10px] text-muted opacity-40 font-medium uppercase mt-1">Capacidad: {instances.length} / {limit}</p>
                        </div>
                        <button
                            className="btn-premium btn-premium-primary !py-2.5 !px-6"
                            onClick={createInstance}
                            disabled={creating || instances.length >= limit}
                        >
                            {creating ? 'Creando...' : 'Crear Nuevo Nodo'}
                        </button>
                    </div>

                    {instances.length === 0 && (
                        <div className="glass-panel py-24 text-center border-dashed border-gray-200">
                            <div className="w-20 h-20 bg-gray-50/30 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Icons.WhatsApp size={32} className="text-muted opacity-20" />
                            </div>
                            <h3 className="text-header font-bold mb-2">Sin Instancias Activas</h3>
                            <p className="text-xs text-muted max-w-xs mx-auto opacity-50 italic mb-8">Crea tu primera instancia de WhatsApp escaneando un codigo QR.</p>
                            <button className="btn-premium btn-premium-outline" onClick={createInstance} disabled={creating}>
                                Crear Instancia
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {instances.map((inst) => {
                            const statusCfg = STATUS_CONFIG[inst.connectionStatus] || STATUS_CONFIG.DISCONNECTED;
                            return (
                                <div key={inst.id} className="glass-panel p-6 group hover:border-brand-primary/20 transition-all duration-500">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-50/30 border border-gray-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Icons.WhatsApp className="text-brand-primary" size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-header uppercase tracking-tight">{inst.displayName}</h3>
                                                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest border mt-1
                                                    ${inst.connectionStatus === 'CONNECTED' ? 'bg-success/5 text-success border-success/20' :
                                                        inst.connectionStatus === 'QR_PENDING' ? 'bg-warning/5 text-warning border-warning/20 animate-pulse' :
                                                            'bg-danger/5 text-danger border-danger/20'}`}>
                                                    {statusCfg.label}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => deleteInstance(inst.id)} className="p-2 rounded-lg bg-gray-50/50 border border-gray-200 text-muted hover:text-danger hover:bg-danger/5 hover:border-danger/20 transition-all">
                                                <Icons.Trash size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="p-3 bg-gray-50/30 border border-gray-200 rounded-lg">
                                            <div className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1">Numero</div>
                                            <div className="text-xs font-mono font-bold text-header">{inst.phoneNumber || 'PENDIENTE'}</div>
                                        </div>
                                        <div className="p-3 bg-gray-50/30 border border-gray-200 rounded-lg">
                                            <div className="text-[9px] font-bold text-muted uppercase tracking-widest mb-1">Mensajes (24h)</div>
                                            <div className="text-xs font-bold text-header">{inst.messagesLast24h} msgs</div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-200">
                                        {inst.connectionStatus === 'CONNECTED' ? (
                                            <button className="btn-premium btn-premium-outline w-full !py-2.5" onClick={() => logout(inst.id)}>
                                                Desconectar
                                            </button>
                                        ) : (
                                            <button className="btn-premium btn-premium-primary w-full !py-2.5" onClick={() => reconnect(inst)}>
                                                Conectar WhatsApp
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="glass-panel py-32 text-center overflow-hidden relative">
                    {/* Background Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none" />

                    <div className="relative">
                        <div className="flex justify-center items-center gap-6 mb-10">
                            <Icons.LogoMeta className="text-[#0668E1]" size={48} />
                            <div className="w-px h-12 bg-gray-100" />
                            <Icons.LogoWhatsApp className="text-[#25D366]" size={48} />
                        </div>
                        <h2 className="text-2xl font-bold font-display text-header tracking-tight mb-4">Ecosistema Meta Business</h2>
                        <p className="text-xs text-muted max-w-lg mx-auto opacity-60 leading-relaxed italic mb-12">
                            Integra via la API oficial de Meta Cloud para maxima estabilidad,
                            identidad verificada y velocidad de mensajes a escala industrial.
                        </p>
                        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gray-50/50 border border-gray-200 grayscale opacity-50 cursor-not-allowed">
                            <Icons.Lock size={12} className="text-muted" />
                            <span className="text-[10px] font-black tracking-[0.2em] text-muted uppercase">Proximamente</span>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Modal Hardware */}
            {qrModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in transition-all">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setQrModal(null)} />
                    <div className="relative glass-panel w-full max-w-sm overflow-hidden p-8 animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-xs font-black tracking-[0.2em] text-brand-primary uppercase">Escanea el QR</h2>
                                <p className="text-[10px] text-muted opacity-40 uppercase font-medium mt-1">Instancia: {qrModal.name}</p>
                            </div>
                            <button className="text-muted hover:text-header transition-colors" onClick={() => setQrModal(null)}>
                                <Icons.Logout size={18} />
                            </button>
                        </div>

                        <div className="aspect-square bg-white rounded-2xl p-4 flex items-center justify-center relative group overflow-hidden">
                            {/* Scanning Line Animation */}
                            <div className="absolute inset-0 z-10 opacity-40 pointer-events-none">
                                <div className="w-full h-1 bg-brand-primary/50 shadow-[0_0_15px_var(--brand-primary)] absolute top-0 animate-scanner" />
                            </div>

                            {qrModal.qrCode ? (
                                <img src={qrModal.qrCode.startsWith("data:") ? qrModal.qrCode : `data:image/png;base64,${qrModal.qrCode}`} alt="Codigo QR" className="w-full h-full relative z-0" />
                            ) : (
                                <div className="flex flex-col items-center gap-4 text-gray-600">
                                    <div className="w-10 h-10 border-4 border-black/10 border-t-brand-primary rounded-full animate-spin" />
                                    <span className="text-[10px] font-black tracking-widest uppercase">Generando QR...</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex flex-col items-center gap-4 italic opacity-60">
                            <p className="text-[10px] text-muted text-center font-medium">
                                El QR se actualiza cada 4 segundos automaticamente.
                            </p>
                            <div className="flex gap-1">
                                {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-brand-primary animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
