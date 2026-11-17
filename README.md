# PitchMind — Personal AI Football Coach

PitchMind is a mobile-first React, TypeScript, and Tailwind CSS football coaching application powered by the Gemini API (`@google/genai`) through an Express backend.

## Features

- **Onboarding & Player Profile**: Captures age, height/weight, dominant foot, position (`GK` through `Striker`), skill level, weekly availability, equipment, injuries/limitations, and an 8-skill self-assessment. Enforces U18 youth intensity safeguards.
- **AI Coach Chat**: Streaming SSE coaching conversation aware of your profile, 4-week plan, and match history, with quick-action chips and Web Speech API voice input.
- **4-Week Adaptive Training Plans**: Structured 5-phase sessions (`Warm-up`, `Technical`, `Physical`, `Game-Situation`, `Cool-down`) with animated SVG pitch diagrams and one-tap adjustments (`Too hard`, `No cones today`, `Only 20 minutes`).
- **Technique Analysis (Photo & Video)**: Extracts frames from uploaded videos or photos and returns a biomechanical score, strengths, 3 priority fixes with corrective drills, timestamped moments, and comparison against previous uploads.
- **Tactics & Match Prep**: Interactive drag-and-drop formation board (`4-3-3`, `4-4-2`, `3-5-2`, `4-2-3-1`) with AI scenario explanations, pressing triggers, and a pre-match checklist.
- **Match Log & Self-Review**: Tracks season totals, rating trends, and generates structured 3+3 post-match AI reviews.
- **Fitness, Nutrition & Recovery**: Weekly acute load tracker with overtraining alert, hydration counter, conditioning routines, meal-timing, and recovery protocols.
- **English & Arabic (RTL) + Light/Dark Mode**: Full bilingual layout switching and persistent local storage.

## Setup & API Key Usage

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `GEMINI_API_KEY` in your environment (or **Settings > Secrets** in AI Studio). All `@google/genai` calls run server-side inside `server.ts` so credentials never reach the browser.
3. Start development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   npm start
   ```

## Project Structure

- `server.ts` — Express server + `/api/coach/*` Gemini endpoints
- `src/prompts/coachTemplates.ts` — Centralized coaching persona, safety rules, and prompt builders
- `src/services/aiClient.ts` — Typed client API wrappers for all AI features
- `src/hooks/useLocalStorage.ts` — Persistent local state hook
- `src/types/pitchmind.ts` — Domain TypeScript types
- `src/data/` — Translations (`i18n.ts`) and initial seed data (`seedData.ts`)
- `src/components/` — Navigation, animated pitch diagrams, charts/rings, and profile modal
- `src/pages/` — Dashboard, Chat, TrainingPlan, Technique, Tactics, MatchLog, FitnessRecovery, Settings

## Adding a Backend, Auth, and Push Notifications Later

- **Database Backend**: Replace `useLocalStorage` state setters in `src/App.tsx` with REST/GraphQL calls or a repository adapter backed by PostgreSQL (Cloud SQL + Drizzle) or Firestore, keeping the TypeScript interfaces in `src/types/pitchmind.ts`.
- **Authentication**: Add Firebase Auth or OAuth middleware in `server.ts` to verify JWT bearer tokens on `/api/coach/*` routes and scope stored plans/matches by `userId`.
- **Push Notifications**: Register a Service Worker (`navigator.serviceWorker.register('/sw.js')`) and store Web Push subscriptions in your backend to send scheduled training reminders, hydration prompts, and post-match review nudges.
