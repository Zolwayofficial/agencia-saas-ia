'use client';

import { useAuth } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
    { href: '/dashboard', icon: '🏠', label: 'Inicio' },
    { href: '/dashboard/kpis', icon: '📊', label: 'KPIs' },
    { href: '/dashboard/whatsapp', icon: '📱', label: 'WhatsApp' },
    { href: '/dashboard/agents', icon: '🤖', label: 'Agentes IA' },
    { href: '/dashboard/referrals', icon: '🤝', label: 'Referidos' },
];

export default function Sidebar() {
    const { user, organization, logout } = useAuth();
    const pathname = usePathname();

    return (
        <aside className="sidebar">
            <div className="logo">🚀 Full Login</div>

            <nav>
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={pathname === item.href ? 'active' : ''}
                    >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="user-section">
                <div className="user-avatar">
                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user?.name || user?.email}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {organization?.name}
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="btn-ghost"
                    style={{ padding: '0.4rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                    title="Cerrar sesión"
                >
                    🚪
                </button>
            </div>
        </aside>
    );
}
