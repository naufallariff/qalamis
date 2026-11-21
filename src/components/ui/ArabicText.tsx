import React, { memo } from 'react';

interface ArabicTextProps {
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    as?: 'span' | 'p' | 'div' | 'h1' | 'h2' | 'h3';
}

const SIZE_CLASSES: Record<NonNullable<ArabicTextProps['size']>, string> = {
    sm: 'text-xl sm:text-2xl',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-3xl sm:text-4xl',
    xl: 'text-4xl sm:text-5xl',
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
            className={`font-arabic font-bold text-slate-900 select-text ${SIZE_CLASSES[size]} ${className}`}
        >
            {children}
        </Component>
    );
});