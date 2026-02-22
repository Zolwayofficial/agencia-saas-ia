'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Icons } from '@/components/icons';

const INTEGRATIONS = [
    { id: 'chatwoot', name: 'Chatwoot', cat: 'Core Infrastructure', status: 'connected', desc: 'Omnichannel engagement & advanced support terminal.' },
    { id: 'evolution', name: 'WhatsApp Evolution', cat: 'Core Infrastructure', status: 'connected', desc: 'Enterprise-scale messaging API for full WhatsApp nodes.' },
    { id: 'n8n', name: 'n8n Workflow', cat: 'Core Infrastructure', status: 'connected', desc: 'Complex B2B automation & multi-step logic orchestration.' },
    { id: 'openai', name: 'OpenAI (GPT-4)', cat: 'Neural Models', status: 'connected', desc: 'Advanced LLM core for autonomous agent intelligence.' },
    { id: 'livekit', name: 'LiveKit Voice', cat: 'Neural Models', status: 'setup', desc: 'Real-time low-latency voice agents for verbal interaction.' },
    { id: 'litellm', name: 'LiteLLM Proxy', cat: 'Neural Models', status: 'connected', desc: 'Orchestration & load-balancing across diverse model providers.' },
    { id: 'stripe', name: 'Stripe Payments', cat: 'Fiscal & CRM', status: 'setup', desc: 'Subscription lifecycle & secure fiscal transaction gateway.' },
    { id: 'shopify', name: 'Shopify Store', cat: 'Fiscal & CRM', status: 'setup', desc: 'Native e-commerce catalog & fulfillment integration.' },
    { id: 'hubspot', name: 'HubSpot CRM', cat: 'Fiscal & CRM', status: 'setup', desc: 'High-fidelity sales lead synchronization and tracking.' },
    { id: 'ga4', name: 'Google Analytics', cat: 'Intelligence Hub', status: 'connected', desc: 'Deep event telemetry & behavioral usage metrics.' },
    { id: 'calendly', name: 'Calendly', cat: 'Intelligence Hub', status: 'setup', desc: 'Autonomous demo scheduling & appointment handshake.' },
    { id: 'opentable', name: 'OpenTable', cat: 'Intelligence Hub', status: 'setup', desc: 'Industrial logistics for hospitality & reservation nodes.' },
];

export default function IntegrationsPage() {
    const [instances, setInstances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        api.getInstances()
            .then(data => setInstances(data.instances || []))
            .catch(() => setInstances([]))
            .finally(() => setLoading(false));
    }, []);

    const filtered = INTEGRATIONS.map(i => {
        if (i.id === 'evolution') return { ...i, status: instances.length > 0 ? 'connected' : 'setup' };
        return i;
    }).filter(i => {
        if (filter === 'All') return true;
        return i.status === filter.toLowerCase();
    });

    if (loading) {
        return (
            <div className="animate-pulse space-y-8 p-8 max-w-7xl mx-auto">
                <div className="h-10 w-64 bg-white/5 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-44 bg-white/5 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in max-w-7xl mx-auto">
            {/* Header section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 tracking-widest uppercase">
                            Connector Layer
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold font-display tracking-tight text-gradient">App Connect</h1>
                    <p className="text-muted text-sm mt-1 font-medium italic opacity-60">
                        Synchronize your agency infrastructure with official third-party protocols.
                    </p>
                </div>
                <div className="flex p-1 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                    {['All', 'Connected', 'Setup'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all ${filter === f ? 'bg-brand-primary text-black shadow-[0_5px_15px_rgba(var(--brand-primary-rgb),0.2)]' : 'text-muted hover:text-header'
                                }`}
                        >
                            {f === 'All' ? 'Complete' : f === 'Connected' ? 'Active' : 'Pending'}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {filtered.map(integration => (
                    <div key={integration.id} className={`group glass-panel p-6 flex flex-col transition-all duration-500 ${integration.status === 'connected' ? 'border-brand-primary/10 shadow-[0_10px_30px_-15px_rgba(var(--brand-primary-rgb),0.1)]' : ''
                        }`}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center text-muted group-hover:text-brand-primary border border-white/[0.05] transition-colors">
                                <Icons.Link size={22} />
                            </div>
                            <div className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest border transition-all ${integration.status === 'connected'
                                    ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                                    : 'bg-white/5 text-muted border-white/10 opacity-40'
                                }`}>
                                {integration.status === 'connected' ? 'AUTHORIZED' : 'PENDING'}
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-base font-bold font-display text-header mb-1 group-hover:text-brand-primary transition-colors">{integration.name}</h3>
                            <div className="text-[10px] font-bold text-brand-primary opacity-60 uppercase tracking-widest">{integration.cat}</div>
                            <p className="text-xs text-muted font-medium leading-relaxed mt-4 opacity-50">
                                {integration.desc}
                            </p>
                        </div>

                        <div className="mt-auto grid grid-cols-2 gap-3 pt-6 border-t border-white/[0.03]">
                            <button className="btn-premium btn-premium-outline !py-2 !text-[10px] justify-center opacity-40 hover:opacity-100">
                                <Icons.Alert size={12} /> Tech Spec
                            </button>
                            <button className={`btn-premium !py-2 !text-[10px] justify-center ${integration.status === 'connected'
                                    ? 'btn-premium-outline !border-white/[0.05] !bg-white/[0.02]'
                                    : 'btn-premium-primary'
                                }`}>
                                {integration.status === 'connected' ? 'Configure' : 'Authorize'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Scale Alert */}
            <div className="glass-panel p-6 border-dashed border-white/10 flex items-center justify-between gap-6 opacity-60 hover:opacity-100 transition-all">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted">
                        <Icons.Plus size={18} />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-header uppercase tracking-widest">Protocol Expansion</h4>
                        <p className="text-[10px] text-muted font-medium">Request custom API orchestration for enterprise workloads.</p>
                    </div>
                </div>
                <button className="btn-premium btn-premium-outline !py-2 !px-4 !text-[10px]">
                    Initiate Request
                </button>
            </div>
        </div>
    );
}
