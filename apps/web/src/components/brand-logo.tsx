import Image from 'next/image';

interface BrandLogoProps {
    variant?: 'icon' | 'horizontal';
    className?: string;
    width?: number;
    height?: number;
}

export function BrandLogo({ variant = 'horizontal', className, width, height }: BrandLogoProps) {
    const src = variant === 'icon' ? '/logo.png' : '/logo-horizontal.png';
    const defaultWidth = variant === 'icon' ? 48 : 150;
    const defaultHeight = variant === 'icon' ? 48 : 40;

    return (
        <Image
            src={src}
            alt="Full Login"
            width={width || defaultWidth}
            height={height || defaultHeight}
            className={className}
            priority
        />
    );
}
