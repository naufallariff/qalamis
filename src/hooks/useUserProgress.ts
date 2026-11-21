// src/hooks/useUserProgress.ts
import { useState, useEffect, useCallback, useRef } from 'react';

export type StudentAvatar = 'boy' | 'girl';

export interface ModuleScoreRecord {
    bestScore: number;
    totalQuestions: number;
    completedAt: string;
}

export interface UserProgressState {
    version: 1;
    studentName: string;
    avatar: StudentAvatar;
    xp: number;
    activeModuleId: number;
    completedModules: Record<number, ModuleScoreRecord>;
}

const STORAGE_KEY = 'qalamis_progress_v1';

const DEFAULT_PROGRESS: UserProgressState = {
    version: 1,
    studentName: '',
    avatar: 'boy',
    xp: 0,
    activeModuleId: 1,
    completedModules: {},
};

function readInitialProgress(): UserProgressState {
    if (typeof window === 'undefined') return DEFAULT_PROGRESS;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_PROGRESS;
        const parsed: unknown = JSON.parse(raw);
        if (
            typeof parsed === 'object' &&
            parsed !== null &&
            'version' in parsed &&
            (parsed as { version: unknown }).version === 1
        ) {
            return {
                ...DEFAULT_PROGRESS,
                ...(parsed as Partial<UserProgressState>),
            };
        }
        return DEFAULT_PROGRESS;
    } catch {
        return DEFAULT_PROGRESS;
    }
}

export function useUserProgress() {
    const [progress, setProgress] = useState<UserProgressState>(readInitialProgress);
    const saveTimerRef = useRef<number | null>(null);

    // Debounced persistence ke localStorage (250ms) agar interaksi UI tetap 60fps
    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (saveTimerRef.current !== null) {
            window.clearTimeout(saveTimerRef.current);
        }

        saveTimerRef.current = window.setTimeout(() => {
            try {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
            } catch {
                // Abaikan jika mode Incognito / storage penuh; state tetap aman di memori
            }
        }, 250);

        return () => {
            if (saveTimerRef.current !== null) {
                window.clearTimeout(saveTimerRef.current);
            }
        };
    }, [progress]);

    const completeOnboarding = useCallback((studentName: string, avatar: StudentAvatar) => {
        const sanitizedName = studentName.trim().slice(0, 32);
        setProgress((prev) => ({
            ...prev,
            studentName: sanitizedName,
            avatar,
        }));
    }, []);

    const setActiveModule = useCallback((moduleId: number) => {
        setProgress((prev) => ({
            ...prev,
            activeModuleId: moduleId,
        }));
    }, []);

    const recordQuizResult = useCallback(
        (moduleId: number, score: number, totalQuestions: number, totalModulesCount: number) => {
            setProgress((prev) => {
                const previousBest = prev.completedModules[moduleId]?.bestScore ?? 0;
                const improvedDelta = Math.max(0, score - previousBest);
                const earnedXp = improvedDelta * 15 + (previousBest === 0 ? 50 : 10);
                const nextModuleId = Math.min(totalModulesCount, moduleId + 1);

                return {
                    ...prev,
                    xp: prev.xp + earnedXp,
                    activeModuleId: Math.max(prev.activeModuleId, nextModuleId),
                    completedModules: {
                        ...prev.completedModules,
                        [moduleId]: {
                            bestScore: Math.max(previousBest, score),
                            totalQuestions,
                            completedAt: new Date().toISOString(),
                        },
                    },
                };
            });
        },
        []
    );

    const resetProgress = useCallback(() => {
        setProgress(DEFAULT_PROGRESS);
        try {
            window.localStorage.removeItem(STORAGE_KEY);
        } catch {
            // Ignore storage error
        }
    }, []);

    return {
        progress,
        isOnboarded: progress.studentName.trim().length > 0,
        completeOnboarding,
        setActiveModule,
        recordQuizResult,
        resetProgress,
    };
}