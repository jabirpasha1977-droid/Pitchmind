import React from "react";
import type { MatchEntry, SkillRatings } from "../types/pitchmind.ts";

interface ProgressRingProps {
  value: number;
  max: number;
  label: string;
  sublabel: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  max,
  label,
  sublabel,
}) => {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(1, Math.max(0, max > 0 ? value / max : 0));
  const offset = circumference * (1 - ratio);

  return (
    <div className="flex items-center gap-3.5">
      <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            className="text-slate-200 dark:text-emerald-950"
          />
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="text-emerald-700 dark:text-lime-400 transition-all duration-300"
          />
        </svg>
        <span className="absolute font-mono tabular-nums text-sm font-bold text-slate-900 dark:text-white">
          {value}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
          {label}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{sublabel}</p>
      </div>
    </div>
  );
};

interface SkillRadarChartProps {
  selfRatings: SkillRatings;
  aiRatings: SkillRatings;
  selfLabel: string;
  aiLabel: string;
}

const AXES: Array<{ key: keyof SkillRatings; label: string }> = [
  { key: "passing", label: "Passing" },
  { key: "shooting", label: "Shooting" },
  { key: "dribbling", label: "Dribbling" },
  { key: "firstTouch", label: "1st Touch" },
  { key: "speed", label: "Speed" },
  { key: "stamina", label: "Stamina" },
  { key: "defending", label: "Defending" },
  { key: "vision", label: "Vision" },
];

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({
  selfRatings,
  aiRatings,
  selfLabel,
  aiLabel,
}) => {
  const cx = 140;
  const cy = 132;
  const maxR = 88;

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / AXES.length - Math.PI / 2;
    const r = (Math.min(10, Math.max(1, value)) / 10) * maxR;
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    };
  };

  const toPolygon = (ratings: SkillRatings) =>
    AXES.map((ax, i) => {
      const pt = getPoint(i, ratings[ax.key]);
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    }).join(" ");

  return (
    <div>
      <svg viewBox="0 0 280 264" className="w-full max-w-[320px] mx-auto">
        {[2, 4, 6, 8, 10].map((ring) => {
          const pts = AXES.map((_, i) => {
            const p = getPoint(i, ring);
            return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
          }).join(" ");
          return (
            <polygon
              key={ring}
              points={pts}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              className="text-slate-200 dark:text-emerald-950"
            />
          );
        })}

        {AXES.map((ax, i) => {
          const outer = getPoint(i, 10);
          const lbl = getPoint(i, 11.7);
          return (
            <g key={ax.key}>
              <line
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
                stroke="currentColor"
                strokeWidth="0.8"
                className="text-slate-200 dark:text-emerald-950"
              />
              <text
                x={lbl.x}
                y={lbl.y + 3}
                textAnchor="middle"
                fontSize="9.5"
                fontWeight="600"
                className="fill-slate-600 dark:fill-slate-300"
              >
                {ax.label}
              </text>
            </g>
          );
        })}

        {/* Self assessment */}
        <polygon
          points={toPolygon(selfRatings)}
          fill="rgba(16, 185, 129, 0.16)"
          stroke="#059669"
          strokeWidth="2"
        />

        {/* AI assessment */}
        <polygon
          points={toPolygon(aiRatings)}
          fill="rgba(132, 204, 22, 0.22)"
          stroke="#84CC16"
          strokeWidth="2"
          strokeDasharray="4 2"
        />
      </svg>

      <div className="flex items-center justify-center gap-6 text-xs mt-1">
        <span className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <span className="w-3 h-0.5 bg-emerald-600 inline-block" />
          {selfLabel}
        </span>
        <span className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <span className="w-3 h-0.5 border-t-2 border-dashed border-lime-500 inline-block" />
          {aiLabel}
        </span>
      </div>
    </div>
  );
};

export const MatchTrendChart: React.FC<{ matches: MatchEntry[] }> = ({ matches }) => {
  const ordered = [...matches].slice(0, 8).reverse();
  if (ordered.length === 0) return null;

  const w = 380;
  const h = 135;
  const padX = 28;
  const padY = 18;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;

  const points = ordered.map((m, idx) => {
    const x =
      ordered.length === 1
        ? padX + innerW / 2
        : padX + (idx / (ordered.length - 1)) * innerW;
    const y = padY + (1 - Math.min(10, Math.max(0, m.rating)) / 10) * innerH;
    return { x, y, m };
  });

  const pathD = points
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-36">
      {[5, 7.5, 10].map((tick) => {
        const y = padY + (1 - tick / 10) * innerH;
        return (
          <g key={tick}>
            <line
              x1={padX}
              y1={y}
              x2={w - padX}
              y2={y}
              stroke="currentColor"
              strokeWidth="0.7"
              strokeDasharray="3 3"
              className="text-slate-200 dark:text-emerald-950"
            />
            <text
              x={6}
              y={y + 3}
              fontSize="9"
              className="fill-slate-400 font-mono tabular-nums"
            >
              {tick}
            </text>
          </g>
        );
      })}
      <path d={pathD} fill="none" stroke="#84CC16" strokeWidth="2.5" strokeLinecap="round" />
      {points.map((p) => (
        <g key={p.m.id}>
          <circle
            cx={p.x}
            cy={p.y}
            r="4.5"
            className="fill-emerald-900 dark:fill-lime-400 stroke-white dark:stroke-[#161D1A]"
            strokeWidth="1.5"
          />
          <text
            x={p.x}
            y={h - 3}
            textAnchor="middle"
            fontSize="8.5"
            className="fill-slate-500 dark:fill-slate-400"
          >
            {p.m.opponent.slice(0, 7)}
          </text>
        </g>
      ))}
    </svg>
  );
};
