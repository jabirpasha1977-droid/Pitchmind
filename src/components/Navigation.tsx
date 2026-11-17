import React from "react";
import {
  Activity,
  BarChart3,
  Camera,
  CalendarDays,
  Compass,
  MessageSquare,
  Settings,
  Trophy,
} from "lucide-react";
import type { Language } from "../types/pitchmind.ts";
import { TRANSLATIONS } from "../data/i18n.ts";

export type PitchMindPage =
  | "dashboard"
  | "plan"
  | "technique"
  | "tactics"
  | "matches"
  | "recovery"
  | "chat"
  | "settings";

interface NavigationProps {
  activePage: PitchMindPage;
  onNavigate: (page: PitchMindPage) => void;
  onOpenProfile: () => void;
  language: Language;
}

export const Navigation: React.FC<NavigationProps> = ({
  activePage,
  onNavigate,
  onOpenProfile,
  language,
}) => {
  const t = TRANSLATIONS[language];

  const desktopLinks: Array<{ id: PitchMindPage; label: string }> = [
    { id: "dashboard", label: t.nav.dashboard },
    { id: "plan", label: t.nav.plan },
    { id: "technique", label: t.nav.technique },
    { id: "tactics", label: t.nav.tactics },
    { id: "matches", label: t.nav.matches },
    { id: "recovery", label: t.nav.recovery },
    { id: "chat", label: t.nav.chat },
  ];

  const mobileTabs: Array<{
    id: PitchMindPage;
    label: string;
    icon: React.FC<{ className?: string }>;
  }> = [
    { id: "dashboard", label: t.nav.dashboard, icon: BarChart3 },
    { id: "plan", label: t.nav.plan, icon: CalendarDays },
    { id: "technique", label: t.nav.technique, icon: Camera },
    { id: "tactics", label: t.nav.tactics, icon: Compass },
    { id: "chat", label: t.nav.chat, icon: MessageSquare },
  ];

  return (
    <>
      {/* Desktop & Mobile Top Header (non-sticky on mobile to preserve 85%+ scrollable viewport) */}
      <header className="relative md:sticky top-0 z-30 bg-white/95 dark:bg-[#111614]/95 backdrop-blur-md border-b border-slate-200 dark:border-emerald-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => onNavigate("dashboard")}
            className="font-display text-xl font-bold tracking-tight text-emerald-950 dark:text-lime-400 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-500"
          >
            {t.brand}
          </button>

          {/* Zone 2: Desktop Single-Line Navigation Links */}
          <nav
            aria-label="Main navigation"
            className="hidden lg:flex items-center gap-6 overflow-x-auto"
          >
            {desktopLinks.map((item) => {
              const active = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    active
                      ? "text-emerald-900 dark:text-lime-400 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-[1px] h-0.5 bg-emerald-700 dark:bg-lime-400"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile/Tablet Secondary Route Shortcuts */}
          <div className="flex lg:hidden items-center gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => onNavigate("matches")}
              aria-label={t.nav.matches}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                activePage === "matches"
                  ? "text-emerald-800 dark:text-lime-400 bg-emerald-50 dark:bg-emerald-950/60"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <Trophy className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate("recovery")}
              aria-label={t.nav.recovery}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                activePage === "recovery"
                  ? "text-emerald-800 dark:text-lime-400 bg-emerald-50 dark:bg-emerald-950/60"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <Activity className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate("settings")}
              aria-label={t.nav.settings}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                activePage === "settings"
                  ? "text-emerald-800 dark:text-lime-400 bg-emerald-50 dark:bg-emerald-950/60"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Zone 3: Single Primary Action */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate("settings")}
              aria-label={t.nav.settings}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                activePage === "settings"
                  ? "text-emerald-800 dark:text-lime-400 bg-slate-100 dark:bg-emerald-950/60"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenProfile}
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-900 text-white hover:bg-emerald-800 dark:bg-lime-400 dark:text-slate-950 dark:hover:bg-lime-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.actions.editProfile}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Tab Bar (56px height = <9% of viewport height) */}
      <nav
        aria-label="Mobile thumb navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-white/95 dark:bg-[#111614]/95 backdrop-blur-md border-t border-slate-200 dark:border-emerald-950 grid grid-cols-5 items-center"
      >
        {mobileTabs.map((tab) => {
          const Icon = tab.icon;
          const active = activePage === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
                active
                  ? "text-emerald-800 dark:text-lime-400 font-semibold"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] tracking-tight whitespace-nowrap truncate max-w-[64px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
