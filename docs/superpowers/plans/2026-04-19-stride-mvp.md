# Stride MVP Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the MVP for Stride, an AI-powered fitness app where users log running activities via natural language chat and receive structured data and coaching.

**Architecture:** Next.js 14 App Router frontend. Supabase handles database (PostgreSQL) and Auth. Server Actions proxy API calls to the LLM provider (Gemini) for natural language parsing and coaching generation. Zustand is used for minimal client state (e.g., chat optimistic updates). UI is built with Tailwind CSS and shadcn/ui.

**Tech Stack:** Next.js (React Server Components), Tailwind CSS, shadcn/ui, Zustand, Supabase, Gemini API.

---

## Chunk 1: Project Setup and Infrastructure

### Task 1: Initialize Next.js Project with Tailwind and shadcn/ui
**Files:**
- Create: `package.json`, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `components.json`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`

- [ ] **Step 1: Initialize Next.js project**
Run: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`
Note: Accept all defaults if prompted.

- [ ] **Step 2: Initialize shadcn/ui**
Run: `npx shadcn@latest init -y`

- [ ] **Step 3: Run dev server to verify**
Run: `npm run dev` and ensure it loads without errors.

- [ ] **Step 4: Commit**
```bash
git add .
git commit -m "chore: initialize next.js with tailwind and shadcn"
```

### Task 2: Supabase Client and Auth Setup
**Files:**
- Create: `.env.local`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/app/login/page.tsx`

- [ ] **Step 1: Install Supabase packages**
Run: `npm install @supabase/supabase-js @supabase/ssr`

- [ ] **Step 2: Write Supabase client utility**
```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 3: Write Supabase server utility**
Create `src/lib/supabase/server.ts` according to the Supabase SSR docs for Next.js App Router (using cookies).

- [ ] **Step 4: Create basic Login page (Email/Password or Anonymous for now)**
Create a simple form in `src/app/login/page.tsx` to handle authentication.

- [ ] **Step 5: Commit**
```bash
git add .
git commit -m "feat: setup supabase ssr clients and basic login page"
```

---

## Chunk 2: Database Schema and LLM Abstraction

### Task 3: Define Supabase Schema
**Files:**
- Create: `supabase/migrations/0000_initial_schema.sql`
- Create: `src/types/database.ts`

- [ ] **Step 1: Write SQL migration file**
Include tables: `goals`, `activities`, `coach_messages`, `training_plans` with RLS policies based on `auth.uid()`.
Ensure `metrics` in `activities` is `JSONB`.

- [ ] **Step 2: Define TypeScript types**
Create `src/types/database.ts` mapping the Supabase schema to TypeScript interfaces.

- [ ] **Step 3: Commit**
```bash
git add supabase src/types
git commit -m "feat: define initial database schema and typescript types"
```

### Task 4: LLM Provider Abstraction
**Files:**
- Create: `src/lib/llm/types.ts`
- Create: `src/lib/llm/providers/gemini.ts`
- Create: `src/lib/llm/index.ts`

- [ ] **Step 1: Define LLM Interfaces**
Define `LLMProvider` in `types.ts` with `parse`, `chat`, and `generatePlan` methods.

- [ ] **Step 2: Install AI SDK**
Run: `npm install @google/genai`

- [ ] **Step 3: Implement Gemini Provider**
Create `gemini.ts` using `@google/genai` to implement the `LLMProvider` interface. Use structured outputs (JSON schema) for the `parse` method to extract Date, Distance, Duration, Pace, HR, Cadence, and Difficulty.

- [ ] **Step 4: Export Provider Factory**
In `index.ts`, conditionally export the provider based on `process.env.LLM_PROVIDER`.

- [ ] **Step 5: Commit**
```bash
git add src/lib/llm package.json package-lock.json
git commit -m "feat: create llm abstraction layer with gemini provider"
```

---

## Chunk 3: Chat Input and Activity Parsing

### Task 5: Chat UI and Server Action
**Files:**
- Create: `src/app/coach/page.tsx`
- Create: `src/components/chat/ChatInterface.tsx`
- Create: `src/app/actions/chat.ts`

- [ ] **Step 1: Build Chat UI**
Use shadcn/ui components (Input, Button, ScrollArea) to build a basic chat interface in `ChatInterface.tsx`. Use `zustand` to manage local message state.

- [ ] **Step 2: Write Server Action for Chat**
Create `chat.ts` Server Action. It should receive the user message, pass it to `llm.parse()`, and return the parsed activity data and AI confidence score.

- [ ] **Step 3: Connect UI to Action**
Update `ChatInterface.tsx` to call the Server Action on submit and render the response (or a confirmation card if confidence is low).

- [ ] **Step 4: Commit**
```bash
git add src/app/coach src/components/chat src/app/actions
git commit -m "feat: implement chat interface and ai parsing server action"
```

### Task 6: Save Parsed Activity to DB
**Files:**
- Modify: `src/app/actions/chat.ts`
- Create: `src/components/chat/ActivityCard.tsx`

- [ ] **Step 1: Save to Supabase**
If the parsed activity is confirmed (confidence > 0.8 or user confirmed), insert it into the `activities` table using the Supabase server client.

- [ ] **Step 2: Render Activity Card**
Create an `ActivityCard` component to visually display the parsed metrics (Distance, Pace, HR, etc.) in the chat.

- [ ] **Step 3: Commit**
```bash
git add .
git commit -m "feat: save parsed activities to database and render ui cards"
```

---

## Chunk 4: Dashboard and Insights

### Task 7: Dashboard Layout and Recent Activities
**Files:**
- Create: `src/app/dashboard/page.tsx`
- Create: `src/components/dashboard/RecentActivities.tsx`

- [ ] **Step 1: Fetch Activities**
In the Server Component `page.tsx`, fetch the user's recent activities from Supabase.

- [ ] **Step 2: Render Feed**
Build the `RecentActivities` list component displaying the fetched data.

- [ ] **Step 3: Commit**
```bash
git add src/app/dashboard src/components/dashboard
git commit -m "feat: create dashboard and display recent activities"
```

### Task 8: Basic Insights Charts
**Files:**
- Create: `src/app/insights/page.tsx`
- Create: `src/components/charts/DistanceChart.tsx`

- [ ] **Step 1: Install Recharts**
Run: `npm install recharts`

- [ ] **Step 2: Create Chart Component**
Build a `DistanceChart` using Recharts to show cumulative distance over the last 7 days.

- [ ] **Step 3: Render on Insights Page**
Fetch data and render the chart in `src/app/insights/page.tsx`.

- [ ] **Step 4: Commit**
```bash
git add src/app/insights src/components/charts package.json package-lock.json
git commit -m "feat: add distance insight chart using recharts"
```

---

## Chunk 5: AI Coaching and Plans

### Task 9: AI Coaching Feedback
**Files:**
- Modify: `src/app/actions/chat.ts`
- Modify: `src/lib/llm/providers/gemini.ts`

- [ ] **Step 1: Generate Coaching Message**
After saving an activity in `chat.ts`, fetch the last 7 days of activities, pass them along with the new activity to `llm.chat()`, and generate a brief coaching feedback message.

- [ ] **Step 2: Save and Return Feedback**
Save the AI's response to `coach_messages` and return it to the UI to be displayed in the chat.

- [ ] **Step 3: Commit**
```bash
git add .
git commit -m "feat: generate and display ai coaching feedback after logging"
```

### Task 10: Weekly Training Plan Generation
**Files:**
- Create: `src/app/plan/page.tsx`
- Create: `src/app/actions/plan.ts`

- [ ] **Step 1: Define Plan Generation Action**
Create a Server Action `generateWeeklyPlan` that takes the user's goal and recent history, calls `llm.generatePlan()`, and saves the structured plan to `training_plans`.

- [ ] **Step 2: Build Plan UI**
Create the `plan/page.tsx` to fetch the current active plan from DB and display it using shadcn/ui Cards/Tables. Add a button to manually trigger a plan refresh.

- [ ] **Step 3: Commit**
```bash
git add src/app/plan src/app/actions
git commit -m "feat: implement automatic weekly training plan generation"
```
