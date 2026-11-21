// src/components/CustomSelect.tsx
import React, { useState, useRef, useEffect, useCallback, useId, memo } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
    value: string;
    label: string;
    badge?: string;
}

interface CustomSelectProps {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    ariaLabel: string;
    className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = memo(function CustomSelect({
    options,
    value,
    onChange,
    placeholder = 'Pilih opsi...',
    ariaLabel,
    className = '',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const listboxId = useId();

    const selectedOption = options.find((opt) => opt.value === value);
    const closeMenu = useCallback(() => setIsOpen(false), []);

    useEffect(() => {
        if (!isOpen) return;

        const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                closeMenu();
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeMenu();
                return;
            }

            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                const currentIndex = options.findIndex((opt) => opt.value === value);
                const step = event.key === 'ArrowDown' ? 1 : -1;
                const nextIndex = (currentIndex + step + options.length) % options.length;
                const nextOption = options[nextIndex];
                if (nextOption) {
                    onChange(nextOption.value);
                }
            }
        };

        document.addEventListener('mousedown', handleOutsideClick, { passive: true });
        document.addEventListener('touchstart', handleOutsideClick, { passive: true });
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('touchstart', handleOutsideClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, closeMenu, options, value, onChange]);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        closeMenu();
    };

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={listboxId}
                aria-label={ariaLabel}
                onClick={() => setIsOpen((prev) => !prev)}
                className="w-full min-h-11.5 px-4 py-2.5 bg-white border-2 border-slate-200 hover:border-emerald-400 focus:border-emerald-500 focus:outline-none rounded-2xl flex items-center justify-between gap-3 text-left transition-colors shadow-xs active:scale-[0.99]"
            >
                <span className="truncate text-sm font-bold text-slate-800">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                    {selectedOption?.badge && (
                        <span className="px-2 py-0.5 text-[11px] font-extrabold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {selectedOption.badge}
                        </span>
                    )}
                    <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600' : ''
                            }`}
                    />
                </div>
            </button>

            {isOpen && (
                <ul
                    id={listboxId}
                    role="listbox"
                    aria-label={ariaLabel}
                    className="absolute z-40 mt-2 w-full max-h-64 overflow-y-auto overscroll-contain bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5"
                >
                    {options.map((option) => {
                        const isSelected = option.value === value;
                        return (
                            <li
                                key={option.value}
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => handleSelect(option.value)}
                                className={`min-h-11 px-4 py-2.5 flex items-center justify-between gap-2 cursor-pointer transition-colors ${isSelected
                                        ? 'bg-emerald-50 text-emerald-800 font-extrabold'
                                        : 'text-slate-700 hover:bg-slate-50 font-semibold'
                                    }`}
                            >
                                <span className="text-sm truncate">{option.label}</span>
                                <div className="flex items-center gap-2 shrink-0">
                                    {option.badge && (
                                        <span
                                            className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${isSelected
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-slate-100 text-slate-600'
                                                }`}
                                        >
                                            {option.badge}
                                        </span>
                                    )}
                                    {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
});