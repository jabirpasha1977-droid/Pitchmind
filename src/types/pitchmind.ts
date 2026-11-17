export type PositionCode =
  | "GK"
  | "CB"
  | "FB"
  | "CDM"
  | "CM"
  | "CAM"
  | "Winger"
  | "Striker";

export type SkillLevel = "beginner" | "amateur" | "semi-pro";
export type DominantFoot = "Right" | "Left" | "Both";
export type Language = "en" | "ar";
export type ThemeMode = "light" | "dark";

export interface SkillRatings {
  passing: number;
  shooting: number;
  dribbling: number;
  firstTouch: number;
  speed: number;
  stamina: number;
  defending: number;
  vision: number;
}

export interface PlayerProfile {
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  dominantFoot: DominantFoot;
  position: PositionCode;
  skillLevel: SkillLevel;
  goals: string[];
  weeklyAvailability: number; // days per week (2-7)
  equipment: string[];
  injuries: string;
  selfAssessment: SkillRatings;
  onboardingCompleted: boolean;
}

export interface DrillDiagramNode {
  id: string;
  role: "player" | "teammate" | "defender" | "cone" | "target";
  label: string;
  x: number;
  y: number;
}

export interface DrillDiagramStep {
  stepNumber: number;
  title: string;
  cue: string;
  ballStart: { x: number; y: number };
  ballEnd: { x: number; y: number };
  ballType: "pass" | "dribble" | "shot" | "movement";
  actorMoves?: Array<{ id: string; toX: number; toY: number }>;
}

export interface DrillItem {
  id: string;
  phase: "Warm-up" | "Technical" | "Physical" | "Game-Situation" | "Cool-down";
  name: string;
  description: string;
  durationMin: number;
  reps: string;
  spaceRequired: string;
  equipmentNeeded: string;
  difficulty: "Foundational" | "Moderate" | "Match Speed";
  coachingPoints: string[];
  commonMistakes: string[];
  diagram?: {
    pitchView: "attacking-half" | "full";
    nodes: DrillDiagramNode[];
    steps: DrillDiagramStep[];
  };
}

export interface TrainingSession {
  id: string;
  weekNumber: number;
  dayNumber: number;
  title: string;
  focus: string;
  totalMinutes: number;
  intensity: "Low" | "Moderate" | "High";
  status: "pending" | "completed" | "skipped";
  feedbackNote?: string;
  drills: DrillItem[];
}

export interface TrainingPlan {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  lastAdaptedAt?: string;
  weeksCount: number;
  sessions: TrainingSession[];
}

export interface TechniqueFix {
  title: string;
  observation: string;
  correction: string;
  correctiveDrill: {
    name: string;
    reps: string;
    cue: string;
  };
}

export interface TechniqueMoment {
  timestampLabel: string;
  observation: string;
  rating: "Strong" | "Adjust" | "Fix";
}

export interface TechniqueAnalysis {
  id: string;
  createdAt: string;
  category: "Shooting" | "Passing" | "Dribbling" | "Juggling" | "Goalkeeping";
  mediaPreviewUrl: string;
  mediaType: "image" | "video";
  overallScore: number;
  summary: string;
  strengths: string[];
  priorityFixes: TechniqueFix[];
  timelineMoments: TechniqueMoment[];
  comparisonNote?: string;
}

export type FormationCode = "4-3-3" | "4-4-2" | "3-5-2" | "4-2-3-1";

export interface TacticToken {
  id: string;
  team: "home" | "away";
  label: string;
  role: string;
  x: number;
  y: number;
  isFocus?: boolean;
}

export interface TacticalGuidance {
  formation: FormationCode;
  position: PositionCode;
  positioning: string;
  offBallMovement: string[];
  pressingTriggers: string[];
  commonSituations: Array<{ situation: string; response: string }>;
  boardExplanation?: string;
}

export interface MatchEntry {
  id: string;
  date: string;
  opponent: string;
  minutesPlayed: number;
  position: PositionCode;
  goals: number;
  assists: number;
  passesCompleted: number;
  rating: number; // 1-10
  notes: string;
  aiReview?: {
    summary: string;
    doneWell: string[];
    toImprove: string[];
  };
}

export interface LoadEntry {
  id: string;
  date: string;
  label: string;
  minutes: number;
  rpe: number; // 1-10 perceived effort
  type: "Pitch" | "Conditioning" | "Match" | "Recovery";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

export interface WeeklySummary {
  generatedAt: string;
  headline: string;
  whatImproved: string[];
  focusNext: string[];
  aiAssessedSkills: SkillRatings;
}
