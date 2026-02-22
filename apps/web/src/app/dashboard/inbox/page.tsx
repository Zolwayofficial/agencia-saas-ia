'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Icons } from '@/components/icons';

const CHANNEL_ICONS: Record<string, ((props: any) => JSX.Element)> = {
    whatsapp: (props) => <Icons.WhatsApp {...props} />,
    instagram: (props) => <Icons.Instagram {...props} />,
    telegram: (props) => <Icons.Telegram {...props} />,
    facebook: (props) => <Icons.Facebook {...props} />,
    email: (props) => <Icons.Mail {...props} />,
    twitter: (props) => <Icons.LogoX {...props} />,
    line: (props) => <Icons.MessageSquare {...props} />,
    sms: (props) => <Icons.Smartphone {...props} />,
};

const CHANNELS = [
    { id: 'whatsapp', name: 'WhatsApp', icon: CHANNEL_ICONS.whatsapp, color: '#25D366', status: 'connected' },
    { id: 'instagram', name: 'Instagram DM', icon: CHANNEL_ICONS.instagram, color: '#E1306C', status: 'setup' },
    { id: 'telegram', name: 'Telegram', icon: CHANNEL_ICONS.telegram, color: '#0088cc', status: 'setup' },
    { id: 'facebook', name: 'Facebook Messenger', icon: CHANNEL_ICONS.facebook, color: '#1877F2', status: 'setup' },
    { id: 'email', name: 'Email Omnichannel', icon: CHANNEL_ICONS.email, color: '#EA4335', status: 'setup' },
    { id: 'twitter', name: 'X / Twitter DM', icon: CHANNEL_ICONS.twitter, color: '#ffffff', status: 'setup' },
    { id: 'sms', name: 'SMS / Twilio', icon: CHANNEL_ICONS.sms, color: '#F22F46', status: 'setup' },
];

export default function InboxPage() {
    const [instances, setInstances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getInstances()
            .then(data => setInstances(data.instances || []))
            .catch(() => setInstances([]))
            .finally(() => setLoading(false));
    }, []);

    const enrichedChannels = CHANNELS.map(c =>
        c.id === 'whatsapp'
            ? { ...c, status: instances.length > 0 ? 'connected' : 'setup', details: `${instances.length} Active Nodes` }
            : { ...c, details: 'Tactical Setup Required' }
    );

    return (
        <div className="animate-in max-w-7xl mx-auto">
            {/* Header section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 tracking-widest uppercase">
                            Communication Layer
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold font-display tracking-tight text-gradient">Omni-Channel Inbox</h1>
                    <p className="text-muted text-sm mt-1 font-medium italic opacity-60">
                        Unified terminal for enterprise-scale interaction management.
                    </p>
                </div>
                <a
                    href="https://chat.fulllogin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-premium btn-premium-primary"
                >
                    <Icons.Link size={16} />
                    Execute Chatwoot Console
                </a>
            </header>

            {/* Metrics Dashboard */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="glass-panel stat-card-premium">
                    <div className="label">Monthly Volume</div>
                    <div className="flex items-baseline gap-2">
                        <span className="value">1,248</span>
                        <span className="trend trend-up">
                            <Icons.ArrowUp size={12} className="mr-1" />
                            18.2%
                        </span>
                    </div>
                </div>
                <div className="glass-panel stat-card-premium">
                    <div className="label">AI Latency</div>
                    <div className="flex items-baseline gap-2">
                        <span className="value">14s</span>
                        <span className="text-[10px] font-bold text-muted ml-2 uppercase">AVG RESPONSE</span>
                    </div>
                </div>
                <div className="glass-panel stat-card-premium">
                    <div className="label">Active Hubs</div>
                    <div className="flex items-baseline gap-2">
                        <span className="value">{enrichedChannels.filter(c => c.status === 'connected').length} / 7</span>
                    </div>
                </div>
                <div className="glass-panel stat-card-premium">
                    <div className="label">System Health</div>
                    <div className="flex items-baseline gap-2 text-brand-primary">
                        <span className="value !text-brand-primary">OPTIMAL</span>
                    </div>
                </div>
            </section>

            {/* Enterprise Status Banner */}
            <div className="glass-panel p-8 flex flex-col md:flex-row items-center gap-8 mb-12 border-brand-primary/10 bg-brand-primary/[0.02]">
                <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20 shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.1)]">
                    <Icons.Credits size={32} />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-xl font-bold font-display text-header mb-2 uppercase tracking-wide">Enterprise Protocol Active</h2>
                    <p className="text-muted text-sm leading-relaxed max-w-2xl">
                        Your account has authorized full access to production-grade automation, multi-agent orchestration, and deep predictive analytics. Official enterprise support prioritized.
                    </p>
                </div>
                <button className="btn-premium btn-premium-outline whitespace-nowrap">
                    Review Protocols
                </button>
            </div>

            {/* Infrastructure Grid */}
            <section className="glass-panel p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xs font-bold tracking-[0.2em] text-muted uppercase mb-1">DEPLOYED INFRASTRUCTURE</h3>
                        <p className="text-[10px] text-muted font-medium">REAL-TIME CHANNEL SCANNER</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enrichedChannels.map(channel => (
                        <Link
                            key={channel.id}
                            href={channel.id === 'whatsapp' ? '/dashboard/whatsapp' : '#'}
                            className="group flex items-center gap-4 p-5 glass-panel !bg-white/[0.01] !border-white/[0.03] hover:!border-brand-primary/20 transition-all no-underline"
                        >
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                                style={{ background: `${channel.color}10`, color: channel.color }}>
                                {(() => {
                                    const Icon = channel.icon;
                                    return <Icon size={24} />;
                                })()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-header truncate group-hover:text-brand-primary transition-colors">{channel.name}</div>
                                <div className="text-[10px] text-muted font-medium uppercase tracking-tighter mt-0.5 opacity-60">
                                    {channel.details}
                                </div>
                            </div>
                            <div className={`text-[9px] font-black px-2 py-1 rounded border tracking-widest ${channel.status === 'connected'
                                    ? 'bg-success/5 text-brand-primary border-brand-primary/20'
                                    : 'bg-white/5 text-muted border-white/10'}`}>
                                {channel.status === 'connected' ? 'ONLINE' : 'OFFLINE'}
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
