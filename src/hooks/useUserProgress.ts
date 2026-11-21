import { useState, useCallback, useEffect } from 'react';

export type StudentAvatar = 'boy' | 'girl';

export interface ModuleScoreRecord {
    bestScore: number;
    totalQuestions: number;
    completedAt: string;
}

export interface UserProgressState {
    studentName: string;
    avatar: StudentAvatar;
    activeModuleId: number;
    xp: number;
    completedModules: Record<number, ModuleScoreRecord>;
}

const STORAGE_KEY = 'qalamis_progress_v1';

const DEFAULT_PROGRESS: UserProgressState = {
    studentName: '',
    avatar: 'boy',
    activeModuleId: 1,
    xp: 0,
    completedModules: {},
};

export function getLevelInfo(xp: number): { level: number; title: string } {
    if (xp >= 1500) return { level: 5, title: 'Juara Qalamis' };
    if (xp >= 900) return { level: 4, title: 'Bintang Bahasa' };
    if (xp >= 450) return { level: 3, title: 'Perangkai Kata' };
    if (xp >= 150) return { level: 2, title: 'Petualang' };
    return { level: 1, title: 'Penjelajah' };
}

function readStoredProgress(): UserProgressState {
    if (typeof window === 'undefined') return DEFAULT_PROGRESS;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_PROGRESS;
        const parsed = JSON.parse(raw) as Partial<UserProgressState>;
        return {
            studentName: typeof parsed.studentName === 'string' ? parsed.studentName : '',
            avatar: parsed.avatar === 'girl' ? 'girl' : 'boy',
            activeModuleId:
                typeof parsed.activeModuleId === 'number' && parsed.activeModuleId >= 1
                    ? parsed.activeModuleId
                    : 1,
            xp: typeof parsed.xp === 'number' && parsed.xp >= 0 ? parsed.xp : 0,
            completedModules:
                parsed.completedModules && typeof parsed.completedModules === 'object'
                    ? parsed.completedModules
                    : {},
        };
    } catch {
        return DEFAULT_PROGRESS;
    }
}

export function useUserProgress() {
    const [progress, setProgress] = useState<UserProgressState>(readStoredProgress);

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        } catch {
            // Abaikan jika private mode membatasi storage
        }
    }, [progress]);

    const isOnboarded = progress.studentName.trim().length > 0;

    const completeOnboarding = useCallback((name: string, avatar: StudentAvatar) => {
        const cleanName = name.trim().slice(0, 32);
        if (!cleanName) return;
        setProgress((prev) => ({
            ...prev,
            studentName: cleanName,
            avatar,
        }));
    }, []);

    const resetOnboarding = useCallback(() => {
        setProgress((prev) => ({
            ...prev,
            studentName: '',
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
                const existing = prev.completedModules[moduleId];
                const previousBest = existing?.bestScore ?? 0;
                const deltaCorrect = Math.max(0, score - previousBest);
                const earnedXp = deltaCorrect * 15 + (existing ? 10 : 50);

                const nextCompleted: Record<number, ModuleScoreRecord> = {
                    ...prev.completedModules,
                    [moduleId]: {
                        bestScore: Math.max(previousBest, score),
                        totalQuestions,
                        completedAt: new Date().toISOString(),
                    },
                };

                const nextModuleId =
                    moduleId < totalModulesCount ? moduleId + 1 : moduleId;

                return {
                    ...prev,
                    xp: prev.xp + earnedXp,
                    completedModules: nextCompleted,
                    activeModuleId: Math.max(prev.activeModuleId, nextModuleId),
                };
            });
        },
        []
    );

    return {
        progress,
        isOnboarded,
        completeOnboarding,
        resetOnboarding,
        setActiveModule,
        recordQuizResult,
    };
}