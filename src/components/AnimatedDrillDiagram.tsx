import React, { useEffect, useMemo, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import type { DrillDiagramNode, DrillDiagramStep } from "../types/pitchmind.ts";

interface AnimatedDrillDiagramProps {
  pitchView: "attacking-half" | "full";
  nodes: DrillDiagramNode[];
  steps: DrillDiagramStep[];
  title: string;
}

export const AnimatedDrillDiagram: React.FC<AnimatedDrillDiagramProps> = ({
  pitchView,
  nodes,
  steps,
  title,
}) => {
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0.75);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setStepIdx(0);
    setProgress(0.75);
    setIsPlaying(false);
  }, [title]);

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;
    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      setProgress((prev) => {
        const next = prev + dt / 1800;
        if (next >= 1) {
          setStepIdx((s) => (s + 1) % steps.length);
          return 0;
        }
        return next;
      });
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, steps.length]);

  const activeStep = steps[stepIdx] ?? steps[0];

  const renderedNodes = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    for (const n of nodes) pos[n.id] = { x: n.x, y: n.y };

    for (let i = 0; i < stepIdx; i++) {
      for (const m of steps[i]?.actorMoves ?? []) {
        if (pos[m.id]) pos[m.id] = { x: m.toX, y: m.toY };
      }
    }
    const eased = 1 - Math.pow(1 - Math.min(1, Math.max(0, progress)), 2.5);
    for (const m of activeStep?.actorMoves ?? []) {
      if (pos[m.id]) {
        const start = pos[m.id];
        pos[m.id] = {
          x: start.x + (m.toX - start.x) * eased,
          y: start.y + (m.toY - start.y) * eased,
        };
      }
    }
    return nodes.map((n) => ({
      ...n,
      rx: pos[n.id]?.x ?? n.x,
      ry: pos[n.id]?.y ?? n.y,
    }));
  }, [nodes, steps, stepIdx, progress, activeStep]);

  const ballPos = useMemo(() => {
    if (!activeStep) return { x: 50, y: 50 };
    const eased = 1 - Math.pow(1 - Math.min(1, Math.max(0, progress)), 2);
    return {
      x: activeStep.ballStart.x + (activeStep.ballEnd.x - activeStep.ballStart.x) * eased,
      y: activeStep.ballStart.y + (activeStep.ballEnd.y - activeStep.ballStart.y) * eased,
    };
  }, [activeStep, progress]);

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-emerald-950 bg-[#124B31]">
      <svg
        viewBox="0 0 100 100"
        className="w-full max-h-[260px] aspect-[4/3]"
        role="img"
        aria-label={`Animated pitch diagram for ${title}`}
      >
        <defs>
          <pattern id="mini-turf" width="100" height="20" patternUnits="userSpaceOnUse">
            <rect width="100" height="10" fill="#145337" />
            <rect y="10" width="100" height="10" fill="#185F3F" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#mini-turf)" />
        <rect
          x="5"
          y="5"
          width="90"
          height="90"
          fill="none"
          stroke="rgba(255,255,255,0.72)"
          strokeWidth="0.55"
        />
        {pitchView === "attacking-half" ? (
          <>
            <rect
              x="41"
              y="2.5"
              width="18"
              height="2.5"
              fill="rgba(255,255,255,0.18)"
              stroke="#FFFFFF"
              strokeWidth="0.6"
            />
            <rect
              x="22"
              y="5"
              width="56"
              height="28"
              fill="none"
              stroke="rgba(255,255,255,0.72)"
              strokeWidth="0.5"
            />
            <rect
              x="36"
              y="5"
              width="28"
              height="10"
              fill="none"
              stroke="rgba(255,255,255,0.72)"
              strokeWidth="0.5"
            />
          </>
        ) : (
          <>
            <line
              x1="5"
              y1="50"
              x2="95"
              y2="50"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="0.5"
            />
            <circle
              cx="50"
              cy="50"
              r="11"
              fill="none"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="0.5"
            />
          </>
        )}

        {steps.map((st, idx) => (
          <line
            key={st.stepNumber}
            x1={st.ballStart.x}
            y1={st.ballStart.y}
            x2={st.ballEnd.x}
            y2={st.ballEnd.y}
            stroke={idx === stepIdx ? "#A3E635" : "rgba(255,255,255,0.35)"}
            strokeWidth={idx === stepIdx ? 0.9 : 0.45}
            strokeDasharray={st.ballType === "shot" ? "none" : "2 1.2"}
          />
        ))}

        {renderedNodes.map((n) => {
          if (n.role === "cone") {
            return (
              <polygon
                key={n.id}
                points={`${n.rx},${n.ry - 2.2} ${n.rx - 2},${n.ry + 1.5} ${n.rx + 2},${n.ry + 1.5}`}
                fill="#F97316"
                stroke="#FFF"
                strokeWidth="0.4"
              />
            );
          }
          if (n.role === "target") {
            return (
              <rect
                key={n.id}
                x={n.rx - 5}
                y={n.ry - 3}
                width="10"
                height="6"
                rx="1"
                fill="rgba(163,230,53,0.22)"
                stroke="#A3E635"
                strokeWidth="0.5"
                strokeDasharray="1.2 0.8"
              />
            );
          }
          const fill =
            n.role === "player" ? "#84CC16" : n.role === "defender" ? "#EF4444" : "#0F172A";
          const textFill = n.role === "player" ? "#0B0F0E" : "#FFFFFF";
          return (
            <g key={n.id}>
              <circle cx={n.rx} cy={n.ry} r="3.1" fill={fill} stroke="#FFF" strokeWidth="0.55" />
              <text
                x={n.rx}
                y={n.ry + 0.9}
                textAnchor="middle"
                fontSize="2.3"
                fontWeight="700"
                fill={textFill}
              >
                {n.role === "player" ? "YOU" : n.role === "defender" ? "D" : "P"}
              </text>
            </g>
          );
        })}

        <circle
          cx={ballPos.x}
          cy={ballPos.y}
          r="1.9"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="0.5"
        />
      </svg>

      <div className="px-3 py-2 bg-white dark:bg-[#161D1A] border-t border-slate-200 dark:border-emerald-950 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
            {activeStep?.stepNumber}. {activeStep?.title}
          </p>
          <p className="text-[11px] text-emerald-800 dark:text-lime-400 truncate">
            {activeStep?.cue}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (!isPlaying && progress >= 1) setProgress(0);
              setIsPlaying((p) => !p);
            }}
            className="min-h-[36px] px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-900 text-white dark:bg-lime-400 dark:text-slate-950 inline-flex items-center gap-1.5 cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? "Pause" : "Animate"}</span>
          </button>
          <button
            type="button"
            aria-label="Reset diagram"
            onClick={() => {
              setIsPlaying(false);
              setStepIdx(0);
              setProgress(0);
            }}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg border border-slate-200 dark:border-emerald-900 text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
