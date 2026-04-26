# Reading Range Tracking Implementation Plan

**Goal:** Implement absolute page tracking and custom reading ranges for reading goals.

## Step 1: Database Trigger Update
**Goal:** Sync `last_page` from activities to goals automatically.

- **Action:** Update `supabase/migrations/20260425000001_universal_metric_triggers.sql` (or create a new migration) to include `last_page` synchronization.
- **Verification:** Manually insert an activity with `metrics: {"last_page": 50}` and verify that the corresponding goal's `current_progress` is updated with `last_page: 50`.

## Step 2: Update Goal Creation Action
**Goal:** Support `start_page` and `end_page` in `createGoal`.

- **Action:** Modify `src/app/actions/goal.ts`:
    - Check if `activity_type` is `reading`.
    - Read `start_page` and `end_page` from `formData`.
    - If provided, set `target_value = end_page - start_page`.
    - Initialize `current_progress` with `{ metric: 0, last_page: start_page }`.
- **Verification:** Create a reading goal with start: 30, end: 250. Verify in DB that `target_value` is 220 and `last_page` is 30.

## Step 3: Update Activity Logging Action
**Goal:** Handle `current_page` input and calculate delta.

- **Action:** Modify `src/app/actions/activity.ts`:
    - If `goal_id` is provided and it's a reading goal.
    - If `current_page` is provided in `formData`.
    - Fetch the goal's `last_page`.
    - Calculate `delta = current_page - last_page`.
    - Set `metrics[metric_name] = delta` and `metrics.last_page = current_page`.
- **Verification:** Log an activity for a goal with `last_page: 30` by entering `current_page: 50`. Verify that the activity has `pages: 20` and the goal progress updates to 20 pages and `last_page: 50`.

## Step 4: Update Goal Creation UI
**Goal:** Add start/end page fields to the form.

- **Action:** Modify `src/app/goals/new/page.tsx`:
    - Add fields for `start_page` and `end_page` when `activityType === 'reading'`.
    - Hide `metric_name` and `target_value` for reading preset (hardcode 'pages').
- **Verification:** Visit `/goals/new`, select "Reading", and see the new fields.

## Step 5: Update Activity Logging UI
**Goal:** Add "Current Page" input to the form.

- **Action:** Modify `src/app/activities/new/page.tsx`:
    - If a reading goal is selected, show `Current Page` input.
    - Fetch and display the previous `last_page` as a hint.
- **Verification:** Visit `/activities/new`, select a reading goal, and see "Current Page" input.

## Step 6: Update Goal Card UI
**Goal:** Display progress in terms of pages reached.

- **Action:** Modify `src/components/dashboard/GoalCard.tsx`:
    - For reading goals with `last_page`, display "Page X of Y" (where Y is `end_page`).
- **Verification:** View the dashboard and see the updated Goal Card.

## Step 7: Update AI Parsing Logic
**Goal:** Support natural language like "I read up to page 100".

- **Action:** Modify `src/app/actions/chat.ts`:
    - Similar to `createManualActivity`, handle `last_page` in the parsed results.
- **Verification:** Chat "I read up to page 100" and verify it correctly logs the delta.
