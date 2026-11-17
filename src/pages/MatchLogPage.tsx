import React, { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import type {
  Language,
  MatchEntry,
  PlayerProfile,
  PositionCode,
} from "../types/pitchmind.ts";
import { TRANSLATIONS } from "../data/i18n.ts";
import { POSITIONS } from "../data/seedData.ts";
import { MatchTrendChart } from "../components/ProgressVisuals.tsx";
import { generateMatchReview } from "../services/aiClient.ts";

interface MatchLogPageProps {
  profile: PlayerProfile;
  matches: MatchEntry[];
  onAddMatch: (match: MatchEntry) => void;
  language: Language;
}

export const MatchLogPage: React.FC<MatchLogPageProps> = ({
  profile,
  matches,
  onAddMatch,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [opponent, setOpponent] = useState("");
  const [minutesPlayed, setMinutesPlayed] = useState(75);
  const [position, setPosition] = useState<PositionCode>(profile.position);
  const [goals, setGoals] = useState(0);
  const [assists, setAssists] = useState(0);
  const [passesCompleted, setPassesCompleted] = useState(25);
  const [rating, setRating] = useState(7.5);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totals = matches.reduce(
    (acc, m) => ({
      minutes: acc.minutes + m.minutesPlayed,
      goals: acc.goals + m.goals,
      assists: acc.assists + m.assists,
      passes: acc.passes + m.passesCompleted,
    }),
    { minutes: 0, goals: 0, assists: 0, passes: 0 }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opponent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    const baseMatch: Omit<MatchEntry, "id" | "aiReview"> = {
      date: new Date().toISOString().slice(0, 10),
      opponent: opponent.trim(),
      minutesPlayed,
      position,
      goals,
      assists,
      passesCompleted,
      rating,
      notes: notes.trim(),
    };

    try {
      const aiReview = await generateMatchReview({
        profile,
        match: baseMatch,
        language,
      });
      onAddMatch({
        ...baseMatch,
        id: `match-${Date.now()}`,
        aiReview,
      });
      setOpponent("");
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate AI match review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          {t.matches.title}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          {t.matches.subtitle}
        </p>
      </div>

      {/* Season Summary + Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Matches</p>
            <p className="font-mono tabular-nums text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {matches.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Minutes</p>
            <p className="font-mono tabular-nums text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {totals.minutes}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Goals / Assists</p>
            <p className="font-mono tabular-nums text-2xl font-bold text-emerald-800 dark:text-lime-400 mt-0.5">
              {totals.goals} / {totals.assists}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Passes</p>
            <p className="font-mono tabular-nums text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {totals.passes}
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
            {t.matches.seasonTrends}
          </h2>
          <MatchTrendChart matches={matches} />
        </div>
      </div>

      {/* Log Match Form + Match Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950 space-y-4"
        >
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {t.matches.addMatch}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Opponent
              </label>
              <input
                type="text"
                required
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                placeholder="e.g., Riverside Rovers"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-emerald-900 bg-slate-50 dark:bg-[#0B0F0E] text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Position
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as PositionCode)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-emerald-900 bg-slate-50 dark:bg-[#0B0F0E] text-slate-900 dark:text-white"
              >
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Minutes
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={minutesPlayed}
                onChange={(e) => setMinutesPlayed(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums rounded-xl border border-slate-300 dark:border-emerald-900 bg-slate-50 dark:bg-[#0B0F0E] text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Goals
              </label>
              <input
                type="number"
                min={0}
                max={15}
                value={goals}
                onChange={(e) => setGoals(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums rounded-xl border border-slate-300 dark:border-emerald-900 bg-slate-50 dark:bg-[#0B0F0E] text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assists
              </label>
              <input
                type="number"
                min={0}
                max={15}
                value={assists}
                onChange={(e) => setAssists(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums rounded-xl border border-slate-300 dark:border-emerald-900 bg-slate-50 dark:bg-[#0B0F0E] text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Passes Completed
              </label>
              <input
                type="number"
                min={0}
                max={200}
                value={passesCompleted}
                onChange={(e) => setPassesCompleted(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums rounded-xl border border-slate-300 dark:border-emerald-900 bg-slate-50 dark:bg-[#0B0F0E] text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Self-Rating ({rating}/10)
              </label>
              <input
                type="number"
                step="0.1"
                min={1}
                max={10}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value) || 7)}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums rounded-xl border border-slate-300 dark:border-emerald-900 bg-slate-50 dark:bg-[#0B0F0E] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Match Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did your first touch, decisions, and stamina hold up?"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-emerald-900 bg-slate-50 dark:bg-[#0B0F0E] text-slate-900 dark:text-white"
            />
          </div>

          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || !opponent.trim()}
            className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-emerald-900 text-white hover:bg-emerald-800 dark:bg-lime-400 dark:text-slate-950 dark:hover:bg-lime-300 text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating AI Match Review...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Save &amp; Get AI Review</span>
              </>
            )}
          </button>
        </form>

        <div className="lg:col-span-7 space-y-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950 space-y-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-slate-100 dark:border-emerald-950">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                    {match.date} · {match.position} · {match.minutesPlayed} min
                  </p>
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    vs {match.opponent}
                  </h3>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <span className="text-lg font-bold text-emerald-800 dark:text-lime-400">
                    {match.rating}/10
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {match.goals}G · {match.assists}A · {match.passesCompleted} passes
                  </p>
                </div>
              </div>

              {match.notes && (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  &ldquo;{match.notes}&rdquo;
                </p>
              )}

              {match.aiReview && (
                <div className="space-y-3 pt-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    {match.aiReview.summary}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-semibold text-emerald-800 dark:text-lime-400 mb-1.5">
                        {t.matches.doneWell}
                      </p>
                      <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                        {match.aiReview.doneWell.map((x, i) => (
                          <li key={i}>+ {x}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-amber-700 dark:text-amber-400 mb-1.5">
                        {t.matches.toImprove}
                      </p>
                      <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                        {match.aiReview.toImprove.map((x, i) => (
                          <li key={i}>→ {x}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
