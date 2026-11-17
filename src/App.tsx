import { useEffect, useState } from "react";
import type {
  ChatMessage,
  Language,
  LoadEntry,
  MatchEntry,
  PlayerProfile,
  TacticalGuidance,
  TechniqueAnalysis,
  ThemeMode,
  TrainingPlan,
  WeeklySummary,
} from "./types/pitchmind.ts";
import {
  INITIAL_LOAD,
  INITIAL_MATCHES,
  INITIAL_PLAN,
  INITIAL_PROFILE,
  INITIAL_TACTICS,
  INITIAL_TECHNIQUE_ANALYSES,
  INITIAL_WEEKLY_SUMMARY,
} from "./data/seedData.ts";
import { useLocalStorage } from "./hooks/useLocalStorage.ts";
import { generateOrAdaptPlan, generateWeeklySummary } from "./services/aiClient.ts";
import { Navigation, type PitchMindPage } from "./components/Navigation.tsx";
import { ProfileOnboardingModal } from "./components/ProfileOnboardingModal.tsx";
import { DashboardPage } from "./pages/DashboardPage.tsx";
import { ChatPage } from "./pages/ChatPage.tsx";
import { TrainingPlanPage } from "./pages/TrainingPlanPage.tsx";
import { TechniquePage } from "./pages/TechniquePage.tsx";
import { TacticsPage } from "./pages/TacticsPage.tsx";
import { MatchLogPage } from "./pages/MatchLogPage.tsx";
import { FitnessRecoveryPage } from "./pages/FitnessRecoveryPage.tsx";
import { SettingsPage } from "./pages/SettingsPage.tsx";

const INITIAL_CHAT: ChatMessage[] = [
  {
    id: "welcome-1",
    role: "assistant",
    text: "Welcome to PitchMind. I know your profile, 4-week plan, and recent match notes. Tap a quick chip below or ask about your first touch, weak foot, tactics, or pre-match prep.",
    timestamp: "2026-11-17T09:00:00.000Z",
  },
];

export default function App() {
  const [activePage, setActivePage] = useState<PitchMindPage>("dashboard");
  const [theme, setTheme] = useLocalStorage<ThemeMode>("pitchmind_theme", "dark");
  const [language, setLanguage] = useLocalStorage<Language>("pitchmind_lang", "en");

  const [profile, setProfile] = useLocalStorage<PlayerProfile>(
    "pitchmind_profile",
    INITIAL_PROFILE
  );
  const [plan, setPlan] = useLocalStorage<TrainingPlan>(
    "pitchmind_plan",
    INITIAL_PLAN
  );
  const [analyses, setAnalyses] = useLocalStorage<TechniqueAnalysis[]>(
    "pitchmind_analyses",
    INITIAL_TECHNIQUE_ANALYSES
  );
  const [tactics, setTactics] = useLocalStorage<TacticalGuidance>(
    "pitchmind_tactics",
    INITIAL_TACTICS
  );
  const [matches, setMatches] = useLocalStorage<MatchEntry[]>(
    "pitchmind_matches",
    INITIAL_MATCHES
  );
  const [loadEntries, setLoadEntries] = useLocalStorage<LoadEntry[]>(
    "pitchmind_load",
    INITIAL_LOAD
  );
  const [chatMessages, setChatMessages] = useLocalStorage<ChatMessage[]>(
    "pitchmind_chat",
    INITIAL_CHAT
  );
  const [weeklySummary, setWeeklySummary] = useLocalStorage<WeeklySummary>(
    "pitchmind_weekly_summary",
    INITIAL_WEEKLY_SUMMARY
  );
  const [streakDays, setStreakDays] = useLocalStorage<number>(
    "pitchmind_streak",
    5
  );
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Sync Tailwind .dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Sync language & RTL/LTR direction on <html>
  useEffect(() => {
    const root = document.documentElement;
    root.lang = language;
    root.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const handleRegeneratePlan = async (adjustmentNote?: string) => {
    const completedCount = plan.sessions.filter((s) => s.status === "completed").length;
    const skippedCount = plan.sessions.filter((s) => s.status === "skipped").length;
    const nextPlan = await generateOrAdaptPlan({
      profile,
      adjustmentNote,
      completedCount,
      skippedCount,
      language,
    });
    setPlan(nextPlan);
  };

  const handleSaveProfile = async (
    updated: PlayerProfile,
    shouldRegeneratePlan: boolean
  ) => {
    setProfile(updated);
    setIsProfileOpen(false);
    if (shouldRegeneratePlan) {
      try {
        const nextPlan = await generateOrAdaptPlan({
          profile: updated,
          language,
        });
        setPlan(nextPlan);
      } catch {
        // Keep existing plan if network call fails; user can retry on Training tab
      }
    }
  };

  const handleUpdateSessionStatus = (
    sessionId: string,
    status: "completed" | "skipped" | "pending"
  ) => {
    const target = plan.sessions.find((s) => s.id === sessionId);
    setPlan((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === sessionId ? { ...s, status } : s
      ),
    }));
    if (status === "completed" && target) {
      setStreakDays((s) => s + 1);
      setLoadEntries((prev) => [
        {
          id: `load-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          label: target.title,
          minutes: target.totalMinutes,
          rpe: target.intensity === "High" ? 8 : target.intensity === "Low" ? 4 : 6,
          type: "Pitch",
        },
        ...prev,
      ]);
    }
  };

  const handleRefreshSummary = async () => {
    const weeklyMinutes = loadEntries.reduce((acc, e) => acc + e.minutes, 0);
    const nextSummary = await generateWeeklySummary({
      profile,
      plan,
      matches,
      weeklyMinutes,
      language,
    });
    setWeeklySummary(nextSummary);
  };

  const handleResetAll = () => {
    setProfile(INITIAL_PROFILE);
    setPlan(INITIAL_PLAN);
    setAnalyses(INITIAL_TECHNIQUE_ANALYSES);
    setTactics(INITIAL_TACTICS);
    setMatches(INITIAL_MATCHES);
    setLoadEntries(INITIAL_LOAD);
    setChatMessages(INITIAL_CHAT);
    setWeeklySummary(INITIAL_WEEKLY_SUMMARY);
    setStreakDays(5);
  };

  return (
    <div className="min-h-screen bg-[#F6F8F7] dark:bg-[#0B0F0E] text-slate-900 dark:text-slate-100 transition-colors">
      <Navigation
        activePage={activePage}
        onNavigate={setActivePage}
        onOpenProfile={() => setIsProfileOpen(true)}
        language={language}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-24 lg:pb-12">
        {activePage === "dashboard" && (
          <DashboardPage
            profile={profile}
            plan={plan}
            matches={matches}
            analyses={analyses}
            weeklySummary={weeklySummary}
            streakDays={streakDays}
            language={language}
            onRefreshSummary={handleRefreshSummary}
            onNavigate={setActivePage}
            onOpenProfile={() => setIsProfileOpen(true)}
          />
        )}

        {activePage === "plan" && (
          <TrainingPlanPage
            profile={profile}
            plan={plan}
            language={language}
            onUpdateSessionStatus={handleUpdateSessionStatus}
            onRegeneratePlan={handleRegeneratePlan}
          />
        )}

        {activePage === "technique" && (
          <TechniquePage
            profile={profile}
            analyses={analyses}
            onAddAnalysis={(a) => setAnalyses((prev) => [a, ...prev])}
            language={language}
          />
        )}

        {activePage === "tactics" && (
          <TacticsPage
            profile={profile}
            guidance={tactics}
            onGuidanceUpdate={setTactics}
            language={language}
          />
        )}

        {activePage === "matches" && (
          <MatchLogPage
            profile={profile}
            matches={matches}
            onAddMatch={(m) => setMatches((prev) => [m, ...prev])}
            language={language}
          />
        )}

        {activePage === "recovery" && (
          <FitnessRecoveryPage
            profile={profile}
            loadEntries={loadEntries}
            onAddLoad={(entry) => setLoadEntries((prev) => [entry, ...prev])}
            language={language}
          />
        )}

        {activePage === "chat" && (
          <ChatPage
            profile={profile}
            plan={plan}
            matches={matches}
            messages={chatMessages}
            onMessagesChange={setChatMessages}
            language={language}
          />
        )}

        {activePage === "settings" && (
          <SettingsPage
            theme={theme}
            onThemeChange={setTheme}
            language={language}
            onLanguageChange={setLanguage}
            profile={profile}
            onOpenProfile={() => setIsProfileOpen(true)}
            onResetAll={handleResetAll}
          />
        )}
      </main>

      <ProfileOnboardingModal
        isOpen={isProfileOpen}
        profile={profile}
        onSave={handleSaveProfile}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}
