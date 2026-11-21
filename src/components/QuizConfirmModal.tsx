// src/components/QuizConfirmModal.tsx
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface QuizConfirmModalProps {
    open: boolean;
    questionCount?: number;
    onCancel: () => void;
    onConfirm: () => void;
}

export function QuizConfirmModal({
    open,
    questionCount = 10,
    onCancel,
    onConfirm,
}: QuizConfirmModalProps) {
    useEffect(() => {
        if (!open) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [open]);

    if (!open) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-quiz-title"
        >
            <div className="animate-pop-in bg-white w-full max-w-md rounded-3xl p-6 border-2 border-indigo-100 shadow-2xl space-y-5">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl shrink-0">
                        🚀
                    </div>
                    <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
                            Arena Tantangan
                        </span>
                        <h3 id="modal-quiz-title" className="text-lg font-extrabold text-slate-900">
                            Sudah Siap Uji Kemampuan?
                        </h3>
                    </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                    Yakin sudah paham materinya? Saat kuis dimulai,{" "}
                    <strong>tabel rumus ditutup sementara</strong>. Kamu punya{" "}
                    <strong>3 Hati ❤️</strong> untuk menaklukkan{" "}
                    <strong>{questionCount} soal acak</strong>!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="tactile-btn min-h-11.5x-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-extrabold"
                    >
                        Baca Ulang Dulu 📖
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="tactile-btn min-h-11.5 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-extrabold border-b-4 border-indigo-800 shadow-md"
                    >
                        Siap, Mulai Kuis! ⚡
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}