import React, { useState, useId } from 'react';
import { Sparkles, ArrowRight, Compass, Star, Heart } from 'lucide-react';
import type { StudentAvatar } from '../../hooks/useUserProgress';
import { ArabicText } from '../../components/ui/ArabicText';

interface OnboardingScreenProps {
    initialName?: string;
    initialAvatar?: StudentAvatar;
    onComplete: (name: string, avatar: StudentAvatar) => void;
}

const AVATAR_OPTIONS: ReadonlyArray<{
    id: StudentAvatar;
    emoji: string;
    label: string;
    arabicTitle: string;
    accentClass: string;
}> = [
        {
            id: 'boy',
            emoji: '👦',
            label: 'Petualang Putra',
            arabicTitle: 'طَالِبٌ (Mudzakkar)',
            accentClass: 'border-sky-500 bg-sky-50/90 text-sky-950 shadow-[0_3px_0_#0284c7]',
        },
        {
            id: 'girl',
            emoji: '👧',
            label: 'Petualang Putri',
            arabicTitle: 'طَالِبَةٌ (Muannats)',
            accentClass: 'border-rose-500 bg-rose-50/90 text-rose-950 shadow-[0_3px_0_#e11d48]',
        },
    ];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
    initialName = '',
    initialAvatar = 'boy',
    onComplete,
}) => {
    const [name, setName] = useState(initialName);
    const [avatar, setAvatar] = useState<StudentAvatar>(initialAvatar);
    const [error, setError] = useState('');
    const inputId = useId();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (trimmed.length < 2) {
            setError('Yuk tulis nama panggilanmu minimal 2 huruf dulu!');
            return;
        }
        setError('');
        onComplete(trimmed, avatar);
    };

    return (
        <div className="min-h-dvh flex flex-col justify-center px-4 py-8 sm:px-6">
            <div className="w-full max-w-md mx-auto animate-panel-enter">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-indigo-200 text-indigo-700 text-xs font-extrabold shadow-2xs mb-3">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>Petualangan Bahasa Arab Interaktif</span>
                    </div>

                    <ArabicText size="lg" as="h1" className="text-indigo-900 block mb-1">
                        أَهْلًا وَسَهْلًا فِي قَلَمِيس!
                    </ArabicText>
                    <p className="text-sm text-slate-700 font-medium">
                        Belajar merangkai kata dan kalimat bahasa Arab seru langkah demi langkah!
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="tactile-card p-5 sm:p-6 space-y-5" noValidate>
                    <div>
                        <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">
                            1. Pilih Karaktermu
                        </span>
                        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Pilih karakter">
                            {AVATAR_OPTIONS.map((item) => {
                                const isSelected = avatar === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        role="radio"
                                        aria-checked={isSelected}
                                        onClick={() => setAvatar(item.id)}
                                        className={`tactile-btn p-3.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${isSelected
                                                ? item.accentClass
                                                : 'border-slate-200 bg-white hover:border-sky-300 text-slate-700'
                                            }`}
                                    >
                                        <span className="text-3xl leading-none mb-1" aria-hidden="true">
                                            {item.emoji}
                                        </span>
                                        <span className="text-xs font-extrabold">{item.label}</span>
                                        <span dir="rtl" lang="ar" className="font-arabic text-base font-bold text-slate-700">
                                            {item.arabicTitle}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor={inputId}
                            className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2"
                        >
                            2. Siapa Nama Panggilanmu?
                        </label>
                        <input
                            id={inputId}
                            type="text"
                            value={name}
                            maxLength={32}
                            autoComplete="given-name"
                            placeholder="Contoh: Zayd, Salma, Adam"
                            onChange={(e) => {
                                setName(e.target.value);
                                if (error) setError('');
                            }}
                            aria-invalid={Boolean(error)}
                            aria-describedby={error ? `${inputId}-error` : undefined}
                            className="w-full min-h-12 px-4 py-3 rounded-2xl border-2 border-slate-200 bg-slate-50/80 focus:bg-white focus:border-indigo-500 focus:outline-none text-base font-extrabold text-slate-900 placeholder:text-slate-400 transition-colors"
                        />
                        {error && (
                            <p
                                id={`${inputId}-error`}
                                role="alert"
                                className="mt-1.5 text-xs font-bold text-rose-600"
                            >
                                {error}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-center">
                            <Compass className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                            <span className="block text-[11px] font-extrabold text-emerald-950">Peta Pos</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-center">
                            <Star className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                            <span className="block text-[11px] font-extrabold text-amber-950">Kumpul XP</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200/80 text-center">
                            <Heart className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                            <span className="block text-[11px] font-extrabold text-rose-950">3 Hati Kuis</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="tactile-btn w-full min-h-13 px-5 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-[0_4px_0_#3730a3] cursor-pointer"
                    >
                        <span>Mulai Petualangan</span>
                        <ArrowRight className="w-5 h-5 shrink-0" />
                    </button>
                </form>
            </div>
        </div>
    );
};