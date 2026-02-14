/**
 * API Client — Comunicación con el backend
 * Maneja JWT automáticamente en cada petición.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        // Token expirado o inválido
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        throw new Error('Sesión expirada');
    }

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || data.error || 'Error en la petición');
    }

    return data as T;
}

export const api = {
    // Generic methods
    get: <T = any>(path: string) => request<T>(path),
    post: <T = any>(path: string, data: any) =>
        request<T>(path, { method: 'POST', body: JSON.stringify(data) }),
    delete: <T = any>(path: string) =>
        request<T>(path, { method: 'DELETE' }),

    // Auth
    login: (email: string, password: string) =>
        request<any>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    register: (data: { email: string; password: string; name?: string; organizationName: string; referralCode?: string }) =>
        request<any>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    me: () => request<any>('/auth/me'),

    // Billing
    getBalance: () => request<any>('/billing/balance'),
    getHistory: (limit = 50) => request<any>(`/billing/history?limit=${limit}`),

    // Agents
    runAgent: (data: { model: string; maxSteps?: number; timeout?: number }) =>
        request<any>('/agents/run', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    getTasks: (limit = 20) => request<any>(`/agents/tasks?limit=${limit}`),
    getTask: (id: string) => request<any>(`/agents/tasks/${id}`),

    // Referrals
    getMyCode: () => request<any>('/referrals/my-code'),
    getNetwork: () => request<any>('/referrals/network'),

    // WhatsApp
    getInstances: () => request<any>('/whatsapp/instances'),
};
