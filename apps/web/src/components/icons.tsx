import {
    Plus,
    MessageSquare,
    Smartphone,
    Home,
    Settings,
    User,
    BarChart3,
    CreditCard,
    Users,
    Zap,
    ShieldCheck,
    Rocket,
    ArrowRight,
    ArrowUp,
    TrendingUp,
    TrendingDown,
    History,
    Code,
    Copy,
    Share,
    UserPlus,
    CheckCircle2,
    AlertCircle,
    LayoutDashboard,
    LogOut,
    Mail,
    Search,
    MoreVertical,
    Link,
    QrCode,
    Building2,
    Cpu,
    Bot,
    Bell,
    ChevronRight,
    ExternalLink,
    Instagram,
    Facebook,
    Send,
    MessageCircle,
    Twitter,
    Download,
    Clock,
    Trash2,
    Lock
} from 'lucide-react';

interface CustomIconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
}

export const Icons = {
    // Navigation
    Home,
    Dashboard: LayoutDashboard,
    Inbox: MessageSquare,
    WhatsApp: Smartphone,
    Smartphone,
    Agents: Bot,
    Analytics: BarChart3,
    Billing: CreditCard,
    Referrals: Users,
    Settings,
    Profile: User,
    Logout: LogOut,

    // UI Actions
    Plus,
    Add: Plus,
    More: MoreVertical,
    Search,
    Link,
    QrCode,
    ArrowRight,
    ArrowUp,
    ChevronRight,
    Copy,
    Share,
    UserPlus,
    Bell,
    External: ExternalLink,
    Download,
    Clock,
    Trash: Trash2,
    Lock,

    // Status/Alerts
    Check: CheckCircle2,
    Alert: AlertCircle,
    Security: ShieldCheck,
    Success: Zap,
    History,
    Pending: History,

    // Business/Tech
    MRR: TrendingUp,
    TrendingUp,
    TrendingDown,
    Credits: Zap,
    API: Code,
    Enterprise: Building2,
    AI: Cpu,
    Cpu,
    Rocket,

    // Channels
    Mail,
    Instagram,
    Facebook,
    Telegram: Send,
    Discord: MessageCircle,
    Twitter,
    MessageSquare,

    // Brand Logos (Custom SVG)
    LogoWhatsApp: ({ size = 24, ...props }: CustomIconProps) => (
        <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} {...props}>
            <path d="M16.75 0C7.5 0 0 7.5 0 16.75c0 3.82 1.3 7.37 3.53 10.15l-3.32 10.74 11.02-3.12c2.68 1.46 5.76 2.27 8.95 2.27 9.25 0 16.75-7.5 16.75-16.75S25.99 0 16.75 0zm7.1 23.32l-.44-.22c-.67-.34-4.17-2.04-4.83-2.31-.56-.23-1.01-.34-1.45.34-.44.68-1.72 2.04-2.11 2.44-.39.34-.78.34-1.12.11-.34-.22-1.45-.56-2.75-1.7-.85-.79-1.43-1.7-1.66-2.04-.22-.34-.02-.53.15-.71.15-.15.34-.34.44-.56.11-.22.06-.39-.06-.56-.11-.22-.44-1.04-.63-1.45-.19-.39-.39-.34-.56-.34-.17 0-.39 0-.59.01-1.01.22-2.65.67-3.62 2.51-1.01 1.93-1.01 3.84-.22 4.07.79.23 2.04 3.16 4.9 4.31 2.86 1.14 3.73.85 4.4.85.34 0 .9-.06 1.25-.28.44-.22 1.29-1.07 1.48-1.78.19-.69.19-1.29.13-1.39-.06-.11-.22-.17-.44-.28z" />
        </svg>
    ),
    LogoMeta: ({ size = 24, ...props }: CustomIconProps) => (
        <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} {...props}>
            <path d="M16.48 3.34c2.51 0 4.54 2.03 4.54 4.54s-2.03 4.54-4.54 4.54-4.54-2.03-4.54-4.54 2.03-4.54 4.54-4.54m-8.96 0c2.51 0 4.54 2.03 4.54 4.54s-2.03 4.54-4.54 4.54-4.54-2.03-4.54-4.54 2.03-4.54 4.54-4.54M16.48 14.42c-1.33 0-2.58-.51-3.54-1.44-.96.93-2.21 1.44-3.54 1.44-4.11 0-7.46-3.35-7.46-7.46S5.29 0 9.4 0c1.33 0 2.58.51 3.54 1.44.96-.93 2.21-1.44 3.54-1.44 4.11 0 7.46 3.35 7.46 7.46s-3.35 7.46-7.46 7.46m-7.08 7.48c-1.08 0-2.08-.41-2.83-1.16-.75.75-1.75 1.16-2.83 1.16-3.29 0-5.97-2.68-5.97-5.97s2.68-5.97 5.97-5.97c1.08 0 2.08.41 2.83 1.16.75-.75 1.75-1.16 2.83-1.16 3.29 0 5.97 2.68 5.97 5.97s-2.68 5.97-5.97 5.97" />
        </svg>
    ),
    LogoX: ({ size = 16, ...props }: CustomIconProps) => (
        <svg viewBox="0 0 16 16" fill="currentColor" width={size} height={size} {...props}>
            <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
        </svg>
    )
};
