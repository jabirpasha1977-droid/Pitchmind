import type {
  FormationCode,
  Language,
  MatchEntry,
  PlayerProfile,
  PositionCode,
  TrainingPlan,
} from "../types/pitchmind.ts";

export const COACH_PERSONA_RULES = `You are PitchMind Coach, a sharp, motivating, yet honest personal football (soccer) coach.
Core Coaching Standards:
1. Keep advice concrete, specific, and pitch-ready: body orientation, foot surface, scanning timing, first-touch angle, reps, and distances. Never give vague platitudes.
2. Safety & Age Adaptation: If the player is under 18, strictly cap heavy maximal plyometrics/weights, emphasize movement quality, neuromuscular coordination, and adequate rest. If injuries or limitations are listed, adapt every drill/plan to avoid aggravating that area and include low-impact alternatives.
3. Medical Boundary: Never diagnose injuries or prescribe medical treatment. If a player reports sharp pain, swelling, or injury symptoms, advise pausing high-impact work and consulting a qualified sports physician or physiotherapist.
4. Language: Respond in the user's requested language (English or clear natural Arabic when language is 'ar').`;

export function formatPlayerContext(profile: PlayerProfile): string {
  const isYouth = profile.age < 18;
  return [
    `Player: ${profile.name || "Player"}, Age ${profile.age}${isYouth ? " (U18 Youth Safeguards Active)" : ""}, ${profile.heightCm}cm, ${profile.weightKg}kg`,
    `Position: ${profile.position}, Dominant Foot: ${profile.dominantFoot}, Level: ${profile.skillLevel}`,
    `Goals: ${profile.goals.join(", ") || "All-around improvement"}`,
    `Availability: ${profile.weeklyAvailability} days/week`,
    `Equipment: ${profile.equipment.join(", ") || "Ball only"}`,
    `Injuries/Limitations: ${profile.injuries?.trim() || "None reported"}`,
    `Self-Assessment (1-10): Passing ${profile.selfAssessment.passing}, Shooting ${profile.selfAssessment.shooting}, Dribbling ${profile.selfAssessment.dribbling}, First Touch ${profile.selfAssessment.firstTouch}, Speed ${profile.selfAssessment.speed}, Stamina ${profile.selfAssessment.stamina}, Defending ${profile.selfAssessment.defending}, Vision ${profile.selfAssessment.vision}`,
  ].join("\n");
}

export function buildChatSystemPrompt(params: {
  profile: PlayerProfile;
  planSummary?: string;
  recentMatches?: MatchEntry[];
  language: Language;
}): string {
  const { profile, planSummary, recentMatches, language } = params;
  const matchContext =
    recentMatches && recentMatches.length > 0
      ? `Recent matches: ${recentMatches
          .slice(0, 3)
          .map(
            (m) =>
              `vs ${m.opponent} (${m.minutesPlayed}m, ${m.goals}G/${m.assists}A, Rating ${m.rating}/10: ${m.notes})`
          )
          .join("; ")}`
      : "No recent matches logged yet.";

  return `${COACH_PERSONA_RULES}

Response Language: ${language === "ar" ? "Arabic (natural, modern football terminology)" : "English"}.

Active Player Context:
${formatPlayerContext(profile)}
Current Plan Overview: ${planSummary || "Custom 4-week skill cycle"}
${matchContext}

Keep responses crisp, well-structured with short bullet points or numbered cues, and tailored to this exact player.`;
}

export function buildPlanGenerationPrompt(params: {
  profile: PlayerProfile;
  adjustmentNote?: string;
  completedCount?: number;
  skippedCount?: number;
  language: Language;
}): string {
  const { profile, adjustmentNote, completedCount = 0, skippedCount = 0, language } = params;
  const sessionsPerWeek = Math.max(2, Math.min(5, profile.weeklyAvailability));

  return `${COACH_PERSONA_RULES}
Language for all text fields: ${language === "ar" ? "Arabic" : "English"}.

Task: Generate a 4-week progressive football training plan (${sessionsPerWeek} sessions per week, total ${sessionsPerWeek * 4} sessions — provide full rich drill detail for Week 1 & Week 2 and structured progressive sessions across all 4 weeks, keeping each session practical and concise).
Wait: keep total JSON compact enough to stay fast and reliable: generate 4 weeks x ${Math.min(3, sessionsPerWeek)} core sessions per week (${Math.min(3, sessionsPerWeek) * 4} sessions total) where each session contains 5 blocks: Warm-up, Technical, Physical, Game-Situation, and Cool-down.

Player Context:
${formatPlayerContext(profile)}
Progress so far: ${completedCount} completed sessions, ${skippedCount} skipped.
${adjustmentNote ? `Urgent Adaptation Request from Player: "${adjustmentNote}". Modify upcoming drills, equipment, duration, or intensity accordingly!` : ""}

Include a 2D pitch diagram on at least the primary Technical or Game-Situation drill of each session (coordinates x: 8..92, y: 8..92).`;
}

export function buildTechniqueAnalysisPrompt(params: {
  profile: PlayerProfile;
  category: string;
  notes?: string;
  previousScore?: number;
  previousFixes?: string[];
  language: Language;
}): string {
  const { profile, category, notes, previousScore, previousFixes, language } = params;
  const compareBlock = previousScore
    ? `Previous upload in this session had score ${previousScore}/100 with fixes: ${(previousFixes || []).join("; ")}. Explicitly compare visible mechanics here to those previous areas in comparisonNote.`
    : "This is the baseline upload for this skill; set comparisonNote to a clear baseline benchmark note.";

  return `${COACH_PERSONA_RULES}
Language for all text fields: ${language === "ar" ? "Arabic" : "English"}.

Analyze the uploaded football ${category} image(s) / video frames for:
${formatPlayerContext(profile)}
Player Notes: ${notes?.trim() || "None"}
${compareBlock}

Evaluate plant foot, ankle lock, knee bend, hip angle, torso lean, balance arm, eye contact, and follow-through.
Return:
- overallScore (integer 45-96 realistic to form visible)
- summary (2 concise sentences)
- strengths (2-3 concrete visible positives)
- priorityFixes (exactly 3 fixes, each with title, observation, correction, and correctiveDrill {name, reps, cue})
- timelineMoments (3-4 key phase moments e.g. "0.0s Approach", "0.3s Plant & Load", "0.5s Contact", "0.8s Follow-through" with rating Strong/Adjust/Fix)
- comparisonNote`;
}

export function buildTacticsPrompt(params: {
  profile: PlayerProfile;
  formation: FormationCode;
  position: PositionCode;
  boardTokensSummary?: string;
  question?: string;
  language: Language;
}): string {
  const { profile, formation, position, boardTokensSummary, question, language } = params;
  return `${COACH_PERSONA_RULES}
Language for all text fields: ${language === "ar" ? "Arabic" : "English"}.

Provide role-specific tactical guidance for a ${position} in a ${formation} formation.
Player context: ${profile.skillLevel} level, ${profile.dominantFoot}-footed, age ${profile.age}.
${boardTokensSummary ? `Current Interactive Tactics Board Layout (x: 0..100 left-to-right, y: 0..100 top attacking goal to bottom own goal):\n${boardTokensSummary}` : ""}
${question ? `Specific Scenario Question: "${question}"` : ""}

Return structured tactical guidance: positioning, 3 offBallMovement cues, 3 pressingTriggers, 3 commonSituations with clear tactical responses, and a crisp boardExplanation analyzing the current player token spacing.`;
}

export function buildMatchReviewPrompt(params: {
  profile: PlayerProfile;
  match: Omit<MatchEntry, "id" | "aiReview">;
  language: Language;
}): string {
  const { profile, match, language } = params;
  return `${COACH_PERSONA_RULES}
Language for all text fields: ${language === "ar" ? "Arabic" : "English"}.

Write a grounded, honest post-match review for ${profile.name} (${profile.position}, ${profile.skillLevel}):
Match: vs ${match.opponent} | Minutes: ${match.minutesPlayed} | Position: ${match.position}
Stats: ${match.goals} goals, ${match.assists} assists, ${match.passesCompleted} completed passes, Self-Rating: ${match.rating}/10
Player Notes: "${match.notes || "No notes provided."}"

Return summary (2 sentences), doneWell (exactly 3 specific points), and toImprove (exactly 3 actionable training adjustments).`;
}

export function buildWeeklySummaryPrompt(params: {
  profile: PlayerProfile;
  plan: TrainingPlan;
  matches: MatchEntry[];
  weeklyMinutes: number;
  language: Language;
}): string {
  const { profile, plan, matches, weeklyMinutes, language } = params;
  const completed = plan.sessions.filter((s) => s.status === "completed").length;
  return `${COACH_PERSONA_RULES}
Language for all text fields: ${language === "ar" ? "Arabic" : "English"}.

Generate a concise weekly progress review and updated AI-assessed skill estimates (1-10) for ${profile.name}.
${formatPlayerContext(profile)}
Training completed: ${completed}/${plan.sessions.length} sessions, ${weeklyMinutes} weekly load minutes.
Recent matches: ${matches.slice(0, 3).map((m) => `${m.opponent} (${m.rating}/10, ${m.goals}G ${m.assists}A)`).join("; ") || "None yet"}.

Return headline, 3 whatImproved bullets, 3 focusNext bullets, and aiAssessedSkills (integers 1-10 for passing, shooting, dribbling, firstTouch, speed, stamina, defending, vision).`;
}
