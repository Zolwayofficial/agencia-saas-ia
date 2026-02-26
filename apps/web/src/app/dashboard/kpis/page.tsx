'use client';

import { useState, useEffect, useCallback } from 'react';
import { ALL_KPIS, INDUSTRY_TEMPLATES, getKpiById, KpiWidget, IndustryKey } from '../../../lib/kpi-templates';

const STORAGE_KEY = 'dashboard_kpis';
const INDUSTRY_KEY = 'dashboard_industry';

function loadSavedKpis(): string[] | null {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
}

function loadSavedIndustry(): IndustryKey {
    if (typeof window === 'undefined') return 'personalizado';
    return (localStorage.getItem(INDUSTRY_KEY) as IndustryKey) || 'personalizado';
}

// Simulated KPI data generator
function generateValue(kpi: KpiWidget): string {
    const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    switch (kpi.type) {
        case 'number': return rand(50, 5000).toLocaleString();
        case 'percentage': return `${rand(45, 98)}%`;
        case 'currency': return `$${rand(100, 9999).toLocaleString()}`;
        case 'chart': return `${rand(100, 2000)}`;
        default: return '—';
    }
}

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
    engagement: { label: 'Engagement', icon: 'CHT' },
    revenue: { label: 'Revenue', icon: 'MRR' },
    operations: { label: 'Operaciones', icon: '⚙️' },
    ai: { label: 'Inteligencia Artificial', icon: 'BOT' },
    satisfaction: { label: 'Satisfacción', icon: 'SAT' },
};

export default function KpiDashboardPage() {
    const [selectedIndustry, setSelectedIndustry] = useState<IndustryKey>(loadSavedIndustry);
    const [activeKpis, setActiveKpis] = useState<string[]>([]);
    const [editMode, setEditMode] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const saved = loadSavedKpis();
        if (saved) {
            setActiveKpis(saved);
        } else {
            const template = INDUSTRY_TEMPLATES.find((t) => t.key === selectedIndustry);
            setActiveKpis(template?.defaultKpis || []);
        }
        setLoaded(true);
    }, []);

    const saveKpis = useCallback((kpis: string[]) => {
        setActiveKpis(kpis);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(kpis));
    }, []);

    const toggleKpi = (id: string) => {
        const newKpis = activeKpis.includes(id)
            ? activeKpis.filter((k) => k !== id)
            : [...activeKpis, id];
        saveKpis(newKpis);
    };

    const applyTemplate = (key: IndustryKey) => {
        setSelectedIndustry(key);
        localStorage.setItem(INDUSTRY_KEY, key);
        const template = INDUSTRY_TEMPLATES.find((t) => t.key === key);
        if (template) {
            saveKpis([...template.defaultKpis]);
        }
    };

    if (!loaded) return <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>Cargando KPIs...</div>;

    const activeWidgets = activeKpis.map(getKpiById).filter(Boolean) as KpiWidget[];
    const categories = [...new Set(ALL_KPIS.map((k) => k.category))];

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h1 className="page-title">Dashboard KPIs</h1>
                <button
                    className={editMode ? 'btn btn-primary' : 'btn btn-ghost'}
                    onClick={() => setEditMode(!editMode)}
                >
                    {editMode ? '✅ Guardar' : '⚙️ Personalizar'}
                </button>
            </div>
            <p className="page-subtitle">
                {editMode
                    ? 'Selecciona los KPIs que quieres ver en tu dashboard'
                    : `Plantilla: ${INDUSTRY_TEMPLATES.find((t) => t.key === selectedIndustry)?.label || 'Personalizado'}`
                }
            </p>

            {/* ─── Edit Mode: Industry Selector ──────── */}
            {editMode && (
                <>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                            ELIGE TU INDUSTRIA (carga KPIs recomendados)
                        </h3>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            {INDUSTRY_TEMPLATES.map((tmpl) => (
                                <button
                                    key={tmpl.key}
                                    onClick={() => applyTemplate(tmpl.key)}
                                    className={selectedIndustry === tmpl.key ? 'btn btn-primary' : 'btn btn-ghost'}
                                    style={{ flex: '1 1 200px' }}
                                >
                                    <span style={{ fontSize: '1.25rem' }}>{tmpl.icon}</span>
                                    <span>{tmpl.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ─── KPI Selector by Category ──────── */}
                    {categories.map((cat) => {
                        const catInfo = CATEGORY_LABELS[cat] || { label: cat, icon: 'LST' };
                        const kpis = ALL_KPIS.filter((k) => k.category === cat);

                        return (
                            <div key={cat} className="glass-card" style={{ marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                                    {catInfo.icon} {catInfo.label}
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.5rem' }}>
                                    {kpis.map((kpi) => {
                                        const isActive = activeKpis.includes(kpi.id);
                                        return (
                                            <button
                                                key={kpi.id}
                                                onClick={() => toggleKpi(kpi.id)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    padding: '0.65rem 1rem',
                                                    background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-elevated)',
                                                    border: isActive ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    color: isActive ? 'var(--brand-primary-light)' : 'var(--text-secondary)',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    transition: 'all 0.15s ease',
                                                    fontFamily: 'inherit',
                                                    fontSize: '0.85rem',
                                                }}
                                            >
                                                <span style={{ fontSize: '1.1rem' }}>{kpi.icon}</span>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 600 }}>{kpi.label}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                                        {kpi.description}
                                                    </div>
                                                </div>
                                                <span style={{ fontSize: '1.2rem' }}>{isActive ? '✅' : '⬜'}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </>
            )}

            {/* ─── View Mode: Active KPIs ──────────── */}
            {!editMode && (
                <>
                    {activeWidgets.length === 0 ? (
                        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>---</div>
                            <p style={{ color: 'var(--text-secondary)' }}>No hay KPIs seleccionados</p>
                            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setEditMode(true)}>
                                Configurar Dashboard
                            </button>
                        </div>
                    ) : (
                        <div className="grid-stats">
                            {activeWidgets.map((kpi) => (
                                <div key={kpi.id} className="stat-card">
                                    <div className="stat-label">{kpi.icon} {kpi.label}</div>
                                    <div className="stat-value">{generateValue(kpi)}</div>
                                    <div className="stat-detail">{kpi.description}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <button className="btn btn-ghost" onClick={() => setEditMode(true)}>
                            ⚙️ Personalizar KPIs ({activeWidgets.length} activos de {ALL_KPIS.length} disponibles)
                        </button>
                    </div>
                </>
            )}
        </>
    );
}
