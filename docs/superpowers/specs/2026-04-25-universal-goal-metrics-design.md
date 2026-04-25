# Goal-Driven Dynamic Forms & Universal Metric Tracking

## 1. Overview
The current Stride application hardcodes 'running' (distance, time) and 'reading' (pages) into its UI forms and Database triggers. To achieve the project's Phase 3 vision of being a "Universal AI Coach" that can track anything, we need to shift to a **Goal-Driven** architecture where the *Goal* defines the *Metric Name* to track, and the *Activity Input* simply provides a delta for that specific metric.

## 2. Architecture Change

### Concept: The Goal owns the Metric Definition
Instead of the system hardcoding that "reading" means "pages", the user will define this when creating a Goal. 
- A goal will track ONE primary metric (e.g., `pages`, `km`, `hours`, `laps`).
- The `target` column in the `goals` table will store the name of the metric. Example: `{ "metric_name": "pages", "target_value": 3000 }`.

### Concept: The DB Trigger tracks dynamically
Instead of hardcoding `IF NEW.activity_type = 'reading'`, the DB trigger will:
1. Look up the parent Goal (`NEW.goal_id`).
2. Read the `metric_name` from the Goal's target (e.g., `"pages"`).
3. Check if the incoming Activity has that metric in its `metrics` JSON (e.g., `NEW.metrics->>'pages'`).
4. If so, add it to the Goal's `current_progress->>'pages'`.

## 3. Form Redesign

### Goal Creation Form (`/goals/new`)
- Ask for Goal Title ("Read JavaScript Book").
- Ask for Goal Type ("Cumulative" or "Record").
- **NEW**: Ask for the **Unit/Metric Name** (e.g., "pages", "km", "hours").
- Ask for the **Target Value** (e.g., "800").

### Activity Logging Form (`/activities/new`)
- **NEW**: Instead of asking for "Activity Type" first, ask: **"Which Goal are you logging progress for?"** (Dropdown of active goals).
- When a Goal is selected, read its `metric_name` (e.g., "pages") and render a single number input labeled "How many [pages]?"
- Save this number into the `metrics` JSON under the correct key.

## 4. Data Structure Examples

**Goal:**
```json
{
  "id": "uuid-1",
  "title": "Read JS Book",
  "activity_type": "custom", 
  "target": { "metric_name": "pages", "target_value": 800 },
  "current_progress": { "pages": 0 }
}
```

**Activity:**
```json
{
  "goal_id": "uuid-1",
  "activity_type": "custom",
  "metrics": { "pages": 15 } // Dynamically matches the Goal's metric_name
}
```

## 5. UI Updates to Dashboard
The Dashboard will read `target.metric_name`, `target.target_value`, and `current_progress[metric_name]` to render progress bars dynamically, regardless of what unit the user chose.