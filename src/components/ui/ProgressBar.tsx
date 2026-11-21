// src/components/ui/ProgressBar.tsx
import React, { memo } from 'react';

interface ProgressBarProps {
    current: number;
    total: number;
    label: string;
    colorClass?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = memo(function ProgressBar({
    current,
    total,
    label,
    colorClass = 'bg-brand',
}) {
    const safeTotal = Math.max(1, total);
    const ratio = Math.min(1, Math.max(0, current / safeTotal));

    return (
        <div
            role="progressbar"
            aria-label={label}
            aria-valuenow={Math.round(ratio * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden p-0.5"
        >
            <div
                className={`h-full w-full rounded-full origin-left transition-transform duration-300 ease-out-snappy ${colorClass}`}
                style={{ transform: `scaleX(${ratio})` }}
            />
        </div>
    );
});