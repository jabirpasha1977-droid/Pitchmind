import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, Droplets, Plus } from "lucide-react";
import type { Language, LoadEntry, PlayerProfile } from "../types/pitchmind.ts";
import { TRANSLATIONS } from "../data/i18n.ts";
import {
  CONDITIONING_MODULES,
  NUTRITION_GUIDE,
  RECOVERY_PROTOCOLS,
} from "../data/seedData.ts";

interface FitnessRecoveryPageProps {
  profile: PlayerProfile;
  loadEntries: LoadEntry[];
  onAddLoad: (entry: LoadEntry) => void;
  language: Language;
}

export const FitnessRecoveryPage: React.FC<FitnessRecoveryPageProps> = ({
  profile,
  loadEntries,
  onAddLoad,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [label, setLabel] = useState("Pitch Conditioning");
  const [minutes, setMinutes] = useState(40);
  const [rpe, setRpe] = useState(7);
  const [type, setType] = useState<LoadEntry["type"]>("Conditioning");
  const [waterGlasses, setWaterGlasses] = useState(5);

  const totalMinutes = loadEntries.reduce((acc, e) => acc + e.minutes, 0);
  const totalLoadUnits = loadEntries.reduce((acc, e) => acc + e.minutes * e.rpe, 0);
  const safeThreshold = profile.age < 18 ? 1600 : 2100;
  const isOverload = totalLoadUnits > safeThreshold || loadEntries.length >= 6;

  const handleAddLoad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    onAddLoad({
      id: `load-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      label: label.trim(),
      minutes,
      rpe,
      type,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          {t.recovery.title}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          {t.recovery.subtitle}
        </p>
      </div>

      {/* Non-Medical Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-950 dark:text-amber-200">
        {t.recovery.disclaimer}
      </div>

      {/* Weekly Load Tracker & Hydration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {t.recovery.weeklyLoad}
            </h2>
            <span className="font-mono tabular-nums text-xs font-semibold text-slate-600 dark:text-slate-300">
              {loadEntries.length} sessions · {totalMinutes} min · {totalLoadUnits} AU
            </span>
          </div>

          <div
            className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs font-medium ${
              isOverload
                ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200"
                : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-lime-300"
            }`}
          >
            {isOverload ? (
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span>{isOverload ? t.recovery.overtrainingWarn : t.recovery.loadHealthy}</span>
          </div>

          <form
            onSubmit={handleAddLoad}
            className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end"
          >
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Session Name
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-emerald-900 bg-slate-50 dark:bg-[#0B0F0E] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Min / RPE (1-10)
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  min={5}
                  max={150}
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value) || 30)}
                  className="w-full px-2.5 py-2 text-sm font-mono tabular-nums rounded-xl border border-slate-300 dark:border-emerald-900 bg-slate-50 dark:bg-[#0B0F0E] text-slate-900 dark:text-white"
                />
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={rpe}
                  onChange={(e) => setRpe(Number(e.target.value) || 5)}
                  className="w-16 px-2.5 py-2 text-sm font-mono tabular-nums rounded-xl border border-slate-300 dark:border-emerald-900 bg-slate-50 dark:bg-[#0B0F0E] text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="min-h-[40px] px-3 py-2 rounded-xl bg-emerald-900 text-white hover:bg-emerald-800 dark:bg-lime-400 dark:text-slate-950 text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Load</span>
            </button>
          </form>

          <div className="divide-y divide-slate-100 dark:divide-emerald-950">
            {loadEntries.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="py-2.5 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {entry.label}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 ms-2">
                    {entry.date} · {entry.type}
                  </span>
                </div>
                <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                  {entry.minutes}m · RPE {entry.rpe}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hydration & Sleep Target */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Daily Hydration Tracker
            </h2>
            <Droplets className="w-5 h-5 text-emerald-700 dark:text-lime-400" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Target: 8–10 glasses (2.5–3L) on training days. Tap to log intake:
          </p>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }, (_, idx) => {
              const filled = idx < waterGlasses;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setWaterGlasses(idx + 1)}
                  className={`min-h-[44px] rounded-xl font-mono tabular-nums text-xs font-semibold border cursor-pointer transition-colors ${
                    filled
                      ? "bg-emerald-900 text-white border-emerald-900 dark:bg-lime-400 dark:text-slate-950 dark:border-lime-400"
                      : "bg-slate-50 dark:bg-[#0B0F0E] text-slate-500 border-slate-200 dark:border-emerald-900"
                  }`}
                >
                  {(idx + 1) * 250}ml
                </button>
              );
            })}
          </div>
          <p className="text-xs font-mono tabular-nums text-emerald-800 dark:text-lime-400 font-semibold">
            Logged today: {(waterGlasses * 0.25).toFixed(2)} L
          </p>
        </div>
      </div>

      {/* Conditioning, Nutrition, Recovery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950 space-y-3">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {t.recovery.conditioning}
          </h2>
          <div className="space-y-3">
            {CONDITIONING_MODULES.map((mod) => (
              <div
                key={mod.name}
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F0E] border border-slate-100 dark:border-emerald-950 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {mod.name}
                  </p>
                  <span className="font-mono tabular-nums text-[11px] text-emerald-800 dark:text-lime-400">
                    {mod.duration}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">{mod.sets}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Cue: {mod.cue}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950 space-y-3">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {t.recovery.nutrition}
          </h2>
          <div className="space-y-3">
            {NUTRITION_GUIDE.map((item) => (
              <div
                key={item.window}
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F0E] border border-slate-100 dark:border-emerald-950 space-y-1"
              >
                <p className="text-xs font-bold text-emerald-900 dark:text-lime-400">
                  {item.window}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.guidance}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950 space-y-3">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {t.recovery.recoveryRoutine}
          </h2>
          <div className="space-y-3">
            {RECOVERY_PROTOCOLS.map((item) => (
              <div
                key={item.title}
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F0E] border border-slate-100 dark:border-emerald-950 space-y-1"
              >
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {item.title}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
