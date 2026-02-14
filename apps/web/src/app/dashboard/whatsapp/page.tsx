'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';

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

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string; icon: string }> = {
    CONNECTED: { label: 'Conectado', badgeClass: 'badge success', icon: '🟢' },
    QR_PENDING: { label: 'Esperando QR', badgeClass: 'badge warning', icon: '🟡' },
    DISCONNECTED: { label: 'Desconectado', badgeClass: 'badge danger', icon: '🔴' },
};

export default function WhatsAppPage() {
    const [instances, setInstances] = useState<WhatsappInstance[]>([]);
    const [limit, setLimit] = useState(1);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [qrModal, setQrModal] = useState<{ instanceId: string; qrCode: string | null; name: string } | null>(null);
    const [error, setError] = useState('');
    const pollRef = useRef<NodeJS.Timeout | null>(null);

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

    // QR polling
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
            } catch { /* retry on next poll */ }
        };

        pollRef.current = setInterval(poll, 4000);
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [qrModal?.instanceId, fetchInstances]);

    const createInstance = async () => {
        setCreating(true);
        setError('');
        try {
            const data = await api.post('/whatsapp/instances', {
                displayName: `WhatsApp ${instances.length + 1}`,
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
        if (!confirm('¿Desconectar esta instancia de WhatsApp?')) return;
        try {
            await api.post(`/whatsapp/instances/${id}/logout`, {});
            fetchInstances();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const deleteInstance = async (id: string) => {
        if (!confirm('¿Eliminar esta instancia permanentemente?')) return;
        try {
            await api.delete(`/whatsapp/instances/${id}`);
            fetchInstances();
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) return <div className="page-loading">Cargando instancias...</div>;

    return (
        <>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">📱 WhatsApp</h1>
                    <p className="page-subtitle">
                        {instances.length}/{limit} instancias usadas
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={createInstance}
                    disabled={creating || instances.length >= limit}
                >
                    {creating ? '⏳ Creando...' : '➕ Conectar WhatsApp'}
                </button>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {/* Empty State */}
            {instances.length === 0 && (
                <div className="glass-card empty-state">
                    <div className="empty-icon">📱</div>
                    <h3>No hay WhatsApp conectado</h3>
                    <p>Conecta tu primer número para empezar a recibir mensajes</p>
                    <button className="btn btn-primary" onClick={createInstance} disabled={creating}>
                        {creating ? '⏳ Creando...' : '🔗 Conectar mi WhatsApp'}
                    </button>
                </div>
            )}

            {/* Instance Cards */}
            <div className="grid-stats">
                {instances.map((inst) => {
                    const statusCfg = STATUS_CONFIG[inst.connectionStatus] || STATUS_CONFIG.DISCONNECTED;
                    return (
                        <div key={inst.id} className="glass-card wa-card">
                            <div className="wa-card-header">
                                <div className="wa-card-info">
                                    <h3 className="wa-card-name">{inst.displayName}</h3>
                                    <span className={statusCfg.badgeClass}>
                                        <span className="pulse-dot"></span>
                                        {statusCfg.label}
                                    </span>
                                </div>
                            </div>

                            <div className="wa-card-details">
                                <div className="wa-detail">
                                    <span className="wa-detail-label">Número</span>
                                    <span className="wa-detail-value">
                                        {inst.phoneNumber || 'Sin conectar'}
                                    </span>
                                </div>
                                <div className="wa-detail">
                                    <span className="wa-detail-label">Mensajes 24h</span>
                                    <span className="wa-detail-value">{inst.messagesLast24h}</span>
                                </div>
                                <div className="wa-detail">
                                    <span className="wa-detail-label">Estado</span>
                                    <span className="wa-detail-value">{statusCfg.icon} {statusCfg.label}</span>
                                </div>
                            </div>

                            <div className="wa-card-actions">
                                {inst.connectionStatus === 'CONNECTED' ? (
                                    <button className="btn btn-ghost btn-sm" onClick={() => logout(inst.id)}>
                                        🔌 Desconectar
                                    </button>
                                ) : (
                                    <button className="btn btn-primary btn-sm" onClick={() => reconnect(inst)}>
                                        📲 Conectar
                                    </button>
                                )}
                                <button className="btn btn-danger btn-sm" onClick={() => deleteInstance(inst.id)}>
                                    🗑️ Eliminar
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* QR Modal */}
            {qrModal && (
                <div className="modal-overlay" onClick={() => setQrModal(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📲 Escanea el QR Code</h2>
                            <button className="modal-close" onClick={() => setQrModal(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <p className="qr-instructions">
                                Abre WhatsApp en tu teléfono → Ajustes → Dispositivos vinculados → Vincular dispositivo
                            </p>
                            <div className="qr-container">
                                {qrModal.qrCode ? (
                                    <img
                                        src={`data:image/png;base64,${qrModal.qrCode}`}
                                        alt="QR Code WhatsApp"
                                        className="qr-image"
                                    />
                                ) : (
                                    <div className="qr-loading">
                                        <div className="spinner"></div>
                                        <p>Generando QR Code...</p>
                                    </div>
                                )}
                            </div>
                            <p className="qr-note">
                                El QR se actualiza automáticamente cada 4 segundos
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
