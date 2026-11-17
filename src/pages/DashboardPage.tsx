import React, { useState } from "react";
import { Award, CalendarCheck, Loader2, RefreshCw, UserCheck } from "lucide-react";
import type {
  Language,
  MatchEntry,
  PlayerProfile,
  TechniqueAnalysis,
  TrainingPlan,
  WeeklySummary,
} from "../types/pitchmind.ts";
import { TRANSLATIONS } from "../data/i18n.ts";
import { SAMPLE_IMAGES, computeEarnedBadges } from "../data/seedData.ts";
import { ProgressRing, SkillRadarChart } from "../components/ProgressVisuals.tsx";
import type { PitchMindPage } from "../components/Navigation.tsx";

interface DashboardPageProps {
  profile: PlayerProfile;
  plan: TrainingPlan;
  matches: MatchEntry[];
  analyses: TechniqueAnalysis[];
  weeklySummary: WeeklySummary;
  streakDays: number;
  language: Language;
  onRefreshSummary: () => Promise<void>;
  onNavigate: (page: PitchMindPage) => void;
  onOpenProfile: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  profile,
  plan,
  matches,
  analyses,
  weeklySummary,
  streakDays,
  language,
  onRefreshSummary,
  onNavigate,
  onOpenProfile,
}) => {
  const t = TRANSLATIONS[language];
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const completedSessions = plan.sessions.filter((s) => s.status === "completed").length;
  const avgRating =
    matches.length > 0
      ? Number(
          (matches.reduce((acc, m) => acc + m.rating, 0) / matches.length).toFixed(1)
        )
      : 0;

  const badges = computeEarnedBadges({
    completedSessions,
    matchesCount: matches.length,
    analysesCount: analyses.length,
    streakDays,
  });
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await onRefreshSummary();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh summary.");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Editorial Hero Strip */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-emerald-950 bg-emerald-950">
        {!heroImgFailed ? (
          <img
            src={SAMPLE_IMAGES.heroPitch}
            alt="Football training pitch with cones and match ball"
            referrerPolicy="no-referrer"
            onError={() => setHeroImgFailed(true)}
            className="w-full h-52 sm:h-60 object-cover"
          />
        ) : (
          <div className="w-full h-52 sm:h-60 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/55 to-transparent flex flex-col justify-end p-5 sm:p-7">
          <p className="text-xs font-medium text-lime-400">
            {profile.name} · {profile.position} · {profile.dominantFoot} Foot ·{" "}
            <span className="capitalize">{profile.skillLevel}</span>
          </p>
          <div className="mt-1 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight [text-wrap:balance]">
                {t.dashboard.title}
              </h1>
              <p className="text-sm text-slate-200 mt-1 max-w-xl">
                {t.dashboard.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onOpenProfile}
                className="min-h-[44px] px-4 py-2 text-xs sm:text-sm font-medium rounded-xl bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <UserCheck className="w-4 h-4" />
                <span>{t.actions.editProfile}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate("plan")}
                className="min-h-[44px] px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>{t.nav.plan}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Column Progress Ring KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950">
          <ProgressRing
            value={streakDays}
            max={14}
            label={t.dashboard.streak}
            sublabel="Target: 7+ active days"
          />
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950">
          <ProgressRing
            value={completedSessions}
            max={Math.max(1, plan.sessions.length)}
            label={t.dashboard.weeklySessions}
            sublabel={`${plan.sessions.length} total in 4-week plan`}
          />
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950">
          <ProgressRing
            value={avgRating}
            max={10}
            label={t.dashboard.avgRating}
            sublabel={`${matches.length} matches logged`}
          />
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950">
          <ProgressRing
            value={unlockedCount}
            max={badges.length}
            label={t.dashboard.badgesEarned}
            sublabel={`${badges.length - unlockedCount} remaining`}
          />
        </div>
      </div>

      {/* Skill Radar + Weekly AI Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-1">
            {t.dashboard.skillRadar}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Compares your self-assessment sliders with AI coaching observations.
          </p>
          <SkillRadarChart
            selfRatings={profile.selfAssessment}
            aiRatings={weeklySummary.aiAssessedSkills}
            selfLabel={t.dashboard.selfLabel}
            aiLabel={t.dashboard.aiLabel}
          />
        </div>

        <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  {t.dashboard.weeklyReview}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Updated {new Date(weeklySummary.generatedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="min-h-[40px] px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-emerald-900 text-slate-800 dark:text-lime-400 hover:bg-slate-50 dark:hover:bg-emerald-950/60 inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {refreshing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>{t.dashboard.refreshSummary}</span>
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 mb-3">{error}</p>
            )}

            <p className="text-sm font-semibold text-emerald-900 dark:text-lime-300 mb-4">
              {weeklySummary.headline}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white mb-2">
                  What Improved
                </h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {weeklySummary.whatImproved.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-700 dark:text-lime-400 font-bold">+</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white mb-2">
                  Focus Next
                </h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {weeklySummary.focusNext.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 font-bold">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges & Technique Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-3">
            {t.dashboard.achievements}
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-emerald-950">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      badge.unlocked
                        ? "bg-emerald-900 text-lime-400 dark:bg-lime-400 dark:text-slate-950"
                        : "bg-slate-100 text-slate-400 dark:bg-[#0B0F0E] dark:text-slate-600"
                    }`}
                  >
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${
                        badge.unlocked
                          ? "text-slate-900 dark:text-white"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {badge.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {badge.detail}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium shrink-0 ${
                    badge.unlocked
                      ? "text-emerald-700 dark:text-lime-400"
                      : "text-slate-400"
                  }`}
                >
                  {badge.unlocked ? "Unlocked" : "Locked"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {t.dashboard.mediaTimeline}
            </h2>
            <button
              type="button"
              onClick={() => onNavigate("technique")}
              className="text-xs font-semibold text-emerald-800 dark:text-lime-400 hover:underline cursor-pointer"
            >
              Open Analyzer
            </button>
          </div>
          {analyses.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
              Upload your first photo or video in Technique Analysis to start tracking form history.
            </p>
          ) : (
            <div className="space-y-3">
              {analyses.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3.5 p-2.5 rounded-xl border border-slate-100 dark:border-emerald-950"
                >
                  <img
                    src={item.mediaPreviewUrl}
                    alt={`${item.category} technique frame`}
                    referrerPolicy="no-referrer"
                    className="w-16 h-12 rounded-lg object-cover bg-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {item.category}
                      </p>
                      <span className="font-mono tabular-nums text-xs font-bold text-emerald-800 dark:text-lime-400">
                        {item.overallScore}/100
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {new Date(item.createdAt).toLocaleDateString()} · {item.summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
