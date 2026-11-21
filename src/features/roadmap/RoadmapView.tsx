import React, { useMemo, useState, useCallback, memo } from 'react';
import { Check, Compass, Lock, Sparkles, Star, Sprout, Flame, Crown, Rocket } from 'lucide-react';
import type { ModuleScoreRecord } from '../../hooks/useUserProgress';
import { CustomSelect, type SelectOption } from '../../components/CustomSelect';
import { ProgressBar } from '../../components/ui/ProgressBar';
import manifest from '../../data/roadmap-manifest.json';

interface RoadmapViewProps {
    studentName: string;
    activeModuleId: number;
    completedModules: Record<number, ModuleScoreRecord>;
    onSelectModule: (moduleId: number) => void;
    onPrefetchModule: (moduleId: number) => void;
}

const ZONE_BANNERS: ReadonlyArray<{
    bg: string;
    iconBg: string;
    Icon: React.ComponentType<{ className?: string }>;
}> = [
        { bg: 'bg-emerald-500 shadow-[0_4px_0_#047857]', iconBg: 'bg-emerald-400/40', Icon: Sprout },
        { bg: 'bg-blue-600 shadow-[0_4px_0_#1d4ed8]', iconBg: 'bg-blue-500/40', Icon: Compass },
        { bg: 'bg-purple-600 shadow-[0_4px_0_#6d28d9]', iconBg: 'bg-purple-500/40', Icon: Flame },
        { bg: 'bg-orange-500 shadow-[0_4px_0_#c2410c]', iconBg: 'bg-orange-400/40', Icon: Crown },
    ];

// Pola zig-zag lembut (tengah -> kiri -> tengah -> kanan) + koordinat X SVG (viewBox 320)
const ZIGZAG_STEPS = [
    { shiftClass: 'translate-x-0', svgX: 160 },
    { shiftClass: '-translate-x-10 sm:-translate-x-14', svgX: 112 },
    { shiftClass: 'translate-x-0', svgX: 160 },
    { shiftClass: 'translate-x-10 sm:translate-x-14', svgX: 208 },
] as const;

const NODE_STEP_HEIGHT = 184; // Tinggi total tiap slot node + label agar garis SVG presisi ke titik tengah lingkaran

export const RoadmapView: React.FC<RoadmapViewProps> = memo(function RoadmapView({
    studentName,
    activeModuleId,
    completedModules,
    onSelectModule,
    onPrefetchModule,
}) {
    const [shakingModuleId, setShakingModuleId] = useState<number | null>(null);
    const [lockToast, setLockToast] = useState<string | null>(null);

    const totalModules = manifest.modules.length;
    const completedCount = Object.keys(completedModules).length;

    // Hitung batas maksimal pos yang terbuka (Pos 1 selalu terbuka, pos berikutnya terbuka setelah pos sebelumnya lulus)
    const unlockedModuleId = useMemo(() => {
        const completedIds = Object.keys(completedModules).map(Number).filter(Number.isFinite);
        const highestCompleted = completedIds.length > 0 ? Math.max(...completedIds) : 0;
        return Math.min(totalModules, Math.max(1, highestCompleted + 1));
    }, [completedModules, totalModules]);

    // Pos terdepan yang sedang dikerjakan saat ini
    const currentFrontId = useMemo(() => {
        if (activeModuleId <= unlockedModuleId && !completedModules[activeModuleId]) {
            return activeModuleId;
        }
        return unlockedModuleId;
    }, [activeModuleId, unlockedModuleId, completedModules]);

    const activeModuleMeta = useMemo(
        () => manifest.modules.find((m) => m.id === currentFrontId) ?? manifest.modules[0],
        [currentFrontId]
    );

    const triggerLockedFeedback = useCallback((modId: number) => {
        setShakingModuleId(null);
        requestAnimationFrame(() => setShakingModuleId(modId));
        setLockToast(`Selesaikan Pos ${modId - 1} dulu ya untuk membuka Pos ${modId}! 🔒`);
    }, []);

    // Auto-hide toast peringatan pos terkunci
    React.useEffect(() => {
        if (!lockToast) return;
        const timer = window.setTimeout(() => setLockToast(null), 2800);
        return () => window.clearTimeout(timer);
    }, [lockToast]);

    const handleNodeClick = useCallback(
        (modId: number) => {
            if (modId > unlockedModuleId) {
                triggerLockedFeedback(modId);
                return;
            }
            onSelectModule(modId);
        },
        [unlockedModuleId, triggerLockedFeedback, onSelectModule]
    );

    // Hanya tampilkan pos yang sudah terbuka di dropdown cepat agar pos terkunci tidak bisa dilompati
    const jumpOptions: SelectOption[] = useMemo(
        () =>
            manifest.modules
                .filter((mod) => mod.id <= unlockedModuleId)
                .map((mod) => {
                    const record = completedModules[mod.id];
                    return {
                        value: String(mod.id),
                        label: `Pos ${mod.id}: ${mod.title}`,
                        badge: record ? `${record.bestScore}/${record.totalQuestions} ⭐` : 'Aktif',
                    };
                }),
        [completedModules, unlockedModuleId]
    );

    return (
        <div className="space-y-7 animate-panel-enter pb-10">
            {/* Floating Toast Peringatan Pos Terkunci */}
            {lockToast && (
                <div
                    role="status"
                    aria-live="polite"
                    className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md px-4 py-3 rounded-2xl bg-slate-900/95 text-white border border-slate-700 shadow-xl text-xs sm:text-sm font-extrabold text-center animate-pop-in"
                >
                    {lockToast}
                </div>
            )}

            {/* Hero Adventure Progress Card */}
            <section className="tactile-card p-5 sm:p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <span className="block text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
                            Peta Petualangan Belajar
                        </span>
                        <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5 truncate">
                            Perjalanan Bahasa Arab {studentName}
                        </h1>
                    </div>

                    <div className="text-right shrink-0">
                        <span className="block text-base sm:text-lg font-extrabold text-emerald-600 tabular-nums">
                            {completedCount}/{totalModules}
                        </span>
                        <span className="block text-[11px] font-bold text-slate-500">Pos Lulus</span>
                    </div>
                </div>

                <ProgressBar
                    current={completedCount}
                    total={totalModules}
                    label="Progres pos petualangan"
                />

                {activeModuleMeta && (
                    <button
                        type="button"
                        onClick={() => handleNodeClick(activeModuleMeta.id)}
                        onMouseEnter={() => onPrefetchModule(activeModuleMeta.id)}
                        className="tactile-btn w-full min-h-12 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_4px_0_#3730a3] cursor-pointer"
                    >
                        <span>
                            Lanjut ke Pos {activeModuleMeta.id}: {activeModuleMeta.title}
                        </span>
                        <Rocket className="w-4 h-4 shrink-0" />
                    </button>
                )}

                {/* Quick Jump Selector (Hanya Pos Terbuka) */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-500 shrink-0">
                        Pilih Pos Terbuka ({unlockedModuleId}/{totalModules}):
                    </span>
                    <div className="flex-1 min-w-0">
                        <CustomSelect
                            options={jumpOptions}
                            value={String(currentFrontId)}
                            onChange={(val) => handleNodeClick(Number(val))}
                            ariaLabel="Pilih pos terbuka untuk langsung dipelajari"
                        />
                    </div>
                </div>
            </section>

            {/* Winding Path Zones */}
            <div className="space-y-9">
                {manifest.zones.map((zone, zoneIndex) => {
                    const zoneModules = manifest.modules.filter((m) => m.zoneId === zone.id);
                    const banner = ZONE_BANNERS[zoneIndex % ZONE_BANNERS.length]!;
                    const BannerIcon = banner.Icon;
                    const firstId = zoneModules[0]?.id ?? 1;
                    const lastId = zoneModules[zoneModules.length - 1]?.id ?? firstId;

                    // Kalkulasi dimensi SVG penghubung antar node dalam 1 zona
                    const svgHeight = Math.max(120, (zoneModules.length - 1) * NODE_STEP_HEIGHT + 80);

                    return (
                        <section key={zone.id} aria-labelledby={`zone-title-${zone.id}`} className="space-y-6">
                            {/* Colorful Duolingo-style Zone Header */}
                            <div
                                className={`rounded-3xl p-4 sm:p-5 text-white flex items-center justify-between gap-4 ${banner.bg}`}
                            >
                                <div className="min-w-0">
                                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                                        ZONA {zone.order}
                                    </span>
                                    <h2 id={`zone-title-${zone.id}`} className="text-base sm:text-lg font-extrabold">
                                        {zone.title}
                                    </h2>
                                    <p className="text-xs text-white/90 mt-0.5">
                                        Pos {firstId} – {lastId} • {zone.subtitle}
                                    </p>
                                </div>

                                <div
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${banner.iconBg}`}
                                >
                                    <BannerIcon className="w-6 h-6 text-white" />
                                </div>
                            </div>

                            {/* Winding Circular Nodes + Curved Dotted SVG Connector */}
                            <div className="relative flex flex-col items-center py-2">
                                {zoneModules.length > 1 && (
                                    <svg
                                        className="absolute top-10 left-1/2 -translate-x-1/2 w-[320px] pointer-events-none z-0"
                                        height={svgHeight}
                                        viewBox={`0 0 320 ${svgHeight}`}
                                        aria-hidden="true"
                                    >
                                        {zoneModules.slice(0, -1).map((modA, i) => {
                                            const modB = zoneModules[i + 1]!;
                                            const x1 = ZIGZAG_STEPS[i % ZIGZAG_STEPS.length]!.svgX;
                                            const y1 = 36 + i * NODE_STEP_HEIGHT;
                                            const x2 = ZIGZAG_STEPS[(i + 1) % ZIGZAG_STEPS.length]!.svgX;
                                            const y2 = 36 + (i + 1) * NODE_STEP_HEIGHT;
                                            const midY = (y1 + y2) / 2;

                                            const isPathCompleted = Boolean(completedModules[modA.id]) && modB.id <= unlockedModuleId;
                                            const isPathUnlocked = modB.id <= unlockedModuleId;
                                            const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

                                            if (isPathCompleted) {
                                                return (
                                                    <g key={`${modA.id}-${modB.id}`}>
                                                        <path
                                                            d={d}
                                                            fill="none"
                                                            stroke="#a7f3d0"
                                                            strokeWidth="12"
                                                            strokeLinecap="round"
                                                        />
                                                        <path
                                                            d={d}
                                                            fill="none"
                                                            stroke="#10b981"
                                                            strokeWidth="5"
                                                            strokeLinecap="round"
                                                            strokeDasharray="10 10"
                                                        />
                                                    </g>
                                                );
                                            }

                                            return (
                                                <path
                                                    key={`${modA.id}-${modB.id}`}
                                                    d={d}
                                                    fill="none"
                                                    stroke={isPathUnlocked ? '#93c5fd' : '#cbd5e1'}
                                                    strokeWidth="5"
                                                    strokeLinecap="round"
                                                    strokeDasharray="9 11"
                                                />
                                            );
                                        })}
                                    </svg>
                                )}

                                <div className="w-full flex flex-col items-center">
                                    {zoneModules.map((mod, idx) => {
                                        const record = completedModules[mod.id];
                                        const isCompleted = Boolean(record);
                                        const isLocked = mod.id > unlockedModuleId;
                                        const isCurrentFront = mod.id === currentFrontId && !isCompleted;
                                        const isShaking = shakingModuleId === mod.id;
                                        const offsetClass = ZIGZAG_STEPS[idx % ZIGZAG_STEPS.length]!.shiftClass;

                                        return (
                                            <div
                                                key={mod.id}
                                                style={{ minHeight: `${NODE_STEP_HEIGHT}px` }}
                                                className={`relative z-10 flex flex-col items-center justify-start transition-transform ${offsetClass}`}
                                            >
                                                {/* Floating "MULAI DI SINI!" Tooltip on Active Front Node */}
                                                {isCurrentFront && (
                                                    <div className="mb-2 px-3 py-1 rounded-xl bg-white border-2 border-amber-400 text-amber-600 text-[11px] font-extrabold uppercase tracking-wider shadow-sm animate-bounce">
                                                        MULAI DI SINI!
                                                    </div>
                                                )}

                                                {/* Circular Node Button */}
                                                <div className="relative flex items-center justify-center">
                                                    {isCurrentFront && (
                                                        <span
                                                            aria-hidden="true"
                                                            className="animate-pulse-ring absolute inset-0 rounded-full bg-amber-400/50 pointer-events-none"
                                                        />
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => handleNodeClick(mod.id)}
                                                        onMouseEnter={() => {
                                                            if (!isLocked) onPrefetchModule(mod.id);
                                                        }}
                                                        onFocus={() => {
                                                            if (!isLocked) onPrefetchModule(mod.id);
                                                        }}
                                                        aria-disabled={isLocked}
                                                        className={`tactile-btn relative w-18 h-18 rounded-full flex items-center justify-center border-4 transition-all ${isShaking ? 'animate-shake-x' : ''
                                                            } ${isLocked
                                                                ? 'bg-slate-200/95 border-slate-300 text-slate-400 shadow-[0_5px_0_#cbd5e1] cursor-not-allowed'
                                                                : isCurrentFront
                                                                    ? 'bg-amber-500 border-amber-200 text-white shadow-[0_6px_0_#b45309] ring-4 ring-amber-400/30 cursor-pointer'
                                                                    : isCompleted
                                                                        ? 'bg-emerald-500 border-emerald-200 text-white shadow-[0_6px_0_#047857] cursor-pointer'
                                                                        : 'bg-sky-500 border-sky-200 text-white shadow-[0_6px_0_#0369a1] cursor-pointer'
                                                            }`}
                                                        aria-label={
                                                            isLocked
                                                                ? `Pos ${mod.id}: ${mod.title} (Terkunci)`
                                                                : `Buka Pos ${mod.id}: ${mod.title}`
                                                        }
                                                    >
                                                        {isLocked ? (
                                                            <Lock className="w-7 h-7 stroke-[2.5]" />
                                                        ) : isCompleted ? (
                                                            <Check className="w-8 h-8 stroke-3" />
                                                        ) : isCurrentFront ? (
                                                            <Compass className="w-8 h-8" />
                                                        ) : (
                                                            <span className="text-xl font-extrabold tabular-nums">{mod.id}</span>
                                                        )}
                                                    </button>
                                                </div>

                                                {/* Node Label Card */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleNodeClick(mod.id)}
                                                    aria-disabled={isLocked}
                                                    className={`mt-2.5 px-3.5 py-2 rounded-2xl border text-center max-w-52 transition-colors ${isLocked
                                                            ? 'bg-white/75 border-slate-200 opacity-75 cursor-not-allowed'
                                                            : isCurrentFront
                                                                ? 'bg-amber-50/95 border-amber-300 shadow-xs cursor-pointer'
                                                                : isCompleted
                                                                    ? 'bg-emerald-50/90 border-emerald-200 cursor-pointer'
                                                                    : 'bg-white border-sky-200 hover:border-sky-300 cursor-pointer'
                                                        }`}
                                                >
                                                    <span
                                                        className={`block text-[10px] font-extrabold uppercase tracking-wider ${isLocked
                                                                ? 'text-slate-400'
                                                                : isCurrentFront
                                                                    ? 'text-amber-700'
                                                                    : isCompleted
                                                                        ? 'text-emerald-700'
                                                                        : 'text-sky-700'
                                                            }`}
                                                    >
                                                        POS {mod.id}
                                                    </span>
                                                    <span
                                                        className={`block text-xs sm:text-sm font-extrabold leading-snug mt-0.5 ${isLocked ? 'text-slate-400' : 'text-slate-900'
                                                            }`}
                                                    >
                                                        {mod.title}
                                                    </span>

                                                    {isLocked && (
                                                        <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold">
                                                            <Lock className="w-2.5 h-2.5" />
                                                            Terkunci
                                                        </span>
                                                    )}

                                                    {!isLocked && isCurrentFront && (
                                                        <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-white border border-amber-300 text-amber-700 text-[10px] font-extrabold">
                                                            <Sparkles className="w-2.5 h-2.5" />
                                                            Pos Aktif
                                                        </span>
                                                    )}

                                                    {record && (
                                                        <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-white border border-emerald-300 text-emerald-700 text-[10px] font-extrabold tabular-nums">
                                                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                                            Skor {record.bestScore}/{record.totalQuestions}
                                                        </span>
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
});