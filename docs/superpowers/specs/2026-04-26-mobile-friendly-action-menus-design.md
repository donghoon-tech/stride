# Spec: Mobile-Friendly Action Menus for Goals and Activities

## 1. Overview
The current implementation of deletion functionality relies on a `hover` state, which is inaccessible on mobile devices. This spec introduces a more robust, mobile-friendly UI using a "More" (Vertical Dots) dropdown menu for each goal and activity card. This pattern provides a consistent UX across desktop and mobile and offers better extensibility for future features like "Edit".

## 2. Goals
- Provide full functionality on touch devices.
- Improve UX by grouping actions (Delete, and eventually Edit).
- Maintain visual consistency with existing `shadcn/ui` components.
- Ensure security by continuing to use authenticated Server Actions.

## 3. Design
### UI/UX
- **Trigger**: A `MoreVertical` icon button placed in the top-right corner of both Goal and Activity cards.
- **Menu Appearance**: When clicked/touched, a dropdown menu appears near the trigger.
- **Menu Items**:
    - **Edit**: (Placeholder for now) Label with `Pencil` icon.
    - **Delete**: Label with `Trash2` icon, styled with red text/hover state to indicate a destructive action.
- **Visibility**: To keep the UI clean, the trigger icon will have a slightly lower opacity (e.g., `opacity-50`) by default and increase to `opacity-100` on hover (desktop) or when active.

### Components
- Use `shadcn/ui` `DropdownMenu` primitives.
- Icons from `lucide-react`: `MoreVertical`, `Pencil`, `Trash2`.

## 4. Technical Architecture
### Data Flow
1. User clicks the `MoreVertical` button.
2. `DropdownMenu` opens locally (client-side state).
3. User clicks "Delete".
4. A client-side transition (or form action) calls the existing `deleteActivity` or `deleteGoal` Server Action.
5. Server performs the deletion and calls `revalidatePath('/dashboard')`.
6. Next.js re-renders the dashboard, removing the deleted item.

### New Dependencies
- `@radix-ui/react-dropdown-menu` (via `npx shadcn@latest add dropdown-menu`)

## 5. Security & Validation
- No changes to existing security logic; Server Actions already verify `user_id` and authentication.
- Added benefit: Grouping destructive actions under a menu reduces accidental deletions.

## 6. Testing Strategy
- **Manual Mobile Test**: Verify menu opens and actions execute on mobile viewport simulation.
- **Regression Test**: Ensure deleting a goal still correctly unlinks activities and removes plans.
- **Layout Test**: Ensure dropdown menus don't cause layout shifts or get cut off at screen edges.
