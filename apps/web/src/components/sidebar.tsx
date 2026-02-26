'use client';

import { useAuth } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Icons } from './icons';

const NAV_GROUPS = [
    {
        label: 'Inteligencia',
        items: [
            { href: '/dashboard',            Icon: Icons.Home,     label: 'Centro de Control', exact: true },
            { href: '/dashboard/analytics',  Icon: Icons.Analytics,label: 'Vista Estratégica' },
            { href: '/dashboard/agents',     Icon: Icons.Agents,   label: 'Agentes IA' },
            { href: '/dashboard/knowledge',  Icon: Icons.AI,       label: 'Base de Conocimiento' },
        ],
    },
    {
        label: 'Operaciones',
        items: [
            { href: '/dashboard/inbox',      Icon: Icons.Inbox,    label: 'Bandeja Omnicanal' },
            { href: '/dashboard/whatsapp',   Icon: Icons.WhatsApp, label: 'Nodos WhatsApp' },
        ],
    },
    {
        label: 'Crecimiento',
        items: [
            { href: '/dashboard/marketing',    Icon: Icons.Rocket,   label: 'Motor de Campañas' },
            { href: '/dashboard/integrations', Icon: Icons.Link,     label: 'Integraciones' },
            { href: '/dashboard/referrals',    Icon: Icons.Referrals,label: 'Programa de Referidos' },
        ],
    },
];

// Icon container colors per nav group index
const GROUP_COLORS = [
    ['#007AFF', '#5856D6', '#AF52DE', '#34C759'],   // Inteligencia
    ['#FF9500', '#25D366'],                           // Operaciones
    ['#FF3B30', '#007AFF', '#FF9500'],                // Crecimiento
];

export default function Sidebar() {
    const { user, organization, logout } = useAuth();
    const pathname = usePathname();

    const isActive = (href: string, exact = false) =>
        exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

    return (
        <aside
            className="fixed top-0 left-0 h-screen flex flex-col z-50 overflow-hidden"
            style={{
                width: 'var(--sidebar-width)',
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                borderRight: '1px solid rgba(0,0,0,0.07)',
            }}
        >
            {/* ── Brand ─────────────────────────────────────────── */}
            <div className="flex items-center gap-3 px-5 pt-8 pb-6">
                <div
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center shadow-sm"
                    style={{
                        background: 'linear-gradient(145deg, #34c97b 0%, #25a562 100%)',
                        boxShadow: '0 2px 8px rgba(52,201,123,0.40)',
                    }}
                >
                    <Icons.Credits width={18} height={18} style={{ color: '#fff' }} />
                </div>
                <span
                    style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                        fontWeight: 700,
                        fontSize: '1.125rem',
                        letterSpacing: '-0.025em',
                        color: '#1C1C1E',
                    }}
                >
                    Full Login
                </span>
            </div>

            {/* ── Navigation ────────────────────────────────────── */}
            <nav className="flex-1 overflow-y-auto px-3 custom-scrollbar space-y-6">
                {NAV_GROUPS.map((group, gi) => (
                    <div key={group.label}>
                        {/* Section header */}
                        <div
                            className="px-3 mb-1.5"
                            style={{
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                                fontSize: '0.6875rem',
                                fontWeight: 600,
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                                color: 'rgba(60,60,67,0.45)',
                            }}
                        >
                            {group.label}
                        </div>

                        <div className="space-y-0.5">
                            {group.items.map((item, ii) => {
                                const active = isActive(item.href, item.exact);
                                const iconColor = GROUP_COLORS[gi]?.[ii] ?? '#8E8E93';
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <div
                                            className="flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all duration-150"
                                            style={{
                                                background: active
                                                    ? 'rgba(52,201,123,0.10)'
                                                    : 'transparent',
                                            }}
                                            onMouseEnter={e => {
                                                if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)';
                                            }}
                                            onMouseLeave={e => {
                                                if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
                                            }}
                                        >
                                            {/* SF-Symbols–style icon container */}
                                            <div
                                                className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0 transition-all duration-150"
                                                style={{
                                                    background: active
                                                        ? `rgba(52,201,123,0.15)`
                                                        : `${iconColor}18`,
                                                    color: active ? 'var(--brand-primary)' : iconColor,
                                                    boxShadow: active
                                                        ? '0 1px 4px rgba(52,201,123,0.20)'
                                                        : 'none',
                                                }}
                                            >
                                                <item.Icon size={16} />
                                            </div>

                                            {/* Label */}
                                            <span
                                                style={{
                                                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                                                    fontSize: '0.875rem',
                                                    fontWeight: active ? 600 : 400,
                                                    color: active ? 'var(--brand-primary)' : '#1C1C1E',
                                                    letterSpacing: '-0.01em',
                                                    transition: 'color 0.15s',
                                                }}
                                            >
                                                {item.label}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* ── User Cell ─────────────────────────────────────── */}
            <div className="p-3 mt-auto">
                {/* Separator */}
                <div className="h-px mx-2 mb-3" style={{ background: 'rgba(60,60,67,0.10)' }} />

                <div
                    className="flex items-center gap-3 px-3 py-2.5 rounded-2xl"
                    style={{ background: 'rgba(116,116,128,0.06)' }}
                >
                    {/* Avatar */}
                    <div
                        className="w-9 h-9 rounded-full overflow-hidden shrink-0"
                        style={{ border: '2px solid rgba(0,0,0,0.06)' }}
                    >
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                        <div
                            className="truncate"
                            style={{
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: '#1C1C1E',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            {user?.name || user?.email?.split('@')[0] || 'Admin'}
                        </div>
                        <div
                            className="truncate"
                            style={{
                                fontSize: '0.75rem',
                                fontWeight: 400,
                                color: 'rgba(60,60,67,0.50)',
                            }}
                        >
                            {organization?.name || 'Full Login'}
                        </div>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={logout}
                        className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
                        style={{ color: 'rgba(60,60,67,0.45)' }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(255,59,48,0.10)';
                            (e.currentTarget as HTMLElement).style.color = '#FF3B30';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                            (e.currentTarget as HTMLElement).style.color = 'rgba(60,60,67,0.45)';
                        }}
                        title="Cerrar sesión"
                    >
                        <Icons.Logout size={15} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
