import React from "react";
import { Globe, Moon, RotateCcw, Sun, User } from "lucide-react";
import type { Language, PlayerProfile, ThemeMode } from "../types/pitchmind.ts";
import { TRANSLATIONS } from "../data/i18n.ts";

interface SettingsPageProps {
  theme: ThemeMode;
  onThemeChange: (t: ThemeMode) => void;
  language: Language;
  onLanguageChange: (l: Language) => void;
  profile: PlayerProfile;
  onOpenProfile: () => void;
  onResetAll: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  theme,
  onThemeChange,
  language,
  onLanguageChange,
  profile,
  onOpenProfile,
  onResetAll,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          {t.settings.title}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          {t.settings.subtitle}
        </p>
      </div>

      {/* Appearance & Language */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {t.settings.appearance}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High-contrast pitch charcoal dark mode or crisp daylight light mode.
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#0B0F0E] border border-slate-200 dark:border-emerald-900">
            <button
              type="button"
              onClick={() => onThemeChange("light")}
              className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer ${
                theme === "light"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => onThemeChange("dark")}
              className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer ${
                theme === "dark"
                  ? "bg-lime-400 text-slate-950"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {t.settings.languageLabel}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Switches interface copy, AI coaching responses, and RTL layout direction.
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#0B0F0E] border border-slate-200 dark:border-emerald-900">
            <button
              type="button"
              onClick={() => onLanguageChange("en")}
              className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer ${
                language === "en"
                  ? "bg-emerald-900 text-white dark:bg-lime-400 dark:text-slate-950"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>English (LTR)</span>
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange("ar")}
              className={`min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer ${
                language === "ar"
                  ? "bg-emerald-900 text-white dark:bg-lime-400 dark:text-slate-950"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>العربية (RTL)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Player Profile Summary */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            {t.settings.profileSection}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {profile.name} · Age {profile.age} · {profile.position} ·{" "}
            {profile.dominantFoot} Foot · {profile.weeklyAvailability} sessions/wk
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenProfile}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-900 text-white dark:bg-lime-400 dark:text-slate-950 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shrink-0"
        >
          <User className="w-4 h-4" />
          <span>{t.actions.editProfile}</span>
        </button>
      </div>

      {/* AI Connection Note & Local Data Reset */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            {t.settings.aiNoteTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {t.settings.aiNoteBody}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-emerald-950 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            All player data, training logs, and match reviews persist in localStorage.
          </p>
          <button
            type="button"
            onClick={onResetAll}
            className="min-h-[40px] px-3.5 py-2 rounded-xl border border-red-300 dark:border-red-900 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.settings.resetData}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
