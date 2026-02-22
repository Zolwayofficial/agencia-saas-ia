'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';

// Professional SVG Icons
const Icons = {
    Rocket: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3" /><path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5" /></svg>
    ),
    Plus: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
    ),
    Zap: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
    ),
    Shield: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.8 17 5 19 5a1 1 0 0 1 1 1z" /></svg>
    ),
    Smartphone: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
    ),
};

export default function MarketingPage() {
    const [instances, setInstances] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getInstances()
            .then(data => setInstances(data.instances || []))
            .catch(() => setInstances([]))
            .finally(() => setLoading(false));
    }, []);

    const activeInstances = instances.filter(i => i.status === 'open').length;
    const warmupLevel = activeInstances > 0 ? 3 : 0; // Simulated level

    return (
        <>
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Icons.Rocket />
                        Marketing & Campañas
                    </h1>
                    <p className="page-subtitle">Envía mensajes masivos inteligentes con sistemas anti-ban avanzados SmartSend™.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary"
                    style={{ gap: '0.5rem' }}
                >
                    <Icons.Plus />
                    Nueva Campaña
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* SmartSend System */}
                <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: '12px', background: 'rgba(80, 205, 149, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)'
                        }}>
                            <Icons.Zap />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>SmartSend™ Engine Status</h2>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Calibración de velocidad y protección anti-ban activa</p>
                        </div>
                    </div>

                    <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>WARMUP PROGRESS (LEVEL {warmupLevel}/5)</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-primary)' }}>{warmupLevel * 20}% OPTIMIZADO</span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', height: '12px', marginBottom: '1.5rem' }}>
                            {[1, 2, 3, 4, 5].map((level) => (
                                <div key={level} style={{
                                    flex: 1,
                                    background: level <= warmupLevel ? 'var(--brand-primary)' : 'rgba(255,255,255,0.05)',
                                    borderRadius: '2px',
                                    boxShadow: level <= warmupLevel ? '0 0 10px rgba(80, 205, 149, 0.3)' : 'none'
                                }} />
                            ))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>VELOCIDAD</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>120 msg/hr</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>ROTACIÓN</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Activa</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>PROTECCIÓN</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                                    <Icons.Shield /> High
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instance Stats */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>
                        INSTANCIAS PARA ENVÍO
                    </h3>
                    <div className="stat-value" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{activeInstances}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                        <Icons.Smartphone /> {activeInstances} WhatsApp Ready
                    </div>

                    <Link href="/dashboard/whatsapp" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                        Gestionar Instancias
                    </Link>
                </div>
            </div>

            {/* Campaigns Table */}
            <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        HISTORIAL DE CAMPAÑAS
                    </h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['Todas', 'Activas', 'En Pausa', 'Completadas'].map(filter => (
                            <button key={filter} style={{
                                padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600,
                                background: filter === 'Todas' ? 'rgba(255,255,255,0.05)' : 'transparent',
                                color: filter === 'Todas' ? 'white' : 'var(--text-muted)',
                                border: '1px solid transparent',
                                cursor: 'pointer'
                            }}>{filter}</button>
                        ))}
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nombre Campaña</th>
                            <th>Canal</th>
                            <th>Estado</th>
                            <th>Enviados / Total</th>
                            <th>Éxito</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                No hay campañas activas. Haz clic en "Nueva Campaña" para empezar.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Modal Placeholder */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '2rem', border: '1px solid var(--brand-primary)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Crear Nueva Campaña</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>NOMBRE DE CAMPAÑA</label>
                                <input type="text" placeholder="Ej: Lanzamiento Marzo 2024" style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancelar</button>
                            <button onClick={() => setShowModal(false)} className="btn btn-primary" style={{ flex: 1 }}>Continuar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

import Link from 'next/link';
