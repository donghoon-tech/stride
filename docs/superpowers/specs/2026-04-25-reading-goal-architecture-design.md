# Reading Goal & Transactional Progress Architecture Design

## 1. Overview
The primary use case for the Stride MVP is now tracking reading progress (e.g., reading 3000 pages per year) alongside running. 

## 2. Architecture Change: Transactional Progress Tracking
Previously, progress was calculated "on-the-fly" by querying all past activities and reducing their `metrics`. As the number of logs grows, this becomes a performance bottleneck. 

To address this, we are shifting to a **Transactional Progress Tracking** model:
- The `goals` table will now maintain a `current_progress` JSONB state.
- The `activities` table will include a `goal_id` to explicitly link an activity to its parent goal.
- A PostgreSQL Database Trigger will automatically update the `goals.current_progress` whenever an activity is inserted, updated, or deleted.

## 3. Data Structure
- **Goal:**
  ```json
  {
    "id": "uuid",
    "activity_type": "reading",
    "target": { "total_pages": 3000 },
    "current_progress": { "pages_read": 150 }
  }
  ```
- **Activity (Delta):**
  ```json
  {
    "id": "uuid",
    "goal_id": "uuid",
    "activity_type": "reading",
    "metrics": { "pages_read": 15 }
  }
  ```

## 4. Workflows

### Creating a Log (e.g., "I read 15 pages today")
1. The user inputs 15 pages via manual entry or chat.
2. The Server Action inserts a new row into `activities` with `metrics: { "pages_read": 15 }` and the `goal_id`.
3. The DB Trigger intercepts the `INSERT`.
4. The Trigger reads `NEW.metrics->>'pages_read'`, adds it to the Goal's `current_progress->>'pages_read'`, and updates the `goals` table atomically.

### Updating/Deleting a Log
1. The DB Trigger intercepts the `UPDATE` or `DELETE`.
2. It calculates the difference between `OLD.metrics` and `NEW.metrics`.
3. It applies this difference to the Goal's `current_progress` atomically, ensuring strict data integrity.

## 5. UI Updates
- The Dashboard will now directly read `goals.current_progress` to render progress bars, eliminating the need to fetch and sum all `activities` on load.
- The Activity Input Form will dynamically show "Pages Read" when the "Reading" activity type is selected.
