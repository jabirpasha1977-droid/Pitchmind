import type {
  ChatMessage,
  FormationCode,
  Language,
  MatchEntry,
  PlayerProfile,
  PositionCode,
  TacticalGuidance,
  TechniqueAnalysis,
  TrainingPlan,
  WeeklySummary,
} from "../types/pitchmind.ts";

export async function streamCoachChat(params: {
  messages: ChatMessage[];
  profile: PlayerProfile;
  planSummary: string;
  recentMatches: MatchEntry[];
  language: Language;
  onChunk: (delta: string) => void;
}): Promise<void> {
  const res = await fetch("/api/coach/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: params.messages,
      profile: params.profile,
      planSummary: params.planSummary,
      recentMatches: params.recentMatches,
      language: params.language,
    }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || "Unable to connect to AI coach.");
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("Streaming response unavailable.");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.replace(/^data:\s*/, "");
      if (payload === "[DONE]") return;
      try {
        const parsed = JSON.parse(payload) as { text?: string; error?: string };
        if (parsed.error) throw new Error(parsed.error);
        if (parsed.text) params.onChunk(parsed.text);
      } catch (e) {
        if (e instanceof Error && !e.message.includes("JSON")) {
          throw e;
        }
      }
    }
  }
}

export async function generateOrAdaptPlan(params: {
  profile: PlayerProfile;
  adjustmentNote?: string;
  completedCount?: number;
  skippedCount?: number;
  language: Language;
}): Promise<TrainingPlan> {
  const res = await fetch("/api/coach/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to generate training plan.");
  return data.plan;
}

export async function analyzeTechniqueMedia(params: {
  frames: Array<{ base64: string; mimeType: string }>;
  category: TechniqueAnalysis["category"];
  notes?: string;
  profile: PlayerProfile;
  previousAnalysis?: TechniqueAnalysis;
  language: Language;
}): Promise<Omit<TechniqueAnalysis, "id" | "createdAt" | "mediaPreviewUrl" | "mediaType" | "category">> {
  const res = await fetch("/api/coach/analyze-technique", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      frames: params.frames,
      category: params.category,
      notes: params.notes,
      profile: params.profile,
      previousAnalysis: params.previousAnalysis
        ? {
            overallScore: params.previousAnalysis.overallScore,
            priorityFixes: params.previousAnalysis.priorityFixes,
          }
        : undefined,
      language: params.language,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to analyze technique.");
  return data.result;
}

export async function fetchTacticalGuidance(params: {
  profile: PlayerProfile;
  formation: FormationCode;
  position: PositionCode;
  boardTokensSummary: string;
  question?: string;
  language: Language;
}): Promise<TacticalGuidance> {
  const res = await fetch("/api/coach/tactics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load tactical guidance.");
  return data.guidance;
}

export async function generateMatchReview(params: {
  profile: PlayerProfile;
  match: Omit<MatchEntry, "id" | "aiReview">;
  language: Language;
}): Promise<NonNullable<MatchEntry["aiReview"]>> {
  const res = await fetch("/api/coach/match-review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to generate match review.");
  return data.aiReview;
}

export async function generateWeeklySummary(params: {
  profile: PlayerProfile;
  plan: TrainingPlan;
  matches: MatchEntry[];
  weeklyMinutes: number;
  language: Language;
}): Promise<WeeklySummary> {
  const res = await fetch("/api/coach/weekly-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to generate weekly summary.");
  return data.weeklySummary;
}
