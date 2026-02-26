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
    { id: 'msgs_sent', label: 'Mensajes Enviados', icon: 'MSG', description: 'Total de mensajes enviados este mes', type: 'number', category: 'engagement' },
    { id: 'msgs_received', label: 'Mensajes Recibidos', icon: 'IN', description: 'Total de mensajes recibidos', type: 'number', category: 'engagement' },
    { id: 'response_time', label: 'Tiempo de Respuesta', icon: 'CLK', description: 'Tiempo promedio de primera respuesta', type: 'number', category: 'engagement' },
    { id: 'active_conversations', label: 'Conversaciones Activas', icon: 'CHT', description: 'Conversaciones abiertas ahora mismo', type: 'number', category: 'engagement' },
    { id: 'msgs_per_channel', label: 'Mensajes por Canal', icon: 'BAR', description: 'Distribución: WhatsApp, Telegram, Instagram, etc.', type: 'chart', category: 'engagement' },
    { id: 'new_contacts', label: 'Contactos Nuevos', icon: 'USR', description: 'Nuevos contactos captados este mes', type: 'number', category: 'engagement' },
    { id: 'recurrence_rate', label: 'Tasa de Recurrencia', icon: 'RPT', description: '% de clientes que vuelven a escribir', type: 'percentage', category: 'engagement' },

    // ── Revenue ──
    { id: 'mrr', label: 'MRR', icon: 'MRR', description: 'Ingreso Mensual Recurrente total', type: 'currency', category: 'revenue' },
    { id: 'sales_via_chat', label: 'Ventas por Chat', icon: 'BAG', description: 'Ventas generadas desde conversaciones', type: 'currency', category: 'revenue' },
    { id: 'referral_commissions', label: 'Comisiones Referidos', icon: 'REF', description: 'Comisiones acumuladas del programa de referidos', type: 'currency', category: 'revenue' },
    { id: 'revenue_per_channel', label: 'Revenue por Canal', icon: 'UP', description: 'Ingresos desglosados por canal de comunicación', type: 'chart', category: 'revenue' },
    { id: 'avg_ticket', label: 'Ticket Promedio', icon: 'TKT', description: 'Valor promedio por transacción/venta', type: 'currency', category: 'revenue' },
    { id: 'ltv', label: 'Lifetime Value (LTV)', icon: 'GEM', description: 'Valor total de un cliente durante su vida', type: 'currency', category: 'revenue' },
    { id: 'cac', label: 'Costo de Adquisición', icon: 'PAY', description: 'Costo promedio de adquirir un cliente por chat', type: 'currency', category: 'revenue' },
    { id: 'churn_rate', label: 'Tasa de Churn', icon: 'DWN', description: '% de clientes/suscriptores que se van al mes', type: 'percentage', category: 'revenue' },

    // ── Operations ──
    { id: 'reservations', label: 'Reservas Confirmadas', icon: 'CAL', description: 'Reservas/citas automáticas confirmadas', type: 'number', category: 'operations' },
    { id: 'reservation_cancel_rate', label: 'Tasa de Cancelación', icon: 'X', description: '% de reservas canceladas o no-shows', type: 'percentage', category: 'operations' },
    { id: 'orders_whatsapp', label: 'Pedidos por WhatsApp', icon: 'ORD', description: 'Pedidos recibidos vía WhatsApp', type: 'number', category: 'operations' },
    { id: 'carts_recovered', label: 'Carritos Recuperados', icon: 'CRT', description: 'Carritos abandonados recuperados por el bot', type: 'number', category: 'operations' },
    { id: 'return_rate', label: 'Tasa de Devoluciones', icon: 'BOX', description: '% de productos devueltos', type: 'percentage', category: 'operations' },
    { id: 'top_product', label: 'Producto Más Pedido', icon: 'STR', description: 'Producto/servicio más solicitado', type: 'number', category: 'operations' },
    { id: 'active_clients', label: 'Clientes Activos', icon: 'GRP', description: 'Clientes con actividad este mes', type: 'number', category: 'operations' },
    { id: 'whatsapp_health', label: 'Salud WhatsApp', icon: 'PHN', description: 'Estado del semáforo de instancias WhatsApp', type: 'number', category: 'operations' },
    { id: 'leads_generated', label: 'Leads Generados', icon: 'LED', description: 'Prospectos captados desde conversaciones', type: 'number', category: 'operations' },
    { id: 'appointments_scheduled', label: 'Citas Agendadas', icon: 'APT', description: 'Citas/visitas agendadas automáticamente', type: 'number', category: 'operations' },
    { id: 'reminders_sent', label: 'Recordatorios Enviados', icon: 'BEL', description: 'Recordatorios automáticos enviados', type: 'number', category: 'operations' },
    { id: 'no_show_rate', label: 'Tasa de No-Show', icon: 'GHO', description: '% de citas donde el cliente no se presentó', type: 'percentage', category: 'operations' },
    { id: 'enrollments', label: 'Matriculaciones', icon: 'EDU', description: 'Inscripciones/matriculaciones completadas', type: 'number', category: 'operations' },

    // ── AI ──
    { id: 'containment_rate', label: 'Tasa de Contención IA', icon: 'BOT', description: '% de chats resueltos sin intervención humana', type: 'percentage', category: 'ai' },
    { id: 'agent_runs', label: 'Ejecuciones de Agentes', icon: 'GER', description: 'Tareas IA ejecutadas este mes', type: 'number', category: 'ai' },
    { id: 'ai_success_rate', label: 'Tasa de Éxito IA', icon: 'OK', description: '% de tareas IA completadas sin error', type: 'percentage', category: 'ai' },
    { id: 'conversion_rate', label: 'Tasa de Conversión', icon: 'TGT', description: '% de conversaciones que terminan en acción/venta', type: 'percentage', category: 'ai' },

    // ── Satisfaction ──
    { id: 'sentiment', label: 'Sentimiento Promedio', icon: 'SMI', description: 'Análisis de sentimiento de conversaciones (-1 a +1)', type: 'percentage', category: 'satisfaction' },
    { id: 'csat', label: 'CSAT', icon: 'STR', description: 'Customer Satisfaction Score (1-5)', type: 'percentage', category: 'satisfaction' },
    { id: 'nps', label: 'NPS', icon: 'NPS', description: 'Net Promoter Score (-100 a +100)', type: 'number', category: 'satisfaction' },
    { id: 'reviews_avg', label: 'Rating Promedio', icon: 'RAT', description: 'Calificación promedio en reseñas', type: 'number', category: 'satisfaction' },
];

// ─── Industry Templates (8) ──────────────────────────

export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
    {
        key: 'restaurantes',
        label: 'Restaurantes',
        icon: 'RST',
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
        icon: 'CRT',
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
        icon: 'BLD',
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
        icon: 'HSP',
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
        icon: 'EDU',
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
        icon: 'HMS',
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
        icon: 'CUT',
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
        icon: 'ZAP',
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
