'use client';

import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import Link from 'next/link';
import { Icons } from '@/components/icons';

// ── Canales de mensajería ─────────────────────────────────────────────────────
const MESSAGING_CHANNELS = [
    { id: 'whatsapp',  name: 'WhatsApp',          icon: Icons.LogoWhatsApp,       color: '#25D366', href: '/dashboard/whatsapp' },
    { id: 'instagram', name: 'Instagram DM',       icon: Icons.LogoInstagram,      color: '#E1306C', href: '/dashboard/inbox' },
    { id: 'facebook',  name: 'Facebook Messenger', icon: Icons.LogoFacebook,       color: '#1877F2', href: '/dashboard/inbox' },
    { id: 'telegram',  name: 'Telegram',           icon: Icons.LogoTelegram,       color: '#229ED9', href: '/dashboard/inbox' },
    { id: 'tiktok',    name: 'TikTok',             icon: Icons.LogoTikTok,         color: '#010101', href: '/dashboard/inbox' },
    { id: 'email',     name: 'Email Omnicanal',    icon: Icons.Mail,               color: '#EA4335', href: '/dashboard/inbox' },
    { id: 'twitter',   name: 'X / Twitter DM',     icon: Icons.LogoX,              color: '#111111', href: '/dashboard/inbox' },
    { id: 'sms',       name: 'SMS · Twilio',       icon: Icons.LogoTwilio,         color: '#F22F46', href: '/dashboard/inbox' },
    { id: 'line',      name: 'LINE',               icon: Icons.LogoLine,           color: '#06C755', href: '/dashboard/inbox' },
    { id: 'google',    name: 'Google Business',    icon: Icons.LogoGoogle,         color: '#4285F4', href: '/dashboard/inbox' },
];

// ── Herramientas de productividad ─────────────────────────────────────────────
const TOOL_INTEGRATIONS = [
    { id: 'slack',  name: 'Slack',            desc: 'Notificaciones',        icon: Icons.LogoSlack,          color: '#4A154B' },
    { id: 'linear', name: 'Linear',           desc: 'Issue tracking',        icon: Icons.LogoLinear,         color: '#5E6AD2' },
    { id: 'notion', name: 'Notion',           desc: 'Conocimiento',          icon: Icons.LogoNotion,         color: '#333333' },
    { id: 'shopify',name: 'Shopify',          desc: 'E-commerce',            icon: Icons.LogoShopify,        color: '#96BF48' },
    { id: 'teams',  name: 'Microsoft Teams',  desc: 'Colaboración',          icon: Icons.LogoMicrosoftTeams, color: '#6264A7' },
];

const QUICK_ACTIONS = [
    { href: '/dashboard/inbox',       Icon: Icons.Inbox,    label: 'Bandeja Omnicanal', desc: 'Gestionar conversaciones',   color: '#5abf8a' },
    { href: '/dashboard/marketing',   Icon: Icons.Rocket,   label: 'Motor de Campanas', desc: 'Crear nueva automatización', color: '#3b82f6' },
    { href: '/dashboard/whatsapp',    Icon: Icons.WhatsApp, label: 'Nodos WhatsApp',    desc: 'Escanear y gestionar',       color: '#25D366' },
    { href: '/dashboard/integrations',Icon: Icons.Link,     label: 'Integraciones',     desc: 'Sincronizar aplicaciones',   color: '#f59e0b' },
];

// ── Channel pill ──────────────────────────────────────────────────────────────
function ChannelPill({
    ch, status, label,
}: {
    ch: typeof MESSAGING_CHANNELS[0];
    status: 'connected' | 'setup';
    label?: string;
}) {
    const Icon = ch.icon;
    const darkIcon = ch.color === '#010101' || ch.color === '#111111';
    return (
        <Link
            href={ch.href}
            className="group flex items-center gap-3 p-3 rounded-2xl bg-white hover:bg-gray-50/80 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
        >
            <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
                style={{ background: `${ch.color}18`, color: darkIcon ? '#555' : ch.color }}
            >
                <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-gray-800 truncate group-hover:text-brand-primary transition-colors leading-tight">
                    {ch.name}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <div
                        className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                            status === 'connected'
                                ? 'bg-green-400 shadow-[0_0_4px_#4ade80]'
                                : 'bg-gray-200'
                        }`}
                    />
                    <span className={`text-[10px] font-medium tracking-tight truncate ${
                        status === 'connected' ? 'text-green-600' : 'text-gray-400'
                    }`}>
                        {label ?? (status === 'connected' ? 'Activo' : 'Inactivo')}
                    </span>
                </div>
            </div>
        </Link>
    );
}

// ── Tool pill ─────────────────────────────────────────────────────────────────
function ToolPill({ tool }: { tool: typeof TOOL_INTEGRATIONS[0] }) {
    const Icon = tool.icon;
    const darkIcon = tool.color === '#333333';
    return (
        <div className="group flex items-center gap-3 p-3 rounded-2xl bg-white hover:bg-gray-50/80 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 cursor-pointer">
            <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
                style={{ background: `${tool.color}15`, color: darkIcon ? '#555' : tool.color }}
            >
                <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-gray-800 truncate leading-tight">{tool.name}</div>
                <div className="text-[10px] text-gray-400 font-medium">{tool.desc}</div>
            </div>
            <div className="shrink-0 px-1.5 py-0.5 rounded-full bg-gray-100 text-[9px] font-bold text-gray-400 uppercase tracking-wide">
                Conectar
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const { user, organization } = useAuth();
    const [balance, setBalance] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [instances, setInstances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.getBalance(),
            api.getHistory(5),
            api.getInstances().catch(() => ({ instances: [] })),
        ])
            .then(([bal, hist, inst]) => {
                setBalance(bal);
                setHistory(hist.transactions || []);
                setInstances(inst.instances || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const msgPercent = balance?.usage
        ? Math.min(100, (balance.usage.messagesUsed / balance.usage.messagesLimit) * 100)
        : 0;

    const whatsappConnected = instances.length > 0;

    if (loading) {
        return (
            <div className="animate-pulse space-y-5 p-6 max-w-7xl mx-auto">
                <div className="h-10 w-56 bg-gray-100 rounded-2xl" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-3xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="h-72 bg-gray-100 rounded-3xl" />
                    <div className="lg:col-span-2 space-y-4">
                        <div className="h-52 bg-gray-100 rounded-3xl" />
                        <div className="h-44 bg-gray-100 rounded-3xl" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in max-w-7xl mx-auto space-y-5">

            {/* ── Header ──────────────────────────────────────────────────────── */}
            <header className="flex justify-between items-end pt-1">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 tracking-widest uppercase">
                            Centro Operativo
                        </span>
                    </div>
                    <h1 className="text-[2rem] font-bold font-display tracking-tight text-gradient leading-none mb-1">
                        Centro de Control
                    </h1>
                    <p className="text-sm text-gray-400 font-medium">
                        {organization?.name || 'Full Login'} — Estrategia Activa
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Plan Actual</div>
                        <div className="text-sm font-semibold text-gray-700">{balance?.plan?.name || 'Pro (Trial)'}</div>
                    </div>
                    <Link href="/dashboard/billing" className="btn-premium btn-premium-primary !rounded-2xl !py-2.5 !px-5">
                        <Icons.Billing size={15} />
                        Mejorar Plan
                    </Link>
                </div>
            </header>

            {/* ── KPI Row ─────────────────────────────────────────────────────── */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Ingresos */}
                <div className="rounded-3xl bg-white border border-gray-100 p-5 shadow-sm">
                    <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Ingresos Mensuales</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black font-display text-gray-900">${(balance?.mrr || 0).toLocaleString()}</span>
                        <span className="text-[11px] font-bold text-green-500 flex items-center gap-0.5">
                            <Icons.ArrowUp size={10} />12.4%
                        </span>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Proyección activa</span>
                    </div>
                </div>

                {/* Mensajes */}
                <div className="rounded-3xl bg-white border border-gray-100 p-5 shadow-sm">
                    <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Volumen de Mensajes</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black font-display text-gray-900">{(balance?.usage?.messagesUsed || 0).toLocaleString()}</span>
                        <span className="text-[11px] text-gray-400 font-medium">/ {balance?.usage?.messagesLimit || '10000'}</span>
                    </div>
                    <div className="mt-3 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full bg-brand-primary transition-all duration-1000"
                            style={{ width: `${msgPercent}%` }}
                        />
                    </div>
                    <div className="mt-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                        Volumen: {Math.round(msgPercent)}% · Escalado automático
                    </div>
                </div>

                {/* IA */}
                <div className="rounded-3xl bg-white border border-gray-100 p-5 shadow-sm">
                    <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Resolución IA</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black font-display text-gray-900">84.2%</span>
                        <span className="text-[11px] font-bold text-green-500 flex items-center gap-0.5">
                            <Icons.ArrowUp size={10} />2.1%
                        </span>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5">
                        <Icons.AI size={13} className="text-brand-primary opacity-70" />
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Eficiencia autónoma</span>
                    </div>
                </div>

                {/* Referidos */}
                <div className="rounded-3xl bg-white border border-gray-100 p-5 shadow-sm">
                    <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Comisiones Referidos</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black font-display text-gray-900">${(balance?.commissions || 0).toFixed(2)}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5">
                        <Icons.Referrals size={13} className="text-amber-400 opacity-80" />
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Nivel único 20% activo</span>
                    </div>
                </div>
            </section>

            {/* ── Main Grid ────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Acciones Rápidas */}
                <div className="rounded-3xl bg-white border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Acciones Rápidas</h2>
                        <div className="w-6 h-1 rounded-full bg-brand-primary/30" />
                    </div>
                    <div className="space-y-1.5">
                        {QUICK_ACTIONS.map(action => (
                            <Link
                                key={action.href}
                                href={action.href}
                                className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-gray-50 transition-all duration-200 group"
                            >
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
                                    style={{ background: `${action.color}18`, color: action.color }}
                                >
                                    <action.Icon size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="text-[13px] font-semibold text-gray-800 group-hover:text-brand-primary transition-colors">
                                        {action.label}
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-tight mt-0.5">
                                        {action.desc}
                                    </div>
                                </div>
                                <Icons.ArrowRight
                                    size={14}
                                    className="text-gray-300 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all shrink-0"
                                />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Channels + Tools col */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Canales de Comunicación */}
                    <div className="rounded-3xl bg-white border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Canales de Comunicación</h2>
                                <p className="text-[10px] text-gray-300 font-medium mt-0.5">Escáner de canales en tiempo real</p>
                            </div>
                            <Link
                                href="/dashboard/inbox"
                                className="text-[11px] font-semibold text-brand-primary flex items-center gap-1 hover:opacity-70 transition-opacity"
                            >
                                Ver todos <Icons.External size={10} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {MESSAGING_CHANNELS.map(ch => (
                                <ChannelPill
                                    key={ch.id}
                                    ch={ch}
                                    status={ch.id === 'whatsapp' && whatsappConnected ? 'connected' : 'setup'}
                                    label={ch.id === 'whatsapp' ? `${instances.length} nodo(s) activo(s)` : undefined}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Herramientas de Productividad */}
                    <div className="rounded-3xl bg-white border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Herramientas</h2>
                                <p className="text-[10px] text-gray-300 font-medium mt-0.5">CRM · Productividad · E-commerce</p>
                            </div>
                            <Link
                                href="/dashboard/integrations"
                                className="text-[11px] font-semibold text-brand-primary flex items-center gap-1 hover:opacity-70 transition-opacity"
                            >
                                Ver todos <Icons.External size={10} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {TOOL_INTEGRATIONS.map(tool => (
                                <ToolPill key={tool.id} tool={tool} />
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* ── Activity Feed ─────────────────────────────────────────────────── */}
            <section className="rounded-3xl bg-white border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Actividad Reciente</h2>
                        <p className="text-[10px] text-gray-300 font-medium mt-0.5">Registro de transacciones</p>
                    </div>
                    <Link href="/dashboard/billing" className="btn-premium btn-premium-outline !py-2 !px-4 !text-[11px] !rounded-xl">
                        Ver Historial Completo
                    </Link>
                </div>
                {history.length === 0 ? (
                    <div className="py-16 text-center rounded-2xl bg-gray-50/60 border border-dashed border-gray-200">
                        <Icons.Inbox size={40} className="mx-auto mb-3 text-gray-200" />
                        <p className="text-sm font-medium text-gray-300">No hay movimientos registrados</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-gray-100">
                                    <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3">Tipo</th>
                                    <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descripción</th>
                                    <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right px-3">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {history.map(tx => (
                                    <tr key={tx.id} className="group hover:bg-gray-50/40 transition-colors">
                                        <td className="py-4 px-3">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                tx.type === 'COMMISSION'
                                                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                                                    : 'bg-blue-50 text-blue-600 border-blue-200'
                                            }`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <div className="text-[13px] font-semibold text-gray-800 group-hover:text-brand-primary transition-colors line-clamp-1">
                                                {tx.description}
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-medium mt-0.5">
                                                {new Date(tx.createdAt).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="py-4 text-right px-3">
                                            <div className={`text-sm font-black font-display ${tx.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {tx.amount >= 0 ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

        </div>
    );
}
