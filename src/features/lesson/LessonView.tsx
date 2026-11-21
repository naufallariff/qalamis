// src/features/lesson/LessonView.tsx
import React, { useState, useMemo, memo } from 'react';
import {
    BookOpen,
    Lightbulb,
    MessageCircle,
    Sparkles,
    Table2,
    PlayCircle,
    Target,
} from 'lucide-react';
import { ArabicText } from '../../components/ui/ArabicText';
import { ZoneBadge } from '../../components/ui/ZoneBadge';

type SegmentRole = 'prefix' | 'base' | 'focus' | 'suffix';

export interface LessonModuleData {
    id: number;
    zoneId: string;
    slug: string;
    title: string;
    canDo: string;
    storyHook: {
        title: string;
        setting: string;
        lines: ReadonlyArray<{
            speaker: string;
            avatarRole: 'boy' | 'girl';
            arabic: string;
            transliteration: string;
            translation: string;
        }>;
    };
    explanation: string;
    patternTable: {
        title: string;
        filters: ReadonlyArray<string>;
        headers: ReadonlyArray<string>;
        rows: ReadonlyArray<{
            id: string;
            category: string;
            cells: ReadonlyArray<string>;
            arabicResult: string;
            transliteration: string;
            meaning: string;
            breakdown: string;
        }>;
    };
    highlightedExamples: ReadonlyArray<{
        segments: ReadonlyArray<{
            text: string;
            role: SegmentRole;
            label?: string;
        }>;
        transliteration: string;
        translation: string;
    }>;
    quickTrick: string;
    vocabulary: ReadonlyArray<{
        arabic: string;
        transliteration: string;
        meaning: string;
        gender?: 'mudzakkar' | 'muannats';
    }>;
    quizBank: ReadonlyArray<unknown>;
}

interface LessonViewProps {
    module: LessonModuleData;
    zoneLabel: string;
    onStartQuiz: () => void;
}

const SEGMENT_STYLES: Record<SegmentRole, string> = {
    prefix: 'bg-sky-100 text-sky-950 border-sky-300',
    base: 'bg-slate-100 text-slate-900 border-slate-300',
    focus: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    suffix: 'bg-amber-100 text-amber-950 border-amber-300',
};

export const LessonView: React.FC<LessonViewProps> = memo(function LessonView({
    module,
    zoneLabel,
    onStartQuiz,
}) {
    const [selectedFilter, setSelectedFilter] = useState<string>('Semua');

    const activeFilter = module.patternTable.filters.includes(selectedFilter)
        ? selectedFilter
        : 'Semua';

    const filteredRows = useMemo(() => {
        if (activeFilter === 'Semua') return module.patternTable.rows;
        return module.patternTable.rows.filter((row) => row.category === activeFilter);
    }, [module.patternTable.rows, activeFilter]);

    return (
        <div className="space-y-6 animate-panel-enter">
            <section className="tactile-card p-5 sm:p-6 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <ZoneBadge zoneId={module.zoneId} label={zoneLabel} />
                        <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                            Module {module.id}
                        </span>
                    </div>
                    <span className="text-xs font-extrabold text-brand bg-brand-soft border border-brand-border px-2.5 py-1 rounded-full tabular-nums">
                        {module.quizBank.length} Quiz Questions
                    </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{module.title}</h1>

                <div className="p-3.5 rounded-2xl bg-brand-soft/70 border border-brand-border flex items-start gap-3">
                    <Target className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                    <div className="min-w-0">
                        <span className="block text-[11px] font-extrabold uppercase tracking-wider text-brand">
                            Can-Do Objective
                        </span>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5">{module.canDo}</p>
                    </div>
                </div>
            </section>

            <section className="tactile-card p-5 sm:p-6 space-y-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-zone-1-soft text-zone-1 border border-sky-200 flex items-center justify-center shrink-0">
                        <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <span className="block text-[11px] font-extrabold uppercase tracking-wider text-zone-1">
                            Story Hook
                        </span>
                        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                            {module.storyHook.title}
                        </h2>
                        <p className="text-xs text-slate-600 mt-0.5">{module.storyHook.setting}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {module.storyHook.lines.map((line, idx) => {
                        const isGirl = line.avatarRole === 'girl';
                        return (
                            <div
                                key={`${module.id}-line-${idx}`}
                                className={`p-3.5 sm:p-4 rounded-2xl border-2 ${isGirl
                                        ? 'bg-rose-50/50 border-rose-200/80'
                                        : 'bg-sky-50/50 border-sky-200/80'
                                    }`}
                            >
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                    <span
                                        className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${isGirl ? 'bg-rose-100 text-rose-900' : 'bg-sky-100 text-sky-900'
                                            }`}
                                    >
                                        {line.speaker}
                                    </span>
                                    <span className="text-[11px] font-bold text-slate-400 tabular-nums">
                                        #{idx + 1}
                                    </span>
                                </div>

                                <ArabicText size="md" as="p" className="text-right mb-1.5">
                                    {line.arabic}
                                </ArabicText>
                                <p className="text-xs font-bold text-brand italic">{line.transliteration}</p>
                                <p className="text-sm font-medium text-slate-700 mt-1">{line.translation}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="tactile-card p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-brand-soft text-brand border border-brand-border flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                        Core Concept • Module {module.id}
                    </h2>
                </div>

                <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                    {module.explanation}
                </p>

                <div className="p-4 rounded-2xl bg-reward-soft border-2 border-reward-border flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-reward shrink-0 mt-0.5" />
                    <div className="min-w-0">
                        <span className="block text-xs font-extrabold uppercase tracking-wider text-reward mb-1">
                            Quick Pattern Tip
                        </span>
                        <p className="text-sm font-bold text-slate-800 leading-relaxed">
                            {module.quickTrick}
                        </p>
                    </div>
                </div>
            </section>

            <section className="tactile-card p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-zone-2-soft text-zone-2 border border-violet-200 flex items-center justify-center shrink-0">
                        <Table2 className="w-5 h-5" />
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                        {module.patternTable.title}
                    </h2>
                </div>

                {module.patternTable.filters.length > 1 && (
                    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter pattern rows">
                        {module.patternTable.filters.map((filter) => {
                            const isSelected = activeFilter === filter;
                            return (
                                <button
                                    key={filter}
                                    type="button"
                                    role="tab"
                                    aria-selected={isSelected}
                                    onClick={() => setSelectedFilter(filter)}
                                    className={`tactile-btn min-h-10 px-3.5 py-1.5 rounded-xl text-xs font-extrabold border-2 cursor-pointer ${isSelected
                                            ? 'bg-slate-900 text-white border-slate-900'
                                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    {filter}
                                </button>
                            );
                        })}
                    </div>
                )}

                <div className="space-y-3">
                    {filteredRows.map((row) => (
                        <div
                            key={row.id}
                            className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2.5"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                                    {row.cells[0]}
                                </span>
                                <span className="text-[11px] font-bold text-slate-500">{row.category}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-slate-700">
                                {row.cells.slice(1).map((cell, i) => (
                                    <div
                                        key={`${row.id}-cell-${i}`}
                                        className="px-3 py-2 rounded-xl bg-white border border-slate-200/80"
                                    >
                                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                                            {module.patternTable.headers[i + 1] ?? 'Component'}
                                        </span>
                                        <span className="text-slate-800">{cell}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <ArabicText size="md" as="p">
                                        {row.arabicResult}
                                    </ArabicText>
                                    <p className="text-xs font-bold text-brand">{row.transliteration}</p>
                                </div>
                                <div className="sm:text-right">
                                    <p className="text-sm font-extrabold text-slate-900">{row.meaning}</p>
                                    <p className="text-xs text-slate-600 mt-0.5">{row.breakdown}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="tactile-card p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-zone-3-soft text-zone-3 border border-orange-200 flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                        Color-Coded Word Breakdown
                    </h2>
                </div>

                <div className="space-y-3">
                    {module.highlightedExamples.map((example, idx) => (
                        <div
                            key={`${module.id}-ex-${idx}`}
                            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                        >
                            <div
                                dir="rtl"
                                lang="ar"
                                className="flex flex-wrap items-center gap-1.5 justify-start"
                            >
                                {example.segments.map((seg, sIdx) => (
                                    <span
                                        key={`${module.id}-ex-${idx}-seg-${sIdx}`}
                                        className={`inline-flex flex-col items-center px-2.5 py-1 rounded-xl border ${SEGMENT_STYLES[seg.role]
                                            }`}
                                    >
                                        <span className="font-arabic text-2xl sm:text-3xl font-bold leading-relaxed">
                                            {seg.text}
                                        </span>
                                        {seg.label && (
                                            <span
                                                dir="ltr"
                                                className="text-[10px] font-extrabold tracking-tight opacity-85"
                                            >
                                                {seg.label}
                                            </span>
                                        )}
                                    </span>
                                ))}
                            </div>

                            <div>
                                <p className="text-xs font-bold text-brand">{example.transliteration}</p>
                                <p className="text-sm font-extrabold text-slate-800">{example.translation}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="tactile-card p-5 sm:p-6 space-y-4">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                    Key Vocabulary • Module {module.id}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {module.vocabulary.map((vocab, idx) => (
                        <div
                            key={`${module.id}-vocab-${idx}`}
                            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                        >
                            <div className="min-w-0">
                                <p className="text-sm font-extrabold text-slate-900">{vocab.meaning}</p>
                                <p className="text-xs font-bold text-brand">{vocab.transliteration}</p>
                                {vocab.gender && (
                                    <span
                                        className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${vocab.gender === 'muannats'
                                                ? 'bg-rose-100 text-rose-800'
                                                : 'bg-sky-100 text-sky-800'
                                            }`}
                                    >
                                        {vocab.gender === 'muannats' ? 'Feminine' : 'Masculine'}
                                    </span>
                                )}
                            </div>
                            <ArabicText size="md" className="shrink-0">
                                {vocab.arabic}
                            </ArabicText>
                        </div>
                    ))}
                </div>
            </section>

            <div className="pt-2 pb-4">
                <button
                    type="button"
                    onClick={onStartQuiz}
                    className="tactile-btn w-full min-h-14 px-6 py-4 rounded-2xl bg-brand hover:bg-brand-hover text-white font-extrabold text-base flex items-center justify-center gap-2.5 shadow-[0_4px_0_#065f46] cursor-pointer"
                >
                    <PlayCircle className="w-5 h-5 shrink-0" />
                    <span>Start {module.quizBank.length} Quiz Challenges • Module {module.id}</span>
                </button>
            </div>
        </div>
    );
});