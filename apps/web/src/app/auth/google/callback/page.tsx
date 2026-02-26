'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.fulllogin.com/api/v1';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState('');

    useEffect(() => {
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');

        if (errorParam) {
            setError('Se cancelo el inicio de sesion con Google.');
            setTimeout(() => router.push('/login'), 3000);
            return;
        }

        if (!code) {
            setError('No se recibio codigo de autorizacion.');
            setTimeout(() => router.push('/login'), 3000);
            return;
        }

        const exchangeCode = async () => {
            try {
                const res = await fetch(`${API}/auth/google`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code,
                        redirectUri: window.location.origin + '/auth/google/callback',
                    }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || 'Error al autenticar con Google');
                }

                localStorage.setItem('auth_token', data.token);

                router.push('/dashboard');
            } catch (err: any) {
                setError(err.message || 'Error al autenticar con Google');
                setTimeout(() => router.push('/login'), 3000);
            }
        };

        exchangeCode();
    }, [searchParams, router]);

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ textAlign: 'center' }}>
                {error ? (
                    <>
                        <h2>Error</h2>
                        <p style={{ color: '#ef4444' }}>{error}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Redirigiendo al login...
                        </p>
                    </>
                ) : (
                    <>
                        <h2>Autenticando con Google...</h2>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            border: '3px solid var(--text-ghost, #40504E)',
                            borderTopColor: 'var(--brand-primary-light, #5abf8a)',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '2rem auto',
                        }} />
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Espera un momento...
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

export default function GoogleCallbackPage() {
    return (
        <Suspense fallback={
            <div className="auth-container">
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <p>Cargando...</p>
                </div>
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}
