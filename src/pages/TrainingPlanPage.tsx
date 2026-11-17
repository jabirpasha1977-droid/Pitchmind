import React, { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  SkipForward,
} from "lucide-react";
import type { Language, PlayerProfile, TrainingPlan } from "../types/pitchmind.ts";
import { TRANSLATIONS } from "../data/i18n.ts";
import { AnimatedDrillDiagram } from "../components/AnimatedDrillDiagram.tsx";

interface TrainingPlanPageProps {
  profile: PlayerProfile;
  plan: TrainingPlan;
  language: Language;
  onUpdateSessionStatus: (
    sessionId: string,
    status: "completed" | "skipped" | "pending"
  ) => void;
  onRegeneratePlan: (adjustmentNote?: string) => Promise<void>;
}

export const TrainingPlanPage: React.FC<TrainingPlanPageProps> = ({
  profile,
  plan,
  language,
  onUpdateSessionStatus,
  onRegeneratePlan,
}) => {
  const t = TRANSLATIONS[language];
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [expandedSessionId, setExpandedSessionId] = useState<string>(
    plan.sessions[0]?.id ?? ""
  );
  const [customAdjust, setCustomAdjust] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const weekSessions = useMemo(
    () => plan.sessions.filter((s) => s.weekNumber === selectedWeek),
    [plan.sessions, selectedWeek]
  );

  const handleAdapt = async (note?: string) => {
    setIsWorking(true);
    setError(null);
    try {
      await onRegeneratePlan(note);
      setCustomAdjust("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to adapt plan.");
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Plan Generation Controls */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-emerald-700 dark:text-lime-400">
              {profile.position} · {profile.weeklyAvailability} days/wk ·{" "}
              {profile.equipment.join(", ")}
            </p>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {plan.title}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
              {plan.summary}
            </p>
          </div>

          <button
            type="button"
            disabled={isWorking}
            onClick={() => handleAdapt()}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-900 text-white hover:bg-emerald-800 dark:bg-lime-400 dark:text-slate-950 dark:hover:bg-lime-300 text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 whitespace-nowrap"
          >
            {isWorking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>{t.actions.generatePlan}</span>
          </button>
        </div>

        {/* Quick Plan Adaptation Controls */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-emerald-950 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 me-1">
              {t.plan.adjustLabel}:
            </span>
            {t.plan.adjustChips.map((chip) => (
              <button
                key={chip}
                type="button"
                disabled={isWorking}
                onClick={() => handleAdapt(chip)}
                className="min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-emerald-900 bg-slate-50 dark:bg-[#0B0F0E] text-slate-700 dark:text-slate-200 hover:border-emerald-700 dark:hover:border-lime-400 cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customAdjust.trim()) handleAdapt(customAdjust.trim());
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              value={customAdjust}
              onChange={(e) => setCustomAdjust(e.target.value)}
              placeholder={t.plan.adaptPrompt}
              className="flex-1 min-h-[44px] px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-emerald-900 bg-slate-50 dark:bg-[#0B0F0E] text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={isWorking || !customAdjust.trim()}
              className="min-h-[44px] px-4 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-emerald-900 text-slate-900 dark:text-lime-400 hover:bg-slate-50 dark:hover:bg-emerald-950/60 disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              Adapt Plan
            </button>
          </form>

          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        </div>
      </div>

      {/* Week 1-4 Selector */}
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((wk) => {
          const active = selectedWeek === wk;
          const wkItems = plan.sessions.filter((s) => s.weekNumber === wk);
          const done = wkItems.filter((s) => s.status === "completed").length;
          return (
            <button
              key={wk}
              type="button"
              onClick={() => {
                setSelectedWeek(wk);
                const first = plan.sessions.find((s) => s.weekNumber === wk);
                if (first) setExpandedSessionId(first.id);
              }}
              className={`min-h-[48px] p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                active
                  ? "bg-emerald-900 text-white border-emerald-900 dark:bg-lime-400 dark:text-slate-950 dark:border-lime-400"
                  : "bg-white dark:bg-[#161D1A] text-slate-800 dark:text-slate-200 border-slate-200 dark:border-emerald-950"
              }`}
            >
              <p className="text-xs font-semibold">
                {t.plan.weekPrefix} {wk}
              </p>
              <p
                className={`text-[11px] font-mono tabular-nums mt-0.5 ${
                  active ? "opacity-85" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {done}/{wkItems.length} done
              </p>
            </button>
          );
        })}
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {weekSessions.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950 text-sm text-slate-500 dark:text-slate-400">
            No sessions scheduled in Week {selectedWeek}. Tap &ldquo;{t.actions.generatePlan}&rdquo; above to build all 4 weeks.
          </div>
        ) : (
          weekSessions.map((session) => {
            const isExpanded = expandedSessionId === session.id;
            return (
              <div
                key={session.id}
                className="rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950 overflow-hidden"
              >
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedSessionId(isExpanded ? "" : session.id)
                    }
                    className="flex-1 text-left flex items-start justify-between gap-3 cursor-pointer"
                  >
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                        Week {session.weekNumber} · Day {session.dayNumber} ·{" "}
                        {session.totalMinutes} min · {session.intensity} Intensity ·{" "}
                        <span
                          className={
                            session.status === "completed"
                              ? "text-emerald-700 dark:text-lime-400 font-semibold"
                              : session.status === "skipped"
                                ? "text-amber-600 dark:text-amber-400"
                                : ""
                          }
                        >
                          {session.status === "completed"
                            ? t.plan.completed
                            : session.status === "skipped"
                              ? t.plan.skipped
                              : t.plan.pending}
                        </span>
                      </p>
                      <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                        {session.title}
                      </h2>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        Focus: {session.focus}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                    )}
                  </button>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSessionStatus(
                          session.id,
                          session.status === "completed" ? "pending" : "completed"
                        )
                      }
                      className={`min-h-[40px] px-3.5 py-2 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                        session.status === "completed"
                          ? "bg-emerald-900 text-white dark:bg-lime-400 dark:text-slate-950"
                          : "border border-slate-300 dark:border-emerald-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-emerald-950/60"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{t.plan.markComplete}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSessionStatus(
                          session.id,
                          session.status === "skipped" ? "pending" : "skipped"
                        )
                      }
                      className={`min-h-[40px] px-3 py-2 text-xs font-medium rounded-xl inline-flex items-center gap-1 cursor-pointer ${
                        session.status === "skipped"
                          ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                          : "border border-slate-200 dark:border-emerald-900 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                      <span>{t.plan.skip}</span>
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-emerald-950 divide-y divide-slate-100 dark:divide-emerald-950">
                    {session.drills.map((drill) => (
                      <div key={drill.id} className="p-4 sm:p-5 space-y-3">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold text-emerald-800 dark:text-lime-400">
                              {drill.phase} · {drill.difficulty} ·{" "}
                              <span className="font-mono tabular-nums">
                                {drill.durationMin} min
                              </span>{" "}
                              · {drill.reps}
                            </p>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                              {drill.name}
                            </h3>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Space: {drill.spaceRequired} · Equipment: {drill.equipmentNeeded}
                          </p>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {drill.description}
                        </p>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                          <div
                            className={`${
                              drill.diagram ? "lg:col-span-6" : "lg:col-span-12"
                            } grid grid-cols-1 sm:grid-cols-2 gap-4`}
                          >
                            <div>
                              <p className="text-xs font-semibold text-slate-900 dark:text-white mb-1.5">
                                Coaching Points
                              </p>
                              <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                                {drill.coachingPoints.map((pt, i) => (
                                  <li key={i}>• {pt}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-900 dark:text-white mb-1.5">
                                Common Mistakes
                              </p>
                              <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                                {drill.commonMistakes.map((mk, i) => (
                                  <li key={i}>× {mk}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {drill.diagram && (
                            <div className="lg:col-span-6">
                              <AnimatedDrillDiagram
                                pitchView={drill.diagram.pitchView}
                                nodes={drill.diagram.nodes}
                                steps={drill.diagram.steps}
                                title={drill.name}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
