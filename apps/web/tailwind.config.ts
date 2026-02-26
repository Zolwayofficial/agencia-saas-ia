// @ts-nocheck
// Tailwind v4: configuracion principal via CSS (globals.css)
// Este archivo se mantiene por compatibilidad con herramientas legacy
const config = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'brand-primary': 'var(--brand-primary)',
                'brand-primary-light': 'var(--brand-primary-light)',
                'brand-primary-dark': 'var(--brand-primary-dark)',
                header: 'var(--text-header)',
                muted: 'var(--text-muted)',
                ghost: 'var(--text-ghost)',
                success: 'hsl(var(--success))',
                warning: 'hsl(var(--warning))',
                danger: 'hsl(var(--danger))',
                info: 'hsl(var(--info))',
            },
            fontFamily: {
                display: ['Outfit', 'sans-serif'],
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
};

export default config;
