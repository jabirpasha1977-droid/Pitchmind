import React, { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Upload } from "lucide-react";
import type {
  Language,
  PlayerProfile,
  TechniqueAnalysis,
} from "../types/pitchmind.ts";
import { TRANSLATIONS } from "../data/i18n.ts";
import { SAMPLE_IMAGES } from "../data/seedData.ts";
import { analyzeTechniqueMedia } from "../services/aiClient.ts";

interface TechniquePageProps {
  profile: PlayerProfile;
  analyses: TechniqueAnalysis[];
  onAddAnalysis: (analysis: TechniqueAnalysis) => void;
  language: Language;
}

const CATEGORIES: TechniqueAnalysis["category"][] = [
  "Shooting",
  "Passing",
  "Dribbling",
  "Juggling",
  "Goalkeeping",
];

async function extractVideoFrames(
  file: File
): Promise<{ frames: Array<{ base64: string; mimeType: string }>; previewUrl: string }> {
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.src = objectUrl;
  video.muted = true;
  video.playsInline = true;

  await new Promise<void>((resolve, reject) => {
    video.onloadeddata = () => resolve();
    video.onerror = () => reject(new Error("Could not read video file."));
  });

  const duration = Math.max(0.5, video.duration || 2);
  const timestamps = [duration * 0.15, duration * 0.5, duration * 0.85];
  const canvas = document.createElement("canvas");
  const w = Math.min(720, video.videoWidth || 640);
  const h = Math.round((w / (video.videoWidth || 640)) * (video.videoHeight || 480));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  const frames: Array<{ base64: string; mimeType: string }> = [];
  for (const t of timestamps) {
    video.currentTime = t;
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
    });
    if (ctx) {
      ctx.drawImage(video, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
      frames.push({ base64: dataUrl, mimeType: "image/jpeg" });
    }
  }

  URL.revokeObjectURL(objectUrl);
  return {
    frames,
    previewUrl: frames[1]?.base64 || frames[0]?.base64 || "",
  };
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

async function imageUrlToBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  const res = await fetch(url);
  const blob = await res.blob();
  const base64 = await new Promise<string>((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(blob);
  });
  return { base64, mimeType: blob.type || "image/jpeg" };
}

export const TechniquePage: React.FC<TechniquePageProps> = ({
  profile,
  analyses,
  onAddAnalysis,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [category, setCategory] = useState<TechniqueAnalysis["category"]>("Shooting");
  const [notes, setNotes] = useState("");
  const [selectedPreview, setSelectedPreview] = useState<string>(
    SAMPLE_IMAGES.shootingStrike
  );
  const [pendingFrames, setPendingFrames] = useState<
    Array<{ base64: string; mimeType: string }> | null
  >(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string>(analyses[0]?.id ?? "");

  const activeAnalysis =
    analyses.find((a) => a.id === activeId) ?? analyses[0] ?? null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    try {
      if (file.type.startsWith("video/")) {
        const extracted = await extractVideoFrames(file);
        setPendingFrames(extracted.frames);
        setSelectedPreview(extracted.previewUrl);
        setMediaType("video");
      } else {
        const dataUrl = await fileToDataUrl(file);
        setPendingFrames([{ base64: dataUrl, mimeType: file.type || "image/jpeg" }]);
        setSelectedPreview(dataUrl);
        setMediaType("image");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not process media file.");
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      let framesToSend = pendingFrames;
      if (!framesToSend) {
        const fetched = await imageUrlToBase64(selectedPreview);
        framesToSend = [fetched];
      }

      const previousSameCategory = analyses.find((a) => a.category === category);
      const res = await analyzeTechniqueMedia({
        frames: framesToSend,
        category,
        notes,
        profile,
        previousAnalysis: previousSameCategory,
        language,
      });

      const created: TechniqueAnalysis = {
        id: `tech-${Date.now()}`,
        createdAt: new Date().toISOString(),
        category,
        mediaPreviewUrl: selectedPreview,
        mediaType,
        ...res,
      };
      onAddAnalysis(created);
      setActiveId(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze technique.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          {t.technique.title}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          {t.technique.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Upload & Controls */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950 space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer transition-colors ${
                  category === cat
                    ? "bg-emerald-900 text-white border-emerald-900 dark:bg-lime-400 dark:text-slate-950 dark:border-lime-400"
                    : "bg-slate-50 dark:bg-[#0B0F0E] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-emerald-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-emerald-950 bg-slate-100 dark:bg-[#0B0F0E]">
            <img
              src={selectedPreview}
              alt="Selected technique frame for analysis"
              referrerPolicy="no-referrer"
              className="w-full aspect-[4/3] object-cover"
            />
          </div>

          <label className="min-h-[44px] px-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-emerald-800 hover:border-emerald-700 dark:hover:border-lime-400 flex items-center justify-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-700 dark:text-lime-400" />
            <span>{t.technique.uploadHint}</span>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              {t.technique.useSample}:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedPreview(SAMPLE_IMAGES.shootingStrike);
                  setPendingFrames(null);
                  setMediaType("image");
                  setCategory("Shooting");
                }}
                className="min-h-[40px] px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-emerald-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-emerald-950/60 cursor-pointer"
              >
                Instep Strike Sample
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedPreview(SAMPLE_IMAGES.firstTouch);
                  setPendingFrames(null);
                  setMediaType("image");
                  setCategory("Passing");
                }}
                className="min-h-[40px] px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-emerald-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-emerald-950/60 cursor-pointer"
              >
                First Touch Sample
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              What are you trying to fix? (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Slicing shots wide right when striking at pace"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-emerald-900 bg-slate-50 dark:bg-[#0B0F0E] text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="button"
            disabled={isAnalyzing}
            onClick={handleAnalyze}
            className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-emerald-900 text-white hover:bg-emerald-800 dark:bg-lime-400 dark:text-slate-950 dark:hover:bg-lime-300 text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Mechanics...</span>
              </>
            ) : (
              <span>{t.actions.analyzeForm}</span>
            )}
          </button>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Analysis Report */}
        <div className="lg:col-span-7 space-y-5">
          {analyses.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {analyses.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setActiveId(a.id)}
                  className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg border whitespace-nowrap shrink-0 cursor-pointer ${
                    activeAnalysis?.id === a.id
                      ? "bg-slate-900 text-white border-slate-900 dark:bg-lime-400 dark:text-slate-950 dark:border-lime-400"
                      : "bg-white dark:bg-[#161D1A] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-emerald-950"
                  }`}
                >
                  {a.category} · <span className="font-mono tabular-nums">{a.overallScore}</span>
                </button>
              ))}
            </div>
          )}

          {activeAnalysis && (
            <div className="p-5 rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-emerald-950">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activeAnalysis.category} ·{" "}
                    {new Date(activeAnalysis.createdAt).toLocaleDateString()}
                  </p>
                  <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    Biomechanical Breakdown
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.technique.overallScore}
                  </p>
                  <p className="font-mono tabular-nums text-2xl font-bold text-emerald-800 dark:text-lime-400">
                    {activeAnalysis.overallScore}/100
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {activeAnalysis.summary}
              </p>

              {/* Strengths */}
              <div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white mb-2">
                  {t.technique.strengths}
                </h3>
                <ul className="space-y-1.5">
                  {activeAnalysis.strengths.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-lime-400 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3 Priority Fixes */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                  {t.technique.priorityFixes}
                </h3>
                {activeAnalysis.priorityFixes.map((fix, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-slate-200 dark:border-emerald-950 bg-slate-50/70 dark:bg-[#0B0F0E] space-y-2"
                  >
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {i + 1}. {fix.title}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-semibold">Observed:</span> {fix.observation}
                    </p>
                    <p className="text-xs text-emerald-900 dark:text-lime-300">
                      <span className="font-semibold">Fix:</span> {fix.correction}
                    </p>
                    <div className="pt-2 border-t border-slate-200 dark:border-emerald-950 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Drill: {fix.correctiveDrill.name}
                      </span>
                      <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        {fix.correctiveDrill.reps} · Cue: {fix.correctiveDrill.cue}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Timeline Moments */}
              <div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white mb-2">
                  {t.technique.timeline}
                </h3>
                <div className="divide-y divide-slate-100 dark:divide-emerald-950">
                  {activeAnalysis.timelineMoments.map((m, i) => (
                    <div
                      key={i}
                      className="py-2.5 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white shrink-0">
                          {m.timestampLabel}
                        </span>
                        <span className="text-slate-600 dark:text-slate-300">
                          {m.observation}
                        </span>
                      </div>
                      <span
                        className={`font-semibold shrink-0 ${
                          m.rating === "Strong"
                            ? "text-emerald-700 dark:text-lime-400"
                            : m.rating === "Fix"
                              ? "text-red-600 dark:text-red-400"
                              : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {m.rating}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {activeAnalysis.comparisonNote && (
                <div className="pt-3 border-t border-slate-100 dark:border-emerald-950 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {t.technique.comparison}:{" "}
                  </span>
                  {activeAnalysis.comparisonNote}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
