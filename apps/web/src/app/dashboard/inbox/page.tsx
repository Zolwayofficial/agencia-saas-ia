'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Icons } from '@/components/icons';

const MESSAGING_CHANNELS = [
    { id: 'whatsapp',  name: 'WhatsApp',           desc: 'Evolution API · Cloud API',    icon: Icons.LogoWhatsApp,       color: '#25D366', href: '/dashboard/whatsapp' },
    { id: 'instagram', name: 'Instagram DM',        desc: 'Meta Business API',            icon: Icons.LogoInstagram,      color: '#E1306C', href: '#' },
    { id: 'facebook',  name: 'Facebook Messenger',  desc: 'Meta Business API',            icon: Icons.LogoFacebook,       color: '#1877F2', href: '#' },
    { id: 'telegram',  name: 'Telegram',             desc: 'Bot API',                      icon: Icons.LogoTelegram,       color: '#229ED9', href: '#' },
    { id: 'tiktok',    name: 'TikTok',               desc: 'Business Messaging',           icon: Icons.LogoTikTok,         color: '#010101', href: '#' },
    { id: 'email',     name: 'Email Omnicanal',      desc: 'SMTP / IMAP',                  icon: Icons.Mail,               color: '#EA4335', href: '#' },
    { id: 'twitter',   name: 'X / Twitter DM',       desc: 'Twitter API v2',               icon: Icons.LogoX,              color: '#000000', href: '#' },
    { id: 'sms',       name: 'SMS · Twilio',          desc: 'Twilio Messaging API',         icon: Icons.LogoTwilio,         color: '#F22F46', href: '#' },
    { id: 'line',      name: 'LINE',                  desc: 'LINE Messaging API',           icon: Icons.LogoLine,           color: '#06C755', href: '#' },
    { id: 'google',    name: 'Google Business',       desc: 'Business Messages API',        icon: Icons.LogoGoogle,         color: '#4285F4', href: '#' },
];

const TOOL_INTEGRATIONS = [
    { id: 'slack',  name: 'Slack',           desc: 'Notificaciones · Alertas',   icon: Icons.LogoSlack,          color: '#4A154B', href: '#' },
    { id: 'linear', name: 'Linear',          desc: 'Issue tracking · Tickets',   icon: Icons.LogoLinear,         color: '#5E6AD2', href: '#' },
    { id: 'notion', name: 'Notion',          desc: 'Base de conocimiento',       icon: Icons.LogoNotion,         color: '#000000', href: '#' },
    { id: 'shopify',name: 'Shopify',         desc: 'E-commerce · Pedidos',       icon: Icons.LogoShopify,        color: '#96BF48', href: '#' },
    { id: 'teams',  name: 'Microsoft Teams', desc: 'Colaboración · Tickets',     icon: Icons.LogoMicrosoftTeams, color: '#6264A7', href: '#' },
];

// ── Shared iOS primitives ─────────────────────────────────────

function IOSCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', ...style }}>
            {children}
        </div>
    );
}

function SectionHeader({ children, sub }: { children: React.ReactNode; sub?: string }) {
    return (
        <div style={{ marginBottom: 8, marginTop: 28, paddingLeft: 4 }}>
            <p style={{
                fontSize: 13, fontWeight: 600, letterSpacing: '0.05em',
                textTransform: 'uppercase', color: 'var(--text-secondary)',
                margin: 0,
            }}>
                {children}
            </p>
            {sub && <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0', opacity: 0.7 }}>{sub}</p>}
        </div>
    );
}

// ── Channel / Tool row ────────────────────────────────────────
function ChannelRow({
    item,
    status,
    details,
    last = false,
    actionLabel,
}: {
    item: typeof MESSAGING_CHANNELS[0];
    status: 'online' | 'offline';
    details?: string;
    last?: boolean;
    actionLabel?: string;
}) {
    const Icon = item.icon;
    const inner = (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            gap: 12,
            borderBottom: last ? 'none' : '1px solid rgba(60,60,67,0.1)',
            background: '#fff',
            transition: 'background 0.15s',
            cursor: item.href !== '#' ? 'pointer' : 'default',
        }}>
            {/* Icon box */}
            <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: `${item.color}1A`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, color: item.color,
            }}>
                <Icon size={20} />
            </div>

            {/* Labels */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 500, color: '#000', margin: 0 }}>
                    {item.name}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '1px 0 0' }}>
                    {details ?? item.desc}
                </p>
            </div>

            {/* Status / action */}
            {actionLabel ? (
                <span style={{
                    fontSize: 14, fontWeight: 500,
                    color: 'var(--brand-primary)',
                    background: 'rgba(52,201,123,0.1)',
                    padding: '5px 12px',
                    borderRadius: 8,
                    whiteSpace: 'nowrap',
                }}>
                    {actionLabel}
                </span>
            ) : (
                <span style={{
                    fontSize: 11, fontWeight: 600,
                    letterSpacing: '0.04em',
                    color: status === 'online' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', gap: 4,
                }}>
                    <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: status === 'online' ? 'var(--brand-primary)' : 'rgba(120,120,128,0.4)',
                        display: 'inline-block',
                    }} />
                    {status === 'online' ? 'Activo' : 'Inactivo'}
                </span>
            )}

            {/* Chevron */}
            {item.href !== '#' && (
                <svg width="8" height="13" viewBox="0 0 8 13" fill="none" style={{ flexShrink: 0, opacity: 0.25 }}>
                    <path d="M1 1l6 5.5L1 12" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            )}
        </div>
    );

    if (item.href !== '#') {
        return <Link href={item.href} style={{ textDecoration: 'none', display: 'block' }}>{inner}</Link>;
    }
    return inner;
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ label, value, badge, color }: {
    label: string; value: string; badge?: string; color?: string;
}) {
    return (
        <IOSCard style={{ padding: '16px 18px' }}>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', margin: '0 0 6px' }}>
                {label}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{
                    fontSize: 28, fontWeight: 700, letterSpacing: -0.5,
                    color: color ?? '#000', lineHeight: 1,
                }}>
                    {value}
                </span>
                {badge && (
                    <span style={{
                        fontSize: 12, fontWeight: 600,
                        color: 'var(--brand-primary)',
                        background: 'rgba(52,201,123,0.1)',
                        padding: '2px 6px', borderRadius: 6,
                    }}>
                        {badge}
                    </span>
                )}
            </div>
        </IOSCard>
    );
}

// ── Page ──────────────────────────────────────────────────────
export default function InboxPage() {
    const [instances, setInstances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getInstances()
            .then(data => setInstances(data.instances || []))
            .catch(() => setInstances([]))
            .finally(() => setLoading(false));
    }, []);

    const whatsappOnline = instances.length > 0;
    const activeCount = whatsappOnline ? 1 : 0;

    return (
        <div style={{ maxWidth: 860, margin: '0 auto' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <p style={{
                        fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
                        textTransform: 'uppercase', color: 'var(--brand-primary)', marginBottom: 6,
                    }}>
                        Comunicación
                    </p>
                    <h1 style={{
                        fontSize: 34, fontWeight: 700, letterSpacing: -0.5,
                        color: '#000', lineHeight: 1.15, margin: 0,
                    }}>
                        Bandeja Omnicanal
                    </h1>
                    <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 400 }}>
                        Terminal unificada para gestionar todas tus conversaciones.
                    </p>
                </div>
                <a
                    href="https://chat.fulllogin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                        padding: '10px 20px', borderRadius: 10, border: 'none',
                        background: 'var(--brand-primary)', color: '#fff',
                        fontSize: 15, fontWeight: 600, textDecoration: 'none',
                        cursor: 'pointer', fontFamily: 'inherit',
                        boxShadow: '0 2px 8px rgba(52,201,123,0.3)',
                    }}
                >
                    <Icons.External size={16} />
                    Abrir Chatwoot
                </a>
            </div>

            {/* ── Stats ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                <StatCard label="Volumen Mensual"     value="1,248" badge="+18.2%" />
                <StatCard label="Tiempo de Respuesta" value="14s"   badge="Promedio" />
                <StatCard label="Canales Activos"     value={`${activeCount} / ${MESSAGING_CHANNELS.length}`} />
                <StatCard label="Estado del Sistema"  value="Óptimo" color="var(--brand-primary)" />
            </div>

            {/* ── Sistema Activo banner ── */}
            <IOSCard style={{ marginTop: 20, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 11,
                    background: 'rgba(52,201,123,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--brand-primary)', flexShrink: 0,
                }}>
                    <Icons.Credits size={24} />
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#000', margin: 0 }}>Sistema Activo</p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '2px 0 0', lineHeight: 1.4 }}>
                        Tu cuenta tiene acceso completo a automatización, orquestación de agentes IA y analítica avanzada.
                    </p>
                </div>
                <button style={{
                    padding: '7px 14px', borderRadius: 8, border: '1.5px solid rgba(52,201,123,0.35)',
                    background: 'rgba(52,201,123,0.06)', color: 'var(--brand-primary)',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    whiteSpace: 'nowrap', outline: 'none',
                }}>
                    Ver Detalles
                </button>
            </IOSCard>

            {/* ── Canales de Comunicación ── */}
            <SectionHeader sub="Escáner de canales en tiempo real">Canales Desplegados</SectionHeader>
            <IOSCard>
                {MESSAGING_CHANNELS.map((ch, i) => (
                    <ChannelRow
                        key={ch.id}
                        item={ch}
                        status={ch.id === 'whatsapp' && whatsappOnline ? 'online' : 'offline'}
                        details={ch.id === 'whatsapp' && instances.length > 0
                            ? `${instances.length} nodo(s) activo(s)`
                            : undefined}
                        last={i === MESSAGING_CHANNELS.length - 1}
                    />
                ))}
            </IOSCard>

            {/* ── Integraciones ── */}
            <SectionHeader sub="CRM · Productividad · E-commerce">Integraciones de Herramientas</SectionHeader>
            <IOSCard>
                {TOOL_INTEGRATIONS.map((tool, i) => (
                    <ChannelRow
                        key={tool.id}
                        item={tool}
                        status="offline"
                        actionLabel="Conectar"
                        last={i === TOOL_INTEGRATIONS.length - 1}
                    />
                ))}
            </IOSCard>

            <div style={{ height: 32 }} />
        </div>
    );
}
