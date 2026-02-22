'use client';

import { useAuth } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

// Professional SVG Icons (Lucide-like)
const Icons = {
    Home: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
    ),
    MessageSquare: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
    ),
    Smartphone: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
    ),
    BarChart: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" /></svg>
    ),
    Bot: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>
    ),
    Target: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
    ),
    Rocket: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3" /><path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5" /></svg>
    ),
    Link: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
    ),
    Users: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    ),
    CreditCard: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
    ),
    LogOut: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
    ),
    Zap: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#50CD95" stroke="#50CD95" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
    ),
};

const NAV_GROUPS = [
    {
        label: 'COMUNICACIÓN',
        items: [
            { href: '/dashboard', Icon: Icons.Home, label: 'Inicio', exact: true },
            { href: '/dashboard/inbox', Icon: Icons.MessageSquare, label: 'Inbox Multicanal' },
            { href: '/dashboard/whatsapp', Icon: Icons.Smartphone, label: 'WhatsApp' },
        ],
    },
    {
        label: 'INTELIGENCIA',
        items: [
            { href: '/dashboard/analytics', Icon: Icons.BarChart, label: 'Analytics' },
            { href: '/dashboard/agents', Icon: Icons.Bot, label: 'Agentes IA' },
            { href: '/dashboard/kpis', Icon: Icons.Target, label: 'KPIs & Métricas' },
        ],
    },
    {
        label: 'CRECIMIENTO',
        items: [
            { href: '/dashboard/marketing', Icon: Icons.Rocket, label: 'Marketing' },
            { href: '/dashboard/integrations', Icon: Icons.Link, label: 'Integraciones' },
            { href: '/dashboard/referrals', Icon: Icons.Users, label: 'Referidos' },
        ],
    },
    {
        label: 'CUENTA',
        items: [
            { href: '/dashboard/billing', Icon: Icons.CreditCard, label: 'Facturación' },
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
            <div className="logo" style={{ cursor: 'default' }}>
                <Icons.Zap />
                <span style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>Full Login</span>
            </div>

            {/* Grouped navigation */}
            <nav style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0' }}>
                {NAV_GROUPS.map((group) => (
                    <div key={group.label} style={{ marginBottom: '1.25rem' }}>
                        <div style={{
                            padding: '0 1.5rem 0.5rem',
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            letterSpacing: '0.12em',
                            color: 'rgba(255,255,255,0.3)',
                            textTransform: 'uppercase',
                        }}>
                            {group.label}
                        </div>
                        <div style={{ padding: '0 0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {group.items.map((item) => {
                                const active = isActive(item.href, item.exact);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.65rem 0.85rem',
                                            borderRadius: '8px',
                                            textDecoration: 'none',
                                            fontSize: '0.875rem',
                                            fontWeight: active ? 600 : 500,
                                            color: active ? 'var(--brand-primary)' : 'rgba(255,255,255,0.6)',
                                            background: active ? 'rgba(80, 205, 149, 0.08)' : 'transparent',
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                            border: active ? '1px solid rgba(80, 205, 149, 0.15)' : '1px solid transparent',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!active) {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                                e.currentTarget.style.color = 'var(--text-primary)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!active) {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                                            }
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20 }}>
                                            <item.Icon />
                                        </div>
                                        <span>{item.label}</span>
                                        {active && (
                                            <div style={{
                                                marginLeft: 'auto',
                                                width: 5, height: 5,
                                                borderRadius: '50%',
                                                background: 'var(--brand-primary)',
                                                boxShadow: '0 0 8px var(--brand-primary)'
                                            }} />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User section */}
            <div className="user-section" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', paddingBottom: '1rem' }}>
                <div className="user-avatar" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                        {user?.name || user?.email}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {organization?.name}
                    </div>
                </div>
                <button
                    onClick={logout}
                    style={{
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid transparent',
                        cursor: 'pointer',
                        background: 'transparent',
                        color: 'rgba(255,255,255,0.4)',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ef4444';
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                    }}
                    title="Cerrar sesión"
                >
                    <Icons.LogOut />
                </button>
            </div>
        </aside>
    );
}
