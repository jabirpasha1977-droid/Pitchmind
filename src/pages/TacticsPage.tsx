import React, { useRef, useState } from "react";
import { CheckSquare, Loader2, RotateCcw, Square } from "lucide-react";
import type {
  FormationCode,
  Language,
  PlayerProfile,
  PositionCode,
  TacticalGuidance,
  TacticToken,
} from "../types/pitchmind.ts";
import { TRANSLATIONS } from "../data/i18n.ts";
import { FORMATION_LAYOUTS, POSITIONS } from "../data/seedData.ts";
import { fetchTacticalGuidance } from "../services/aiClient.ts";

interface TacticsPageProps {
  profile: PlayerProfile;
  guidance: TacticalGuidance;
  onGuidanceUpdate: (g: TacticalGuidance) => void;
  language: Language;
}

const FORMATIONS: FormationCode[] = ["4-3-3", "4-4-2", "3-5-2", "4-2-3-1"];

const INITIAL_CHECKLIST = [
  "Hydrate 500ml water + electrolytes 2-3 hours pre-kickoff",
  "Review 2 primary pressing triggers for today's formation",
  "10-minute dynamic warm-up + 20 sharp first-touch passes",
  "Set 1 process focus (e.g., 'Scan before every reception')",
  "Reset breath after any mistake: 2-second exhale, next action",
];

export const TacticsPage: React.FC<TacticsPageProps> = ({
  profile,
  guidance,
  onGuidanceUpdate,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [formation, setFormation] = useState<FormationCode>(guidance.formation);
  const [position, setPosition] = useState<PositionCode>(guidance.position);
  const [tokens, setTokens] = useState<TacticToken[]>(
    FORMATION_LAYOUTS[guidance.formation]
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({
    0: true,
  });
  const svgRef = useRef<SVGSVGElement | null>(null);

  const handleFormationChange = (nextFormation: FormationCode) => {
    setFormation(nextFormation);
    setTokens(FORMATION_LAYOUTS[nextFormation]);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(6, Math.min(94, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(6, Math.min(94, ((e.clientY - rect.top) / rect.height) * 100));
    setTokens((prev) =>
      prev.map((tok) => (tok.id === draggingId ? { ...tok, x, y } : tok))
    );
  };

  const handleExplainBoard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const summary = tokens
        .map((tk) => `${tk.label} (${tk.team}): x=${Math.round(tk.x)}, y=${Math.round(tk.y)}`)
        .join("; ");
      const res = await fetchTacticalGuidance({
        profile,
        formation,
        position,
        boardTokensSummary: summary,
        question: question.trim() || undefined,
        language,
      });
      onGuidanceUpdate(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tactical guidance.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {t.tactics.title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            {t.tactics.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950">
            {FORMATIONS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => handleFormationChange(f)}
                className={`min-h-[36px] px-3 py-1 text-xs font-mono font-semibold rounded-lg cursor-pointer transition-colors ${
                  formation === f
                    ? "bg-emerald-900 text-white dark:bg-lime-400 dark:text-slate-950"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <select
            value={position}
            onChange={(e) => setPosition(e.target.value as PositionCode)}
            aria-label="Select position role"
            className="min-h-[44px] px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-emerald-950 bg-white dark:bg-[#161D1A] text-slate-900 dark:text-white"
          >
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                Role: {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Tactics Board */}
        <div className="lg:col-span-6 p-4 rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Drag any player token to adjust spacing</span>
            <button
              type="button"
              onClick={() => setTokens(FORMATION_LAYOUTS[formation])}
              className="inline-flex items-center gap-1 text-emerald-800 dark:text-lime-400 font-medium cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Shape</span>
            </button>
          </div>

          <div className="rounded-xl overflow-hidden bg-[#134D32]">
            <svg
              ref={svgRef}
              viewBox="0 0 100 100"
              onPointerMove={handlePointerMove}
              onPointerUp={() => setDraggingId(null)}
              onPointerLeave={() => setDraggingId(null)}
              className="w-full aspect-[4/4.4] select-none touch-none"
              role="img"
              aria-label={`Interactive ${formation} tactical pitch board`}
            >
              <defs>
                <pattern id="tac-turf" width="100" height="16.6" patternUnits="userSpaceOnUse">
                  <rect width="100" height="8.3" fill="#155638" />
                  <rect y="8.3" width="100" height="8.3" fill="#196140" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#tac-turf)" />
              <rect
                x="5"
                y="4"
                width="90"
                height="92"
                fill="none"
                stroke="rgba(255,255,255,0.75)"
                strokeWidth="0.5"
              />
              <line
                x1="5"
                y1="50"
                x2="95"
                y2="50"
                stroke="rgba(255,255,255,0.75)"
                strokeWidth="0.45"
              />
              <circle
                cx="50"
                cy="50"
                r="10"
                fill="none"
                stroke="rgba(255,255,255,0.75)"
                strokeWidth="0.45"
              />
              <rect
                x="26"
                y="4"
                width="48"
                height="16"
                fill="none"
                stroke="rgba(255,255,255,0.75)"
                strokeWidth="0.45"
              />
              <rect
                x="26"
                y="80"
                width="48"
                height="16"
                fill="none"
                stroke="rgba(255,255,255,0.75)"
                strokeWidth="0.45"
              />

              {tokens.map((tok) => {
                const isHome = tok.team === "home";
                const isRoleMatch = tok.role === position || tok.isFocus;
                const fill = isHome
                  ? isRoleMatch
                    ? "#84CC16"
                    : "#0F172A"
                  : "#DC2626";
                const textFill = isHome && isRoleMatch ? "#0B0F0E" : "#FFFFFF";
                return (
                  <g
                    key={tok.id}
                    onPointerDown={() => setDraggingId(tok.id)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <circle
                      cx={tok.x}
                      cy={tok.y}
                      r={isRoleMatch && isHome ? 3.5 : 2.9}
                      fill={fill}
                      stroke="#FFFFFF"
                      strokeWidth="0.55"
                    />
                    <text
                      x={tok.x}
                      y={tok.y + 0.85}
                      textAnchor="middle"
                      fontSize="2.1"
                      fontWeight="700"
                      fill={textFill}
                    >
                      {tok.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Optional scenario question (e.g. 'How do we beat a high press?')"
              className="flex-1 min-h-[44px] px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-emerald-900 bg-slate-50 dark:bg-[#0B0F0E] text-slate-900 dark:text-white"
            />
            <button
              type="button"
              disabled={isLoading}
              onClick={handleExplainBoard}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-900 text-white hover:bg-emerald-800 dark:bg-lime-400 dark:text-slate-950 dark:hover:bg-lime-300 text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 whitespace-nowrap"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{t.tactics.explainBoard}</span>
            </button>
          </div>

          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

          {guidance.boardExplanation && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0F0E] border border-slate-200 dark:border-emerald-950 text-sm text-slate-700 dark:text-slate-200">
              {guidance.boardExplanation}
            </div>
          )}
        </div>

        {/* Role Guidance & Pre-Match Checklist */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950 space-y-4">
            <div>
              <p className="text-xs font-semibold text-emerald-800 dark:text-lime-400">
                {guidance.formation} · {guidance.position}
              </p>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {t.tactics.positioning}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                {guidance.positioning}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-emerald-950">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white mb-2">
                {t.tactics.offBall}
              </h3>
              <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                {guidance.offBallMovement.map((m, i) => (
                  <li key={i}>• {m}</li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-emerald-950">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white mb-2">
                {t.tactics.pressing}
              </h3>
              <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                {guidance.pressingTriggers.map((p, i) => (
                  <li key={i}>→ {p}</li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-emerald-950 space-y-2.5">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                {t.tactics.situations}
              </h3>
              {guidance.commonSituations.map((sit, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F0E] border border-slate-100 dark:border-emerald-950 text-xs space-y-1"
                >
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {sit.situation}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">{sit.response}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#161D1A] border border-slate-200 dark:border-emerald-950">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-3">
              {t.tactics.checklist}
            </h2>
            <div className="divide-y divide-slate-100 dark:divide-emerald-950">
              {INITIAL_CHECKLIST.map((item, idx) => {
                const checked = Boolean(checkedItems[idx]);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }))
                    }
                    className="w-full min-h-[44px] py-2.5 flex items-center gap-3 text-left text-sm cursor-pointer"
                  >
                    {checked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-700 dark:text-lime-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span
                      className={
                        checked
                          ? "line-through text-slate-400"
                          : "text-slate-700 dark:text-slate-200"
                      }
                    >
                      {item}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
