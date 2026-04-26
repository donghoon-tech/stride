# Reading Goal Architecture Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Transactional Progress Tracking for reading goals using Supabase DB triggers, and update the UI/Actions to support it.

**Architecture:** Database triggers intercept `INSERT`, `UPDATE`, and `DELETE` on the `activities` table to atomically update the `current_progress` JSONB field on the parent `goals` table. The frontend and server actions are updated to read this progress instead of aggregating on the fly.

**Tech Stack:** Supabase (PostgreSQL), Next.js (App Router), Server Actions, TypeScript, Tailwind CSS, shadcn/ui.

---

## Chunk 1: Database Migrations and Types

### Task 1: Create Database Migration for Trigger

**Files:**
- Create: `supabase/migrations/20260425000000_add_reading_goal_triggers.sql`

- [ ] **Step 1: Write Migration SQL**

```sql
-- 1. Add goal_id to activities
ALTER TABLE activities ADD COLUMN goal_id UUID REFERENCES goals(id);

-- 2. Add current_progress to goals
ALTER TABLE goals ADD COLUMN current_progress JSONB DEFAULT '{}'::jsonb;

-- 3. Create Trigger Function
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
DECLARE
    old_pages NUMERIC;
    new_pages NUMERIC;
    current_pages NUMERIC;
BEGIN
    -- Only process 'reading' activities
    IF (TG_OP = 'INSERT' AND NEW.activity_type = 'reading') THEN
        new_pages := COALESCE((NEW.metrics->>'pages_read')::NUMERIC, 0);
        
        UPDATE goals
        SET current_progress = jsonb_set(
            COALESCE(current_progress, '{}'::jsonb),
            '{pages_read}',
            to_jsonb(COALESCE((current_progress->>'pages_read')::NUMERIC, 0) + new_pages)
        )
        WHERE id = NEW.goal_id;

    ELSIF (TG_OP = 'UPDATE' AND NEW.activity_type = 'reading') THEN
        old_pages := COALESCE((OLD.metrics->>'pages_read')::NUMERIC, 0);
        new_pages := COALESCE((NEW.metrics->>'pages_read')::NUMERIC, 0);
        
        UPDATE goals
        SET current_progress = jsonb_set(
            COALESCE(current_progress, '{}'::jsonb),
            '{pages_read}',
            to_jsonb(COALESCE((current_progress->>'pages_read')::NUMERIC, 0) - old_pages + new_pages)
        )
        WHERE id = NEW.goal_id;

    ELSIF (TG_OP = 'DELETE' AND OLD.activity_type = 'reading') THEN
        old_pages := COALESCE((OLD.metrics->>'pages_read')::NUMERIC, 0);
        
        UPDATE goals
        SET current_progress = jsonb_set(
            COALESCE(current_progress, '{}'::jsonb),
            '{pages_read}',
            to_jsonb(COALESCE((current_progress->>'pages_read')::NUMERIC, 0) - old_pages)
        )
        WHERE id = OLD.goal_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create Trigger
CREATE TRIGGER on_activity_change
AFTER INSERT OR UPDATE OR DELETE ON activities
FOR EACH ROW EXECUTE FUNCTION update_goal_progress();
```

- [ ] **Step 2: Commit Migration**

```bash
git add supabase/migrations/20260425000000_add_reading_goal_triggers.sql
git commit -m "feat: add transactional progress tracking for reading goals via trigger"
```

### Task 2: Update Database Types

**Files:**
- Modify: `src/types/database.ts`

- [ ] **Step 1: Update Types**

Add `current_progress` to `goals` table (Row, Insert, Update) as `Json | null`.
Add `goal_id` to `activities` table (Row, Insert, Update) as `string | null`.

- [ ] **Step 2: Commit Types**

```bash
git add src/types/database.ts
git commit -m "feat: update db types for goal_id and current_progress"
```

---

## Chunk 2: Update Server Actions

### Task 3: Update `createGoal` Action

**Files:**
- Modify: `src/app/actions/goal.ts`

- [ ] **Step 1: Initialize `current_progress`**

Modify the `insert` call to set `current_progress: { pages_read: 0 }` if the `activity_type` is `'reading'`. Also update `target` to accept `total_pages` for reading.

- [ ] **Step 2: Commit Goal Action**

```bash
git add src/app/actions/goal.ts
git commit -m "feat: initialize current_progress on goal creation"
```

### Task 4: Update `createManualActivity` Action

**Files:**
- Modify: `src/app/actions/activity.ts`

- [ ] **Step 1: Add `goal_id` and Reading Metrics**

Update the action to accept a `goal_id` from the form data and insert it. Add handling for `pages_read` in the `metrics` jsonb object if `activity_type` is `'reading'`.

- [ ] **Step 2: Commit Activity Action**

```bash
git add src/app/actions/activity.ts
git commit -m "feat: handle goal_id and pages_read in manual activity creation"
```

---

## Chunk 3: Update Dashboard UI

### Task 5: Read `current_progress` on Dashboard

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Fetch and Render Progress**

Instead of reducing `activities` on the fly, read `current_progress->>'pages_read'` from the active reading goal to display the progress bar. Also pass `goal.id` to the manual activity creation form.

- [ ] **Step 2: Update UI Logic**

Ensure the progress calculates as `(current_progress.pages_read / target.total_pages) * 100`.

- [ ] **Step 3: Commit Dashboard**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: use transactional current_progress for dashboard rendering"
```
