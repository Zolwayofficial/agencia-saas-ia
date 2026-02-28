'use client';

import { useState, useEffect, useCallback } from 'react';
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
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    CONNECTED:    { label: 'Conectado',    color: 'var(--brand-primary)', bg: 'rgba(52,201,123,0.1)', dot: 'var(--brand-primary)' },
    QR_PENDING:   { label: 'Esperando QR', color: '#FF9500',              bg: 'rgba(255,149,0,0.1)',  dot: '#FF9500' },
    DISCONNECTED: { label: 'Desconectado', color: '#FF3B30',              bg: 'rgba(255,59,48,0.1)',  dot: '#FF3B30' },
};

function IOSCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', ...style }}>{children}</div>;
}

export default function WhatsAppPage() {
    const [instances, setInstances] = useState<WhatsappInstance[]>([]);
    const [loading,   setLoading]   = useState(true);
    const [error,     setError]     = useState('');

    const fetchInstances = useCallback(async () => {
        try {
            const data = await api.get('/whatsapp/instances');
            setInstances(data.instances || []);
            setError('');
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

    if (loading) {
        return (
            <div style={{ maxWidth: 860, margin: '0 auto' }}>
                {[1, 2].map(i => (
                    <div key={i} style={{ height: 140, borderRadius: 12, background: 'rgba(120,120,128,0.08)', marginBottom: 12 }} />
                ))}
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 860, margin: '0 auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--brand-primary)', marginBottom: 6 }}>
                        Operaciones
                    </p>
                    <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5, color: '#000', lineHeight: 1.15, margin: 0 }}>
                        Nodos WhatsApp
                    </h1>
                    <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 4 }}>
                        Gestiona tus instancias desde Evolution API.
                    </p>
                </div>

                <a
                    href="https://wa.fulllogin.com/manager/login"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                        padding: '10px 20px', borderRadius: 10, border: 'none',
                        background: 'var(--brand-primary)', color: '#fff',
                        fontSize: 15, fontWeight: 600, textDecoration: 'none',
                        cursor: 'pointer', fontFamily: 'inherit',
                        boxShadow: '0 2px 8px rgba(52,201,123,0.3)',
                    }}
                >
                    <Icons.External size={16} />
                    Abrir Evolution API
                </a>
            </div>

            {/* Error */}
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

            {/* Sub-header */}
            <div style={{ paddingLeft: 4, marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0 }}>
                    Instancias Activas
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0', opacity: 0.7 }}>
                    {instances.filter(i => i.connectionStatus === 'CONNECTED').length} de {instances.length} conectadas
                </p>
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
                            Crea y conecta instancias desde Evolution API.
                        </p>
                        <a
                            href="https://wa.fulllogin.com/manager/login"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 7,
                                padding: '10px 24px', borderRadius: 10,
                                background: 'var(--brand-primary)', color: '#fff',
                                fontSize: 15, fontWeight: 600, textDecoration: 'none',
                            }}
                        >
                            <Icons.External size={15} />
                            Abrir Evolution API
                        </a>
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
                                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
                                        <span style={{ fontSize: 11, fontWeight: 600, color: s.color }}>{s.label}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                                {[
                                    { label: 'Número',         value: inst.phoneNumber || '—' },
                                    { label: 'Mensajes (24h)', value: `${inst.messagesLast24h} msgs` },
                                ].map((stat, i) => (
                                    <div key={stat.label} style={{
                                        padding: '12px 16px',
                                        borderRight: i === 0 ? '1px solid rgba(60,60,67,0.1)' : 'none',
                                    }}>
                                        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', margin: '0 0 3px' }}>
                                            {stat.label}
                                        </p>
                                        <p style={{ fontSize: 14, fontWeight: 600, color: '#000', margin: 0, fontFamily: 'monospace' }}>
                                            {stat.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </IOSCard>
                    );
                })}
            </div>

            <div style={{ height: 32 }} />
        </div>
    );
}
