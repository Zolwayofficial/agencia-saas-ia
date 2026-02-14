/**
 * Industry KPI Templates — v2
 * 8 industrias + 35 KPIs disponibles
 * Los usuarios pueden personalizar después.
 */

export interface KpiWidget {
    id: string;
    label: string;
    icon: string;
    description: string;
    type: 'number' | 'percentage' | 'currency' | 'chart';
    category: 'engagement' | 'revenue' | 'operations' | 'ai' | 'satisfaction';
}

export type IndustryKey =
    | 'restaurantes'
    | 'ecommerce'
    | 'agencias'
    | 'salud'
    | 'educacion'
    | 'inmobiliarias'
    | 'belleza'
    | 'personalizado';

export interface IndustryTemplate {
    key: IndustryKey;
    label: string;
    icon: string;
    description: string;
    defaultKpis: string[];
}

// ─── All Available KPIs (35) ─────────────────────────

export const ALL_KPIS: KpiWidget[] = [
    // ── Engagement ──
    { id: 'msgs_sent', label: 'Mensajes Enviados', icon: '📨', description: 'Total de mensajes enviados este mes', type: 'number', category: 'engagement' },
    { id: 'msgs_received', label: 'Mensajes Recibidos', icon: '📩', description: 'Total de mensajes recibidos', type: 'number', category: 'engagement' },
    { id: 'response_time', label: 'Tiempo de Respuesta', icon: '⏱️', description: 'Tiempo promedio de primera respuesta', type: 'number', category: 'engagement' },
    { id: 'active_conversations', label: 'Conversaciones Activas', icon: '💬', description: 'Conversaciones abiertas ahora mismo', type: 'number', category: 'engagement' },
    { id: 'msgs_per_channel', label: 'Mensajes por Canal', icon: '📊', description: 'Distribución: WhatsApp, Telegram, Instagram, etc.', type: 'chart', category: 'engagement' },
    { id: 'new_contacts', label: 'Contactos Nuevos', icon: '👤', description: 'Nuevos contactos captados este mes', type: 'number', category: 'engagement' },
    { id: 'recurrence_rate', label: 'Tasa de Recurrencia', icon: '🔄', description: '% de clientes que vuelven a escribir', type: 'percentage', category: 'engagement' },

    // ── Revenue ──
    { id: 'mrr', label: 'MRR', icon: '💰', description: 'Ingreso Mensual Recurrente total', type: 'currency', category: 'revenue' },
    { id: 'sales_via_chat', label: 'Ventas por Chat', icon: '🛍️', description: 'Ventas generadas desde conversaciones', type: 'currency', category: 'revenue' },
    { id: 'referral_commissions', label: 'Comisiones Referidos', icon: '🤝', description: 'Comisiones acumuladas del programa de referidos', type: 'currency', category: 'revenue' },
    { id: 'revenue_per_channel', label: 'Revenue por Canal', icon: '📈', description: 'Ingresos desglosados por canal de comunicación', type: 'chart', category: 'revenue' },
    { id: 'avg_ticket', label: 'Ticket Promedio', icon: '🎫', description: 'Valor promedio por transacción/venta', type: 'currency', category: 'revenue' },
    { id: 'ltv', label: 'Lifetime Value (LTV)', icon: '💎', description: 'Valor total de un cliente durante su vida', type: 'currency', category: 'revenue' },
    { id: 'cac', label: 'Costo de Adquisición', icon: '💸', description: 'Costo promedio de adquirir un cliente por chat', type: 'currency', category: 'revenue' },
    { id: 'churn_rate', label: 'Tasa de Churn', icon: '📉', description: '% de clientes/suscriptores que se van al mes', type: 'percentage', category: 'revenue' },

    // ── Operations ──
    { id: 'reservations', label: 'Reservas Confirmadas', icon: '📅', description: 'Reservas/citas automáticas confirmadas', type: 'number', category: 'operations' },
    { id: 'reservation_cancel_rate', label: 'Tasa de Cancelación', icon: '❌', description: '% de reservas canceladas o no-shows', type: 'percentage', category: 'operations' },
    { id: 'orders_whatsapp', label: 'Pedidos por WhatsApp', icon: '🍕', description: 'Pedidos recibidos vía WhatsApp', type: 'number', category: 'operations' },
    { id: 'carts_recovered', label: 'Carritos Recuperados', icon: '🛒', description: 'Carritos abandonados recuperados por el bot', type: 'number', category: 'operations' },
    { id: 'return_rate', label: 'Tasa de Devoluciones', icon: '📦', description: '% de productos devueltos', type: 'percentage', category: 'operations' },
    { id: 'top_product', label: 'Producto Más Pedido', icon: '⭐', description: 'Producto/servicio más solicitado', type: 'number', category: 'operations' },
    { id: 'active_clients', label: 'Clientes Activos', icon: '👥', description: 'Clientes con actividad este mes', type: 'number', category: 'operations' },
    { id: 'whatsapp_health', label: 'Salud WhatsApp', icon: '📱', description: 'Estado del semáforo de instancias WhatsApp', type: 'number', category: 'operations' },
    { id: 'leads_generated', label: 'Leads Generados', icon: '🎣', description: 'Prospectos captados desde conversaciones', type: 'number', category: 'operations' },
    { id: 'appointments_scheduled', label: 'Citas Agendadas', icon: '🗓️', description: 'Citas/visitas agendadas automáticamente', type: 'number', category: 'operations' },
    { id: 'reminders_sent', label: 'Recordatorios Enviados', icon: '🔔', description: 'Recordatorios automáticos enviados', type: 'number', category: 'operations' },
    { id: 'no_show_rate', label: 'Tasa de No-Show', icon: '👻', description: '% de citas donde el cliente no se presentó', type: 'percentage', category: 'operations' },
    { id: 'enrollments', label: 'Matriculaciones', icon: '🎓', description: 'Inscripciones/matriculaciones completadas', type: 'number', category: 'operations' },

    // ── AI ──
    { id: 'containment_rate', label: 'Tasa de Contención IA', icon: '🤖', description: '% de chats resueltos sin intervención humana', type: 'percentage', category: 'ai' },
    { id: 'agent_runs', label: 'Ejecuciones de Agentes', icon: '⚙️', description: 'Tareas IA ejecutadas este mes', type: 'number', category: 'ai' },
    { id: 'ai_success_rate', label: 'Tasa de Éxito IA', icon: '✅', description: '% de tareas IA completadas sin error', type: 'percentage', category: 'ai' },
    { id: 'conversion_rate', label: 'Tasa de Conversión', icon: '🎯', description: '% de conversaciones que terminan en acción/venta', type: 'percentage', category: 'ai' },

    // ── Satisfaction ──
    { id: 'sentiment', label: 'Sentimiento Promedio', icon: '😊', description: 'Análisis de sentimiento de conversaciones (-1 a +1)', type: 'percentage', category: 'satisfaction' },
    { id: 'csat', label: 'CSAT', icon: '⭐', description: 'Customer Satisfaction Score (1-5)', type: 'percentage', category: 'satisfaction' },
    { id: 'nps', label: 'NPS', icon: '📐', description: 'Net Promoter Score (-100 a +100)', type: 'number', category: 'satisfaction' },
    { id: 'reviews_avg', label: 'Rating Promedio', icon: '🌟', description: 'Calificación promedio en reseñas', type: 'number', category: 'satisfaction' },
];

// ─── Industry Templates (8) ──────────────────────────

export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
    {
        key: 'restaurantes',
        label: 'Restaurantes',
        icon: '🍕',
        description: 'Reservas, pedidos y menú por WhatsApp',
        defaultKpis: [
            'reservations', 'orders_whatsapp', 'response_time',
            'top_product', 'reservation_cancel_rate', 'containment_rate',
            'avg_ticket', 'sentiment',
        ],
    },
    {
        key: 'ecommerce',
        label: 'E-commerce',
        icon: '🛒',
        description: 'Carritos, ventas, conversión y retención',
        defaultKpis: [
            'carts_recovered', 'sales_via_chat', 'conversion_rate',
            'avg_ticket', 'return_rate', 'ltv',
            'revenue_per_channel', 'msgs_per_channel',
        ],
    },
    {
        key: 'agencias',
        label: 'Agencias',
        icon: '🏢',
        description: 'MRR, clientes, contención IA y referidos',
        defaultKpis: [
            'active_clients', 'mrr', 'churn_rate',
            'containment_rate', 'agent_runs', 'referral_commissions',
            'whatsapp_health', 'csat',
        ],
    },
    {
        key: 'salud',
        label: 'Salud / Clínicas',
        icon: '🏥',
        description: 'Citas, recordatorios, no-shows y satisfacción',
        defaultKpis: [
            'appointments_scheduled', 'reminders_sent', 'no_show_rate',
            'containment_rate', 'response_time', 'sentiment',
            'active_clients', 'csat',
        ],
    },
    {
        key: 'educacion',
        label: 'Educación',
        icon: '🎓',
        description: 'Matriculaciones, consultas y retención estudiantil',
        defaultKpis: [
            'enrollments', 'leads_generated', 'conversion_rate',
            'response_time', 'containment_rate', 'recurrence_rate',
            'msgs_per_channel', 'sentiment',
        ],
    },
    {
        key: 'inmobiliarias',
        label: 'Inmobiliarias',
        icon: '🏠',
        description: 'Leads, visitas agendadas y propiedades consultadas',
        defaultKpis: [
            'leads_generated', 'appointments_scheduled', 'conversion_rate',
            'response_time', 'active_conversations', 'top_product',
            'containment_rate', 'new_contacts',
        ],
    },
    {
        key: 'belleza',
        label: 'Belleza / Servicios',
        icon: '💇',
        description: 'Citas, recurrencia, reviews y fidelización',
        defaultKpis: [
            'appointments_scheduled', 'recurrence_rate', 'no_show_rate',
            'reminders_sent', 'reviews_avg', 'containment_rate',
            'response_time', 'new_contacts',
        ],
    },
    {
        key: 'personalizado',
        label: 'Otra Industria',
        icon: '⚡',
        description: 'Elige los KPIs que importan para tu negocio',
        defaultKpis: [
            'msgs_sent', 'response_time', 'containment_rate',
            'active_conversations', 'conversion_rate', 'sentiment',
        ],
    },
];

export function getKpiById(id: string): KpiWidget | undefined {
    return ALL_KPIS.find((k) => k.id === id);
}

export function getTemplateByKey(key: IndustryKey): IndustryTemplate {
    return INDUSTRY_TEMPLATES.find((t) => t.key === key) || INDUSTRY_TEMPLATES[7];
}
