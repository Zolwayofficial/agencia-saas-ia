'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Icons } from '@/components/icons';

// ── Canales de mensajería ────────────────────────────────────────────────────
const MESSAGING_CHANNELS = [
    {
        id: 'whatsapp',
        name: 'WhatsApp',
        desc: 'Evolution API · Cloud API',
        icon: Icons.LogoWhatsApp,
        color: '#25D366',
        href: '/dashboard/whatsapp',
    },
    {
        id: 'instagram',
        name: 'Instagram DM',
        desc: 'Meta Business API',
        icon: Icons.LogoInstagram,
        color: '#E1306C',
        href: '#',
    },
    {
        id: 'facebook',
        name: 'Facebook Messenger',
        desc: 'Meta Business API',
        icon: Icons.LogoFacebook,
        color: '#1877F2',
        href: '#',
    },
    {
        id: 'telegram',
        name: 'Telegram',
        desc: 'Bot API',
        icon: Icons.LogoTelegram,
        color: '#229ED9',
        href: '#',
    },
    {
        id: 'tiktok',
        name: 'TikTok',
        desc: 'Business Messaging',
        icon: Icons.LogoTikTok,
        color: '#010101',
        href: '#',
    },
    {
        id: 'email',
        name: 'Email Omnicanal',
        desc: 'SMTP / IMAP',
        icon: Icons.Mail,
        color: '#EA4335',
        href: '#',
    },
    {
        id: 'twitter',
        name: 'X / Twitter DM',
        desc: 'Twitter API v2',
        icon: Icons.LogoX,
        color: '#ffffff',
        href: '#',
    },
    {
        id: 'sms',
        name: 'SMS · Twilio',
        desc: 'Twilio Messaging API',
        icon: Icons.LogoTwilio,
        color: '#F22F46',
        href: '#',
    },
    {
        id: 'line',
        name: 'LINE',
        desc: 'LINE Messaging API',
        icon: Icons.LogoLine,
        color: '#06C755',
        href: '#',
    },
    {
        id: 'google',
        name: 'Google Business',
        desc: 'Business Messages API',
        icon: Icons.LogoGoogle,
        color: '#4285F4',
        href: '#',
    },
];

// ── Integraciones de herramientas ────────────────────────────────────────────
const TOOL_INTEGRATIONS = [
    {
        id: 'slack',
        name: 'Slack',
        desc: 'Notificaciones · Alertas',
        icon: Icons.LogoSlack,
        color: '#4A154B',
        href: '#',
    },
    {
        id: 'linear',
        name: 'Linear',
        desc: 'Issue tracking · Tickets',
        icon: Icons.LogoLinear,
        color: '#5E6AD2',
        href: '#',
    },
    {
        id: 'notion',
        name: 'Notion',
        desc: 'Base de conocimiento',
        icon: Icons.LogoNotion,
        color: '#ffffff',
        href: '#',
    },
    {
        id: 'shopify',
        name: 'Shopify',
        desc: 'E-commerce · Pedidos',
        icon: Icons.LogoShopify,
        color: '#96BF48',
        href: '#',
    },
    {
        id: 'teams',
        name: 'Microsoft Teams',
        desc: 'Colaboración · Tickets',
        icon: Icons.LogoMicrosoftTeams,
        color: '#6264A7',
        href: '#',
    },
];

function ChannelCard({ item, status, details }: {
    item: typeof MESSAGING_CHANNELS[0];
    status: 'online' | 'offline';
    details?: string;
}) {
    const Icon = item.icon;
    return (
        <Link
            href={item.href}
            className="group flex items-center gap-4 p-5 glass-panel !bg-white/[0.01] !border-white/[0.03] hover:!border-brand-primary/20 transition-all no-underline"
        >
            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shrink-0"
                style={{ background: `${item.color}18`, color: item.color }}
            >
                <Icon size={24} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-header truncate group-hover:text-brand-primary transition-colors">
                    {item.name}
                </div>
                <div className="text-[10px] text-muted font-medium uppercase tracking-tighter mt-0.5 opacity-60">
                    {details ?? item.desc}
                </div>
            </div>
            <div className={`text-[9px] font-black px-2 py-1 rounded border tracking-widest shrink-0 ${
                status === 'online'
                    ? 'bg-success/5 text-brand-primary border-brand-primary/20'
                    : 'bg-white/5 text-muted border-white/10'
            }`}>
                {status === 'online' ? 'ACTIVO' : 'INACTIVO'}
            </div>
        </Link>
    );
}

export default function InboxPage() {
    const [instances, setInstances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getInstances()
            .then(data => setInstances(data.instances || []))
            .catch(() => setInstances([]))
            .finally(() => setLoading(false));
    }, []);

    const whatsappOnline = instances.length > 0;
    const activeCount = whatsappOnline ? 1 : 0;

    return (
        <div className="animate-in max-w-7xl mx-auto">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 tracking-widest uppercase">
                            Comunicación
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold font-display tracking-tight text-gradient">
                        Bandeja Omnicanal
                    </h1>
                    <p className="text-muted text-sm mt-1 font-medium italic opacity-60">
                        Terminal unificada para gestionar todas tus conversaciones.
                    </p>
                </div>
                <a
                    href="https://chat.fulllogin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-premium btn-premium-primary"
                >
                    <Icons.External size={16} />
                    Abrir Chatwoot
                </a>
            </header>

            {/* Métricas */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="glass-panel stat-card-premium">
                    <div className="label">Volumen Mensual</div>
                    <div className="flex items-baseline gap-2">
                        <span className="value">1,248</span>
                        <span className="trend trend-up">
                            <Icons.ArrowUp size={12} className="mr-1" />18.2%
                        </span>
                    </div>
                </div>
                <div className="glass-panel stat-card-premium">
                    <div className="label">Tiempo de Respuesta</div>
                    <div className="flex items-baseline gap-2">
                        <span className="value">14s</span>
                        <span className="text-[10px] font-bold text-muted ml-2 uppercase">Promedio</span>
                    </div>
                </div>
                <div className="glass-panel stat-card-premium">
                    <div className="label">Canales Activos</div>
                    <div className="flex items-baseline gap-2">
                        <span className="value">{activeCount} / {MESSAGING_CHANNELS.length}</span>
                    </div>
                </div>
                <div className="glass-panel stat-card-premium">
                    <div className="label">Estado del Sistema</div>
                    <div className="flex items-baseline gap-2 text-brand-primary">
                        <span className="value !text-brand-primary">ÓPTIMO</span>
                    </div>
                </div>
            </section>

            {/* Banner Enterprise */}
            <div className="glass-panel p-8 flex flex-col md:flex-row items-center gap-8 mb-12 border-brand-primary/10 bg-brand-primary/[0.02]">
                <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20 shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.1)]">
                    <Icons.Credits size={32} />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-xl font-bold font-display text-header mb-2 uppercase tracking-wide">
                        Sistema Activo
                    </h2>
                    <p className="text-muted text-sm leading-relaxed max-w-2xl">
                        Tu cuenta tiene acceso completo a automatización, orquestación de agentes IA y analítica avanzada.
                    </p>
                </div>
                <button className="btn-premium btn-premium-outline whitespace-nowrap">
                    Ver Detalles
                </button>
            </div>

            {/* Canales Desplegados */}
            <section className="glass-panel p-8 mb-8">
                <div className="mb-8">
                    <h3 className="text-xs font-bold tracking-[0.2em] text-muted uppercase mb-1">
                        Canales Desplegados
                    </h3>
                    <p className="text-[10px] text-muted font-medium">Escáner de canales en tiempo real</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {MESSAGING_CHANNELS.map(channel => (
                        <ChannelCard
                            key={channel.id}
                            item={channel}
                            status={channel.id === 'whatsapp' && whatsappOnline ? 'online' : 'offline'}
                            details={channel.id === 'whatsapp'
                                ? `${instances.length} nodo(s) activo(s)`
                                : undefined}
                        />
                    ))}
                </div>
            </section>

            {/* Integraciones de Herramientas */}
            <section className="glass-panel p-8">
                <div className="mb-8">
                    <h3 className="text-xs font-bold tracking-[0.2em] text-muted uppercase mb-1">
                        Integraciones de Herramientas
                    </h3>
                    <p className="text-[10px] text-muted font-medium">CRM · Productividad · E-commerce</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {TOOL_INTEGRATIONS.map(tool => (
                        <ChannelCard
                            key={tool.id}
                            item={tool}
                            status="offline"
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}
