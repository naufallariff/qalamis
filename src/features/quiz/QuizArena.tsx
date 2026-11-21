// src/features/quiz/QuizArena.tsx
import React, { useState, useCallback, memo } from 'react';
import {
    CheckCircle2,
    XCircle,
    ArrowRight,
    RotateCcw,
    Trophy,
    BookOpen,
    Sparkles,
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

export const QuizArena: React.FC<QuizArenaProps> = memo(function QuizArena({
    module,
    hasNextModule,
    onCompleteQuiz,
    onBackToLesson,
    onNextModule,
}) {
    const questions = module.quizBank;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const guardAction = useActionGuard(300);
    const currentQuestion = questions[currentIndex];
    const hasAnswered = selectedOption !== null;
    const isCorrect =
        hasAnswered && currentQuestion && selectedOption === currentQuestion.correctIndex;

    const handleSelectOption = useCallback(
        (optionIndex: number) => {
            if (hasAnswered || !currentQuestion) return;
            setSelectedOption(optionIndex);
            if (optionIndex === currentQuestion.correctIndex) {
                setScore((prev) => prev + 1);
            }
        },
        [hasAnswered, currentQuestion]
    );

    const handleNextQuestion = useCallback(() => {
        if (!hasAnswered) return;
        if (currentIndex + 1 < questions.length) {
            setCurrentIndex((prev) => prev + 1);
            setSelectedOption(null);
        } else {
            setIsFinished(true);
            onCompleteQuiz(score, questions.length);
        }
    }, [hasAnswered, currentIndex, questions.length, onCompleteQuiz, score]);

    const handleRetry = useCallback(() => {
        setCurrentIndex(0);
        setSelectedOption(null);
        setScore(0);
        setIsFinished(false);
    }, []);

    if (isFinished) {
        const percentage = Math.round((score / Math.max(1, questions.length)) * 100);
        const isMastered = percentage >= 80;

        return (
            <div className="tactile-card p-6 sm:p-8 text-center space-y-6 animate-panel-enter">
                <div
                    className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center border-2 ${isMastered
                            ? 'bg-reward-soft border-reward-border text-reward'
                            : 'bg-brand-soft border-brand-border text-brand'
                        }`}
                >
                    <Trophy className="w-10 h-10" />
                </div>

                <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-brand-soft text-brand border border-brand-border">
                        <Sparkles className="w-3.5 h-3.5" />
                        Module {module.id} Complete!
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                        {isMastered ? 'Mumtāz! Great Work!' : 'Good Effort! Keep Practicing!'}
                    </h2>
                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                        You answered{' '}
                        <strong className="text-slate-900 tabular-nums">
                            {score} of {questions.length} questions
                        </strong>{' '}
                        ({percentage}%) correctly in <strong className="text-slate-900">{module.title}</strong>.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleRetry}
                        className="tactile-btn min-h-12 px-5 py-3 rounded-2xl border-2 border-slate-200 bg-white hover:border-slate-300 text-slate-800 font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <RotateCcw className="w-4 h-4 shrink-0" />
                        <span>Retry Module {module.id}</span>
                    </button>

                    {hasNextModule ? (
                        <button
                            type="button"
                            onClick={onNextModule}
                            className="tactile-btn min-h-12 px-5 py-3 rounded-2xl bg-brand hover:bg-brand-hover text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_#065f46] cursor-pointer"
                        >
                            <span>Next: Module {module.id + 1}</span>
                            <ArrowRight className="w-4 h-4 shrink-0" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onBackToLesson}
                            className="tactile-btn min-h-12 px-5 py-3 rounded-2xl bg-brand hover:bg-brand-hover text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_#065f46] cursor-pointer"
                        >
                            <BookOpen className="w-4 h-4 shrink-0" />
                            <span>Review Lesson</span>
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (!currentQuestion) return null;

    return (
        <div className="space-y-5 animate-panel-enter">
            <div className="tactile-card p-4 space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs font-extrabold">
                    <span className="text-slate-600 tabular-nums">
                        Question {currentIndex + 1} of {questions.length}
                    </span>
                    <span
                        className={`px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[11px] ${currentQuestion.difficulty === 'hard'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-sky-100 text-sky-800'
                            }`}
                    >
                        {currentQuestion.difficulty === 'hard' ? 'Hard' : 'Medium'}
                    </span>
                    <span className="text-brand tabular-nums">Score: {score}</span>
                </div>

                <ProgressBar
                    current={currentIndex + (hasAnswered ? 1 : 0)}
                    total={questions.length}
                    label="Quiz completion progress"
                />
            </div>

            <div
                key={currentQuestion.id}
                className={`tactile-card p-5 sm:p-6 space-y-5 ${hasAnswered && !isCorrect ? 'animate-shake-x' : 'animate-panel-enter'
                    }`}
            >
                <p className="text-base sm:text-lg font-extrabold text-slate-900 whitespace-pre-line leading-relaxed">
                    {currentQuestion.question}
                </p>

                <div className="space-y-2.5" role="radiogroup" aria-label="Answer choices">
                    {currentQuestion.options.map((optionText, idx) => {
                        const isThisSelected = selectedOption === idx;
                        const isThisCorrect = idx === currentQuestion.correctIndex;

                        let optionStyle =
                            'border-slate-200 bg-white hover:border-brand/60 text-slate-800';
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
                                {currentIndex + 1 < questions.length
                                    ? 'Next Question'
                                    : 'View Final Score'}
                            </span>
                            <ArrowRight className="w-4 h-4 shrink-0" />
                        </button>
                    </div>
                )}
            </div>

            <div className="text-center">
                <button
                    type="button"
                    onClick={onBackToLesson}
                    className="text-xs font-extrabold text-slate-500 hover:text-slate-800 underline underline-offset-4 py-2 px-3 cursor-pointer"
                >
                    Back to Module {module.id} lesson
                </button>
            </div>
        </div>
    );
});