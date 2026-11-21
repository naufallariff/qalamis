import React, { useState, useId } from 'react';
import { Sparkles, ArrowRight, BookOpen, Trophy, Compass } from 'lucide-react';
import type { StudentAvatar } from '../../hooks/useUserProgress';
import { ArabicText } from '../../components/ui/ArabicText';

interface OnboardingScreenProps {
    onComplete: (name: string, avatar: StudentAvatar) => void;
}

const AVATAR_OPTIONS: ReadonlyArray<{
    id: StudentAvatar;
    label: string;
    roleTitle: string;
    accentClass: string;
}> = [
        {
            id: 'boy',
            label: 'Explorer (Male)',
            roleTitle: 'طَالِبٌ (Ṭālibun)',
            accentClass: 'border-sky-400 bg-sky-50/80 text-sky-900',
        },
        {
            id: 'girl',
            label: 'Explorer (Female)',
            roleTitle: 'طَالِبَةٌ (Ṭālibatun)',
            accentClass: 'border-rose-400 bg-rose-50/80 text-rose-900',
        },
    ];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState<StudentAvatar>('boy');
    const [error, setError] = useState('');
    const inputId = useId();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (trimmed.length < 2) {
            setError('Please enter at least 2 characters for your name.');
            return;
        }
        setError('');
        onComplete(trimmed, avatar);
    };

    return (
        <div className="min-h-dvh flex flex-col justify-center px-4 py-8 sm:px-6 bg-canvas">
            <div className="w-full max-w-lg mx-auto animate-panel-enter">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-soft border border-brand-border text-brand text-xs font-extrabold mb-4">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>Arabic Learning Curriculum • 17 Modules</span>
                    </div>

                    <div className="mb-2">
                        <ArabicText size="xl" as="h1" className="text-brand">
                            أَهْلًا وَسَهْلًا فِي قَلَمِيس!
                        </ArabicText>
                    </div>
                    <p className="text-sm sm:text-base text-slate-600 font-medium max-w-md mx-auto">
                        Welcome to <strong className="text-slate-900">Qalamis</strong>! Build foundational Arabic sentences through story hooks, pattern tables, and interactive quizzes.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="tactile-card p-5 sm:p-7 space-y-6" noValidate>
                    <div>
                        <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">
                            1. Choose Your Explorer Avatar
                        </span>
                        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Choose avatar">
                            {AVATAR_OPTIONS.map((item) => {
                                const isSelected = avatar === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        role="radio"
                                        aria-checked={isSelected}
                                        onClick={() => setAvatar(item.id)}
                                        className={`tactile-btn min-h-14 p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-1.5 ${isSelected
                                                ? `${item.accentClass} shadow-xs`
                                                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-2 w-full">
                                            <span className="text-sm font-extrabold truncate">{item.label}</span>
                                            <span
                                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-brand bg-brand' : 'border-slate-300'
                                                    }`}
                                            >
                                                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                            </span>
                                        </div>
                                        <span dir="rtl" lang="ar" className="font-arabic text-lg font-bold text-slate-800">
                                            {item.roleTitle}
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
                            2. What Should We Call You?
                        </label>
                        <input
                            id={inputId}
                            type="text"
                            value={name}
                            maxLength={32}
                            autoComplete="given-name"
                            placeholder="e.g. Zayd, Salma, Adam"
                            onChange={(e) => {
                                setName(e.target.value);
                                if (error) setError('');
                            }}
                            aria-invalid={Boolean(error)}
                            aria-describedby={error ? `${inputId}-error` : undefined}
                            className="w-full min-h-12 px-4 py-3 rounded-2xl border-2 border-slate-200 bg-slate-50/60 focus:bg-white focus:border-brand focus:outline-none text-base font-bold text-slate-900 placeholder:text-slate-400 transition-colors"
                        />
                        {error && (
                            <p id={`${inputId}-error`} className="mt-1.5 text-xs font-bold text-rose-600">
                                {error}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                            <Compass className="w-4 h-4 text-zone-1 mx-auto mb-1" />
                            <span className="block text-[11px] font-extrabold text-slate-700">4 Zones</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                            <BookOpen className="w-4 h-4 text-brand mx-auto mb-1" />
                            <span className="block text-[11px] font-extrabold text-slate-700">17 Modules</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                            <Trophy className="w-4 h-4 text-reward mx-auto mb-1" />
                            <span className="block text-[11px] font-extrabold text-slate-700">340 Questions</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="tactile-btn w-full min-h-12 px-5 py-3.5 rounded-2xl bg-brand hover:bg-brand-hover text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-[0_4px_0_#065f46] cursor-pointer"
                    >
                        <span>Start Learning</span>
                        <ArrowRight className="w-5 h-5 shrink-0" />
                    </button>
                </form>
            </div>
        </div>
    );
};