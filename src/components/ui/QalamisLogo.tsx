import React, { useId, memo } from 'react';

interface QalamisLogoProps {
    variant?: 'icon' | 'full';
    size?: 'sm' | 'md' | 'lg';
    showArabicSub?: boolean;
    className?: string;
}

const ICON_DIMENSIONS = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
} as const;

export const QalamisLogo: React.FC<QalamisLogoProps> = memo(function QalamisLogo({
    variant = 'full',
    size = 'md',
    showArabicSub = false,
    className = '',
}) {
    const uid = useId();
    const bgId = `${uid}-qalamis-bg`;
    const nibId = `${uid}-qalamis-nib`;
    const goldId = `${uid}-qalamis-gold`;

    const markSvg = (
        <svg
            width="256"
            height="256"
            viewBox="0 0 256 256"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${ICON_DIMENSIONS[size]} shrink-0 select-none`}
            aria-hidden={variant === 'full'}
            role={variant === 'icon' ? 'img' : undefined}
            aria-label={variant === 'icon' ? 'Logo Qalamis' : undefined}
        >
            <defs>
                <linearGradient id={bgId} x1="32" y1="20" x2="224" y2="236" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="55%" stopColor="#4F46E5" />
                    <stop offset="100%" stopColor="#3730A3" />
                </linearGradient>
                <linearGradient id={nibId} x1="100" y1="54" x2="168" y2="176" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#E0E7FF" />
                </linearGradient>
                <linearGradient id={goldId} x1="168" y1="48" x2="208" y2="88" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FDE047" />
                    <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
            </defs>

            <rect x="20" y="28" width="216" height="212" rx="56" fill="#312E81" />

            <rect x="20" y="16" width="216" height="212" rx="56" fill={`url(#${bgId})`} />

            <rect
                x="24"
                y="20"
                width="208"
                height="204"
                rx="52"
                stroke="#818CF8"
                strokeOpacity="0.45"
                strokeWidth="3"
            />

            <path
                d="M68 176C86 196 144 198 174 172"
                stroke="#10B981"
                strokeWidth="14"
                strokeLinecap="round"
            />
            <circle cx="68" cy="176" r="8" fill="#34D399" />

            <path
                d="M142 54L180 92L134 156L92 164L100 122L142 54Z"
                fill={`url(#${nibId})`}
            />
            <path
                d="M95 161L132 124"
                stroke="#4F46E5"
                strokeWidth="7"
                strokeLinecap="round"
            />
            <circle cx="136" cy="120" r="6.5" fill="#4F46E5" />

            <path
                d="M188 46L193 58L205 63L193 68L188 80L183 68L171 63L183 58L188 46Z"
                fill={`url(#${goldId})`}
            />
            <circle cx="163" cy="46" r="6" fill="#FBBF24" />
        </svg>
    );

    if (variant === 'icon') {
        return (
            <span className={`inline-flex items-center justify-center ${className}`}>
                {markSvg}
            </span>
        );
    }

    return (
        <div className={`inline-flex items-center gap-2.5 ${className}`}>
            {markSvg}
            <div className="leading-none">
                <div className="flex items-baseline gap-1.5">
                    <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                        Qalamis
                    </span>
                    {showArabicSub && (
                        <span
                            dir="rtl"
                            lang="ar"
                            className="font-arabic text-base sm:text-lg font-bold text-indigo-600"
                        >
                            قَلَمِيس
                        </span>
                    )}
                </div>
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mt-0.5">
                    Arabic Grammar Quest
                </span>
            </div>
        </div>
    );
});