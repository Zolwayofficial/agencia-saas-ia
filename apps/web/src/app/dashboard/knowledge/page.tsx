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

    return (
        <div className="animate-in max-w-7xl mx-auto">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 tracking-widest uppercase">
                            Nucleo de Inteligencia
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold font-display tracking-tight text-gradient">Base de Conocimiento</h1>
                    <p className="text-muted text-sm mt-1 font-medium italic opacity-60">
                        Configura tu agente IA y enséñale sobre tu negocio.
                    </p>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex gap-1 mb-8 p-1.5 rounded-2xl bg-black/[0.05] w-fit">
                {([
                    { key: 'config' as Tab, label: 'Agente IA', icon: 'BOT' },
                    { key: 'knowledge' as Tab, label: 'Conocimiento', icon: 'DOC' },
                    { key: 'conversations' as Tab, label: 'Conversaciones', icon: 'CHT' },
                ]).map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            activeTab === tab.key
                                ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                                : 'text-muted hover:text-header hover:bg-gray-50/50'
                        }`}
                    >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'config' && <AgentConfigTab />}
            {activeTab === 'knowledge' && <KnowledgeTab />}
            {activeTab === 'conversations' && <ConversationsTab />}
        </div>
    );
}

// ── Agent Config Tab ─────────────────────────────────────

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
    if (!config) return <p className="text-muted">Error al cargar configuración.</p>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Identity */}
            <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-header mb-1">Identidad del Agente</h3>
                <p className="text-xs text-muted mb-6 opacity-60">Cómo se presenta tu agente a los clientes.</p>

                <div className="space-y-5">
                    <Field label="Nombre del Agente" hint="Ej: Sofia, Carlos, Asistente de Ventas">
                        <input
                            type="text"
                            value={config.agentName}
                            onChange={e => setConfig({ ...config, agentName: e.target.value })}
                            className="input-field"
                            placeholder="Asistente"
                        />
                    </Field>

                    <Field label="Mensaje de Bienvenida" hint="Primer mensaje cuando un cliente nuevo escribe.">
                        <textarea
                            value={config.welcomeMessage}
                            onChange={e => setConfig({ ...config, welcomeMessage: e.target.value })}
                            className="input-field"
                            rows={2}
                            placeholder="Hola! En qué puedo ayudarte?"
                        />
                    </Field>

                    <Field label="Tono de Comunicación">
                        <div className="grid grid-cols-2 gap-2">
                            {TONE_OPTIONS.map(t => (
                                <button
                                    key={t.value}
                                    onClick={() => setConfig({ ...config, tone: t.value })}
                                    className={`p-3 rounded-xl border text-left transition-all ${
                                        config.tone === t.value
                                            ? 'border-brand-primary/40 bg-brand-primary/5'
                                            : 'border-gray-200 hover:border-gray-200 bg-gray-50/20'
                                    }`}
                                >
                                    <div className={`text-sm font-semibold ${config.tone === t.value ? 'text-brand-primary' : 'text-header'}`}>
                                        {t.label}
                                    </div>
                                    <div className="text-[10px] text-muted mt-0.5">{t.desc}</div>
                                </button>
                            ))}
                        </div>
                    </Field>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50/20">
                        <div>
                            <div className="text-sm font-semibold text-header">Agente Activo</div>
                            <div className="text-[10px] text-muted">Si está desactivado, no responderá mensajes automáticamente.</div>
                        </div>
                        <button
                            onClick={() => setConfig({ ...config, isActive: !config.isActive })}
                            className={`w-12 h-7 rounded-full transition-all duration-300 relative ${
                                config.isActive ? 'bg-brand-primary' : 'bg-gray-100'
                            }`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${
                                config.isActive ? 'left-6' : 'left-1'
                            }`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Behavior */}
            <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-header mb-1">Comportamiento</h3>
                <p className="text-xs text-muted mb-6 opacity-60">Instrucciones personalizadas para tu agente.</p>

                <div className="space-y-5">
                    <Field label="Instrucciones del Sistema (System Prompt)" hint="Indica cómo debe comportarse, qué sabe, qué no debe hacer.">
                        <textarea
                            value={config.systemPrompt || ''}
                            onChange={e => setConfig({ ...config, systemPrompt: e.target.value || null })}
                            className="input-field font-mono text-xs"
                            rows={8}
                            placeholder={`Ej: Eres el asistente de "Mi Tienda". Ayudas con pedidos, precios y disponibilidad.\n\nReglas:\n- No des descuentos sin autorización\n- Si no sabes algo, sugiere llamar al 555-1234\n- Máximo 2 párrafos por respuesta`}
                        />
                    </Field>

                    <Field label="Mensajes de Memoria" hint={`Recuerda las últimas ${config.maxHistoryMessages} mensajes por contacto.`}>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min={2}
                                max={30}
                                value={config.maxHistoryMessages}
                                onChange={e => setConfig({ ...config, maxHistoryMessages: Number(e.target.value) })}
                                className="flex-1 accent-brand-primary"
                            />
                            <span className="text-lg font-bold text-header w-12 text-center">{config.maxHistoryMessages}</span>
                        </div>
                    </Field>

                    <Field label="Idioma">
                        <select
                            value={config.language}
                            onChange={e => setConfig({ ...config, language: e.target.value })}
                            className="input-field"
                        >
                            <option value="es">Español</option>
                            <option value="en">English</option>
                            <option value="pt">Português</option>
                        </select>
                    </Field>
                </div>

                {/* Save Button */}
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={save}
                        disabled={saving}
                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                            saved
                                ? 'bg-success/20 text-success border border-success/30'
                                : 'bg-brand-primary text-white hover:bg-brand-primary/90'
                        }`}
                    >
                        {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar Configuración'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Base de Conocimiento Tab ───────────────────────────────────

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

    // Form state
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

            if (!res.ok) {
                setUploadResult(`Error: ${data.message}`);
            } else {
                setUploadResult(`${data.message}`);
                load();
            }
        } catch (err) {
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
            {/* Top bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => setFilterCat('')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            !filterCat ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' : 'text-muted hover:text-header hover:bg-gray-50/50'
                        }`}
                    >
                        Todas ({entries.length})
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCat(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                                filterCat === cat ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' : 'text-muted hover:text-header hover:bg-gray-50/50'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <label className="px-4 py-2.5 rounded-xl border border-brand-primary/30 text-brand-primary font-bold text-sm hover:bg-brand-primary/10 transition-all flex items-center gap-2 cursor-pointer">
                        <Icons.Download size={16} />
                        Subir Documento
                        <input
                            type="file"
                            accept=".pdf,.xlsx,.xls,.docx,.txt,.csv"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </label>
                    <button
                        onClick={() => { setShowForm(true); setEditId(null); setForm({ category: 'general', title: '', content: '' }); }}
                        className="px-4 py-2.5 rounded-xl bg-brand-primary text-white font-bold text-sm hover:bg-brand-primary/90 transition-all flex items-center gap-2"
                    >
                        + Agregar Manual
                    </button>
                </div>
            </div>

            {/* Upload Drop Zone */}
            <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`mb-6 p-6 rounded-2xl border-2 border-dashed text-center transition-all duration-200 ${
                    dragOver
                        ? 'border-brand-primary bg-brand-primary/5'
                        : 'border-gray-200 hover:border-white/20 bg-gray-50/20'
                }`}
            >
                {uploading ? (
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-muted font-medium">Procesando documento...</span>
                    </div>
                ) : (
                    <div>
                        <div className="text-2xl mb-2">---</div>
                        <p className="text-sm text-muted font-medium">
                            Arrastra aquí un archivo <span className="text-brand-primary">PDF, Excel, Word, TXT o CSV</span>
                        </p>
                        <p className="text-[10px] text-muted mt-1 opacity-50">Máx 10MB — El texto se extraerá automáticamente</p>
                    </div>
                )}
            </div>

            {/* Upload Result */}
            {uploadResult && (
                <div className={`mb-6 p-4 rounded-xl text-sm font-medium border ${
                    uploadResult.startsWith('Error')
                        ? 'bg-red-500/10 border-red-500/20 text-red-400'
                        : 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'
                }`}>
                    {uploadResult}
                    <button onClick={() => setUploadResult(null)} className="ml-3 opacity-50 hover:opacity-100">✕</button>
                </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <div className="glass-panel p-6 rounded-2xl mb-6 border border-brand-primary/10">
                    <h3 className="text-sm font-bold text-header mb-4">{editId ? 'Editar Entrada' : 'Nueva Entrada de Conocimiento'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Field label="Categoría">
                            <div className="flex gap-2">
                                <select
                                    value={CATEGORY_SUGGESTIONS.includes(form.category) ? form.category : '__custom'}
                                    onChange={e => {
                                        if (e.target.value !== '__custom') setForm({ ...form, category: e.target.value });
                                    }}
                                    className="input-field flex-1"
                                >
                                    {CATEGORY_SUGGESTIONS.map(c => (
                                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                    ))}
                                    <option value="__custom">Personalizada...</option>
                                </select>
                                {!CATEGORY_SUGGESTIONS.includes(form.category) && (
                                    <input
                                        type="text"
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}
                                        className="input-field flex-1"
                                        placeholder="Nombre de categoría"
                                    />
                                )}
                            </div>
                        </Field>
                        <Field label="Título" hint="Nombre corto de la información">
                            <input
                                type="text"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                className="input-field"
                                placeholder="Ej: Horarios de atención, Precio del plan Pro..."
                            />
                        </Field>
                    </div>
                    <Field label="Contenido" hint="Detalle que el agente debe saber.">
                        <textarea
                            value={form.content}
                            onChange={e => setForm({ ...form, content: e.target.value })}
                            className="input-field"
                            rows={4}
                            placeholder="Ej: Atendemos de lunes a viernes de 9am a 6pm. Sábados de 10am a 2pm. Domingos cerrado."
                        />
                    </Field>
                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            onClick={() => { setShowForm(false); setEditId(null); }}
                            className="px-4 py-2 rounded-xl text-sm text-muted hover:text-header transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-5 py-2 rounded-xl bg-brand-primary text-white font-bold text-sm hover:bg-brand-primary/90 transition-all"
                        >
                            {editId ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </div>
            )}

            {/* Entries Grid */}
            {entries.length === 0 ? (
                <div className="glass-panel text-center py-20 px-8 rounded-2xl">
                    <div className="text-4xl mb-4">---</div>
                    <h3 className="text-lg font-bold text-header mb-2">Sin información todavía</h3>
                    <p className="text-xs text-muted max-w-md mx-auto opacity-60 leading-relaxed">
                        Agrega información sobre tu negocio para que el agente pueda responder con precisión: productos, precios, horarios, FAQ, políticas, etc.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {entries.map(entry => (
                        <div key={entry.id} className={`glass-panel p-5 rounded-2xl border transition-all ${
                            entry.isActive ? 'border-gray-200' : 'border-gray-100 opacity-50'
                        }`}>
                            <div className="flex items-start justify-between mb-3">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 tracking-wider uppercase">
                                    {entry.category}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleToggle(entry)}
                                        className={`p-1.5 rounded-lg transition-all text-xs ${
                                            entry.isActive ? 'text-success hover:bg-success/10' : 'text-muted hover:bg-gray-100'
                                        }`}
                                        title={entry.isActive ? 'Desactivar' : 'Activar'}
                                    >
                                        {entry.isActive ? '●' : '○'}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(entry)}
                                        className="p-1.5 rounded-lg text-muted hover:text-header hover:bg-gray-100 transition-all"
                                        title="Editar"
                                    >
                                        <Icons.Analytics size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(entry.id)}
                                        className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                                        title="Eliminar"
                                    >
                                        <Icons.Logout size={14} />
                                    </button>
                                </div>
                            </div>
                            <h4 className="text-sm font-bold text-header mb-2">{entry.title}</h4>
                            <p className="text-xs text-muted leading-relaxed line-clamp-4">{entry.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Conversations Tab ────────────────────────────────────

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: '500px' }}>
            {/* Contact List */}
            <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="text-sm font-bold text-header">Contactos</h3>
                    <p className="text-[10px] text-muted mt-0.5">{contacts.length} conversaciones</p>
                </div>
                <div className="overflow-y-auto max-h-[500px] custom-scrollbar">
                    {contacts.length === 0 ? (
                        <div className="text-center py-12 px-4">
                            <div className="text-3xl mb-3">---</div>
                            <p className="text-xs text-muted opacity-60">
                                Aún no hay conversaciones. Cuando los clientes escriban por WhatsApp, aparecerán aquí.
                            </p>
                        </div>
                    ) : (
                        contacts.map(c => (
                            <button
                                key={c.contactPhone}
                                onClick={() => loadMessages(c.contactPhone)}
                                className={`w-full text-left p-4 border-b border-gray-100 transition-all hover:bg-gray-50/30 ${
                                    selectedPhone === c.contactPhone ? 'bg-gray-50/50 border-l-2 border-l-brand-primary' : ''
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xs">
                                        {c.contactPhone.slice(-4)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-header truncate">+{c.contactPhone}</div>
                                        <div className="text-[10px] text-muted truncate mt-0.5">{c.content}</div>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat View */}
            <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden flex flex-col">
                {!selectedPhone ? (
                    <div className="flex-1 flex items-center justify-center text-center px-8">
                        <div>
                            <div className="text-4xl mb-4">---</div>
                            <p className="text-sm text-muted opacity-60">Selecciona un contacto para ver la conversación.</p>
                        </div>
                    </div>
                ) : loadingMsgs ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-sm text-muted animate-pulse">Cargando mensajes...</div>
                    </div>
                ) : (
                    <>
                        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xs">
                                {selectedPhone.slice(-4)}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-header">+{selectedPhone}</div>
                                <div className="text-[10px] text-muted">{messages.length} mensajes</div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                                        msg.role === 'assistant'
                                            ? 'bg-gray-50/50 border border-gray-200 text-header rounded-bl-md'
                                            : 'bg-brand-primary/10 border border-brand-primary/20 text-header rounded-br-md'
                                    }`}>
                                        <div>{msg.content}</div>
                                        <div className={`text-[9px] mt-1.5 ${msg.role === 'assistant' ? 'text-muted' : 'text-brand-primary'} opacity-50`}>
                                            {new Date(msg.createdAt).toLocaleString('es', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ── Shared Components ────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-bold text-header mb-1.5">{label}</label>
            {hint && <p className="text-[10px] text-muted mb-2 opacity-60">{hint}</p>}
            {children}
        </div>
    );
}

function LoadingState() {
    return (
        <div className="glass-panel p-12 rounded-2xl">
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-10 bg-gray-100 rounded-lg w-full" />
                ))}
            </div>
        </div>
    );
}
