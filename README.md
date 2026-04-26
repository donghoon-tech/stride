# Stride: AI Goal & Fitness Coach

> A personal tracking app that logs activities via natural language chat and generates AI-driven plans, starting with reading and running.

---

## 1. Overview

### Core Concept
"Log your daily progress simply by chatting or manual entry, and let AI build your next schedule."

### #1 Primary Requirement & Use Case: Reading Tracker
**Goal:** Track book reading progress (e.g., 3000 pages per year).
**Mechanism:** Users log the number of pages they read each time (e.g., "15 pages"). 
**Architecture (Transactional Progress):** Instead of calculating the sum of all past logs on-the-fly, the `goals` table maintains a `current_progress` state. Whenever a new activity log is added, updated, or deleted, a database transaction (or Postgres trigger) automatically updates the `current_progress` column on the connected goal. This guarantees data integrity while optimizing read performance.

### The Problem
- Manual data entry in tracking apps is tedious.
- Accumulated data rarely answers the question: "What should I do next?"
- On-the-fly aggregation of thousands of logs becomes a performance bottleneck over time.

### The Solution
1. **Input:** Natural language chat or manual entry → AI/System parses it into structured data (Delta/Increment).
2. **Transactional State:** Database atomically aggregates the delta into the Goal's progress state.
3. **Analysis:** AI generates coaching feedback based on your history.
4. **Plan:** AI generates and automatically updates a weekly training/reading plan based on your goal.

---

## 2. Tech Stack

- **Frontend:** Next.js 14 (App Router), TailwindCSS, shadcn/ui
- **State Management:** Zustand (minimal client state)
- **Backend:** Next.js Server Actions
- **Database & Auth:** Supabase (PostgreSQL) with Row Level Security (RLS)
- **AI:** Google Gemini API (`@google/genai`), abstracted to allow model swapping
- **Deployment:** Vercel

---

## 3. Database Schema Concept

- **`goals`**: Stores user goals (e.g., "Read 3000 pages", "10km under 49 mins"). 
  - Uses `target` (JSONB) for flexibility (e.g., `{ "total_pages": 3000 }`).
  - **NEW:** Uses `current_progress` (JSONB) to maintain real-time aggregated state, updated transactionally via DB triggers.
- **`activities`**: Activity logs (e.g., "Read 15 pages"). 
  - Uses `metrics` (JSONB) to store the delta (increment).
  - **NEW:** Includes `goal_id` (UUID, Nullable) to explicitly link an activity to a specific goal for transactional updates.
- **`coach_messages`**: Stores the AI coaching history.
- **`training_plans`**: Stores the AI-generated weekly schedules.

---

## 4. Development Phases

### Phase 1: Reading & Running MVP (Current Focus)
- [x] Supabase project setup & RLS policies
- [x] Supabase Auth (Anonymous login)
- [x] LLM abstraction layer & Gemini Provider
- [ ] **[Priority 1]** Refactor Database: Add `goal_id` to activities and `current_progress` to goals. Implement DB Triggers for transactional progress tracking.
- [ ] **[Priority 1]** Reading Goal implementation: Create goals, log pages, auto-update progress.
- [x] Chat input → AI parse → DB save flow
- [x] Dashboard UI (Recent activities, Current goal)
- [x] AI coaching feedback generation
- [x] AI training plan generation

### Phase 2: Data I/O (Pending)
- [ ] CSV / Google Sheets / Notion DB Import & Export
- [ ] AI column mapping inference + User confirmation UI

### Phase 3: Expansion (Pending)
- [ ] Add support for pull-ups and other exercise types
- [ ] Generalize goal structures for non-fitness domains
- [ ] Speech-to-Text (STT) input integration

### Phase 4: Public Release (Pending)
- [ ] Multi-user onboarding (Google OAuth)
- [ ] User-specific LLM keys (Bring Your Own Key)
- [ ] Billing and plan structure

---

## 5. Environment Variables

To run this project locally, create a `.env.local` file with the following:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Provider
GEMINI_API_KEY=your_gemini_api_key
```

---

## 6. Next Steps
Move to implementing the **Transactional Progress Tracking (DB Triggers)** and **Reading Tracker MVP**, which are now the highest priority features.
