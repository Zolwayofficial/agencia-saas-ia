'use client';

import { Suspense, useState, FormEvent } from 'react';
import { useAuth } from '../../lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';

import { INDUSTRY_TEMPLATES, IndustryKey } from '../../lib/kpi-templates';

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
            // Save industry selection for KPI dashboard
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

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>🚀 Crear Cuenta</h1>
                <p>Comienza gratis, upgradea cuando quieras</p>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="name">Tu nombre</label>
                        <input
                            id="name"
                            className="form-input"
                            type="text"
                            placeholder="Juan Pérez"
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

                    {/* Industry Selector */}
                    <div className="form-group">
                        <label className="form-label">¿Cuál es tu industria?</label>
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
                        <label className="form-label" htmlFor="regEmail">Correo electrónico</label>
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
                        <label className="form-label" htmlFor="regPass">Contraseña</label>
                        <input
                            id="regPass"
                            className="form-input"
                            type="password"
                            placeholder="Mínimo 8 caracteres"
                            value={form.password}
                            onChange={(e) => update('password', e.target.value)}
                            required
                            minLength={8}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="refCode">Código de referido (opcional)</label>
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

                <p style={{ marginTop: '1.5rem', fontSize: '0.85rem' }}>
                    ¿Ya tienes cuenta?{' '}
                    <a href="/login" style={{ color: 'var(--brand-primary-light)' }}>
                        Iniciar sesión
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
