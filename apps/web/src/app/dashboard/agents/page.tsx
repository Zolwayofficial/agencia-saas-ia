'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';

const STATUS_MAP: Record<string, { label: string; class: string }> = {
    PENDING: { label: 'Pendiente', class: 'neutral' },
    RUNNING: { label: 'Ejecutando', class: 'info' },
    SUCCESS: { label: 'Exitoso', class: 'success' },
    ERROR: { label: 'Error', class: 'danger' },
    TIMEOUT: { label: 'Timeout', class: 'warning' },
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
        const interval = setInterval(loadTasks, 10_000); // Polling cada 10s
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <h1 className="page-title">🤖 Agentes IA</h1>
            <p className="page-subtitle">Tareas de inteligencia artificial ejecutadas por tu organización</p>

            <div className="glass-card">
                {loading ? (
                    <p style={{ color: 'var(--text-muted)' }}>Cargando tareas...</p>
                ) : tasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>No hay tareas aún</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                            Ejecuta tu primer agente desde la API: <code>POST /agents/run</code>
                        </p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Estado</th>
                                <th>Modelo</th>
                                <th>Pasos</th>
                                <th>Duración</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map((task) => {
                                const status = STATUS_MAP[task.status] || STATUS_MAP.PENDING;
                                return (
                                    <tr key={task.id}>
                                        <td>
                                            <span className={`badge ${status.class}`}>
                                                {(task.status === 'RUNNING') && <span className="pulse-dot" />}
                                                {status.label}
                                            </span>
                                        </td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{task.model}</td>
                                        <td>{task.stepsUsed || '—'}</td>
                                        <td>{task.durationMs ? `${(task.durationMs / 1000).toFixed(1)}s` : '—'}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>
                                            {new Date(task.createdAt).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' })}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}
