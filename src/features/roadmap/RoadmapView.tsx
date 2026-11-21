import React, { useMemo, memo } from 'react';
import { CheckCircle2, Play, Sparkles, Award, Compass } from 'lucide-react';
import type { ModuleScoreRecord } from '../../hooks/useUserProgress';
import { CustomSelect, type SelectOption } from '../../components/CustomSelect';
import { ZoneBadge } from '../../components/ui/ZoneBadge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import manifest from '../../data/roadmap-manifest.json';

interface RoadmapViewProps {
    activeModuleId: number;
    completedModules: Record<number, ModuleScoreRecord>;
    onSelectModule: (moduleId: number) => void;
    onPrefetchModule: (moduleId: number) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = memo(function RoadmapView({
    activeModuleId,
    completedModules,
    onSelectModule,
    onPrefetchModule,
}) {
    const totalModules = manifest.modules.length;
    const completedCount = Object.keys(completedModules).length;

    const jumpOptions: SelectOption[] = useMemo(
        () =>
            manifest.modules.map((mod) => {
                const record = completedModules[mod.id];
                return {
                    value: String(mod.id),
                    label: `Module ${mod.id}: ${mod.title}`,
                    badge: record ? `${record.bestScore}/${record.totalQuestions}` : undefined,
                };
            }),
        [completedModules]
    );

    return (
        <div className="space-y-6 animate-panel-enter">
            <section className="tactile-card p-4 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs font-extrabold text-brand uppercase tracking-wider mb-1">
                            <Compass className="w-4 h-4 shrink-0" />
                            <span>Qalamis Curriculum Roadmap</span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                            {completedCount === totalModules
                                ? 'All 17 Modules Completed!'
                                : `Progress: ${completedCount} of ${totalModules} Modules Completed`}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-reward-soft border border-reward-border text-reward shrink-0 self-start sm:self-center">
                        <Award className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-extrabold tabular-nums">
                            {Math.round((completedCount / Math.max(1, totalModules)) * 100)}% Done
                        </span>
                    </div>
                </div>

                <ProgressBar
                    current={completedCount}
                    total={totalModules}
                    label="Overall Qalamis curriculum progress"
                />

                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-2.5">
                    <span className="text-xs font-extrabold text-slate-600 shrink-0">
                        Jump to Module:
                    </span>
                    <div className="flex-1 min-w-0">
                        <CustomSelect
                            options={jumpOptions}
                            value={String(activeModuleId)}
                            onChange={(val) => onSelectModule(Number(val))}
                            ariaLabel="Select a module to jump to"
                        />
                    </div>
                </div>
            </section>

            <div className="space-y-6">
                {manifest.zones.map((zone) => {
                    const zoneModules = manifest.modules.filter((m) => m.zoneId === zone.id);
                    return (
                        <section key={zone.id} aria-labelledby={`zone-heading-${zone.id}`} className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <ZoneBadge zoneId={zone.id} label={zone.title} />
                                        <span className="text-xs font-bold text-slate-500 tabular-nums">
                                            {zoneModules.length} Modules
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-600">{zone.subtitle}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {zoneModules.map((mod) => {
                                    const record = completedModules[mod.id];
                                    const isCurrent = mod.id === activeModuleId;
                                    const isCompleted = Boolean(record);

                                    return (
                                        <button
                                            key={mod.id}
                                            type="button"
                                            onClick={() => onSelectModule(mod.id)}
                                            onMouseEnter={() => onPrefetchModule(mod.id)}
                                            onFocus={() => onPrefetchModule(mod.id)}
                                            className={`tactile-card tactile-card-interactive p-4 text-left flex items-start justify-between gap-3 cursor-pointer ${isCurrent ? 'border-brand bg-brand-soft/30' : ''
                                                }`}
                                        >
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 tabular-nums ${isCompleted
                                                            ? 'bg-brand text-white'
                                                            : isCurrent
                                                                ? 'bg-reward text-white'
                                                                : 'bg-slate-100 text-slate-700'
                                                        }`}
                                                >
                                                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : mod.id}
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                                                            Module {mod.id}
                                                        </span>
                                                        {isCurrent && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-reward-soft text-reward border border-reward-border">
                                                                <Sparkles className="w-2.5 h-2.5" />
                                                                Active
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                                                        {mod.title}
                                                    </h3>
                                                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                                                        {mod.shortDesc}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                                                {record ? (
                                                    <span className="px-2 py-1 rounded-lg bg-brand-soft text-brand border border-brand-border text-xs font-extrabold tabular-nums whitespace-nowrap">
                                                        {record.bestScore}/{record.totalQuestions}
                                                    </span>
                                                ) : (
                                                    <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                                                        <Play className="w-4 h-4 fill-current" />
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
});