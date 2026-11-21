import React, { useState, useMemo, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import {
    BookOpen,
    Lightbulb,
    Sparkles,
    Table2,
    Rocket,
    ChevronDown,
    ChevronUp,
    Search,
    Backpack,
    ArrowLeft,
    Heart,
    Zap,
} from 'lucide-react';
import { ArabicText } from '../../components/ui/ArabicText';

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
    studentName: string;
    totalModules: number;
    module: LessonModuleData;
    zoneLabel: string;
    onBackToRoadmap: () => void;
    onStartQuiz: () => void;
}

const QUIZ_SESSION_LENGTH = 10;

// Inline text color highlights that NEVER break Arabic cursive letter joining
const INLINE_ARABIC_HIGHLIGHT: Record<SegmentRole, string> = {
    prefix: 'text-sky-700 bg-sky-100/80 rounded-md px-0.5',
    base: 'text-slate-900',
    focus: 'text-indigo-700 bg-indigo-100/80 rounded-md px-0.5',
    suffix: 'text-amber-800 bg-amber-100/90 rounded-md px-0.5',
};

const LEGEND_PILL_STYLES: Record<SegmentRole, string> = {
    prefix: 'bg-sky-100 text-sky-900 border-sky-200',
    base: 'bg-slate-100 text-slate-800 border-slate-200',
    focus: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    suffix: 'bg-amber-100 text-amber-900 border-amber-200',
};

const ROLE_DEFAULT_EXPLANATION: Record<SegmentRole, string> = {
    prefix: 'Kata depan / awalan',
    base: 'Kata inti',
    focus: 'Pola utama',
    suffix: 'Akhiran / tanda kepemilikan & gender',
};

export const LessonView: React.FC<LessonViewProps> = memo(function LessonView({
    studentName,
    totalModules,
    module,
    zoneLabel,
    onBackToRoadmap,
    onStartQuiz,
}) {
    const [selectedFilter, setSelectedFilter] = useState<string>('Semua');
    const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [showReadyModal, setShowReadyModal] = useState<boolean>(false);

    const activeQuizCount = Math.min(QUIZ_SESSION_LENGTH, module.quizBank.length);

    // Kunci scroll halaman & dukung tombol Escape saat modal konfirmasi kuis terbuka
    useEffect(() => {
        if (!showReadyModal) return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowReadyModal(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [showReadyModal]);

    const activeFilter = module.patternTable.filters.includes(selectedFilter)
        ? selectedFilter
        : 'Semua';

    const filteredRows = useMemo(() => {
        if (activeFilter === 'Semua') return module.patternTable.rows;
        return module.patternTable.rows.filter((row) => row.category === activeFilter);
    }, [module.patternTable.rows, activeFilter]);

    const activeRow = useMemo(() => {
        if (filteredRows.length === 0) return null;
        return filteredRows.find((r) => r.id === selectedRowId) ?? filteredRows[0]!;
    }, [filteredRows, selectedRowId]);

    return (
        <div className="space-y-5 animate-panel-enter pb-8">
            {/* Top Sub-bar: Kembali ke Peta & Pos X dari Y */}
            <div className="flex items-center justify-between gap-2">
                <button
                    type="button"
                    onClick={onBackToRoadmap}
                    className="tactile-btn min-h-10 px-3.5 py-2 rounded-xl bg-white/95 border border-blue-200 hover:border-blue-300 text-slate-700 text-xs font-extrabold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                    <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                    <span>Kembali ke Peta</span>
                </button>

                <span className="px-3 py-1.5 rounded-xl bg-white/95 border border-indigo-200 text-indigo-700 text-xs font-extrabold tabular-nums shadow-2xs">
                    Pos {module.id} dari {totalModules}
                </span>
            </div>

            {/* 1. Title & Purple Misi Belajar Card */}
            <section className="tactile-card p-5 sm:p-6 space-y-4">
                <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-extrabold mb-2">
                        <span>🏅 {zoneLabel}</span>
                    </span>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                        Pos {module.id}: {module.title}
                    </h1>
                </div>

                <div className="rounded-2xl p-4 sm:p-5 bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-[0_4px_0_#4338ca]">
                    <span className="block text-[11px] font-extrabold uppercase tracking-wider text-indigo-100 mb-1">
                        🎯 MISI BELAJAR {studentName.toUpperCase()}
                    </span>
                    <p className="text-sm sm:text-base font-bold leading-relaxed">{module.canDo}</p>
                </div>
            </section>

            {/* 2. Cerita & Konsep Singkat */}
            <section className="tactile-card p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                            Cerita & Konsep Singkat
                        </h2>
                        <p className="text-xs text-slate-500">{module.storyHook.title}</p>
                    </div>
                </div>

                <p className="text-sm sm:text-base text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    {module.explanation}
                </p>

                {/* Collapsible Short Story Dialogue */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setShowDialog((prev) => !prev)}
                        aria-expanded={showDialog}
                        className="w-full min-h-11 px-4 py-2.5 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between gap-2 text-xs font-extrabold text-slate-700 cursor-pointer"
                    >
                        <span>💬 Lihat Contoh Percakapan Singkat ({module.storyHook.lines.length} baris)</span>
                        {showDialog ? (
                            <ChevronUp className="w-4 h-4 shrink-0" />
                        ) : (
                            <ChevronDown className="w-4 h-4 shrink-0" />
                        )}
                    </button>

                    {showDialog && (
                        <div className="p-4 space-y-3 bg-white border-t border-slate-200">
                            <p className="text-xs text-slate-500 italic">{module.storyHook.setting}</p>
                            {module.storyHook.lines.map((line, idx) => (
                                <div
                                    key={`${module.id}-dlg-${idx}`}
                                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
                                >
                                    <span className="text-[11px] font-extrabold text-indigo-600">
                                        {line.speaker}
                                    </span>
                                    <ArabicText size="sm" as="p" className="text-right">
                                        {line.arabic}
                                    </ArabicText>
                                    <p className="text-xs font-bold text-emerald-700">{line.transliteration}</p>
                                    <p className="text-xs text-slate-600">{line.translation}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* 3. Interactive Pattern Table */}
            <section className="tactile-card p-5 sm:p-6 space-y-4">
                <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <Table2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                            {module.patternTable.title}
                        </h2>
                        <p className="text-xs text-slate-500">
                            Pilih filter atau klik salah satu baris untuk membedah pola hurufnya!
                        </p>
                    </div>
                </div>

                {/* Filter Pills */}
                {module.patternTable.filters.length > 1 && (
                    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter tabel pola">
                        {module.patternTable.filters.map((filter) => {
                            const isSelected = activeFilter === filter;
                            return (
                                <button
                                    key={filter}
                                    type="button"
                                    role="tab"
                                    aria-selected={isSelected}
                                    onClick={() => setSelectedFilter(filter)}
                                    className={`tactile-btn min-h-9.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold border-2 cursor-pointer ${isSelected
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-[0_2px_0_#3730a3]'
                                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    {filter}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Clean Interactive Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <div className="grid grid-cols-12 bg-indigo-600 text-white text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-2.5">
                        <div className="col-span-4">{module.patternTable.headers[0] ?? 'Konteks'}</div>
                        <div className="col-span-4 text-center">Bahasa Arab</div>
                        <div className="col-span-4 text-right">Cara Baca & Arti</div>
                    </div>

                    <div className="divide-y divide-slate-200 bg-white">
                        {filteredRows.map((row) => {
                            const isSelected = activeRow?.id === row.id;
                            return (
                                <button
                                    key={row.id}
                                    type="button"
                                    onClick={() => setSelectedRowId(row.id)}
                                    className={`w-full text-left px-3.5 py-3 grid grid-cols-12 items-center gap-2 transition-colors cursor-pointer ${isSelected
                                            ? 'bg-amber-50/90 ring-2 ring-inset ring-amber-400'
                                            : 'hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="col-span-4 pr-1">
                                        <span className="text-xs sm:text-sm font-extrabold text-slate-800 block leading-snug">
                                            {row.cells[0]}
                                        </span>
                                    </div>

                                    <div className="col-span-4 text-center">
                                        <span
                                            dir="rtl"
                                            lang="ar"
                                            className="font-arabic text-xl sm:text-2xl font-bold text-slate-900 leading-loose"
                                        >
                                            {row.arabicResult}
                                        </span>
                                    </div>

                                    <div className="col-span-4 text-right">
                                        <span className="block text-xs font-extrabold text-indigo-700">
                                            {row.transliteration}
                                        </span>
                                        <span className="block text-xs text-slate-600">{row.meaning}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Bedah Pola Baris Terpilih */}
                {activeRow && (
                    <div className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-300 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-800">
                                <Search className="w-3.5 h-3.5" />
                                Bedah Pola Baris Terpilih: {activeRow.cells[0]}
                            </span>
                        </div>

                        {activeRow.cells.length > 1 && (
                            <div className="flex flex-wrap items-center gap-2">
                                {activeRow.cells.slice(1).map((part, idx) => (
                                    <span
                                        key={`${activeRow.id}-part-${idx}`}
                                        className="px-3 py-1.5 rounded-xl bg-white border border-amber-200 text-xs font-extrabold text-slate-800"
                                    >
                                        {part}
                                    </span>
                                ))}
                            </div>
                        )}

                        <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
                            {activeRow.breakdown}
                        </p>
                    </div>
                )}
            </section>

            {/* 4. Contoh Kalimat & Sorotan Pola */}
            <section className="tactile-card p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                            Contoh Kalimat & Sorotan Pola
                        </h2>
                        <p className="text-xs text-slate-500">
                            Perhatikan warna bagian kata untuk melihat perubahan bentuk & fungsi katanya (i'rab/pola)
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    {module.highlightedExamples.map((example, idx) => {
                        const labeledSegments = example.segments.filter((s) => s.label);
                        return (
                            <div
                                key={`${module.id}-ex-${idx}`}
                                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5"
                            >
                                <p
                                    dir="rtl"
                                    lang="ar"
                                    className="font-arabic text-2xl sm:text-3xl font-bold leading-[2.2] text-right text-slate-900"
                                >
                                    {example.segments.map((seg, sIdx) => (
                                        <span
                                            key={`${module.id}-ex-${idx}-seg-${sIdx}`}
                                            className={
                                                seg.role !== 'base' ? INLINE_ARABIC_HIGHLIGHT[seg.role] : undefined
                                            }
                                        >
                                            {seg.text}
                                        </span>
                                    ))}
                                </p>

                                <p className="text-xs font-bold text-slate-500">{example.transliteration}</p>
                                <p className="text-sm font-extrabold text-slate-900">{example.translation}</p>

                                {labeledSegments.length > 0 && (
                                    <div className="pt-1.5 flex flex-wrap gap-1.5">
                                        {labeledSegments.map((seg, lIdx) => (
                                            <span
                                                key={`${module.id}-ex-${idx}-leg-${lIdx}`}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-extrabold ${LEGEND_PILL_STYLES[seg.role]
                                                    }`}
                                            >
                                                <span dir="rtl" lang="ar" className="font-arabic text-base">
                                                    {seg.text.trim()}
                                                </span>
                                                <span>= {seg.label ?? ROLE_DEFAULT_EXPLANATION[seg.role]}</span>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Trik Cepat Hafal */}
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                        <span className="block text-xs font-extrabold uppercase tracking-wider text-amber-800 mb-1">
                            💡 Trik Cepat Hafal
                        </span>
                        <p className="text-sm font-bold text-slate-800 leading-relaxed">
                            {module.quickTrick}
                        </p>
                    </div>
                </div>
            </section>

            {/* 5. Bekal Mufrodat Pos X */}
            <section className="tactile-card p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                        <Backpack className="w-5 h-5" />
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                        Bekal Mufrodat Pos {module.id}
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {module.vocabulary.map((vocab, idx) => (
                        <div
                            key={`${module.id}-vocab-${idx}`}
                            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                        >
                            <div className="min-w-0">
                                <p className="text-xs font-extrabold text-indigo-700">{vocab.transliteration}</p>
                                <p className="text-sm font-bold text-slate-800">{vocab.meaning}</p>
                                {vocab.gender && (
                                    <span
                                        className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${vocab.gender === 'muannats'
                                                ? 'bg-rose-100 text-rose-800'
                                                : 'bg-sky-100 text-sky-800'
                                            }`}
                                    >
                                        {vocab.gender === 'muannats' ? 'Muannats' : 'Mudzakkar'}
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

            {/* Bottom CTA -> Opens Pre-Quiz Readiness Modal */}
            <div className="pt-1">
                <button
                    type="button"
                    onClick={() => setShowReadyModal(true)}
                    className="tactile-btn w-full min-h-14 px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-[0_4px_0_#3730a3] cursor-pointer"
                >
                    <span>Aku Paham! Lanjut ke Tantangan Kuis</span>
                    <Rocket className="w-5 h-5 shrink-0" />
                </button>
            </div>

            {/* Pre-Quiz Readiness Confirmation Modal dirender via Portal ke document.body agar selalu tepat di tengah viewport */}
            {showReadyModal &&
                createPortal(
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="quiz-ready-title"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setShowReadyModal(false);
                        }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs"
                    >
                        <div className="animate-pop-in w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 text-center shadow-2xl border-2 border-indigo-100 space-y-5">
                            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center text-2xl">
                                🚀
                            </div>

                            <div className="space-y-1.5">
                                <span className="block text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
                                    Arena Tantangan
                                </span>
                                <h3 id="quiz-ready-title" className="text-xl font-extrabold text-slate-900">
                                    Sudah Siap Uji Kemampuan?
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed pt-1">
                                    Yakin sudah paham materinya? Saat kuis dimulai,{' '}
                                    <strong className="text-slate-900">tabel pola akan ditutup sementara</strong>. Kamu punya{' '}
                                    <strong className="text-rose-600 inline-flex items-center gap-1">
                                        3 Hati <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 inline" />
                                    </strong>{' '}
                                    untuk menaklukkan <strong>{activeQuizCount} soal acak</strong>!
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowReadyModal(false)}
                                    className="tactile-btn min-h-12 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm cursor-pointer"
                                >
                                    Baca Ulang Dulu 📖
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowReadyModal(false);
                                        onStartQuiz();
                                    }}
                                    className="tactile-btn min-h-12 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm flex items-center justify-center gap-1.5 shadow-[0_4px_0_#3730a3] cursor-pointer"
                                >
                                    <span>Siap, Mulai Kuis!</span>
                                    <Zap className="w-4 h-4 shrink-0 fill-current" />
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
});