# Universal Metric Tracking Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Goal-Driven dynamic forms and universal metric tracking, removing hardcoded 'reading'/'running' logic from DB triggers and UI forms.

**Architecture:** 
1. The DB trigger is completely rewritten to dynamically extract the `metric_name` from a Goal's `target` and update `current_progress` for that specific key. 
2. The UI forms for Goals and Activities are updated to use React state. Goal creation allows users to define custom metric names (e.g., 'pages', 'laps'). Activity logging fetches active goals and renders an input based on the selected goal's metric.

**Tech Stack:** Supabase (PostgreSQL), Next.js (App Router), React Client Components, Server Actions, Tailwind CSS.

---

## Chunk 1: Database Trigger Refactoring

### Task 1: Replace Hardcoded DB Trigger with Universal Logic

**Files:**
- Create: `supabase/migrations/20260425000001_universal_metric_triggers.sql`

- [ ] **Step 1: Write Universal Trigger Migration**

```sql
-- Replace the hardcoded 'reading' trigger with a dynamic one
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
DECLARE
    target_metric TEXT;
    old_val NUMERIC;
    new_val NUMERIC;
    goal_record RECORD;
BEGIN
    -- Only process if an activity is explicitly linked to a goal
    IF (NEW.goal_id IS NOT NULL AND TG_OP IN ('INSERT', 'UPDATE')) THEN
        SELECT * INTO goal_record FROM goals WHERE id = NEW.goal_id;
        
        -- If the goal has a defined metric_name in its target JSON
        IF (goal_record.target ? 'metric_name') THEN
            target_metric := goal_record.target->>'metric_name';
            
            -- For INSERT
            IF (TG_OP = 'INSERT') THEN
                new_val := COALESCE((NEW.metrics->>target_metric)::NUMERIC, 0);
                
                UPDATE goals
                SET current_progress = jsonb_set(
                    COALESCE(current_progress, '{}'::jsonb),
                    array[target_metric],
                    to_jsonb(COALESCE((current_progress->>target_metric)::NUMERIC, 0) + new_val)
                )
                WHERE id = NEW.goal_id;
            
            -- For UPDATE
            ELSIF (TG_OP = 'UPDATE') THEN
                old_val := COALESCE((OLD.metrics->>target_metric)::NUMERIC, 0);
                new_val := COALESCE((NEW.metrics->>target_metric)::NUMERIC, 0);
                
                UPDATE goals
                SET current_progress = jsonb_set(
                    COALESCE(current_progress, '{}'::jsonb),
                    array[target_metric],
                    to_jsonb(COALESCE((current_progress->>target_metric)::NUMERIC, 0) - old_val + new_val)
                )
                WHERE id = NEW.goal_id;
            END IF;
        END IF;
    END IF;

    -- For DELETE
    IF (TG_OP = 'DELETE' AND OLD.goal_id IS NOT NULL) THEN
        SELECT * INTO goal_record FROM goals WHERE id = OLD.goal_id;
        
        IF (goal_record.target ? 'metric_name') THEN
            target_metric := goal_record.target->>'metric_name';
            old_val := COALESCE((OLD.metrics->>target_metric)::NUMERIC, 0);
            
            UPDATE goals
            SET current_progress = jsonb_set(
                COALESCE(current_progress, '{}'::jsonb),
                array[target_metric],
                to_jsonb(COALESCE((current_progress->>target_metric)::NUMERIC, 0) - old_val)
            )
            WHERE id = OLD.goal_id;
        END IF;
        
        RETURN OLD;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

- [ ] **Step 2: Commit Migration**

```bash
git add supabase/migrations/20260425000001_universal_metric_triggers.sql
git commit -m "feat: implement universal dynamic metric db trigger"
```

---

## Chunk 2: Goal Creation Refactor

### Task 2: Update Server Action for Universal Goals

**Files:**
- Modify: `src/app/actions/goal.ts`

- [ ] **Step 1: Refactor Action Logic**

Modify `createGoal` to accept `metric_name` and `target_value` instead of hardcoded distances/pages. Initialize `current_progress` dynamically based on the provided metric name. 

- [ ] **Step 2: Commit Server Action**

```bash
git add src/app/actions/goal.ts
git commit -m "feat: refactor createGoal action to use dynamic metrics"
```

### Task 3: Refactor Goal Creation UI (Client Component)

**Files:**
- Modify: `src/app/goals/new/page.tsx`

- [ ] **Step 1: Convert to Client Component**

Add `"use client"` at the top. Use React state to toggle between "Presets" (Running/Reading) and "Custom".
When a user selects "Custom", show inputs for "Metric Name" (e.g., "pages", "hours") and "Target Value". Provide hidden inputs to send these cleanly to the server action.

- [ ] **Step 2: Commit UI**

```bash
git add src/app/goals/new/page.tsx
git commit -m "feat: convert goal creation form to use dynamic metric selection"
```

---

## Chunk 3: Activity Logging Refactor

### Task 4: Update Server Action for Universal Activities

**Files:**
- Modify: `src/app/actions/activity.ts`

- [ ] **Step 1: Refactor Action Logic**

Modify `createManualActivity` to accept a dynamic `metric_name` and `metric_value` instead of hardcoded distance/duration. Construct the `metrics` JSON object dynamically: `{ [metric_name]: metric_value }`.

- [ ] **Step 2: Commit Server Action**

```bash
git add src/app/actions/activity.ts
git commit -m "feat: refactor createManualActivity action to use dynamic metrics"
```

### Task 5: Refactor Activity Logging UI (Client Component)

**Files:**
- Modify: `src/app/activities/new/page.tsx`

- [ ] **Step 1: Convert to Client Component & Fetch Goals**

Add `"use client"`. Fetch the user's active goals via Supabase client on mount.
Render a `<select>` dropdown to choose an active Goal.
When a Goal is selected, read its `target.metric_name` and display a numeric input with that label (e.g., "How many pages?"). Pass the selected `goal_id`, `metric_name`, and `metric_value` to the server action.

- [ ] **Step 2: Commit UI**

```bash
git add src/app/activities/new/page.tsx
git commit -m "feat: implement goal-driven dynamic activity logging form"
```

---

## Chunk 4: Dashboard Universal Rendering

### Task 6: Update Dashboard UI to Render Dynamic Metrics

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Render Progress Dynamically**

In the Active Goals map, check if `goal.target?.metric_name` exists. If so, read `goal.target.target_value` and `goal.current_progress[goal.target.metric_name]` to calculate the percentage and display the labels (e.g., "Target pages: 3000", "Current pages: 150"). Fall back to the old logic only for legacy 'cumulative' running goals if needed.

- [ ] **Step 2: Commit UI**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: render dynamic metric progress bars on dashboard"
```
