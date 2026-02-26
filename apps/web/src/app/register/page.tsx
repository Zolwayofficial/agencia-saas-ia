'use client';

import { Suspense, useState, FormEvent } from 'react';
import { useAuth } from '../../lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';

import { INDUSTRY_TEMPLATES, IndustryKey } from '../../lib/kpi-templates';

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.94.46 3.77 1.18 5.43l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

function RegisterContent() {
    const { register } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const refCode = searchParams.get('ref') || '';

    const [form, setForm] = useState({
        email: '',
        password: '',
        name: '',
        organizationName: '',
        referralCode: refCode,
    });
    const [industry, setIndustry] = useState<IndustryKey>('personalizado');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            localStorage.setItem('dashboard_industry', industry);
            const template = INDUSTRY_TEMPLATES.find((t) => t.key === industry);
            if (template) {
                localStorage.setItem('dashboard_kpis', JSON.stringify(template.defaultKpis));
            }

            await register(form);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Error al crear cuenta');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = () => {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId) {
            setError('Google Sign-In no configurado aun. Contacta soporte.');
            return;
        }
        const redirect = encodeURIComponent(window.location.origin + '/auth/google/callback');
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirect}&response_type=code&scope=openid%20email%20profile&prompt=select_account`;
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Crear Cuenta</h1>
                <p>Comienza gratis, upgradea cuando quieras</p>

                {error && <div className="error-msg">{error}</div>}

                <button
                    type="button"
                    onClick={handleGoogle}
                    className="btn"
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        background: 'transparent',
                        border: '1px solid var(--text-ghost, #40504E)',
                        color: 'var(--text-main, #D1DEDC)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        marginBottom: '1rem',
                    }}
                >
                    <GoogleIcon />
                    Registrarse con Google
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0 1.5rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--text-ghost, #40504E)' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #7A8F8D)' }}>o con correo</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--text-ghost, #40504E)' }} />
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="name">Tu nombre</label>
                        <input
                            id="name"
                            className="form-input"
                            type="text"
                            placeholder="Juan Perez"
                            value={form.name}
                            onChange={(e) => update('name', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="orgName">Nombre de tu agencia</label>
                        <input
                            id="orgName"
                            className="form-input"
                            type="text"
                            placeholder="Mi Agencia IA"
                            value={form.organizationName}
                            onChange={(e) => update('organizationName', e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Cual es tu industria?</label>
                        <div className="industry-grid">
                            {INDUSTRY_TEMPLATES.map((tmpl) => (
                                <button
                                    key={tmpl.key}
                                    type="button"
                                    className={`industry-option ${industry === tmpl.key ? 'active' : ''}`}
                                    onClick={() => setIndustry(tmpl.key)}
                                >
                                    <span className="industry-icon">{tmpl.icon}</span>
                                    <span className="industry-name">{tmpl.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="regEmail">Correo electronico</label>
                        <input
                            id="regEmail"
                            className="form-input"
                            type="email"
                            placeholder="tu@email.com"
                            value={form.email}
                            onChange={(e) => update('email', e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="regPass">Contrasena</label>
                        <input
                            id="regPass"
                            className="form-input"
                            type="password"
                            placeholder="Minimo 8 caracteres"
                            value={form.password}
                            onChange={(e) => update('password', e.target.value)}
                            required
                            minLength={8}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="refCode">Codigo de referido (opcional)</label>
                        <input
                            id="refCode"
                            className="form-input"
                            type="text"
                            placeholder="CODIGO-REF"
                            value={form.referralCode}
                            onChange={(e) => update('referralCode', e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '100%', marginTop: '0.5rem' }}
                    >
                        {loading ? 'Creando cuenta...' : 'Crear Cuenta Gratis'}
                    </button>
                </form>

                <p style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                    Ya tienes cuenta?{' '}
                    <a href="/login" style={{ color: 'var(--brand-primary-light)' }}>
                        Iniciar sesion
                    </a>
                </p>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="auth-container"><div className="auth-card"><p>Cargando...</p></div></div>}>
            <RegisterContent />
        </Suspense>
    );
}
