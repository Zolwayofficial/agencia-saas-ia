import Image from 'next/image';

interface BrandLogoProps {
    variant?: 'icon' | 'horizontal';
    className?: string;
    width?: number;
    height?: number;
    domain?: string;
}

export function BrandLogo({ variant = 'horizontal', className, width, height, domain }: BrandLogoProps) {
    const src = domain
        ? `https://logo.clearbit.com/${domain}`
        : (variant === 'icon' ? '/logo.png' : '/logo-horizontal.png');

    const defaultWidth = variant === 'icon' ? 48 : 150;
    const defaultHeight = variant === 'icon' ? 48 : 40;

    return (
        <div className={`relative flex items-center justify-center ${className}`} style={{ width: width || defaultWidth, height: height || defaultHeight }}>
            <img
                src={src}
                alt="Brand Logo"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    borderRadius: domain ? '8px' : '0'
                }}
                onError={(e) => {
                    // Fallback to default if clearbit fails
                    (e.target as HTMLImageElement).src = variant === 'icon' ? '/logo.png' : '/logo-horizontal.png';
                }}
            />
        </div>
    );
}
