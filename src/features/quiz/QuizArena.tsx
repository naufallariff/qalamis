import React, { useState, useCallback, memo } from 'react';
import {
    CheckCircle2,
    XCircle,
    ArrowRight,
    ArrowLeft,
    RotateCcw,
    Trophy,
    BookOpen,
    Sparkles,
    Heart,
} from 'lucide-react';
import { useActionGuard } from '../../hooks/useActionGuard';
import { ProgressBar } from '../../components/ui/ProgressBar';

export interface QuizQuestionItem {
    id: string;
    difficulty: 'medium' | 'hard';
    type: string;
    question: string;
    options: ReadonlyArray<string>;
    correctIndex: number;
    feedbackWrong: string;
    feedbackCorrect: string;
}

export interface QuizModuleData {
    id: number;
    title: string;
    quizBank: ReadonlyArray<QuizQuestionItem>;
}

interface QuizArenaProps {
    module: QuizModuleData;
    hasNextModule: boolean;
    onCompleteQuiz: (score: number, total: number) => void;
    onBackToLesson: () => void;
    onNextModule: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;
const MAX_HEARTS = 3;
const QUESTIONS_PER_SESSION = 10;

function shuffleArray<T>(items: ReadonlyArray<T>): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j]!, copy[i]!];
    }
    return copy;
}

/**
 * Mengambil maksimal 10 soal acak dari bank 20 soal sekaligus mengacak urutan pilihan A/B/C/D
 */
function buildRandomizedSession(
    quizBank: ReadonlyArray<QuizQuestionItem>,
    limit = QUESTIONS_PER_SESSION
): QuizQuestionItem[] {
    return shuffleArray(quizBank)
        .slice(0, limit)
        .map((item) => {
            const indexedOptions = item.options.map((text, idx) => ({
                text,
                isCorrect: idx === item.correctIndex,
            }));
            const shuffledOptions = shuffleArray(indexedOptions);
            const newCorrectIndex = shuffledOptions.findIndex((opt) => opt.isCorrect);

            return {
                ...item,
                options: shuffledOptions.map((opt) => opt.text),
                correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
            };
        });
}

export const QuizArena: React.FC<QuizArenaProps> = memo(function QuizArena({
    module,
    hasNextModule,
    onCompleteQuiz,
    onBackToLesson,
    onNextModule,
}) {
    const [questions, setQuestions] = useState<QuizQuestionItem[]>(() =>
        buildRandomizedSession(module.quizBank)
    );
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [hearts, setHearts] = useState(MAX_HEARTS);
    const [isFinished, setIsFinished] = useState(false);

    const guardAction = useActionGuard(280);
    const currentQuestion = questions[currentIndex];
    const hasAnswered = selectedOption !== null;
    const isCorrect =
        hasAnswered && currentQuestion && selectedOption === currentQuestion.correctIndex;
    const isOutOfHearts = hearts <= 0;

    const handleSelectOption = useCallback(
        (optionIndex: number) => {
            if (hasAnswered || !currentQuestion) return;
            setSelectedOption(optionIndex);
            if (optionIndex === currentQuestion.correctIndex) {
                setScore((prev) => prev + 1);
            } else {
                setHearts((prev) => Math.max(0, prev - 1));
            }
        },
        [hasAnswered, currentQuestion]
    );

    const handleNextQuestion = useCallback(() => {
        if (!hasAnswered) return;
        if (hearts <= 0) {
            setIsFinished(true);
            return;
        }
        if (currentIndex + 1 < questions.length) {
            setCurrentIndex((prev) => prev + 1);
            setSelectedOption(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            setIsFinished(true);
            onCompleteQuiz(score, questions.length);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [hasAnswered, hearts, currentIndex, questions.length, onCompleteQuiz, score]);

    const handleRetry = useCallback(() => {
        setQuestions(buildRandomizedSession(module.quizBank));
        setCurrentIndex(0);
        setSelectedOption(null);
        setScore(0);
        setHearts(MAX_HEARTS);
        setIsFinished(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [module.quizBank]);

    if (isFinished) {
        const failedByHearts = isOutOfHearts;
        const percentage = Math.round((score / Math.max(1, questions.length)) * 100);
        const isMastered = !failedByHearts && percentage >= 80;

        return (
            <div className="tactile-card p-6 sm:p-8 text-center space-y-6 animate-panel-enter">
                <div
                    className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center border-2 ${failedByHearts
                            ? 'bg-rose-50 border-rose-200 text-rose-500'
                            : isMastered
                                ? 'bg-amber-50 border-amber-300 text-amber-500'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                        }`}
                >
                    {failedByHearts ? (
                        <Heart className="w-10 h-10" />
                    ) : (
                        <Trophy className="w-10 h-10" />
                    )}
                </div>

                <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Sparkles className="w-3.5 h-3.5" />
                        {failedByHearts ? 'Hati Habis!' : `Pos ${module.id} Tuntas!`}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                        {failedByHearts
                            ? 'Jangan Menyerah, Yuk Coba Lagi!'
                            : isMastered
                                ? 'Mumtāz! Hebat Sekali!'
                                : 'Bagus! Pos Berhasil Dilewati!'}
                    </h2>
                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                        {failedByHearts ? (
                            <>
                                3 hatimu habis di Pos {module.id}. Yuk intip lagi tabel polanya sebentar lalu taklukkan 10 soal acak baru!
                            </>
                        ) : (
                            <>
                                Kamu menjawab benar{' '}
                                <strong className="text-slate-900 tabular-nums">
                                    {score} dari {questions.length} soal
                                </strong>{' '}
                                ({percentage}%) pada materi <strong className="text-slate-900">{module.title}</strong>.
                            </>
                        )}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                        type="button"
                        onClick={failedByHearts ? onBackToLesson : handleRetry}
                        className="tactile-btn min-h-12 px-5 py-3 rounded-2xl border-2 border-slate-200 bg-white hover:border-slate-300 text-slate-800 font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {failedByHearts ? (
                            <>
                                <BookOpen className="w-4 h-4 shrink-0" />
                                <span>Baca Materi Dulu</span>
                            </>
                        ) : (
                            <>
                                <RotateCcw className="w-4 h-4 shrink-0" />
                                <span>Ulangi Kuis (Soal Baru)</span>
                            </>
                        )}
                    </button>

                    {failedByHearts ? (
                        <button
                            type="button"
                            onClick={handleRetry}
                            className="tactile-btn min-h-12 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_#3730a3] cursor-pointer"
                        >
                            <RotateCcw className="w-4 h-4 shrink-0" />
                            <span>Coba Soal Acak Baru</span>
                        </button>
                    ) : hasNextModule ? (
                        <button
                            type="button"
                            onClick={onNextModule}
                            className="tactile-btn min-h-12 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_#047857] cursor-pointer"
                        >
                            <span>Lanjut ke Pos {module.id + 1}</span>
                            <ArrowRight className="w-4 h-4 shrink-0" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onBackToLesson}
                            className="tactile-btn min-h-12 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_#047857] cursor-pointer"
                        >
                            <BookOpen className="w-4 h-4 shrink-0" />
                            <span>Kembali ke Materi</span>
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (!currentQuestion) return null;

    return (
        <div className="space-y-4 animate-panel-enter pb-8">
            {/* Top Quiz Sub-bar: Kembali ke Materi & 3 Hearts */}
            <div className="flex items-center justify-between gap-2">
                <button
                    type="button"
                    onClick={onBackToLesson}
                    className="tactile-btn min-h-10 px-3.5 py-2 rounded-xl bg-white/95 border border-blue-200 hover:border-blue-300 text-slate-700 text-xs font-extrabold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                    <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                    <span>Kembali ke Materi 📖</span>
                </button>

                {/* 3 Hearts Pill */}
                <div
                    aria-label={`Sisa ${hearts} dari ${MAX_HEARTS} hati`}
                    className="px-3.5 py-1.5 rounded-2xl bg-white/95 border border-rose-200 flex items-center gap-1.5 shadow-2xs"
                >
                    {Array.from({ length: MAX_HEARTS }).map((_, idx) => {
                        const isAlive = idx < hearts;
                        return (
                            <Heart
                                key={`heart-${idx}`}
                                className={`w-4 h-4 transition-transform ${isAlive
                                        ? 'fill-rose-500 text-rose-500 scale-100'
                                        : 'fill-slate-200 text-slate-300 scale-90'
                                    }`}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Question Card */}
            <div
                key={`${currentQuestion.id}-${currentIndex}`}
                className={`tactile-card p-5 sm:p-6 space-y-5 ${hasAnswered && !isCorrect ? 'animate-shake-x' : 'animate-panel-enter'
                    }`}
            >
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs font-extrabold">
                        <span className="text-indigo-600">
                            Tantangan Pos {module.id}: {module.title}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 tabular-nums shrink-0">
                            Soal {currentIndex + 1} / {questions.length}
                        </span>
                    </div>

                    <ProgressBar
                        current={currentIndex + (hasAnswered ? 1 : 0)}
                        total={questions.length}
                        label="Progres pengerjaan kuis"
                    />
                </div>

                {/* Question Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90">
                    <p className="text-base sm:text-lg font-extrabold text-slate-900 whitespace-pre-line leading-relaxed">
                        {currentQuestion.question}
                    </p>
                </div>

                {/* Options */}
                <div className="space-y-2.5" role="radiogroup" aria-label="Pilihan jawaban">
                    {currentQuestion.options.map((optionText, idx) => {
                        const isThisSelected = selectedOption === idx;
                        const isThisCorrect = idx === currentQuestion.correctIndex;

                        let optionStyle =
                            'border-slate-200 bg-white hover:border-indigo-400 text-slate-800';
                        if (hasAnswered) {
                            if (isThisCorrect) {
                                optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950';
                            } else if (isThisSelected) {
                                optionStyle = 'border-rose-500 bg-rose-50 text-rose-950';
                            } else {
                                optionStyle = 'border-slate-200 bg-slate-50/60 text-slate-400';
                            }
                        }

                        return (
                            <button
                                key={`${currentQuestion.id}-opt-${idx}`}
                                type="button"
                                role="radio"
                                aria-checked={isThisSelected}
                                disabled={hasAnswered}
                                onClick={guardAction(() => handleSelectOption(idx))}
                                className={`tactile-btn w-full min-h-13 p-3.5 sm:p-4 rounded-2xl border-2 text-left flex items-center justify-between gap-3 transition-colors ${optionStyle} ${hasAnswered ? 'cursor-default' : 'cursor-pointer'
                                    }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span
                                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 ${hasAnswered && isThisCorrect
                                                ? 'bg-emerald-600 text-white'
                                                : hasAnswered && isThisSelected
                                                    ? 'bg-rose-600 text-white'
                                                    : 'bg-slate-100 text-slate-700'
                                            }`}
                                    >
                                        {OPTION_LETTERS[idx] ?? idx + 1}
                                    </span>
                                    <span className="text-sm sm:text-base font-bold leading-snug">
                                        {optionText}
                                    </span>
                                </div>

                                {hasAnswered && isThisCorrect && (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                )}
                                {hasAnswered && isThisSelected && !isThisCorrect && (
                                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Feedback Box */}
                {hasAnswered && (
                    <div
                        role="status"
                        aria-live="polite"
                        className={`p-4 rounded-2xl border-2 space-y-3 animate-pop-in ${isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                                : 'bg-rose-50 border-rose-300 text-rose-950'
                            }`}
                    >
                        <div className="flex items-start gap-2.5">
                            {isCorrect ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            )}
                            <p className="text-sm font-bold leading-relaxed">
                                {isCorrect ? currentQuestion.feedbackCorrect : currentQuestion.feedbackWrong}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={guardAction(handleNextQuestion)}
                            className={`tactile-btn w-full min-h-12 px-5 py-3 rounded-xl font-extrabold text-sm text-white flex items-center justify-center gap-2 cursor-pointer ${isCorrect
                                    ? 'bg-emerald-600 hover:bg-emerald-700'
                                    : 'bg-rose-600 hover:bg-rose-700'
                                }`}
                        >
                            <span>
                                {hearts <= 0
                                    ? 'Lihat Status Hati'
                                    : currentIndex + 1 < questions.length
                                        ? 'Lanjut Soal Berikutnya'
                                        : 'Lihat Hasil Akhir Pos'}
                            </span>
                            <ArrowRight className="w-4 h-4 shrink-0" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});