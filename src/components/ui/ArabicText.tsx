import React, { memo } from 'react';

interface ArabicTextProps {
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    as?: 'span' | 'p' | 'div' | 'h1' | 'h2' | 'h3';
}

const SIZE_CLASSES: Record<NonNullable<ArabicTextProps['size']>, string> = {
    sm: 'text-xl sm:text-2xl leading-[2.1]',
    md: 'text-2xl sm:text-3xl leading-[2.15]',
    lg: 'text-3xl sm:text-4xl leading-[2.2]',
    xl: 'text-4xl sm:text-5xl leading-[2.2]',
};

export const ArabicText: React.FC<ArabicTextProps> = memo(function ArabicText({
    children,
    size = 'md',
    className = '',
    as: Component = 'span',
}) {
    return (
        <Component
            dir="rtl"
            lang="ar"
            className={`font-arabic font-bold text-slate-900 select-text py-0.5 ${SIZE_CLASSES[size]} ${className}`}
        >
            {children}
        </Component>
    );
});