import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';

export const metadata: Metadata = {
    title: 'Full Login — Agencia SaaS IA',
    description: 'Plataforma integral para gestión de agencias de IA y automatización.',
    icons: {
        icon: '/logo.png',
        apple: '/logo.png',
    },
    openGraph: {
        title: 'Full Login — Agencia SaaS IA',
        description: 'Plataforma integral para gestión de agencias de IA y automatización.',
        images: [{ url: '/logo-horizontal.png', width: 1200, height: 630, alt: 'Full Login Dashboard' }],
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
            <body>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
