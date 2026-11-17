import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
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
  TrainingSession,
  WeeklySummary,
} from "./src/types/pitchmind.ts";
import {
  buildChatSystemPrompt,
  buildMatchReviewPrompt,
  buildPlanGenerationPrompt,
  buildTacticsPrompt,
  buildTechniqueAnalysisPrompt,
  buildWeeklySummaryPrompt,
} from "./src/prompts/coachTemplates.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please attach your API key in Settings > Secrets."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function formatApiError(error: unknown): { status: number; message: string } {
  const raw = error instanceof Error ? error.message : String(error);
  const lower = raw.toLowerCase();

  if (
    lower.includes("api_key_invalid") ||
    lower.includes("permission_denied") ||
    lower.includes("not configured")
  ) {
    return {
      status: 403,
      message:
        "Gemini API key is missing or invalid. Please verify your key in Settings > Secrets.",
    };
  }
  if (lower.includes("resource_exhausted") || lower.includes("429")) {
    return {
      status: 429,
      message: "Gemini API rate limit reached. Please wait a few seconds and retry.",
    };
  }
  if (lower.includes("not_found") || lower.includes("404")) {
    return {
      status: 404,
      message: "Requested Gemini model could not be reached.",
    };
  }
  return {
    status: 500,
    message: raw || "Unexpected AI coaching error.",
  };
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message.toLowerCase() : "";
      if (msg.includes("api_key_invalid") || msg.includes("permission_denied")) {
        throw err;
      }
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 450 * (attempt + 1)));
      }
    }
  }
  throw lastErr;
}

const app = express();
app.use(express.json({ limit: "20mb" }));

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// 1. Streaming AI Coach Chat
app.post("/api/coach/chat", async (req: Request, res: Response) => {
  try {
    const { messages, profile, planSummary, recentMatches, language } = req.body as {
      messages?: ChatMessage[];
      profile?: PlayerProfile;
      planSummary?: string;
      recentMatches?: MatchEntry[];
      language?: Language;
    };

    if (!messages || messages.length === 0 || !profile) {
      res.status(400).json({ error: "Messages and player profile are required." });
      return;
    }

    const ai = getAiClient();
    const systemInstruction = buildChatSystemPrompt({
      profile,
      planSummary,
      recentMatches,
      language: language || "en",
    });

    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text }],
    }));

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await ai.models.generateContentStream({
      model: "gemini-4-hydrogen",
      contents,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    const formatted = formatApiError(err);
    if (!res.headersSent) {
      res.status(formatted.status).json({ error: formatted.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: formatted.message })}\n\n`);
      res.end();
    }
  }
});

// 2. Generate or Adapt 4-Week Training Plan
app.post("/api/coach/plan", async (req: Request, res: Response) => {
  try {
    const { profile, adjustmentNote, completedCount, skippedCount, language } = req.body as {
      profile?: PlayerProfile;
      adjustmentNote?: string;
      completedCount?: number;
      skippedCount?: number;
      language?: Language;
    };

    if (!profile) {
      res.status(400).json({ error: "Player profile is required." });
      return;
    }

    const ai = getAiClient();
    const prompt = buildPlanGenerationPrompt({
      profile,
      adjustmentNote,
      completedCount,
      skippedCount,
      language: language || "en",
    });

    const response = await withRetry(() =>
      ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              sessions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    weekNumber: { type: Type.INTEGER },
                    dayNumber: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    focus: { type: Type.STRING },
                    totalMinutes: { type: Type.INTEGER },
                    intensity: { type: Type.STRING },
                    drills: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          phase: { type: Type.STRING },
                          name: { type: Type.STRING },
                          description: { type: Type.STRING },
                          durationMin: { type: Type.INTEGER },
                          reps: { type: Type.STRING },
                          spaceRequired: { type: Type.STRING },
                          equipmentNeeded: { type: Type.STRING },
                          difficulty: { type: Type.STRING },
                          coachingPoints: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                          },
                          commonMistakes: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                          },
                          diagram: {
                            type: Type.OBJECT,
                            properties: {
                              pitchView: { type: Type.STRING },
                              nodes: {
                                type: Type.ARRAY,
                                items: {
                                  type: Type.OBJECT,
                                  properties: {
                                    id: { type: Type.STRING },
                                    role: { type: Type.STRING },
                                    label: { type: Type.STRING },
                                    x: { type: Type.NUMBER },
                                    y: { type: Type.NUMBER },
                                  },
                                  required: ["id", "role", "label", "x", "y"],
                                },
                              },
                              steps: {
                                type: Type.ARRAY,
                                items: {
                                  type: Type.OBJECT,
                                  properties: {
                                    stepNumber: { type: Type.INTEGER },
                                    title: { type: Type.STRING },
                                    cue: { type: Type.STRING },
                                    ballType: { type: Type.STRING },
                                    ballStart: {
                                      type: Type.OBJECT,
                                      properties: {
                                        x: { type: Type.NUMBER },
                                        y: { type: Type.NUMBER },
                                      },
                                      required: ["x", "y"],
                                    },
                                    ballEnd: {
                                      type: Type.OBJECT,
                                      properties: {
                                        x: { type: Type.NUMBER },
                                        y: { type: Type.NUMBER },
                                      },
                                      required: ["x", "y"],
                                    },
                                  },
                                  required: [
                                    "stepNumber",
                                    "title",
                                    "cue",
                                    "ballType",
                                    "ballStart",
                                    "ballEnd",
                                  ],
                                },
                              },
                            },
                            required: ["pitchView", "nodes", "steps"],
                          },
                        },
                        required: [
                          "phase",
                          "name",
                          "description",
                          "durationMin",
                          "reps",
                          "spaceRequired",
                          "equipmentNeeded",
                          "difficulty",
                          "coachingPoints",
                          "commonMistakes",
                        ],
                      },
                    },
                  },
                  required: [
                    "weekNumber",
                    "dayNumber",
                    "title",
                    "focus",
                    "totalMinutes",
                    "intensity",
                    "drills",
                  ],
                },
              },
            },
            required: ["title", "summary", "sessions"],
          },
        },
      })
    );

    const raw = JSON.parse((response.text ?? "{}").trim()) as {
      title: string;
      summary: string;
      sessions: Array<Omit<TrainingSession, "id" | "status">>;
    };

    const plan: TrainingPlan = {
      id: `plan-${Date.now()}`,
      title: raw.title || "4-Week Personalized Football Plan",
      summary: raw.summary || "Tailored progressive football training plan.",
      createdAt: new Date().toISOString(),
      lastAdaptedAt: adjustmentNote ? new Date().toISOString() : undefined,
      weeksCount: 4,
      sessions: (raw.sessions || []).map((s, sIdx) => ({
        id: `session-w${s.weekNumber}-d${s.dayNumber}-${sIdx}`,
        weekNumber: Math.max(1, Math.min(4, s.weekNumber || Math.floor(sIdx / 3) + 1)),
        dayNumber: s.dayNumber || (sIdx % 3) + 1,
        title: s.title,
        focus: s.focus,
        totalMinutes: s.totalMinutes || 45,
        intensity: (["Low", "Moderate", "High"].includes(s.intensity)
          ? s.intensity
          : "Moderate") as "Low" | "Moderate" | "High",
        status: "pending",
        drills: (s.drills || []).map((d, dIdx) => ({
          ...d,
          id: `drill-${sIdx}-${dIdx}-${Date.now()}`,
          phase: (["Warm-up", "Technical", "Physical", "Game-Situation", "Cool-down"].includes(
            d.phase
          )
            ? d.phase
            : "Technical") as TrainingSession["drills"][number]["phase"],
          difficulty: (["Foundational", "Moderate", "Match Speed"].includes(d.difficulty)
            ? d.difficulty
            : "Moderate") as TrainingSession["drills"][number]["difficulty"],
          diagram: d.diagram
            ? {
                pitchView: d.diagram.pitchView === "full" ? "full" : "attacking-half",
                nodes: (d.diagram.nodes || []).map((n, ni) => ({
                  id: n.id || `n-${ni}`,
                  role: (["player", "teammate", "defender", "cone", "target"].includes(n.role)
                    ? n.role
                    : "cone") as "player" | "teammate" | "defender" | "cone" | "target",
                  label: n.label || `N${ni + 1}`,
                  x: Math.max(8, Math.min(92, Number(n.x) || 50)),
                  y: Math.max(8, Math.min(92, Number(n.y) || 50)),
                })),
                steps: (d.diagram.steps || []).map((st, si) => ({
                  stepNumber: si + 1,
                  title: st.title,
                  cue: st.cue,
                  ballType: (["pass", "dribble", "shot", "movement"].includes(st.ballType)
                    ? st.ballType
                    : "pass") as "pass" | "dribble" | "shot" | "movement",
                  ballStart: {
                    x: Math.max(8, Math.min(92, Number(st.ballStart?.x) || 50)),
                    y: Math.max(8, Math.min(92, Number(st.ballStart?.y) || 70)),
                  },
                  ballEnd: {
                    x: Math.max(8, Math.min(92, Number(st.ballEnd?.x) || 50)),
                    y: Math.max(8, Math.min(92, Number(st.ballEnd?.y) || 35)),
                  },
                })),
              }
            : undefined,
        })),
      })),
    };

    res.json({ plan });
  } catch (err) {
    const formatted = formatApiError(err);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

// 3. Multimodal Technique Analysis (Photos or Extracted Video Frames)
app.post("/api/coach/analyze-technique", async (req: Request, res: Response) => {
  try {
    const {
      frames,
      category,
      notes,
      profile,
      previousAnalysis,
      language,
    } = req.body as {
      frames?: Array<{ base64: string; mimeType: string }>;
      category?: TechniqueAnalysis["category"];
      notes?: string;
      profile?: PlayerProfile;
      previousAnalysis?: { overallScore: number; priorityFixes: Array<{ title: string }> };
      language?: Language;
    };

    if (!frames || frames.length === 0 || !profile) {
      res.status(400).json({ error: "Please provide at least one image or video frame." });
      return;
    }

    const ai = getAiClient();
    const promptText = buildTechniqueAnalysisPrompt({
      profile,
      category: category || "Shooting",
      notes,
      previousScore: previousAnalysis?.overallScore,
      previousFixes: previousAnalysis?.priorityFixes?.map((f) => f.title),
      language: language || "en",
    });

    const imageParts = frames.slice(0, 4).map((f) => ({
      inlineData: {
        mimeType: f.mimeType || "image/jpeg",
        data: f.base64.includes(",") ? f.base64.split(",")[1] : f.base64,
      },
    }));

    const response = await withRetry(() =>
      ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: { parts: [...imageParts, { text: promptText }] },
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.INTEGER },
              summary: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              priorityFixes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    observation: { type: Type.STRING },
                    correction: { type: Type.STRING },
                    correctiveDrill: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        reps: { type: Type.STRING },
                        cue: { type: Type.STRING },
                      },
                      required: ["name", "reps", "cue"],
                    },
                  },
                  required: ["title", "observation", "correction", "correctiveDrill"],
                },
              },
              timelineMoments: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    timestampLabel: { type: Type.STRING },
                    observation: { type: Type.STRING },
                    rating: { type: Type.STRING },
                  },
                  required: ["timestampLabel", "observation", "rating"],
                },
              },
              comparisonNote: { type: Type.STRING },
            },
            required: [
              "overallScore",
              "summary",
              "strengths",
              "priorityFixes",
              "timelineMoments",
              "comparisonNote",
            ],
          },
        },
      })
    );

    const result = JSON.parse((response.text ?? "{}").trim());
    res.json({ result });
  } catch (err) {
    const formatted = formatApiError(err);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

// 4. Tactics & Interactive Board Explanation
app.post("/api/coach/tactics", async (req: Request, res: Response) => {
  try {
    const { profile, formation, position, boardTokensSummary, question, language } = req.body as {
      profile?: PlayerProfile;
      formation?: FormationCode;
      position?: PositionCode;
      boardTokensSummary?: string;
      question?: string;
      language?: Language;
    };

    if (!profile || !formation || !position) {
      res.status(400).json({ error: "Formation, position, and profile are required." });
      return;
    }

    const ai = getAiClient();
    const prompt = buildTacticsPrompt({
      profile,
      formation,
      position,
      boardTokensSummary,
      question,
      language: language || "en",
    });

    const response = await withRetry(() =>
      ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              positioning: { type: Type.STRING },
              offBallMovement: { type: Type.ARRAY, items: { type: Type.STRING } },
              pressingTriggers: { type: Type.ARRAY, items: { type: Type.STRING } },
              commonSituations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    situation: { type: Type.STRING },
                    response: { type: Type.STRING },
                  },
                  required: ["situation", "response"],
                },
              },
              boardExplanation: { type: Type.STRING },
            },
            required: [
              "positioning",
              "offBallMovement",
              "pressingTriggers",
              "commonSituations",
              "boardExplanation",
            ],
          },
        },
      })
    );

    const parsed = JSON.parse((response.text ?? "{}").trim()) as Omit<
      TacticalGuidance,
      "formation" | "position"
    >;
    const guidance: TacticalGuidance = {
      formation,
      position,
      ...parsed,
    };
    res.json({ guidance });
  } catch (err) {
    const formatted = formatApiError(err);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

// 5. Post-Match AI Review
app.post("/api/coach/match-review", async (req: Request, res: Response) => {
  try {
    const { profile, match, language } = req.body as {
      profile?: PlayerProfile;
      match?: Omit<MatchEntry, "id" | "aiReview">;
      language?: Language;
    };

    if (!profile || !match) {
      res.status(400).json({ error: "Match details and profile are required." });
      return;
    }

    const ai = getAiClient();
    const prompt = buildMatchReviewPrompt({
      profile,
      match,
      language: language || "en",
    });

    const response = await withRetry(() =>
      ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              doneWell: { type: Type.ARRAY, items: { type: Type.STRING } },
              toImprove: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["summary", "doneWell", "toImprove"],
          },
        },
      })
    );

    const aiReview = JSON.parse((response.text ?? "{}").trim());
    res.json({ aiReview });
  } catch (err) {
    const formatted = formatApiError(err);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

// 6. Weekly Progress Summary & AI Skill Assessment
app.post("/api/coach/weekly-summary", async (req: Request, res: Response) => {
  try {
    const { profile, plan, matches, weeklyMinutes, language } = req.body as {
      profile?: PlayerProfile;
      plan?: TrainingPlan;
      matches?: MatchEntry[];
      weeklyMinutes?: number;
      language?: Language;
    };

    if (!profile || !plan) {
      res.status(400).json({ error: "Profile and training plan are required." });
      return;
    }

    const ai = getAiClient();
    const prompt = buildWeeklySummaryPrompt({
      profile,
      plan,
      matches: matches || [],
      weeklyMinutes: weeklyMinutes || 0,
      language: language || "en",
    });

    const response = await withRetry(() =>
      ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              whatImproved: { type: Type.ARRAY, items: { type: Type.STRING } },
              focusNext: { type: Type.ARRAY, items: { type: Type.STRING } },
              aiAssessedSkills: {
                type: Type.OBJECT,
                properties: {
                  passing: { type: Type.INTEGER },
                  shooting: { type: Type.INTEGER },
                  dribbling: { type: Type.INTEGER },
                  firstTouch: { type: Type.INTEGER },
                  speed: { type: Type.INTEGER },
                  stamina: { type: Type.INTEGER },
                  defending: { type: Type.INTEGER },
                  vision: { type: Type.INTEGER },
                },
                required: [
                  "passing",
                  "shooting",
                  "dribbling",
                  "firstTouch",
                  "speed",
                  "stamina",
                  "defending",
                  "vision",
                ],
              },
            },
            required: ["headline", "whatImproved", "focusNext", "aiAssessedSkills"],
          },
        },
      })
    );

    const parsed = JSON.parse((response.text ?? "{}").trim()) as Omit<
      WeeklySummary,
      "generatedAt"
    >;
    res.json({
      weeklySummary: {
        ...parsed,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    const formatted = formatApiError(err);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get("*", (_req: Request, res: Response) => {
        res.sendFile(path.join(distDir, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PitchMind server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
