// src/components/ui/ZoneBadge.tsx
import React, { memo } from 'react';

interface ZoneBadgeProps {
    zoneId: string;
    label: string;
    className?: string;
}

const ZONE_STYLES: Record<string, string> = {
    'zone-1': 'bg-zone-1-soft text-zone-1 border-sky-200',
    'zone-2': 'bg-zone-2-soft text-zone-2 border-violet-200',
    'zone-3': 'bg-zone-3-soft text-zone-3 border-orange-200',
    'zone-4': 'bg-zone-4-soft text-zone-4 border-rose-200',
};

export const ZoneBadge: React.FC<ZoneBadgeProps> = memo(function ZoneBadge({
    zoneId,
    label,
    className = '',
}) {
    const style = ZONE_STYLES[zoneId] ?? 'bg-brand-soft text-brand border-brand-border';

    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold border shrink-0 whitespace-nowrap ${style} ${className}`}
        >
            {label}
        </span>
    );
});