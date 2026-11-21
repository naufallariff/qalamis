import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { BookOpen, Star, Award, WifiOff } from 'lucide-react';
import { loadModuleById } from './data/curriculum-loader';
import manifest from './data/roadmap-manifest.json';
import { useUserProgress, getLevelInfo } from './hooks/useUserProgress';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { OnboardingScreen } from './features/onboarding/OnboardingScreen';
import { RoadmapView } from './features/roadmap/RoadmapView';
import { LessonView, type LessonModuleData } from './features/lesson/LessonView';
import { QuizArena, type QuizModuleData } from './features/quiz/QuizArena';
import { QalamisLogo } from './components/ui/QalamisLogo';

type ActiveScreen = 'roadmap' | 'lesson' | 'quiz';
type LoadedModule = LessonModuleData & QuizModuleData;

export default function App() {
  const {
    progress,
    isOnboarded,
    completeOnboarding,
    resetOnboarding,
    setActiveModule,
    recordQuizResult,
  } = useUserProgress();
  const isOnline = useNetworkStatus();

  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('roadmap');
  const [currentModule, setCurrentModule] = useState<LoadedModule | null>(null);
  const [isLoadingModule, setIsLoadingModule] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // State & refs untuk Floating Navbar Auto-Hide saat scroll (60fps GPU transform)
  const [isNavHidden, setIsNavHidden] = useState<boolean>(false);
  const lastScrollY = useRef<number>(0);
  const scrollTicking = useRef<boolean>(false);

  const totalModules = manifest.modules.length;
  const completedCount = Object.keys(progress.completedModules).length;
  const levelInfo = useMemo(() => getLevelInfo(progress.xp), [progress.xp]);

  // Hitung batas maksimal pos yang sudah terbuka
  const unlockedModuleId = useMemo(() => {
    const completedIds = Object.keys(progress.completedModules)
      .map(Number)
      .filter(Number.isFinite);
    const highestCompleted = completedIds.length > 0 ? Math.max(...completedIds) : 0;
    return Math.min(totalModules, Math.max(1, highestCompleted + 1));
  }, [progress.completedModules, totalModules]);

  const effectiveActiveModuleId = Math.min(progress.activeModuleId, unlockedModuleId);

  // Listener scroll ringan dengan requestAnimationFrame
  useEffect(() => {
    if (!isOnboarded) return;

    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      if (scrollTicking.current) return;
      scrollTicking.current = true;

      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY.current;

        if (currentY <= 48) {
          setIsNavHidden(false);
        } else if (delta > 10) {
          setIsNavHidden(true);
        } else if (delta < -8) {
          setIsNavHidden(false);
        }

        lastScrollY.current = currentY;
        scrollTicking.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOnboarded]);

  // Selalu tampilkan navbar saat berpindah layar
  useEffect(() => {
    setIsNavHidden(false);
  }, [activeScreen]);

  const prefetchModule = useCallback((moduleId: number) => {
    void loadModuleById(moduleId).catch(() => { });
  }, []);

  const activeZoneLabel = useMemo(() => {
    if (!currentModule) return 'Zona Petualangan';
    return (
      manifest.zones.find((z) => z.id === currentModule.zoneId)?.title ?? 'Zona Petualangan'
    );
  }, [currentModule]);

  useEffect(() => {
    if (!isOnboarded) return;
    let isCancelled = false;

    setIsLoadingModule(true);
    setLoadError(null);

    loadModuleById(effectiveActiveModuleId)
      .then((mod) => {
        if (isCancelled) return;
        setCurrentModule(mod as unknown as LoadedModule);
        setIsLoadingModule(false);

        if (mod.id < unlockedModuleId) {
          prefetchModule(mod.id + 1);
        }
      })
      .catch(() => {
        if (isCancelled) return;
        setLoadError('Gagal memuat materi pos ini. Periksa koneksi internetmu ya!');
        setIsLoadingModule(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [isOnboarded, effectiveActiveModuleId, unlockedModuleId, prefetchModule]);

  const handleSelectModuleFromRoadmap = useCallback(
    (moduleId: number) => {
      if (moduleId > unlockedModuleId) return;
      setActiveModule(moduleId);
      setActiveScreen('lesson');
      setIsNavHidden(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [unlockedModuleId, setActiveModule]
  );

  const handleQuizComplete = useCallback(
    (score: number, total: number) => {
      if (!currentModule) return;
      recordQuizResult(currentModule.id, score, total, totalModules);
      if (currentModule.id < totalModules) {
        prefetchModule(currentModule.id + 1);
      }
    },
    [currentModule, recordQuizResult, totalModules, prefetchModule]
  );

  const handleGoToNextModule = useCallback(() => {
    if (!currentModule || currentModule.id >= totalModules) return;
    const nextId = currentModule.id + 1;
    if (!progress.completedModules[currentModule.id] && nextId > unlockedModuleId) return;

    setActiveModule(nextId);
    setActiveScreen('lesson');
    setIsNavHidden(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentModule, totalModules, progress.completedModules, unlockedModuleId, setActiveModule]);

  if (!isOnboarded) {
    return (
      <OnboardingScreen
        initialName={progress.studentName}
        initialAvatar={progress.avatar}
        onComplete={(name, avatar) => {
          completeOnboarding(name, avatar);
          setActiveScreen('roadmap');
        }}
      />
    );
  }

  return (
    <div className="min-h-dvh flex flex-col text-slate-900">
      {/* Gamified Floating Top Bar */}
      <header
        className={`sticky top-0 z-30 pt-3 px-4 transition-transform duration-200 ease-out will-change-transform ${isNavHidden ? 'translate-y-[-120%]' : 'translate-y-0'
          }`}
      >
        <div className="max-w-2xl mx-auto tactile-card px-3.5 py-2.5 flex items-center justify-between gap-2 bg-white/95 backdrop-blur-md">
          {/* Kiri: Brand Logo Qalamis -> Kembali ke Peta */}
          <button
            type="button"
            onClick={() => {
              setActiveScreen('roadmap');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer group"
          >
            <QalamisLogo variant="icon" size="md" className="group-hover:scale-105 transition-transform" />

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900">
                  Qalamis
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-extrabold whitespace-nowrap">
                  Lv.{levelInfo.level} {levelInfo.title}
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-500 truncate">
                Peta Petualangan Bahasa Arab
              </p>
            </div>
          </button>

          {/* Kanan: Offline + XP + Pos Lulus + Logo Profil (Klik untuk Pengaturan Profil) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {!isOnline && (
              <span
                title="Mode Offline Aktif"
                className="p-1.5 rounded-xl bg-slate-100 border border-slate-200 text-rose-600"
              >
                <WifiOff className="w-3.5 h-3.5" />
              </span>
            )}

            <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-extrabold tabular-nums whitespace-nowrap">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
              <span>{progress.xp} XP</span>
            </div>

            <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold tabular-nums whitespace-nowrap">
              <Award className="w-3.5 h-3.5 shrink-0" />
              <span>
                {completedCount}/{totalModules}
              </span>
            </div>

            <button
              type="button"
              onClick={resetOnboarding}
              title={`Pengaturan Profil (${progress.studentName}) — Ubah Nama & Karakter`}
              aria-label={`Pengaturan Profil ${progress.studentName}, klik untuk mengubah nama dan karakter`}
              className="tactile-btn inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer"
            >
              <span
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg shrink-0 border ${progress.avatar === 'girl'
                  ? 'bg-rose-50 border-rose-300'
                  : 'bg-sky-50 border-sky-300'
                  }`}
              >
                {progress.avatar === 'girl' ? '👧' : '👦'}
              </span>
              <span className="hidden md:inline text-xs font-extrabold text-slate-700 max-w-24 truncate">
                {progress.studentName}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-5">
        {activeScreen === 'roadmap' ? (
          <RoadmapView
            studentName={progress.studentName}
            activeModuleId={effectiveActiveModuleId}
            completedModules={progress.completedModules}
            onSelectModule={handleSelectModuleFromRoadmap}
            onPrefetchModule={prefetchModule}
          />
        ) : isLoadingModule ? (
          <div className="tactile-card p-8 text-center space-y-3" role="status">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center animate-pulse">
              <BookOpen className="w-5 h-5" />
            </div>
            <p className="text-sm font-extrabold text-slate-700">
              Menyiapkan materi Pos {effectiveActiveModuleId}...
            </p>
          </div>
        ) : loadError || !currentModule ? (
          <div className="tactile-card p-6 text-center space-y-3">
            <p className="text-sm font-bold text-rose-600">
              {loadError ?? 'Materi tidak ditemukan.'}
            </p>
            <button
              type="button"
              onClick={() => setActiveScreen('roadmap')}
              className="tactile-btn min-h-11 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-extrabold cursor-pointer"
            >
              Kembali ke Peta
            </button>
          </div>
        ) : activeScreen === 'lesson' ? (
          <LessonView
            studentName={progress.studentName}
            totalModules={totalModules}
            module={currentModule}
            zoneLabel={activeZoneLabel}
            onBackToRoadmap={() => {
              setActiveScreen('roadmap');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onStartQuiz={() => {
              setActiveScreen('quiz');
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
              setActiveScreen('lesson');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNextModule={handleGoToNextModule}
          />
        )}
      </main>
    </div>
  );
}