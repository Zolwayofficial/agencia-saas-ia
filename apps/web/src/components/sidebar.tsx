'use client';

import { useAuth } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Icons } from './icons';

// iOS Settings-style icon colors per item
const NAV_GROUPS = [
    {
        label: 'Inteligencia',
        items: [
            { href: '/dashboard',            Icon: Icons.Home,     label: 'Centro de Control', exact: true, iconBg: '#34C759', iconColor: '#fff' },
            { href: '/dashboard/analytics',  Icon: Icons.Analytics,label: 'Vista Estratégica',             iconBg: '#007AFF', iconColor: '#fff' },
            { href: '/dashboard/agents',     Icon: Icons.Agents,   label: 'Agentes IA',                   iconBg: '#AF52DE', iconColor: '#fff' },
            { href: '/dashboard/knowledge',  Icon: Icons.AI,       label: 'Base de Conocimiento',         iconBg: '#FF9500', iconColor: '#fff' },
        ],
    },
    {
        label: 'Operaciones',
        items: [
            { href: '/dashboard/inbox',      Icon: Icons.Inbox,    label: 'Bandeja Omnicanal', iconBg: '#5AC8FA', iconColor: '#fff' },
            { href: '/dashboard/whatsapp',   Icon: Icons.WhatsApp, label: 'Nodos WhatsApp',    iconBg: '#25D366', iconColor: '#fff' },
        ],
    },
    {
        label: 'Crecimiento',
        items: [
            { href: '/dashboard/marketing',    Icon: Icons.Rocket,   label: 'Motor de Campañas',    iconBg: '#FF3B30', iconColor: '#fff' },
            { href: '/dashboard/integrations', Icon: Icons.Link,     label: 'Integraciones',        iconBg: '#FF9500', iconColor: '#fff' },
            { href: '/dashboard/referrals',    Icon: Icons.Referrals,label: 'Programa de Referidos',iconBg: '#5856D6', iconColor: '#fff' },
        ],
    },
];

export default function Sidebar() {
    const { user, organization, logout } = useAuth();
    const pathname = usePathname();

    const isActive = (href: string, exact = false) =>
        exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

    return (
        <aside
            style={{
                position:    'fixed',
                top:         0,
                left:        0,
                height:      '100vh',
                width:       'var(--sidebar-width)',
                display:     'flex',
                flexDirection: 'column',
                zIndex:      50,
                overflowX:   'hidden',
                // iOS frosted glass
                background:  'rgba(255, 255, 255, 0.82)',
                backdropFilter:       'blur(28px) saturate(180%)',
                WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                borderRight: '0.5px solid rgba(0, 0, 0, 0.10)',
            }}
        >
            {/* ── Brand ─────────────────────────────────────────── */}
            <div style={{ padding: '28px 20px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* App icon — rounded square like iOS */}
                <div style={{
                    width: 38, height: 38,
                    borderRadius: 10,
                    background: 'linear-gradient(145deg, #34c97b 0%, #1fa85e 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 3px 10px rgba(52,201,123,0.40)',
                    flexShrink: 0,
                }}>
                    <Icons.Credits width={20} height={20} style={{ color: '#fff' }} />
                </div>
                <span style={{
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    fontWeight: 700,
                    fontSize:   '1.125rem',
                    letterSpacing: '-0.022em',
                    color: '#1C1C1E',
                }}>
                    Full Login
                </span>
            </div>

            {/* ── Navigation ────────────────────────────────────── */}
            <nav style={{ flex: 1, overflowY: 'auto', padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 20 }}
                 className="custom-scrollbar">
                {NAV_GROUPS.map(group => (
                    <div key={group.label}>
                        {/* Section header */}
                        <div style={{
                            padding: '0 10px 6px',
                            fontFamily: '"Inter", -apple-system, system-ui, sans-serif',
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            letterSpacing: '0.07em',
                            textTransform: 'uppercase',
                            color: 'rgba(60,60,67,0.40)',
                        }}>
                            {group.label}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {group.items.map(item => {
                                const active = isActive(item.href, item.exact);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <div style={{
                                            display:     'flex',
                                            alignItems:  'center',
                                            gap:         12,
                                            padding:     '7px 10px',
                                            borderRadius: 12,
                                            background:  active ? 'rgba(52,201,123,0.12)' : 'transparent',
                                            cursor:      'pointer',
                                            transition:  'background 0.15s ease',
                                        }}
                                        onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.05)'; }}
                                        onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                                        >
                                            {/* iOS-style colored icon box */}
                                            <div style={{
                                                width:          34,
                                                height:         34,
                                                borderRadius:   9,
                                                background:     active ? item.iconBg : item.iconBg,
                                                color:          item.iconColor,
                                                display:        'flex',
                                                alignItems:     'center',
                                                justifyContent: 'center',
                                                flexShrink:     0,
                                                boxShadow:      active
                                                    ? `0 3px 8px ${item.iconBg}55`
                                                    : `0 1px 4px ${item.iconBg}40`,
                                                transition:     'box-shadow 0.15s ease',
                                            }}>
                                                <item.Icon size={17} />
                                            </div>

                                            {/* Label */}
                                            <span style={{
                                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                                                fontSize:   '0.9375rem',   /* 15pt — iOS body */
                                                fontWeight: active ? 600 : 400,
                                                color:      active ? '#1C1C1E' : '#3A3A3C',
                                                letterSpacing: '-0.01em',
                                                transition: 'font-weight 0.1s',
                                            }}>
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
            <div style={{ padding: '12px', marginTop: 'auto' }}>
                {/* Hairline separator */}
                <div style={{ height: '0.5px', background: 'rgba(60,60,67,0.15)', margin: '0 4px 12px' }} />

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 14,
                    background: 'rgba(116,116,128,0.07)',
                }}>
                    {/* Avatar */}
                    <div style={{
                        width: 36, height: 36,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: '1.5px solid rgba(0,0,0,0.08)',
                    }}>
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email ?? 'default'}`}
                            alt="Avatar"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>

                    {/* Name + Org */}
                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                        <div style={{
                            fontFamily: '"Inter", -apple-system, system-ui, sans-serif',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: '#1C1C1E',
                            letterSpacing: '-0.01em',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {user?.name ?? user?.email?.split('@')[0] ?? 'Admin'}
                        </div>
                        <div style={{
                            fontSize: '0.75rem',
                            fontWeight: 400,
                            color: 'rgba(60,60,67,0.50)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {organization?.name ?? 'Full Login'}
                        </div>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={logout}
                        title="Cerrar sesión"
                        style={{
                            flexShrink: 0,
                            width: 30, height: 30,
                            borderRadius: 8,
                            border: 'none',
                            background: 'transparent',
                            color: 'rgba(60,60,67,0.40)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'background 0.15s, color 0.15s',
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(255,59,48,0.10)';
                            (e.currentTarget as HTMLElement).style.color = '#FF3B30';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                            (e.currentTarget as HTMLElement).style.color = 'rgba(60,60,67,0.40)';
                        }}
                    >
                        <Icons.Logout size={15} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
