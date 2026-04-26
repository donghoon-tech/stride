# Mobile-Friendly Action Menus Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hover-based deletion with a mobile-friendly dropdown menu (MoreVertical) on Goal and Activity cards, including a confirmation dialog for safety.

**Architecture:** 
- Extract `GoalCard` from the main dashboard to improve maintainability.
- Use `shadcn/ui` `DropdownMenu` for the "Edit/Delete" actions.
- Use `shadcn/ui` `AlertDialog` for deletion confirmation.
- Use `useTransition` for better loading states during server action execution.

**Tech Stack:** Next.js Server Actions, shadcn/ui (Radix UI), Lucide Icons.

---

## Chunk 1: Setup and UI Components

### Task 1: Install shadcn/ui Components

**Files:**
- Create: `src/components/ui/dropdown-menu.tsx`
- Create: `src/components/ui/alert-dialog.tsx`

- [ ] **Step 1: Install Dropdown Menu**
Run: `npx shadcn@latest add dropdown-menu`

- [ ] **Step 2: Install Alert Dialog**
Run: `npx shadcn@latest add alert-dialog`

- [ ] **Step 3: Verify files exist**
Check if `src/components/ui/dropdown-menu.tsx` and `src/components/ui/alert-dialog.tsx` are created.

- [ ] **Step 4: Commit**
```bash
git add src/components/ui/dropdown-menu.tsx src/components/ui/alert-dialog.tsx
git commit -m "chore: add dropdown-menu and alert-dialog shadcn components"
```

---

## Chunk 2: GoalCard Extraction and Refactoring

### Task 2: Create GoalCard Component

**Files:**
- Create: `src/components/dashboard/GoalCard.tsx`
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Create GoalCard.tsx**
Extract the goal card rendering logic from `src/app/dashboard/page.tsx` into a new client component. Include the progress calculation and the new Dropdown/AlertDialog UI.

```tsx
// Partial structure for GoalCard.tsx
"use client"

import { Goal } from '@/lib/llm/types'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { deleteGoal } from '@/app/actions/goal'
import { useTransition } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function GoalCard({ goal, activities }: { goal: Goal, activities: any[] }) {
  const [isPending, startTransition] = useTransition()
  // ... progress logic ...
  return (
    <div className="bg-gray-50 border rounded-xl p-5 space-y-4 transition-all hover:border-gray-300 group relative">
       {/* UI with DropdownMenu and AlertDialog */}
    </div>
  )
}
```

- [ ] **Step 2: Update DashboardPage to use GoalCard**
Modify `src/app/dashboard/page.tsx` to import and use the new `GoalCard` component.

- [ ] **Step 3: Commit**
```bash
git add src/components/dashboard/GoalCard.tsx src/app/dashboard/page.tsx
git commit -m "refactor: extract GoalCard component and add action menu with confirmation"
```

---

## Chunk 3: ActivityCard Menu Update

### Task 3: Update ActivityCard and RecentActivities

**Files:**
- Modify: `src/components/chat/ActivityCard.tsx`
- Modify: `src/components/dashboard/RecentActivities.tsx`

- [ ] **Step 1: Update ActivityCard.tsx**
Add support for an optional action menu. Since `ActivityCard` is used in chat, we only want the menu when it's displayed in the "Recent Activities" list.

- [ ] **Step 2: Update RecentActivities.tsx**
Update the rendering loop to use the new menu-enabled `ActivityCard` and remove the old absolute-positioned trash icon.

- [ ] **Step 3: Commit**
```bash
git add src/components/chat/ActivityCard.tsx src/components/dashboard/RecentActivities.tsx
git commit -m "feat: update ActivityCard with dropdown menu and confirmation dialog"
```

---

## Chunk 4: Final Polish and Verification

### Task 4: Final Verification

- [ ] **Step 1: Run Linting**
Run: `npm run lint`

- [ ] **Step 2: Manual Verification**
- Check Goal Card menu on mobile/desktop.
- Check Activity Card menu on mobile/desktop.
- Verify Delete confirmation works.
- Verify "Edit" placeholder exists.

- [ ] **Step 3: Commit**
```bash
git commit --allow-empty -m "docs: finalize mobile-friendly menus implementation"
```
