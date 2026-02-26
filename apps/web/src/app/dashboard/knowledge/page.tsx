'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Icons } from '@/components/icons';

type Tab = 'config' | 'knowledge' | 'conversations';

interface AgentConfig {
    id: string;
    agentName: string;
    systemPrompt: string | null;
    welcomeMessage: string;
    tone: string;
    language: string;
    maxHistoryMessages: number;
    isActive: boolean;
}

interface KnowledgeEntry {
    id: string;
    category: string;
    title: string;
    content: string;
    isActive: boolean;
    createdAt: string;
}

interface ConversationContact {
    contactPhone: string;
    content: string;
    role: string;
    createdAt: string;
    instanceName: string;
}

interface ConversationMessage {
    role: string;
    content: string;
    createdAt: string;
}

const TONE_OPTIONS = [
    { value: 'profesional', label: 'Profesional', desc: 'Claro y directo' },
    { value: 'amigable', label: 'Amigable', desc: 'Cercano y cálido' },
    { value: 'formal', label: 'Formal', desc: 'Respetuoso y serio' },
    { value: 'casual', label: 'Casual', desc: 'Relajado y natural' },
];

const CATEGORY_SUGGESTIONS = ['productos', 'servicios', 'precios', 'horarios', 'faq', 'politicas', 'contacto', 'promociones'];

export default function KnowledgePage() {
    const [activeTab, setActiveTab] = useState<Tab>('config');

    const tabs = [
        { key: 'config' as Tab, label: 'Agente IA' },
        { key: 'knowledge' as Tab, label: 'Conocimiento' },
        { key: 'conversations' as Tab, label: 'Conversaciones' },
    ];

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            {/* ── Header ── */}
            <div style={{ marginBottom: 28 }}>
                <p style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--brand-primary)',
                    marginBottom: 6,
                }}>
                    Núcleo de Inteligencia
                </p>
                <h1 style={{
                    fontSize: 34,
                    fontWeight: 700,
                    letterSpacing: -0.5,
                    color: '#000',
                    lineHeight: 1.15,
                    margin: 0,
                }}>
                    Base de Conocimiento
                </h1>
                <p style={{
                    fontSize: 15,
                    color: 'var(--text-secondary)',
                    marginTop: 4,
                    fontWeight: 400,
                }}>
                    Configura tu agente IA y enséñale sobre tu negocio.
                </p>
            </div>

            {/* ── iOS Segmented Control ── */}
            <div style={{
                display: 'inline-flex',
                background: 'rgba(118,118,128,0.12)',
                borderRadius: 9,
                padding: 2,
                marginBottom: 28,
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            padding: '6px 20px',
                            borderRadius: 7,
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: 500,
                            fontFamily: 'inherit',
                            transition: 'all 0.2s',
                            background: activeTab === tab.key
                                ? '#fff'
                                : 'transparent',
                            color: activeTab === tab.key
                                ? '#000'
                                : 'var(--text-secondary)',
                            boxShadow: activeTab === tab.key
                                ? '0 1px 3px rgba(0,0,0,0.12), 0 1px 1px rgba(0,0,0,0.08)'
                                : 'none',
                            outline: 'none',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Tab Content ── */}
            {activeTab === 'config' && <AgentConfigTab />}
            {activeTab === 'knowledge' && <KnowledgeTab />}
            {activeTab === 'conversations' && <ConversationsTab />}
        </div>
    );
}

// ── iOS Card wrapper ──────────────────────────────────────────
function IOSCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <div style={{
            background: '#fff',
            borderRadius: 12,
            overflow: 'hidden',
            ...style,
        }}>
            {children}
        </div>
    );
}

// ── iOS Section Header ────────────────────────────────────────
function SectionHeader({ children }: { children: React.ReactNode }) {
    return (
        <p style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            marginBottom: 8,
            marginTop: 24,
            paddingLeft: 4,
        }}>
            {children}
        </p>
    );
}

// ── iOS Row ───────────────────────────────────────────────────
function IOSRow({
    label,
    hint,
    children,
    last = false,
}: {
    label: string;
    hint?: string;
    children: React.ReactNode;
    last?: boolean;
}) {
    return (
        <div style={{
            padding: '13px 16px',
            borderBottom: last ? 'none' : '1px solid rgba(60,60,67,0.1)',
        }}>
            <label style={{
                display: 'block',
                fontSize: 15,
                fontWeight: 500,
                color: '#000',
                marginBottom: hint ? 2 : 8,
            }}>
                {label}
            </label>
            {hint && (
                <p style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    marginBottom: 8,
                }}>
                    {hint}
                </p>
            )}
            {children}
        </div>
    );
}

// ── iOS Input styles ──────────────────────────────────────────
const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    fontSize: 15,
    borderRadius: 9,
    border: '1px solid rgba(60,60,67,0.18)',
    background: 'rgba(118,118,128,0.06)',
    color: '#000',
    fontFamily: 'inherit',
    outline: 'none',
    lineHeight: 1.4,
    boxSizing: 'border-box',
};

const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    resize: 'vertical',
    minHeight: 80,
};

// ── iOS Toggle ────────────────────────────────────────────────
function IOSToggle({ value, onChange }: { value: boolean; onChange: () => void }) {
    return (
        <button
            onClick={onChange}
            style={{
                width: 51,
                height: 31,
                borderRadius: 16,
                border: 'none',
                cursor: 'pointer',
                padding: 2,
                background: value ? 'var(--brand-primary)' : 'rgba(120,120,128,0.32)',
                transition: 'background 0.25s',
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                flexShrink: 0,
                outline: 'none',
            }}
        >
            <div style={{
                width: 27,
                height: 27,
                borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                transition: 'transform 0.25s cubic-bezier(0.25,1,0.5,1)',
                transform: value ? 'translateX(20px)' : 'translateX(0)',
            }} />
        </button>
    );
}

// ── Primary Button ────────────────────────────────────────────
function PrimaryButton({
    onClick,
    disabled,
    children,
    variant = 'filled',
}: {
    onClick?: () => void;
    disabled?: boolean;
    children: React.ReactNode;
    variant?: 'filled' | 'tinted' | 'plain';
}) {
    const base: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '10px 20px',
        borderRadius: 10,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 15,
        fontWeight: 600,
        fontFamily: 'inherit',
        transition: 'opacity 0.15s',
        opacity: disabled ? 0.4 : 1,
        outline: 'none',
    };
    const variants = {
        filled: { background: 'var(--brand-primary)', color: '#fff' },
        tinted: { background: 'rgba(52,201,123,0.12)', color: 'var(--brand-primary)' },
        plain:  { background: 'transparent', color: 'var(--brand-primary)' },
    };
    return (
        <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>
            {children}
        </button>
    );
}

// ══════════════════════════════════════════════════════════════
// Agent Config Tab
// ══════════════════════════════════════════════════════════════
function AgentConfigTab() {
    const [config, setConfig] = useState<AgentConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        api.get('/knowledge/agent-config')
            .then(setConfig)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const save = async () => {
        if (!config) return;
        setSaving(true);
        try {
            const updated = await api.put('/knowledge/agent-config', {
                agentName: config.agentName,
                systemPrompt: config.systemPrompt,
                welcomeMessage: config.welcomeMessage,
                tone: config.tone,
                language: config.language,
                maxHistoryMessages: config.maxHistoryMessages,
                isActive: config.isActive,
            });
            setConfig(updated);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error(err);
        }
        setSaving(false);
    };

    if (loading) return <LoadingState />;
    if (!config) return <p style={{ color: 'var(--text-secondary)', padding: 16 }}>Error al cargar configuración.</p>;

    return (
        <div>
            {/* ── Identidad ── */}
            <SectionHeader>Identidad del Agente</SectionHeader>
            <IOSCard>
                <IOSRow label="Nombre del Agente" hint="Ej: Sofía, Carlos, Asistente de Ventas">
                    <input
                        type="text"
                        value={config.agentName}
                        onChange={e => setConfig({ ...config, agentName: e.target.value })}
                        style={inputStyle}
                        placeholder="Asistente"
                    />
                </IOSRow>
                <IOSRow label="Mensaje de Bienvenida" hint="Primer mensaje cuando un cliente nuevo escribe." last>
                    <textarea
                        value={config.welcomeMessage}
                        onChange={e => setConfig({ ...config, welcomeMessage: e.target.value })}
                        style={textareaStyle}
                        rows={2}
                        placeholder="Hola! ¿En qué puedo ayudarte?"
                    />
                </IOSRow>
            </IOSCard>

            {/* ── Tono ── */}
            <SectionHeader>Tono de Comunicación</SectionHeader>
            <IOSCard>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                }}>
                    {TONE_OPTIONS.map((t, i) => {
                        const isLast = i >= 2;
                        const isRight = i % 2 === 1;
                        const isSelected = config.tone === t.value;
                        return (
                            <button
                                key={t.value}
                                onClick={() => setConfig({ ...config, tone: t.value })}
                                style={{
                                    padding: '14px 16px',
                                    textAlign: 'left',
                                    background: isSelected ? 'rgba(52,201,123,0.08)' : 'transparent',
                                    border: 'none',
                                    borderBottom: isLast ? 'none' : '1px solid rgba(60,60,67,0.1)',
                                    borderRight: isRight ? 'none' : '1px solid rgba(60,60,67,0.1)',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    transition: 'background 0.15s',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 10,
                                }}
                            >
                                <div style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    border: isSelected
                                        ? '6px solid var(--brand-primary)'
                                        : '2px solid rgba(60,60,67,0.3)',
                                    marginTop: 1,
                                    flexShrink: 0,
                                    transition: 'all 0.15s',
                                }} />
                                <div>
                                    <div style={{
                                        fontSize: 15,
                                        fontWeight: 500,
                                        color: isSelected ? 'var(--brand-primary)' : '#000',
                                    }}>
                                        {t.label}
                                    </div>
                                    <div style={{
                                        fontSize: 12,
                                        color: 'var(--text-secondary)',
                                        marginTop: 1,
                                    }}>
                                        {t.desc}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </IOSCard>

            {/* ── Comportamiento ── */}
            <SectionHeader>Comportamiento</SectionHeader>
            <IOSCard>
                <IOSRow
                    label="Instrucciones del Sistema"
                    hint="Indica cómo debe comportarse, qué sabe, qué no debe hacer."
                >
                    <textarea
                        value={config.systemPrompt || ''}
                        onChange={e => setConfig({ ...config, systemPrompt: e.target.value || null })}
                        style={{ ...textareaStyle, fontFamily: 'monospace', fontSize: 13, minHeight: 140 }}
                        rows={7}
                        placeholder={`Ej: Eres el asistente de "Mi Tienda". Ayudas con pedidos, precios y disponibilidad.\n\nReglas:\n- No des descuentos sin autorización\n- Si no sabes algo, sugiere llamar al 555-1234\n- Máximo 2 párrafos por respuesta`}
                    />
                </IOSRow>

                <IOSRow label="Mensajes de Memoria" hint={`Recuerda los últimos ${config.maxHistoryMessages} mensajes por contacto.`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <input
                            type="range"
                            min={2}
                            max={30}
                            value={config.maxHistoryMessages}
                            onChange={e => setConfig({ ...config, maxHistoryMessages: Number(e.target.value) })}
                            style={{ flex: 1, accentColor: 'var(--brand-primary)' }}
                        />
                        <span style={{
                            fontSize: 17,
                            fontWeight: 600,
                            color: '#000',
                            minWidth: 32,
                            textAlign: 'center',
                        }}>
                            {config.maxHistoryMessages}
                        </span>
                    </div>
                </IOSRow>

                <IOSRow label="Idioma" last>
                    <select
                        value={config.language}
                        onChange={e => setConfig({ ...config, language: e.target.value })}
                        style={inputStyle}
                    >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                        <option value="pt">Português</option>
                    </select>
                </IOSRow>
            </IOSCard>

            {/* ── Estado ── */}
            <SectionHeader>Estado</SectionHeader>
            <IOSCard>
                <div style={{
                    padding: '13px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 500, color: '#000' }}>Agente Activo</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                            Si está desactivado, no responderá mensajes automáticamente.
                        </div>
                    </div>
                    <IOSToggle value={config.isActive} onChange={() => setConfig({ ...config, isActive: !config.isActive })} />
                </div>
            </IOSCard>

            {/* ── Guardar ── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <PrimaryButton onClick={save} disabled={saving} variant={saved ? 'tinted' : 'filled'}>
                    {saving ? 'Guardando…' : saved ? '✓ Guardado' : 'Guardar Configuración'}
                </PrimaryButton>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
// Knowledge Tab
// ══════════════════════════════════════════════════════════════
function KnowledgeTab() {
    const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [filterCat, setFilterCat] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [form, setForm] = useState({ category: 'general', title: '', content: '' });

    const load = () => {
        const params = filterCat ? `?category=${filterCat}` : '';
        api.get(`/knowledge${params}`)
            .then((data: any) => {
                setEntries(data.entries || []);
                if (!filterCat) setCategories(data.categories || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [filterCat]);

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.content.trim()) return;
        try {
            if (editId) {
                await api.put(`/knowledge/${editId}`, form);
            } else {
                await api.post('/knowledge', form);
            }
            setForm({ category: 'general', title: '', content: '' });
            setShowForm(false);
            setEditId(null);
            load();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (entry: KnowledgeEntry) => {
        setForm({ category: entry.category, title: entry.title, content: entry.content });
        setEditId(entry.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar esta entrada?')) return;
        try {
            await api.delete(`/knowledge/${id}`);
            load();
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggle = async (entry: KnowledgeEntry) => {
        try {
            await api.put(`/knowledge/${entry.id}`, { isActive: !entry.isActive });
            load();
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileUpload = async (file: File) => {
        setUploading(true);
        setUploadResult(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', 'documentos');
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
            const res = await fetch(`${API_BASE}/knowledge/upload`, {
                method: 'POST',
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) setUploadResult(`Error: ${data.message}`);
            else { setUploadResult(data.message); load(); }
        } catch {
            setUploadResult('Error al subir el archivo.');
        }
        setUploading(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);
        e.target.value = '';
    };

    if (loading) return <LoadingState />;

    return (
        <div>
            {/* ── Toolbar ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
                {/* Category filters */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['', ...categories].map(cat => (
                        <button
                            key={cat || '__all'}
                            onClick={() => setFilterCat(cat)}
                            style={{
                                padding: '5px 12px',
                                borderRadius: 20,
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 13,
                                fontWeight: 500,
                                fontFamily: 'inherit',
                                background: filterCat === cat
                                    ? 'var(--brand-primary)'
                                    : 'rgba(118,118,128,0.12)',
                                color: filterCat === cat ? '#fff' : 'var(--text-secondary)',
                                transition: 'all 0.15s',
                            }}
                        >
                            {cat === '' ? `Todas (${entries.length})` : cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                    <label style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '9px 16px',
                        borderRadius: 10,
                        border: '1.5px solid rgba(52,201,123,0.4)',
                        color: 'var(--brand-primary)',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: 'rgba(52,201,123,0.06)',
                        fontFamily: 'inherit',
                    }}>
                        <Icons.Download size={15} />
                        Subir doc
                        <input type="file" accept=".pdf,.xlsx,.xls,.docx,.txt,.csv" onChange={handleFileSelect} style={{ display: 'none' }} />
                    </label>
                    <PrimaryButton onClick={() => { setShowForm(true); setEditId(null); setForm({ category: 'general', title: '', content: '' }); }}>
                        + Agregar
                    </PrimaryButton>
                </div>
            </div>

            {/* ── Drop Zone ── */}
            <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={{
                    marginBottom: 16,
                    padding: '20px 16px',
                    borderRadius: 12,
                    border: `2px dashed ${dragOver ? 'var(--brand-primary)' : 'rgba(60,60,67,0.2)'}`,
                    background: dragOver ? 'rgba(52,201,123,0.04)' : 'transparent',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                }}
            >
                {uploading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: 14 }}>
                        <div style={{
                            width: 16, height: 16,
                            border: '2px solid var(--brand-primary)',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                        }} />
                        Procesando documento…
                    </div>
                ) : (
                    <>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
                            Arrastra aquí un archivo{' '}
                            <span style={{ color: 'var(--brand-primary)', fontWeight: 500 }}>PDF, Excel, Word, TXT o CSV</span>
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', opacity: 0.6, marginTop: 3 }}>Máx 10 MB — el texto se extraerá automáticamente</p>
                    </>
                )}
            </div>

            {/* ── Upload result ── */}
            {uploadResult && (
                <div style={{
                    marginBottom: 16,
                    padding: '12px 16px',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 500,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: uploadResult.startsWith('Error') ? 'rgba(255,59,48,0.08)' : 'rgba(52,201,123,0.08)',
                    color: uploadResult.startsWith('Error') ? '#FF3B30' : 'var(--brand-primary)',
                    border: `1px solid ${uploadResult.startsWith('Error') ? 'rgba(255,59,48,0.2)' : 'rgba(52,201,123,0.2)'}`,
                }}>
                    <span>{uploadResult}</span>
                    <button onClick={() => setUploadResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, fontSize: 16, padding: '0 4px' }}>✕</button>
                </div>
            )}

            {/* ── Add/Edit Form ── */}
            {showForm && (
                <IOSCard style={{ marginBottom: 20, border: '1.5px solid rgba(52,201,123,0.2)' }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(60,60,67,0.1)' }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#000', margin: 0 }}>
                            {editId ? 'Editar Entrada' : 'Nueva Entrada de Conocimiento'}
                        </p>
                    </div>
                    <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Categoría</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <select
                                    value={CATEGORY_SUGGESTIONS.includes(form.category) ? form.category : '__custom'}
                                    onChange={e => { if (e.target.value !== '__custom') setForm({ ...form, category: e.target.value }); }}
                                    style={{ ...inputStyle, flex: 1 }}
                                >
                                    {CATEGORY_SUGGESTIONS.map(c => (
                                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                    ))}
                                    <option value="__custom">Personalizada…</option>
                                </select>
                                {!CATEGORY_SUGGESTIONS.includes(form.category) && (
                                    <input
                                        type="text"
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}
                                        style={{ ...inputStyle, flex: 1 }}
                                        placeholder="Categoría"
                                    />
                                )}
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Título</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                style={inputStyle}
                                placeholder="Ej: Horarios de atención…"
                            />
                        </div>
                    </div>
                    <div style={{ padding: '0 16px 14px' }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Contenido</label>
                        <textarea
                            value={form.content}
                            onChange={e => setForm({ ...form, content: e.target.value })}
                            style={textareaStyle}
                            rows={3}
                            placeholder="Ej: Atendemos de lunes a viernes de 9 am a 6 pm…"
                        />
                    </div>
                    <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(60,60,67,0.1)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                        <PrimaryButton variant="plain" onClick={() => { setShowForm(false); setEditId(null); }}>
                            Cancelar
                        </PrimaryButton>
                        <PrimaryButton onClick={handleSubmit}>
                            {editId ? 'Actualizar' : 'Guardar'}
                        </PrimaryButton>
                    </div>
                </IOSCard>
            )}

            {/* ── Entries ── */}
            {entries.length === 0 ? (
                <IOSCard>
                    <div style={{ textAlign: 'center', padding: '60px 32px' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                        <p style={{ fontSize: 17, fontWeight: 600, color: '#000', marginBottom: 6 }}>Sin información todavía</p>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 320, margin: '0 auto', lineHeight: 1.5 }}>
                            Agrega información sobre tu negocio para que el agente pueda responder con precisión.
                        </p>
                    </div>
                </IOSCard>
            ) : (
                <IOSCard>
                    {entries.map((entry, i) => (
                        <div
                            key={entry.id}
                            style={{
                                padding: '13px 16px',
                                borderBottom: i < entries.length - 1 ? '1px solid rgba(60,60,67,0.1)' : 'none',
                                opacity: entry.isActive ? 1 : 0.45,
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 12,
                            }}
                        >
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                                    <span style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        letterSpacing: '0.06em',
                                        textTransform: 'uppercase',
                                        color: 'var(--brand-primary)',
                                        background: 'rgba(52,201,123,0.1)',
                                        padding: '2px 7px',
                                        borderRadius: 5,
                                    }}>
                                        {entry.category}
                                    </span>
                                </div>
                                <p style={{ fontSize: 15, fontWeight: 600, color: '#000', margin: '0 0 3px' }}>{entry.title}</p>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {entry.content}
                                </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                                <button
                                    onClick={() => handleToggle(entry)}
                                    title={entry.isActive ? 'Desactivar' : 'Activar'}
                                    style={{
                                        width: 28, height: 28,
                                        borderRadius: 8,
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        fontSize: 16,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: entry.isActive ? '#34C759' : 'var(--text-secondary)',
                                    }}
                                >
                                    {entry.isActive ? '●' : '○'}
                                </button>
                                <button
                                    onClick={() => handleEdit(entry)}
                                    title="Editar"
                                    style={{
                                        width: 28, height: 28, borderRadius: 8,
                                        border: 'none', background: 'transparent',
                                        cursor: 'pointer', color: 'var(--text-secondary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    <Icons.Analytics size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(entry.id)}
                                    title="Eliminar"
                                    style={{
                                        width: 28, height: 28, borderRadius: 8,
                                        border: 'none', background: 'transparent',
                                        cursor: 'pointer', color: '#FF3B30',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    <Icons.Logout size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </IOSCard>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
// Conversations Tab
// ══════════════════════════════════════════════════════════════
function ConversationsTab() {
    const [contacts, setContacts] = useState<ConversationContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
    const [messages, setMessages] = useState<ConversationMessage[]>([]);
    const [loadingMsgs, setLoadingMsgs] = useState(false);

    useEffect(() => {
        api.get('/knowledge/conversations')
            .then((data: any) => setContacts(data.contacts || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const loadMessages = async (phone: string) => {
        setSelectedPhone(phone);
        setLoadingMsgs(true);
        try {
            const data = await api.get(`/knowledge/conversations?contactPhone=${phone}&limit=50`) as any;
            setMessages(data.messages || []);
        } catch (err) {
            console.error(err);
        }
        setLoadingMsgs(false);
    };

    if (loading) return <LoadingState />;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 12, minHeight: 520 }}>
            {/* ── Contact List ── */}
            <IOSCard>
                <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(60,60,67,0.1)' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#000', margin: 0 }}>Contactos</p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                        {contacts.length} conversaciones
                    </p>
                </div>
                <div style={{ overflowY: 'auto', maxHeight: 480 }}>
                    {contacts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                Aún no hay conversaciones. Cuando los clientes escriban por WhatsApp, aparecerán aquí.
                            </p>
                        </div>
                    ) : contacts.map((c, i) => (
                        <button
                            key={c.contactPhone}
                            onClick={() => loadMessages(c.contactPhone)}
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '12px 16px',
                                borderBottom: i < contacts.length - 1 ? '1px solid rgba(60,60,67,0.08)' : 'none',
                                background: selectedPhone === c.contactPhone ? 'rgba(52,201,123,0.06)' : 'transparent',
                                borderLeft: selectedPhone === c.contactPhone ? '3px solid var(--brand-primary)' : '3px solid transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                            }}
                        >
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: 'rgba(52,201,123,0.12)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 700, color: 'var(--brand-primary)',
                                flexShrink: 0,
                            }}>
                                {c.contactPhone.slice(-4)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 14, fontWeight: 600, color: '#000', margin: 0, marginBottom: 2 }}>+{c.contactPhone}</p>
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {c.content}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </IOSCard>

            {/* ── Chat View ── */}
            <IOSCard style={{ display: 'flex', flexDirection: 'column' }}>
                {!selectedPhone ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
                        <div>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
                            <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0 }}>
                                Selecciona un contacto para ver la conversación
                            </p>
                        </div>
                    </div>
                ) : loadingMsgs ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Cargando mensajes…</p>
                    </div>
                ) : (
                    <>
                        <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(60,60,67,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'rgba(52,201,123,0.12)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 700, color: 'var(--brand-primary)',
                            }}>
                                {selectedPhone.slice(-4)}
                            </div>
                            <div>
                                <p style={{ fontSize: 15, fontWeight: 600, color: '#000', margin: 0 }}>+{selectedPhone}</p>
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>{messages.length} mensajes</p>
                            </div>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {messages.map((msg, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'assistant' ? 'flex-start' : 'flex-end' }}>
                                    <div style={{
                                        maxWidth: '72%',
                                        padding: '10px 14px',
                                        borderRadius: msg.role === 'assistant' ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                                        fontSize: 14,
                                        lineHeight: 1.45,
                                        background: msg.role === 'assistant' ? '#F2F2F7' : 'var(--brand-primary)',
                                        color: msg.role === 'assistant' ? '#000' : '#fff',
                                    }}>
                                        <p style={{ margin: 0 }}>{msg.content}</p>
                                        <p style={{
                                            fontSize: 10,
                                            margin: '4px 0 0',
                                            opacity: 0.55,
                                            color: msg.role === 'assistant' ? 'var(--text-secondary)' : '#fff',
                                            textAlign: 'right',
                                        }}>
                                            {new Date(msg.createdAt).toLocaleString('es', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </IOSCard>
        </div>
    );
}

// ── Loading State ─────────────────────────────────────────────
function LoadingState() {
    return (
        <IOSCard style={{ padding: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{
                        height: 40,
                        borderRadius: 8,
                        background: 'rgba(120,120,128,0.08)',
                        animation: 'pulse 1.5s ease-in-out infinite',
                    }} />
                ))}
            </div>
        </IOSCard>
    );
}
