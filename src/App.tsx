// src/App.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Compass, BookOpen, HelpCircle, Sparkles, WifiOff } from 'lucide-react';
import { loadModuleById } from './data/curriculum-loader';
import manifest from './data/roadmap-manifest.json';
import { useUserProgress } from './hooks/useUserProgress';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { OnboardingScreen } from './features/onboarding/OnboardingScreen';
import { RoadmapView } from './features/roadmap/RoadmapView';
import { LessonView, type LessonModuleData } from './features/lesson/LessonView';
import { QuizArena, type QuizModuleData } from './features/quiz/QuizArena';

type ActiveTab = 'roadmap' | 'lesson' | 'quiz';
type LoadedModule = LessonModuleData & QuizModuleData;

export default function App() {
  const {
    progress,
    isOnboarded,
    completeOnboarding,
    setActiveModule,
    recordQuizResult,
  } = useUserProgress();
  const isOnline = useNetworkStatus();

  const [activeTab, setActiveTab] = useState<ActiveTab>('lesson');
  const [currentModule, setCurrentModule] = useState<LoadedModule | null>(null);
  const [isLoadingModule, setIsLoadingModule] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const totalModules = manifest.modules.length;

  const prefetchModule = useCallback((moduleId: number) => {
    void loadModuleById(moduleId).catch(() => {
      // Prefetch bersifat opsional; error ditangani saat modul dibuka
    });
  }, []);

  const activeZoneLabel = useMemo(() => {
    if (!currentModule) return 'Learning Zone';
    return (
      manifest.zones.find((z) => z.id === currentModule.zoneId)?.title ?? 'Learning Zone'
    );
  }, [currentModule]);

  useEffect(() => {
    if (!isOnboarded) return;
    let isCancelled = false;

    setIsLoadingModule(true);
    setLoadError(null);

    loadModuleById(progress.activeModuleId)
      .then((mod) => {
        if (isCancelled) return;
        setCurrentModule(mod as unknown as LoadedModule);
        setIsLoadingModule(false);

        if (mod.id < totalModules) {
          prefetchModule(mod.id + 1);
        }
      })
      .catch(() => {
        if (isCancelled) return;
        setLoadError('Unable to load this module. Please check your connection.');
        setIsLoadingModule(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [isOnboarded, progress.activeModuleId, totalModules, prefetchModule]);

  const handleSelectModuleFromRoadmap = useCallback(
    (moduleId: number) => {
      setActiveModule(moduleId);
      setActiveTab('lesson');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setActiveModule]
  );

  const handleQuizComplete = useCallback(
    (score: number, total: number) => {
      if (!currentModule) return;
      recordQuizResult(currentModule.id, score, total, totalModules);
    },
    [currentModule, recordQuizResult, totalModules]
  );

  const handleGoToNextModule = useCallback(() => {
    if (!currentModule || currentModule.id >= totalModules) return;
    setActiveModule(currentModule.id + 1);
    setActiveTab('lesson');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentModule, totalModules, setActiveModule]);

  if (!isOnboarded) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  return (
    <div className="min-h-dvh flex flex-col bg-canvas text-slate-900">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90">
        <div className="max-w-3xl mx-auto px-4 h-15 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-brand text-white font-extrabold text-sm flex items-center justify-center shrink-0">
              {progress.studentName.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-slate-900 truncate">
                {progress.studentName}
              </p>
              <p className="text-[11px] font-bold text-slate-500 truncate tabular-nums">
                Module {progress.activeModuleId} of {totalModules}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isOnline && (
              <span
                title="Offline mode active"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-700 text-xs font-extrabold whitespace-nowrap"
              >
                <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Offline</span>
              </span>
            )}

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-reward-soft border border-reward-border text-reward text-xs font-extrabold tabular-nums whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{progress.xp} XP</span>
            </div>
          </div>
        </div>

        <nav
          aria-label="Primary learning navigation"
          className="max-w-3xl mx-auto px-4 pb-2.5 grid grid-cols-3 gap-2"
        >
          <button
            type="button"
            onClick={() => setActiveTab('roadmap')}
            aria-current={activeTab === 'roadmap' ? 'page' : undefined}
            className={`tactile-btn min-h-10.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 border-2 cursor-pointer ${activeTab === 'roadmap'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
          >
            <Compass className="w-4 h-4 shrink-0" />
            <span>Roadmap</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lesson')}
            aria-current={activeTab === 'lesson' ? 'page' : undefined}
            className={`tactile-btn min-h-10.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 border-2 cursor-pointer ${activeTab === 'lesson'
                ? 'bg-brand text-white border-brand'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Lesson</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quiz')}
            aria-current={activeTab === 'quiz' ? 'page' : undefined}
            className={`tactile-btn min-h-10.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 border-2 cursor-pointer ${activeTab === 'quiz'
                ? 'bg-reward text-white border-reward'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>Quiz</span>
          </button>
        </nav>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6">
        {activeTab === 'roadmap' ? (
          <RoadmapView
            activeModuleId={progress.activeModuleId}
            completedModules={progress.completedModules}
            onSelectModule={handleSelectModuleFromRoadmap}
            onPrefetchModule={prefetchModule}
          />
        ) : isLoadingModule ? (
          <div className="tactile-card p-8 text-center space-y-3" role="status">
            <div className="w-10 h-10 rounded-2xl bg-brand-soft text-brand mx-auto flex items-center justify-center animate-pulse">
              <BookOpen className="w-5 h-5" />
            </div>
            <p className="text-sm font-extrabold text-slate-700">
              Loading Module {progress.activeModuleId}...
            </p>
          </div>
        ) : loadError || !currentModule ? (
          <div className="tactile-card p-6 text-center space-y-3">
            <p className="text-sm font-bold text-rose-600">
              {loadError ?? 'Module not found.'}
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('roadmap')}
              className="tactile-btn min-h-11 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-extrabold cursor-pointer"
            >
              Back to Roadmap
            </button>
          </div>
        ) : activeTab === 'lesson' ? (
          <LessonView
            module={currentModule}
            zoneLabel={activeZoneLabel}
            onStartQuiz={() => {
              setActiveTab('quiz');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          <QuizArena
            key={`quiz-mod-${currentModule.id}`}
            module={currentModule}
            hasNextModule={currentModule.id < totalModules}
            onCompleteQuiz={handleQuizComplete}
            onBackToLesson={() => {
              setActiveTab('lesson');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNextModule={handleGoToNextModule}
          />
        )}
      </main>
    </div>
  );
}