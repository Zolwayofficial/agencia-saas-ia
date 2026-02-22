'use client';

import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import Link from 'next/link';
import { Icons } from '@/components/icons';

const CHANNEL_ICONS: Record<string, ((props: any) => JSX.Element)> = {
    whatsapp: (props) => <Icons.WhatsApp {...props} />,
    instagram: (props) => <Icons.Instagram {...props} />,
    telegram: (props) => <Icons.Telegram {...props} />,
    facebook: (props) => <Icons.Facebook {...props} />,
    email: (props) => <Icons.Mail {...props} />,
    discord: (props) => <Icons.Discord {...props} />,
};

const CHANNELS = [
    { id: 'whatsapp', name: 'WhatsApp', icon: CHANNEL_ICONS.whatsapp, color: '#25D366', status: 'connected', label: 'Active instances' },
    { id: 'instagram', name: 'Instagram', icon: CHANNEL_ICONS.instagram, color: '#E1306C', status: 'setup', label: 'Not configured' },
    { id: 'telegram', name: 'Telegram', icon: CHANNEL_ICONS.telegram, color: '#0088cc', status: 'setup', label: 'Not configured' },
    { id: 'facebook', name: 'Facebook', icon: CHANNEL_ICONS.facebook, color: '#1877F2', status: 'setup', label: 'Not configured' },
    { id: 'email', name: 'Email', icon: CHANNEL_ICONS.email, color: '#EA4335', status: 'setup', label: 'Not configured' },
    { id: 'discord', name: 'Discord', icon: CHANNEL_ICONS.discord, color: '#5865F2', status: 'setup', label: 'Not configured' },
];

const QUICK_ACTIONS = [
    { href: '/dashboard/inbox', Icon: Icons.Inbox, label: 'Omni-Channel Inbox', desc: 'Manage all interactions', color: '#50CD95' },
    { href: '/dashboard/marketing', Icon: Icons.Rocket, label: 'Campaign Engine', desc: 'Deploy new automation', color: '#3b82f6' },
    { href: '/dashboard/whatsapp', Icon: Icons.WhatsApp, label: 'WhatsApp Nodes', desc: 'Scan & Manage instances', color: '#25D366' },
    { href: '/dashboard/integrations', Icon: Icons.Link, label: 'App Connect', desc: 'Infrastructure sync', color: '#f59e0b' },
];

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

    const enrichedChannels = CHANNELS.map((c) =>
        c.id === 'whatsapp'
            ? { ...c, label: `${instances.length} node(s) active`, status: instances.length > 0 ? 'connected' : 'setup' }
            : c
    );

    if (loading) {
        return (
            <div className="animate-pulse space-y-8 p-8 max-w-6xl mx-auto">
                <div className="h-8 w-64 bg-white/5 rounded-lg" />
                <div className="grid grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-white/5 rounded-2xl" />
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="h-64 bg-white/5 rounded-2xl" />
                    <div className="h-64 bg-white/5 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in max-w-7xl mx-auto">
            {/* Command Center Header */}
            <header className="flex justify-between items-end mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/[0.05] text-brand-primary border border-brand-primary/20 tracking-widest uppercase">
                            Operational Hub
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold font-display tracking-tight text-gradient">Command Center</h1>
                    <p className="text-muted text-sm mt-1 font-medium italic opacity-60">
                        {organization?.name || 'Enterprise'} — Terminal Strategy Active
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <div className="text-xs font-bold text-muted uppercase tracking-widest mb-1">CURRENT PLAN</div>
                        <div className="text-sm font-semibold text-header">{balance?.plan?.name || 'SaaS Professional'}</div>
                    </div>
                    <Link href="/dashboard/billing" className="btn-premium btn-premium-primary">
                        <Icons.Billing size={16} />
                        Scale Operation
                    </Link>
                </div>
            </header>

            {/* Strategic KPI Row */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="glass-panel stat-card-premium">
                    <div className="label">Monthly Revenue</div>
                    <div className="flex items-baseline gap-2">
                        <span className="value">${(balance?.mrr || 0).toLocaleString()}</span>
                        <span className="trend trend-up">
                            <Icons.ArrowUp size={12} className="mr-1" />
                            12.4%
                        </span>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <Icons.MRR size={14} className="text-brand-primary opacity-50" />
                        <span className="text-[10px] font-bold text-muted underline decoration-brand-primary/20 underline-offset-4">PROJECTION ACTIVE</span>
                    </div>
                </div>

                <div className="glass-panel stat-card-premium">
                    <div className="label">Message Velocity</div>
                    <div className="flex items-baseline gap-2">
                        <span className="value">{(balance?.usage?.messagesUsed || 0).toLocaleString()}</span>
                        <span className="text-xs font-medium text-muted">/ {balance?.usage?.messagesLimit || '5k'}</span>
                    </div>
                    <div className="mt-4 w-full h-1 bg-white/[0.05] rounded-full overflow-hidden">
                        <div className="h-full bg-brand-primary shadow-[0_0_8px_var(--brand-primary)]" style={{ width: `${msgPercent}%` }} />
                    </div>
                    <div className="mt-4 flex justify-between items-center text-[10px] font-bold tracking-widest text-muted">
                        <span>VOLUME: {Math.round(msgPercent)}%</span>
                        <span className="opacity-40">AUTO-SCALE ENABLED</span>
                    </div>
                </div>

                <div className="glass-panel stat-card-premium">
                    <div className="label">AI Resolution</div>
                    <div className="flex items-baseline gap-2">
                        <span className="value">84.2%</span>
                        <span className="trend trend-up">
                            <Icons.ArrowUp size={12} className="mr-1" />
                            2.1%
                        </span>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <Icons.AI size={14} className="text-primary-light opacity-80" />
                        <span className="text-[10px] font-bold text-muted">AUTONOMOUS EFFICIENCY</span>
                    </div>
                </div>

                <div className="glass-panel stat-card-premium">
                    <div className="label">Partner Commissions</div>
                    <div className="flex items-baseline gap-2">
                        <span className="value">${(balance?.commissions || 0).toFixed(2)}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <Icons.Referrals size={14} className="text-warning opacity-50" />
                        <span className="text-[10px] font-bold text-muted">SINGLE-LEVEL 20% ACTIVE</span>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                {/* Tactical Actions */}
                <div className="lg:col-span-1 glass-panel p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xs font-bold tracking-[0.2em] text-muted uppercase">TACTICAL ACTIONS</h2>
                        <div className="w-8 h-1 bg-brand-primary/20 rounded-full" />
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {QUICK_ACTIONS.map((action) => (
                            <Link key={action.href} href={action.href} className="flex items-center gap-4 p-4 glass-panel hover:bg-white/[0.03] transition-all group !border-white/[0.02]">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
                                    style={{ background: `${action.color}15`, color: action.color }}>
                                    <action.Icon size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="text-[13px] font-bold text-header group-hover:text-brand-primary transition-colors">{action.label}</div>
                                    <div className="text-[10px] text-muted font-medium uppercase tracking-tight opacity-60">{action.desc}</div>
                                </div>
                                <Icons.ArrowRight size={14} className="text-muted group-hover:translate-x-1 group-hover:text-header transition-all" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Infrastructure Status */}
                <div className="lg:col-span-2 glass-panel p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xs font-bold tracking-[0.2em] text-muted uppercase">INFRASTRUCTURE NODES</h2>
                        <Link href="/dashboard/whatsapp" className="text-[10px] flex items-center gap-1 font-bold text-brand-primary uppercase tracking-widest hover:opacity-80 transition-all">
                            Manage All <Icons.External size={10} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {enrichedChannels.map((ch) => (
                            <div key={ch.id} className="flex items-center gap-4 p-4 glass-panel !border-white/[0.02]">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: `${ch.color}10`, color: ch.color }}>
                                    {(() => {
                                        const Icon = ch.icon;
                                        return <Icon size={20} />;
                                    })()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[13px] font-bold text-header truncate">{ch.name}</div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${ch.status === 'connected' ? 'bg-success animate-pulse' : 'bg-white/10'}`}
                                            style={{ backgroundColor: ch.status === 'connected' ? 'hsl(var(--success))' : undefined }} />
                                        <span className={`text-[10px] font-bold tracking-tight uppercase ${ch.status === 'connected' ? 'text-brand-primary' : 'text-muted opacity-40'}`}>
                                            {ch.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Strategic Activity Feed */}
            <section className="glass-panel p-6 mb-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xs font-bold tracking-[0.2em] text-muted uppercase mb-1">OPERATIONAL ACTIVITY</h2>
                        <p className="text-[10px] text-muted font-medium">REAL-TIME TRANSACTION LOG</p>
                    </div>
                    <Link href="/dashboard/billing" className="btn-premium btn-premium-outline !py-2 !px-4 !text-[11px]">
                        Full Forensic Audit
                    </Link>
                </div>
                {history.length === 0 ? (
                    <div className="py-20 text-center glass-panel !border-dashed !bg-transparent border-white/5 opacity-40">
                        <Icons.Inbox size={48} className="mx-auto mb-4 opacity-5" />
                        <p className="text-sm font-medium">No tactical movements registered</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-white/[0.03]">
                                    <th className="pb-4 text-[10px] font-bold text-muted uppercase tracking-[0.1em] px-4">TYPE</th>
                                    <th className="pb-4 text-[10px] font-bold text-muted uppercase tracking-[0.1em]">STRATEGY</th>
                                    <th className="pb-4 text-[10px] font-bold text-muted uppercase tracking-[0.1em] text-right px-4">IMPACT</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
                                {history.map((tx) => (
                                    <tr key={tx.id} className="group hover:bg-white/[0.01] transition-all">
                                        <td className="py-5 px-4">
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${tx.type === 'COMMISSION'
                                                    ? 'bg-warning/5 text-warning border-warning/20'
                                                    : 'bg-info/5 text-info border-info/20'}`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="py-5">
                                            <div className="text-[13px] font-bold text-header group-hover:text-brand-primary transition-all line-clamp-1">{tx.description}</div>
                                            <div className="text-[10px] text-muted font-medium opacity-40">
                                                {new Date(tx.createdAt).toLocaleString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="py-5 text-right px-4">
                                            <div className={`text-sm font-black font-display ${tx.amount >= 0 ? 'text-brand-primary' : 'text-danger'}`}>
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

