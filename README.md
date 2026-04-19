# Stride: AI Fitness Coach

> A personal fitness app that logs workouts via natural language chat and generates AI-driven training plans.

---

## 1. Overview

### Core Concept
"Log your workouts simply by chatting, and let AI build your next training schedule."

### The Problem
- Manual data entry in fitness apps is tedious.
- Accumulated data rarely answers the question: "What should I do next?"
- Migrating existing data (Google Sheets, Notion, CSV) is difficult.

### The Solution
1. **Input:** Natural language chat → AI parses it into structured data.
2. **Analysis:** AI generates coaching feedback based on your history.
3. **Plan:** AI generates and automatically updates a weekly training plan based on your goal.

### Vision for Expansion
- **General Goal Achievement:** While the MVP focuses on running, the ultimate vision is a general AI coach for any goal (e.g., reading 10 books, studying, dieting).
- **Flexible Architecture:** To support this, the database uses schema-less `JSONB` columns for metrics, relying on the LLM's reasoning capabilities rather than hardcoded logic.

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

- **`goals`**: Stores user goals (e.g., "10km under 49 mins"). Uses `target` (JSONB) for flexibility.
- **`activities`**: Workout logs. Uses `metrics` (JSONB) to store dynamic fields (distance, duration, HR, etc.) without strict columns.
- **`coach_messages`**: Stores the AI coaching history.
- **`training_plans`**: Stores the AI-generated weekly schedules.

---

## 4. Development Phases

### Phase 1: Running MVP (✅ Completed)
- [x] Supabase project setup & RLS policies
- [x] Supabase Auth (Anonymous login)
- [x] LLM abstraction layer & Gemini Provider
- [x] Chat input → AI parse → DB save flow
- [x] Dashboard UI (Recent activities, Current goal)
- [x] Insights chart (7-day distance using Recharts)
- [x] AI coaching feedback generation
- [x] AI training plan generation

### Phase 2: Data I/O (Pending)
- [ ] CSV / Google Sheets / Notion DB Import & Export
- [ ] AI column mapping inference + User confirmation UI
- [ ] Data migration strategy execution

### Phase 3: Expansion (Pending)
- [ ] Add support for pull-ups and other exercise types
- [ ] Generalize goal structures for non-fitness domains (Reading, etc.)
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
Move to **Phase 2**, which focuses on Data I/O. The primary task is implementing import and export functionality for CSV, Google Sheets, and Notion, alongside an AI-driven column mapping UI to ingest users' historical data effortlessly.
