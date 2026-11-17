import React, { useState } from "react";
import { X } from "lucide-react";
import type {
  DominantFoot,
  PlayerProfile,
  PositionCode,
  SkillLevel,
  SkillRatings,
} from "../types/pitchmind.ts";
import { POSITIONS } from "../data/seedData.ts";

interface ProfileOnboardingModalProps {
  isOpen: boolean;
  profile: PlayerProfile;
  onSave: (updated: PlayerProfile, regeneratePlan: boolean) => void;
  onClose: () => void;
}

const GOAL_OPTIONS = [
  "Improve first touch",
  "Finishing under pressure",
  "Weak foot consistency",
  "Dribbling & 1v1s",
  "Stamina & match fitness",
  "Passing vision",
  "Defensive positioning",
];

const EQUIPMENT_OPTIONS = [
  "Ball",
  "Cones",
  "Rebound Wall",
  "Goal / Net",
  "Gym",
  "Full Pitch",
  "Agility Ladder",
];

const SKILL_SLIDERS: Array<{ key: keyof SkillRatings; label: string }> = [
  { key: "passing", label: "Passing" },
  { key: "shooting", label: "Shooting" },
  { key: "dribbling", label: "Dribbling" },
  { key: "firstTouch", label: "First Touch" },
  { key: "speed", label: "Speed" },
  { key: "stamina", label: "Stamina" },
  { key: "defending", label: "Defending" },
  { key: "vision", label: "Vision" },
];

export const ProfileOnboardingModal: React.FC<ProfileOnboardingModalProps> = ({
  isOpen,
  profile,
  onSave,
  onClose,
}) => {
  const [draft, setDraft] = useState<PlayerProfile>(profile);
  const [regeneratePlan, setRegeneratePlan] = useState(true);

  if (!isOpen) return null;

  const toggleItem = (list: string[], item: string) =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...draft, onboardingCompleted: true }, regeneratePlan);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Player Profile and Onboarding"
    >
      <div className="bg-white dark:bg-[#161D1A] w-full sm:max-w-2xl max-h-[92vh] rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-emerald-950 flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-emerald-950 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Player Profile &amp; Self-Assessment
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your age, position, equipment, and injuries tailor every AI drill and plan.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile dialog"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-5">
          {/* Identity & Physical */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Name
              </label>
              <input
                type="text"
                required
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-emerald-900 bg-slate-50 dark:bg-[#0B0F0E] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Age
              </label>
              <input
                type="number"
                min={7}
                max={65}
                value={draft.age}
                onChange={(e) =>
                  setDraft({ ...draft, age: Math.max(7, Number(e.target.value) || 18) })
                }
                className="w-full px-3 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-emerald-900 bg-slate-50 dark:bg-[#0B0F0E] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                min={110}
                max={220}
                value={draft.heightCm}
                onChange={(e) =>
                  setDraft({ ...draft, heightCm: Number(e.target.value) || 175 })
                }
                className="w-full px-3 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-emerald-900 bg-slate-50 dark:bg-[#0B0F0E] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                min={25}
                max={140}
                value={draft.weightKg}
                onChange={(e) =>
                  setDraft({ ...draft, weightKg: Number(e.target.value) || 70 })
                }
                className="w-full px-3 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 dark:border-emerald-900 bg-slate-50 dark:bg-[#0B0F0E] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {draft.age < 18 && (
            <div className="p-3 rounded-lg bg-lime-50 dark:bg-lime-950/30 border border-lime-300 dark:border-lime-800 text-xs text-slate-800 dark:text-lime-200">
              U18 Youth Safety Active: PitchMind automatically moderates plyometric volume and emphasizes technique and recovery.
            </div>
          )}

          {/* Football Role */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Position
              </label>
              <select
                value={draft.position}
                onChange={(e) =>
                  setDraft({ ...draft, position: e.target.value as PositionCode })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-emerald-900 bg-slate-50 dark:bg-[#0B0F0E] text-slate-900 dark:text-white"
              >
                {POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dominant Foot
              </label>
              <select
                value={draft.dominantFoot}
                onChange={(e) =>
                  setDraft({ ...draft, dominantFoot: e.target.value as DominantFoot })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-emerald-900 bg-slate-50 dark:bg-[#0B0F0E] text-slate-900 dark:text-white"
              >
                <option value="Right">Right</option>
                <option value="Left">Left</option>
                <option value="Both">Both</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Skill Level
              </label>
              <select
                value={draft.skillLevel}
                onChange={(e) =>
                  setDraft({ ...draft, skillLevel: e.target.value as SkillLevel })
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-emerald-900 bg-slate-50 dark:bg-[#0B0F0E] text-slate-900 dark:text-white"
              >
                <option value="beginner">Beginner</option>
                <option value="amateur">Amateur / Club</option>
                <option value="semi-pro">Semi-Pro / Academy</option>
              </select>
            </div>
          </div>

          {/* Weekly Availability & Injuries */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Weekly Training Availability:{" "}
                <span className="font-mono tabular-nums">{draft.weeklyAvailability} days/wk</span>
              </label>
              <input
                type="range"
                min={2}
                max={6}
                value={draft.weeklyAvailability}
                onChange={(e) =>
                  setDraft({ ...draft, weeklyAvailability: Number(e.target.value) })
                }
                className="w-full accent-emerald-700 dark:accent-lime-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Injuries or Limitations (optional)
              </label>
              <input
                type="text"
                value={draft.injuries}
                onChange={(e) => setDraft({ ...draft, injuries: e.target.value })}
                placeholder="e.g., Mild left ankle sprain recovery"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-emerald-900 bg-slate-50 dark:bg-[#0B0F0E] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Goals & Equipment */}
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Primary Goals
            </p>
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((goal) => {
                const selected = draft.goals.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() =>
                      setDraft({ ...draft, goals: toggleItem(draft.goals, goal) })
                    }
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer transition-colors ${
                      selected
                        ? "bg-emerald-900 text-white border-emerald-900 dark:bg-lime-400 dark:text-slate-950 dark:border-lime-400"
                        : "bg-slate-50 dark:bg-[#0B0F0E] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-emerald-900"
                    }`}
                  >
                    {goal}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Equipment Access
            </p>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map((eq) => {
                const selected = draft.equipment.includes(eq);
                return (
                  <button
                    key={eq}
                    type="button"
                    onClick={() =>
                      setDraft({ ...draft, equipment: toggleItem(draft.equipment, eq) })
                    }
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer transition-colors ${
                      selected
                        ? "bg-emerald-900 text-white border-emerald-900 dark:bg-lime-400 dark:text-slate-950 dark:border-lime-400"
                        : "bg-slate-50 dark:bg-[#0B0F0E] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-emerald-900"
                    }`}
                  >
                    {eq}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 8 Skill Self-Assessment Sliders */}
          <div className="pt-2 border-t border-slate-200 dark:border-emerald-950">
            <p className="text-xs font-semibold text-slate-900 dark:text-white mb-3">
              Self-Assessment (1–10)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {SKILL_SLIDERS.map(({ key, label }) => (
                <div key={key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-700 dark:text-slate-300">{label}</span>
                    <span className="font-mono tabular-nums font-semibold text-emerald-800 dark:text-lime-400">
                      {draft.selfAssessment[key]}/10
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={draft.selfAssessment[key]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        selfAssessment: {
                          ...draft.selfAssessment,
                          [key]: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-emerald-700 dark:accent-lime-400"
                  />
                </div>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={regeneratePlan}
              onChange={(e) => setRegeneratePlan(e.target.checked)}
              className="rounded accent-emerald-700"
            />
            <span>Automatically regenerate my 4-week AI training plan with these updates</span>
          </label>

          <div className="pt-3 border-t border-slate-200 dark:border-emerald-950 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-emerald-900 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-emerald-900 text-white hover:bg-emerald-800 dark:bg-lime-400 dark:text-slate-950 dark:hover:bg-lime-300 cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
