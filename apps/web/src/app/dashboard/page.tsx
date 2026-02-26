'use client';

import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import Link from 'next/link';
import { Icons } from '@/components/icons';

// ── Data ──────────────────────────────────────────────────────────────────────
const MESSAGING_CHANNELS = [
    { id: 'whatsapp',  name: 'WhatsApp',          icon: Icons.LogoWhatsApp,       color: '#25D366', href: '/dashboard/whatsapp' },
    { id: 'instagram', name: 'Instagram DM',       icon: Icons.LogoInstagram,      color: '#E1306C', href: '/dashboard/inbox' },
    { id: 'facebook',  name: 'Facebook Messenger', icon: Icons.LogoFacebook,       color: '#1877F2', href: '/dashboard/inbox' },
    { id: 'telegram',  name: 'Telegram',           icon: Icons.LogoTelegram,       color: '#229ED9', href: '/dashboard/inbox' },
    { id: 'tiktok',    name: 'TikTok',             icon: Icons.LogoTikTok,         color: '#333333', href: '/dashboard/inbox' },
    { id: 'email',     name: 'Email Omnicanal',    icon: Icons.Mail,               color: '#EA4335', href: '/dashboard/inbox' },
    { id: 'twitter',   name: 'X / Twitter DM',     icon: Icons.LogoX,              color: '#111111', href: '/dashboard/inbox' },
    { id: 'sms',       name: 'SMS · Twilio',       icon: Icons.LogoTwilio,         color: '#F22F46', href: '/dashboard/inbox' },
    { id: 'line',      name: 'LINE',               icon: Icons.LogoLine,           color: '#06C755', href: '/dashboard/inbox' },
    { id: 'google',    name: 'Google Business',    icon: Icons.LogoGoogle,         color: '#4285F4', href: '/dashboard/inbox' },
];

const TOOL_INTEGRATIONS = [
    { id: 'slack',   name: 'Slack',           desc: 'Notificaciones',  icon: Icons.LogoSlack,          color: '#4A154B' },
    { id: 'linear',  name: 'Linear',          desc: 'Issue tracking',  icon: Icons.LogoLinear,         color: '#5E6AD2' },
    { id: 'notion',  name: 'Notion',          desc: 'Conocimiento',    icon: Icons.LogoNotion,         color: '#333333' },
    { id: 'shopify', name: 'Shopify',         desc: 'E-commerce',      icon: Icons.LogoShopify,        color: '#96BF48' },
    { id: 'teams',   name: 'Microsoft Teams', desc: 'Colaboración',    icon: Icons.LogoMicrosoftTeams, color: '#6264A7' },
];

const QUICK_ACTIONS = [
    { href: '/dashboard/inbox',        Icon: Icons.Inbox,    label: 'Bandeja Omnicanal', desc: 'Gestionar conversaciones',    iconBg: '#34C759', iconColor: '#fff' },
    { href: '/dashboard/marketing',    Icon: Icons.Rocket,   label: 'Motor de Campañas', desc: 'Crear nueva automatización',  iconBg: '#007AFF', iconColor: '#fff' },
    { href: '/dashboard/whatsapp',     Icon: Icons.WhatsApp, label: 'Nodos WhatsApp',    desc: 'Escanear y gestionar',        iconBg: '#25D366', iconColor: '#fff' },
    { href: '/dashboard/integrations', Icon: Icons.Link,     label: 'Integraciones',     desc: 'Sincronizar aplicaciones',    iconBg: '#FF9500', iconColor: '#fff' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const card: React.CSSProperties = {
    background:   '#FFFFFF',
    borderRadius: 20,
    boxShadow:    '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
    overflow:     'hidden',
};

const label11: React.CSSProperties = {
    fontFamily:    '"Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    fontSize:      '0.6875rem',
    fontWeight:    600,
    letterSpacing: '0.07em',
    textTransform: 'uppercase' as const,
    color:         'rgba(60,60,67,0.50)',
};

const body15: React.CSSProperties = {
    fontFamily:    '"Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    fontSize:      '0.9375rem',
    fontWeight:    400,
    color:         '#3A3A3C',
    letterSpacing: '-0.01em',
};

// ── Sub-components ────────────────────────────────────────────────────────────
function ChannelRow({ ch, status, label }: {
    ch:     typeof MESSAGING_CHANNELS[0];
    status: 'connected' | 'setup';
    label?: string;
}) {
    const Icon = ch.icon;
    return (
        <Link href={ch.href} style={{ textDecoration: 'none' }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 16px',
                cursor: 'pointer',
                transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.03)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
                {/* Icon */}
                <div style={{
                    width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                    background: `${ch.color}18`, color: ch.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon size={18} />
                </div>
                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ ...body15, fontWeight: 500, color: '#1C1C1E', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ch.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                        <div style={{
                            width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                            background: status === 'connected' ? '#34C759' : '#C7C7CC',
                            boxShadow: status === 'connected' ? '0 0 4px #34C759' : 'none',
                        }} />
                        <span style={{ fontSize: '0.75rem', color: status === 'connected' ? '#34C759' : 'rgba(60,60,67,0.45)', fontWeight: 500 }}>
                            {label ?? (status === 'connected' ? 'Activo' : 'Inactivo')}
                        </span>
                    </div>
                </div>
                {/* Chevron */}
                <Icons.ArrowRight size={14} style={{ color: 'rgba(60,60,67,0.25)', flexShrink: 0 }} />
            </div>
        </Link>
    );
}

function ToolRow({ tool }: { tool: typeof TOOL_INTEGRATIONS[0] }) {
    const Icon = tool.icon;
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 16px',
            cursor: 'pointer',
            transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.03)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
        >
            <div style={{
                width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                background: `${tool.color}18`, color: tool.color === '#333333' ? '#555' : tool.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Icon size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...body15, fontWeight: 500, color: '#1C1C1E', fontSize: '0.875rem' }}>{tool.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(60,60,67,0.45)', fontWeight: 400 }}>{tool.desc}</div>
            </div>
            <div style={{
                padding: '3px 8px', borderRadius: 20,
                background: 'rgba(0,122,255,0.10)', color: '#007AFF',
                fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.02em',
                flexShrink: 0,
            }}>
                Conectar
            </div>
        </div>
    );
}

function Separator() {
    return <div style={{ height: '0.5px', background: 'rgba(60,60,67,0.10)', margin: '0 16px' }} />;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const { user, organization } = useAuth();
    const [balance, setBalance]     = useState<any>(null);
    const [history, setHistory]     = useState<any[]>([]);
    const [instances, setInstances] = useState<any[]>([]);
    const [loading, setLoading]     = useState(true);

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

    const msgPercent       = balance?.usage ? Math.min(100, (balance.usage.messagesUsed / balance.usage.messagesLimit) * 100) : 0;
    const whatsappConnected = instances.length > 0;

    if (loading) {
        return (
            <div className="animate-pulse" style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
                <div style={{ height: 40, width: 220, background: '#f0f0f0', borderRadius: 12, marginBottom: 32 }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
                    {[1,2,3,4].map(i => <div key={i} style={{ height: 100, background: '#f0f0f0', borderRadius: 20 }} />)}
                </div>
            </div>
        );
    }

    return (
        <div
            className="animate-in"
            style={{
                maxWidth: 1100,
                margin: '0 auto',
                padding: '1.75rem 2rem',
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
            }}
        >
            {/* ── Header ─────────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <div style={{ marginBottom: 6 }}>
                        <span style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: 'rgba(52,201,123,0.10)',
                            color: '#25a562',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            letterSpacing: '0.07em',
                            textTransform: 'uppercase',
                        }}>
                            Centro Operativo
                        </span>
                    </div>
                    <h1 style={{
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                        fontSize: '2rem',
                        fontWeight: 700,
                        letterSpacing: '-0.03em',
                        color: '#1C1C1E',
                        lineHeight: 1.1,
                        margin: 0,
                    }}>
                        Centro de Control
                    </h1>
                    <p style={{ ...body15, fontSize: '0.875rem', color: 'rgba(60,60,67,0.55)', marginTop: 4 }}>
                        {organization?.name ?? 'Full Login'} — Estrategia Activa
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ ...label11, marginBottom: 2 }}>Plan Actual</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1C1C1E' }}>
                            {balance?.plan?.name ?? 'Pro (Trial)'}
                        </div>
                    </div>
                    <Link href="/dashboard/billing" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '9px 18px',
                        borderRadius: 12,
                        background: '#34c97b',
                        color: '#fff',
                        fontFamily: '"Inter", -apple-system, system-ui, sans-serif',
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        letterSpacing: '-0.01em',
                        textDecoration: 'none',
                        boxShadow: '0 2px 8px rgba(52,201,123,0.35)',
                        whiteSpace: 'nowrap',
                    }}>
                        <Icons.Billing size={15} />
                        Mejorar Plan
                    </Link>
                </div>
            </div>

            {/* ── KPI Cards ──────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                {/* Ingresos */}
                <div style={{ ...card, padding: '18px 20px' }}>
                    <div style={{ ...label11, marginBottom: 10 }}>Ingresos Mensuales</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.04em', color: '#1C1C1E', lineHeight: 1 }}>
                            ${(balance?.mrr ?? 0).toLocaleString()}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34C759', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Icons.ArrowUp size={10} />12.4%
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34C759' }} />
                        <span style={{ ...label11, fontSize: '0.625rem' }}>Proyección activa</span>
                    </div>
                </div>

                {/* Mensajes */}
                <div style={{ ...card, padding: '18px 20px' }}>
                    <div style={{ ...label11, marginBottom: 10 }}>Volumen de Mensajes</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.04em', color: '#1C1C1E', lineHeight: 1 }}>
                            {(balance?.usage?.messagesUsed ?? 0).toLocaleString()}
                        </span>
                        <span style={{ fontSize: '0.8125rem', color: 'rgba(60,60,67,0.45)', fontWeight: 400 }}>
                            / {balance?.usage?.messagesLimit ?? '10000'}
                        </span>
                    </div>
                    <div style={{ marginTop: 12, height: 4, background: 'rgba(0,0,0,0.07)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${msgPercent}%`, background: '#34c97b', borderRadius: 4, transition: 'width 1s ease' }} />
                    </div>
                    <div style={{ ...label11, fontSize: '0.625rem', marginTop: 6 }}>
                        Volumen: {Math.round(msgPercent)}% · Escalado auto
                    </div>
                </div>

                {/* IA */}
                <div style={{ ...card, padding: '18px 20px' }}>
                    <div style={{ ...label11, marginBottom: 10 }}>Resolución IA</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.04em', color: '#1C1C1E', lineHeight: 1 }}>84.2%</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34C759', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Icons.ArrowUp size={10} />2.1%
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10 }}>
                        <Icons.AI size={12} style={{ color: '#AF52DE' }} />
                        <span style={{ ...label11, fontSize: '0.625rem' }}>Eficiencia autónoma</span>
                    </div>
                </div>

                {/* Referidos */}
                <div style={{ ...card, padding: '18px 20px' }}>
                    <div style={{ ...label11, marginBottom: 10 }}>Comisiones Referidos</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.04em', color: '#1C1C1E', lineHeight: 1 }}>
                            ${(balance?.commissions ?? 0).toFixed(2)}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10 }}>
                        <Icons.Referrals size={12} style={{ color: '#FF9500' }} />
                        <span style={{ ...label11, fontSize: '0.625rem' }}>Nivel único 20% activo</span>
                    </div>
                </div>
            </div>

            {/* ── Main Grid ──────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>

                {/* Acciones Rápidas */}
                <div style={card}>
                    <div style={{ padding: '16px 16px 10px', ...label11 }}>Acciones Rápidas</div>
                    {QUICK_ACTIONS.map((action, i) => (
                        <div key={action.href}>
                            <Link href={action.href} style={{ textDecoration: 'none' }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '11px 16px',
                                    cursor: 'pointer',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.03)'}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                                >
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                                        background: action.iconBg, color: action.iconColor,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: `0 2px 6px ${action.iconBg}55`,
                                    }}>
                                        <action.Icon size={17} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ ...body15, fontWeight: 500, color: '#1C1C1E', fontSize: '0.875rem' }}>{action.label}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'rgba(60,60,67,0.45)', marginTop: 1 }}>{action.desc}</div>
                                    </div>
                                    <Icons.ArrowRight size={14} style={{ color: 'rgba(60,60,67,0.25)', flexShrink: 0 }} />
                                </div>
                            </Link>
                            {i < QUICK_ACTIONS.length - 1 && <Separator />}
                        </div>
                    ))}
                </div>

                {/* Channels + Tools */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                    {/* Canales */}
                    <div style={card}>
                        <div style={{ padding: '16px 16px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={label11}>Canales de Comunicación</span>
                            <Link href="/dashboard/inbox" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#34c97b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                                Ver todos <Icons.External size={11} />
                            </Link>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                            {MESSAGING_CHANNELS.map((ch, i) => (
                                <div key={ch.id}>
                                    <ChannelRow
                                        ch={ch}
                                        status={ch.id === 'whatsapp' && whatsappConnected ? 'connected' : 'setup'}
                                        label={ch.id === 'whatsapp' ? `${instances.length} nodo(s) activo(s)` : undefined}
                                    />
                                    {/* Separator only between rows, not after last */}
                                    {i % 2 === 0 && i < MESSAGING_CHANNELS.length - 1 && (
                                        <div style={{ height: '0.5px', background: 'rgba(60,60,67,0.08)', margin: '0 16px' }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Herramientas */}
                    <div style={card}>
                        <div style={{ padding: '16px 16px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={label11}>Herramientas</span>
                            <Link href="/dashboard/integrations" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#34c97b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                                Ver todos <Icons.External size={11} />
                            </Link>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                            {TOOL_INTEGRATIONS.map((tool, i) => (
                                <div key={tool.id}>
                                    <ToolRow tool={tool} />
                                    {i % 2 === 0 && i < TOOL_INTEGRATIONS.length - 1 && (
                                        <div style={{ height: '0.5px', background: 'rgba(60,60,67,0.08)', margin: '0 16px' }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* ── Activity Feed ───────────────────────────────── */}
            <div style={card}>
                <div style={{ padding: '16px 16px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={label11}>Actividad Reciente</span>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(60,60,67,0.40)', marginTop: 2 }}>Registro de transacciones</div>
                    </div>
                    <Link href="/dashboard/billing" style={{
                        padding: '6px 14px', borderRadius: 10,
                        background: 'rgba(0,0,0,0.05)', color: '#1C1C1E',
                        fontSize: '0.8125rem', fontWeight: 600,
                        textDecoration: 'none',
                    }}>
                        Ver historial
                    </Link>
                </div>

                {history.length === 0 ? (
                    <div style={{ padding: '48px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icons.Inbox size={22} style={{ color: 'rgba(60,60,67,0.25)' }} />
                        </div>
                        <span style={{ fontSize: '0.875rem', color: 'rgba(60,60,67,0.35)', fontWeight: 500 }}>
                            No hay movimientos registrados
                        </span>
                    </div>
                ) : (
                    <div>
                        {history.map((tx, i) => (
                            <div key={tx.id}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 14,
                                    padding: '12px 16px',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.02)'}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                                >
                                    <div style={{
                                        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                                        background: tx.type === 'COMMISSION' ? 'rgba(255,149,0,0.12)' : 'rgba(0,122,255,0.10)',
                                        color: tx.type === 'COMMISSION' ? '#FF9500' : '#007AFF',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.6875rem', fontWeight: 700,
                                    }}>
                                        {tx.type === 'COMMISSION' ? '₿' : '→'}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1C1C1E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {tx.description}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'rgba(60,60,67,0.45)', marginTop: 2 }}>
                                            {new Date(tx.createdAt).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <div style={{
                                        fontSize: '0.9375rem', fontWeight: 700,
                                        color: tx.amount >= 0 ? '#34C759' : '#FF3B30',
                                        letterSpacing: '-0.02em', flexShrink: 0,
                                    }}>
                                        {tx.amount >= 0 ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                                    </div>
                                </div>
                                {i < history.length - 1 && <Separator />}
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
