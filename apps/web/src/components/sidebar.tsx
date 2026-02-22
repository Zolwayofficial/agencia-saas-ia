'use client';

import { useAuth } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV_GROUPS = [
    {
        label: 'COMUNICACIÓN',
        items: [
            { href: '/dashboard', icon: '⚡', label: 'Inicio', exact: true },
            { href: '/dashboard/inbox', icon: '💬', label: 'Inbox Multicanal' },
            { href: '/dashboard/whatsapp', icon: '📱', label: 'WhatsApp' },
        ],
    },
    {
        label: 'INTELIGENCIA',
        items: [
            { href: '/dashboard/analytics', icon: '📊', label: 'Analytics' },
            { href: '/dashboard/agents', icon: '🤖', label: 'Agentes IA' },
            { href: '/dashboard/kpis', icon: '📈', label: 'KPIs & Métricas' },
        ],
    },
    {
        label: 'CRECIMIENTO',
        items: [
            { href: '/dashboard/marketing', icon: '🚀', label: 'Marketing' },
            { href: '/dashboard/integrations', icon: '🔗', label: 'Integraciones' },
            { href: '/dashboard/referrals', icon: '🤝', label: 'Referidos' },
        ],
    },
    {
        label: 'CUENTA',
        items: [
            { href: '/dashboard/billing', icon: '💳', label: 'Facturación' },
        ],
    },
];

export default function Sidebar() {
    const { user, organization, logout } = useAuth();
    const pathname = usePathname();

    const isActive = (href: string, exact = false) =>
        exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="logo">
                <span style={{ color: 'var(--brand-primary)', fontSize: '1.4rem' }}>⚡</span>
                <span>Full Login</span>
            </div>

            {/* Grouped navigation */}
            <nav style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0' }}>
                {NAV_GROUPS.map((group) => (
                    <div key={group.label} style={{ marginBottom: '0.25rem' }}>
                        <div style={{
                            padding: '0.6rem 1.5rem 0.3rem',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                        }}>
                            {group.label}
                        </div>
                        <div style={{ padding: '0 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {group.items.map((item) => {
                                const active = isActive(item.href, item.exact);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.65rem',
                                            padding: '0.6rem 0.85rem',
                                            borderRadius: 'var(--radius-sm)',
                                            textDecoration: 'none',
                                            fontSize: '0.875rem',
                                            fontWeight: active ? 600 : 500,
                                            color: active ? 'var(--brand-primary)' : 'var(--text-secondary)',
                                            background: active ? 'rgba(80, 205, 149, 0.1)' : 'transparent',
                                            borderLeft: active ? '2px solid var(--brand-primary)' : '2px solid transparent',
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        <span style={{ fontSize: '1rem', lineHeight: 1 }}>{item.icon}</span>
                                        <span>{item.label}</span>
                                        {active && (
                                            <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-primary)' }} />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User section */}
            <div className="user-section">
                <div className="user-avatar">
                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user?.name || user?.email}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {organization?.name}
                    </div>
                </div>
                <button
                    onClick={logout}
                    style={{ padding: '0.4rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '1rem', background: 'transparent', color: 'var(--text-muted)', transition: 'color 0.15s' }}
                    title="Cerrar sesión"
                >
                    🚪
                </button>
            </div>
        </aside>
    );
}
