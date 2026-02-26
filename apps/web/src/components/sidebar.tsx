'use client';

import { useAuth } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Icons } from './icons';

const NAV_GROUPS = [
    {
        label: 'Inteligencia',
        items: [
            { href: '/dashboard', Icon: Icons.Home, label: 'Centro de Control', exact: true },
            { href: '/dashboard/analytics', Icon: Icons.Analytics, label: 'Vista Estrategica' },
            { href: '/dashboard/agents', Icon: Icons.Agents, label: 'Agentes IA' },
            { href: '/dashboard/knowledge', Icon: Icons.AI, label: 'Base de Conocimiento' },
        ],
    },
    {
        label: 'Operaciones',
        items: [
            { href: '/dashboard/inbox', Icon: Icons.Inbox, label: 'Bandeja Omnicanal' },
            { href: '/dashboard/whatsapp', Icon: Icons.WhatsApp, label: 'Nodos WhatsApp' },
        ],
    },
    {
        label: 'Crecimiento',
        items: [
            { href: '/dashboard/marketing', Icon: Icons.Rocket, label: 'Motor de Campanas' },
            { href: '/dashboard/integrations', Icon: Icons.Link, label: 'Integraciones' },
            { href: '/dashboard/referrals', Icon: Icons.Referrals, label: 'Programa de Referidos' },
        ],
    },
];

export default function Sidebar() {
    const { user, organization, logout } = useAuth();
    const pathname = usePathname();

    const isActive = (href: string, exact = false) =>
        exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

    return (
        <aside className="fixed top-0 left-0 h-screen overflow-hidden flex flex-col z-50 transition-all duration-300"
            style={{
                width: 'var(--sidebar-width)',
                background: '#ffffff',
                borderRight: '1px solid #e5e5e5'
            }}>

            {/* Brand Identity */}
            <div className="flex items-center gap-3 px-8 py-10" style={{ cursor: 'default' }}>
                <div className="flex items-center justify-center w-8 h-8 rounded-lg"
                    style={{ background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary-dark) 100%)' }}>
                    <Icons.Credits width={18} height={18} style={{ color: '#ffffff' }} />
                </div>
                <span className="font-display text-xl font-bold tracking-tight">Full Login</span>
            </div>

            {/* Navigation Flow */}
            <nav className="flex-1 overflow-y-auto px-4 custom-scrollbar">
                {NAV_GROUPS.map((group) => (
                    <div key={group.label} className="mb-8">
                        <div className="px-4 mb-3 text-[10px] font-bold tracking-[0.2em] text-muted uppercase opacity-40 font-display">
                            {group.label}
                        </div>
                        <div className="flex flex-col gap-1">
                            {group.items.map((item) => {
                                const active = isActive(item.href, item.exact);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                            ${active ? 'bg-black/[0.04]' : 'hover:bg-black/[0.02]'}`}
                                        style={{
                                            textDecoration: 'none',
                                            color: active ? 'var(--text-header)' : 'var(--text-muted)'
                                        }}
                                    >
                                        {/* Active Indicator Glow */}
                                        {active && (
                                            <div className="absolute left-0 w-1 h-5 rounded-r-full"
                                                style={{
                                                    backgroundColor: 'var(--brand-primary)',
                                                    boxShadow: '0 0 15px var(--brand-primary)'
                                                }} />
                                        )}

                                        <div className={`transition-colors duration-200
                                            ${active ? 'text-brand-primary' : 'group-hover:text-header'}`}
                                            style={{ color: active ? 'var(--brand-primary)' : undefined }}>
                                            <item.Icon size={18} />
                                        </div>

                                        <span className={`text-[13px] font-medium transition-all duration-200
                                            ${active ? 'font-semibold' : 'group-hover:translate-x-1'}`}>
                                            {item.label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Premium User Module */}
            <div className="p-4 mt-auto">
                <div className="glass-panel p-4 rounded-2xl flex items-center gap-3" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center border border-black/10">
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`}
                            alt="User Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1 min-width-0 overflow-hidden">
                        <div className="text-[13px] font-bold text-header truncate">{user?.name || user?.email?.split('@')[0]}</div>
                        <div className="text-[10px] text-muted truncate opacity-60 font-medium uppercase tracking-tighter">
                            {organization?.name || 'Cuenta Estandar'}
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 rounded-lg hover:bg-red-50 text-muted hover:text-red-400 transition-all"
                        title="Cerrar sesion"
                    >
                        <Icons.Logout size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
