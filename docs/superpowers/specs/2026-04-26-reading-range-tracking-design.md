# Reading Goal: Page Range & Absolute Progress Tracking

This document outlines the design for improving the reading tracker to support absolute page tracking (e.g., "up to page 50") and custom reading ranges (e.g., "reading from page 30 to 250").

## Problem Statement
Current reading goals only track cumulative "pages read". Users find it tedious to calculate how many pages they read between sessions. They also want to define specific reading ranges within a book to accurately reflect progress.

## Requirements
1.  **Reading Range Definition:** When creating a goal, users can specify a `start_page` and `end_page`.
2.  **Absolute Tracking:** Users can log activity by entering the `current_page` reached.
3.  **Automatic Delta Calculation:** The system calculates `pages_read = current_page - last_page_read`.
4.  **UI Updates:**
    *   Goal Creation: Support `start_page` and `end_page`.
    *   Activity Logging: Support `current_page` input for reading goals.
    *   Dashboard: Display "Page 70 / 250" instead of just "40 pages".

## Architecture Changes

### Database
*   **Trigger Update:** `update_goal_progress` trigger in Supabase will be updated to sync `last_page` from activity metrics to the goal's `current_progress`.
*   **Goal Target Schema:** 
    ```json
    {
      "metric_name": "pages",
      "start_page": 30,
      "end_page": 250,
      "target_value": 220
    }
    ```
*   **Goal Progress Schema:**
    ```json
    {
      "pages": 40,
      "last_page": 70
    }
    ```

### Server Actions
*   `createGoal`: Calculate `target_value` as `end_page - start_page`. Initialize `last_page` in `current_progress`.
*   `createManualActivity`: If `last_page` is provided, calculate delta and update `metrics`.
*   `processUserMessage`: Update AI logic to handle "I read up to page X".

### Frontend
*   `NewGoalPage`: Conditional fields for reading goals.
*   `NewActivityPage`: "Current Page" input with "Previous Page" context.
*   `GoalCard`: Improved display for reading goals.

## Implementation Plan

### Phase 1: Database & Actions
1.  Update DB trigger to support `last_page` synchronization.
2.  Modify `createGoal` to handle reading ranges.
3.  Modify `createManualActivity` to handle absolute page inputs.

### Phase 2: Frontend
1.  Update `NewGoalPage` UI.
2.  Update `NewActivityPage` UI.
3.  Update `GoalCard` UI.

### Phase 3: AI & Refinement
1.  Update AI parsing logic in `processUserMessage`.
2.  Test with various scenarios.
