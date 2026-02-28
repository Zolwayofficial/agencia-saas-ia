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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    CONNECTED:    { label: 'Conectado',     color: 'var(--brand-primary)', bg: 'rgba(52,201,123,0.1)',  dot: 'var(--brand-primary)' },
    QR_PENDING:   { label: 'Esperando QR',  color: '#FF9500',              bg: 'rgba(255,149,0,0.1)',   dot: '#FF9500' },
    DISCONNECTED: { label: 'Desconectado',  color: '#FF3B30',              bg: 'rgba(255,59,48,0.1)',   dot: '#FF3B30' },
};

function IOSCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', ...style }}>{children}</div>;
}

export default function WhatsAppPage() {
    const [instances,      setInstances]      = useState<WhatsappInstance[]>([]);
    const [limit,          setLimit]          = useState(1);
    const [loading,        setLoading]        = useState(true);
    const [creating,       setCreating]       = useState(false);
    const [qrModal,        setQrModal]        = useState<{ instanceId: string; qrCode: string | null; name: string } | null>(null);
    const [error,          setError]          = useState('');
    const pollRef                             = useRef<NodeJS.Timeout | null>(null);
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
        const interval = setInterval(fetchInstances, 5000);
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
        pollRef.current = setInterval(poll, 1500);
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
                setQrModal({ instanceId: data.instance.id, qrCode: data.qrCode, name: data.instance.displayName });
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
            <div style={{ maxWidth: 860, margin: '0 auto' }}>
                {[1,2].map(i => (
                    <div key={i} style={{ height: 160, borderRadius: 12, background: 'rgba(120,120,128,0.08)', marginBottom: 12 }} />
                ))}
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 860, margin: '0 auto' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--brand-primary)', marginBottom: 6 }}>
                        Operaciones
                    </p>
                    <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5, color: '#000', lineHeight: 1.15, margin: 0 }}>
                        Nodos WhatsApp
                    </h1>
                    <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 4 }}>
                        Despliega y gestiona tus instancias de WhatsApp.
                    </p>
                </div>

                {/* Segmented Control QR / META API */}
                <div style={{ display: 'inline-flex', background: 'rgba(118,118,128,0.12)', borderRadius: 9, padding: 2 }}>
                    {(['QR', 'API'] as const).map(t => (
                        <button key={t} onClick={() => setConnectionType(t)} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '7px 16px', borderRadius: 7, border: 'none',
                            cursor: 'pointer', fontSize: 13, fontWeight: 500,
                            fontFamily: 'inherit', outline: 'none',
                            background: connectionType === t ? '#fff' : 'transparent',
                            color: connectionType === t ? '#000' : 'var(--text-secondary)',
                            boxShadow: connectionType === t ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                            transition: 'all 0.2s',
                        }}>
                            {t === 'QR' ? <Icons.QrCode size={13} /> : <Icons.Enterprise size={13} />}
                            {t === 'QR' ? 'Código QR' : 'Meta API'}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Error ── */}
            {error && (
                <div style={{
                    marginBottom: 16, padding: '12px 16px', borderRadius: 10,
                    background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)',
                    display: 'flex', alignItems: 'center', gap: 10,
                    fontSize: 13, fontWeight: 500, color: '#FF3B30',
                }}>
                    <Icons.Alert size={16} />
                    {error}
                </div>
            )}

            {/* ── QR Mode ── */}
            {connectionType === 'QR' && (
                <div>
                    {/* Sub-header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingLeft: 4 }}>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0 }}>
                                Instancias Activas
                            </p>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0', opacity: 0.7 }}>
                                Capacidad: {instances.length} / {limit}
                            </p>
                        </div>
                        <button
                            onClick={createInstance}
                            disabled={creating || instances.length >= limit}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 7,
                                padding: '10px 20px', borderRadius: 10, border: 'none',
                                background: (creating || instances.length >= limit) ? 'rgba(52,201,123,0.4)' : 'var(--brand-primary)',
                                color: '#fff', fontSize: 15, fontWeight: 600,
                                cursor: (creating || instances.length >= limit) ? 'not-allowed' : 'pointer',
                                fontFamily: 'inherit',
                                boxShadow: '0 2px 8px rgba(52,201,123,0.3)',
                            }}
                        >
                            <Icons.Plus size={16} />
                            {creating ? 'Creando…' : 'Crear Nuevo Nodo'}
                        </button>
                    </div>

                    {/* Empty state */}
                    {instances.length === 0 && (
                        <IOSCard>
                            <div style={{ textAlign: 'center', padding: '64px 32px' }}>
                                <div style={{
                                    width: 72, height: 72, borderRadius: '50%',
                                    background: 'rgba(52,201,123,0.08)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 16px',
                                }}>
                                    <Icons.WhatsApp size={32} color="rgba(52,201,123,0.4)" />
                                </div>
                                <p style={{ fontSize: 17, fontWeight: 600, color: '#000', margin: '0 0 8px' }}>Sin Instancias Activas</p>
                                <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 24px', maxWidth: 280, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
                                    Crea tu primera instancia de WhatsApp escaneando un código QR.
                                </p>
                                <button
                                    onClick={createInstance}
                                    disabled={creating}
                                    style={{
                                        padding: '10px 24px', borderRadius: 10, border: 'none',
                                        background: 'var(--brand-primary)', color: '#fff',
                                        fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                                    }}
                                >
                                    Crear Instancia
                                </button>
                            </div>
                        </IOSCard>
                    )}

                    {/* Instance cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 12 }}>
                        {instances.map(inst => {
                            const s = STATUS_CONFIG[inst.connectionStatus] || STATUS_CONFIG.DISCONNECTED;
                            return (
                                <IOSCard key={inst.id}>
                                    {/* Card header */}
                                    <div style={{ padding: '16px 16px 14px', borderBottom: '1px solid rgba(60,60,67,0.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{
                                            width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                                            background: 'rgba(37,211,102,0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Icons.WhatsApp size={22} color="#25D366" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: 15, fontWeight: 600, color: '#000', margin: 0 }}>{inst.displayName}</p>
                                            <div style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                                marginTop: 3, padding: '3px 8px', borderRadius: 20,
                                                background: s.bg,
                                            }}>
                                                <span style={{
                                                    width: 5, height: 5, borderRadius: '50%',
                                                    background: s.dot, display: 'inline-block',
                                                    ...(inst.connectionStatus === 'QR_PENDING' ? { animation: 'pulse 1.2s infinite' } : {}),
                                                }} />
                                                <span style={{ fontSize: 11, fontWeight: 600, color: s.color }}>{s.label}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => deleteInstance(inst.id)}
                                            style={{
                                                width: 30, height: 30, borderRadius: 8,
                                                border: 'none', background: 'rgba(255,59,48,0.08)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', color: '#FF3B30',
                                            }}
                                        >
                                            <Icons.Trash size={14} />
                                        </button>
                                    </div>

                                    {/* Stats */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid rgba(60,60,67,0.1)' }}>
                                        {[
                                            { label: 'Número',        value: inst.phoneNumber || 'Pendiente' },
                                            { label: 'Mensajes (24h)', value: `${inst.messagesLast24h} msgs` },
                                        ].map((s, i) => (
                                            <div key={s.label} style={{
                                                padding: '12px 16px',
                                                borderRight: i === 0 ? '1px solid rgba(60,60,67,0.1)' : 'none',
                                            }}>
                                                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', margin: '0 0 3px' }}>
                                                    {s.label}
                                                </p>
                                                <p style={{ fontSize: 14, fontWeight: 600, color: '#000', margin: 0, fontFamily: 'monospace' }}>
                                                    {s.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action */}
                                    <div style={{ padding: '12px 16px' }}>
                                        {inst.connectionStatus === 'CONNECTED' ? (
                                            <button
                                                onClick={() => logout(inst.id)}
                                                style={{
                                                    width: '100%', padding: '10px', borderRadius: 10,
                                                    border: '1.5px solid rgba(60,60,67,0.2)',
                                                    background: 'transparent', color: 'var(--text-secondary)',
                                                    fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                                                }}
                                            >
                                                Desconectar
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => reconnect(inst)}
                                                style={{
                                                    width: '100%', padding: '10px', borderRadius: 10,
                                                    border: 'none', background: 'var(--brand-primary)',
                                                    color: '#fff', fontSize: 14, fontWeight: 600,
                                                    cursor: 'pointer', fontFamily: 'inherit',
                                                    boxShadow: '0 2px 6px rgba(52,201,123,0.3)',
                                                }}
                                            >
                                                Conectar WhatsApp
                                            </button>
                                        )}
                                    </div>
                                </IOSCard>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── META API Mode ── */}
            {connectionType === 'API' && (
                <IOSCard style={{ padding: '64px 32px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                        <Icons.LogoMeta color="#0668E1" size={48} />
                        <div style={{ width: 1, height: 48, background: 'rgba(60,60,67,0.15)' }} />
                        <Icons.LogoWhatsApp color="#25D366" size={48} />
                    </div>
                    <p style={{ fontSize: 22, fontWeight: 700, color: '#000', margin: '0 0 10px', letterSpacing: -0.3 }}>
                        Ecosistema Meta Business
                    </p>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 420, margin: '0 auto 28px', lineHeight: 1.6 }}>
                        Integra vía la API oficial de Meta Cloud para máxima estabilidad, identidad verificada y velocidad de mensajes a escala industrial.
                    </p>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '9px 20px', borderRadius: 20,
                        border: '1px solid rgba(60,60,67,0.15)',
                        background: 'rgba(120,120,128,0.06)',
                        fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
                        cursor: 'not-allowed', opacity: 0.6,
                    }}>
                        <Icons.Lock size={12} />
                        Próximamente
                    </div>
                </IOSCard>
            )}

            {/* ── QR Modal — lógica intacta, solo visual ── */}
            {qrModal && (
                <div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 100,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 20, background: 'rgba(0,0,0,0.45)',
                        backdropFilter: 'blur(10px)',
                    }}
                    onClick={() => setQrModal(null)}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: '#fff', borderRadius: 20,
                            width: '100%', maxWidth: 360,
                            overflow: 'hidden',
                            boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
                        }}
                    >
                        {/* Modal header */}
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(60,60,67,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Escanea el QR
                                </p>
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                                    Instancia: {qrModal.name}
                                </p>
                            </div>
                            <button
                                onClick={() => setQrModal(null)}
                                style={{
                                    width: 28, height: 28, borderRadius: '50%', border: 'none',
                                    background: 'rgba(120,120,128,0.12)', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--text-secondary)', fontSize: 16,
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* QR area — lógica de imagen intacta */}
                        <div style={{ padding: 20 }}>
                            <div style={{
                                background: '#fff', borderRadius: 12, padding: 12,
                                border: '1px solid rgba(60,60,67,0.12)',
                                aspectRatio: '1', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden', position: 'relative',
                            }}>
                                {qrModal.qrCode ? (
                                    <img
                                        src={qrModal.qrCode.startsWith('data:') ? qrModal.qrCode : `data:image/png;base64,${qrModal.qrCode}`}
                                        alt="Código QR"
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    />
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: 'var(--text-secondary)' }}>
                                        <div style={{
                                            width: 32, height: 32,
                                            border: '3px solid rgba(52,201,123,0.3)',
                                            borderTopColor: 'var(--brand-primary)',
                                            borderRadius: '50%',
                                            animation: 'spin 0.8s linear infinite',
                                        }} />
                                        <span style={{ fontSize: 12, fontWeight: 600 }}>Generando QR…</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '0 20px 18px', textAlign: 'center' }}>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                                El QR se actualiza cada 4 segundos automáticamente.
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 8 }}>
                                {[0, 0.2, 0.4].map((d, i) => (
                                    <div key={i} style={{
                                        width: 5, height: 5, borderRadius: '50%',
                                        background: 'var(--brand-primary)',
                                        animation: `pulse 1.2s ease-in-out ${d}s infinite`,
                                    }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ height: 32 }} />
        </div>
    );
}
