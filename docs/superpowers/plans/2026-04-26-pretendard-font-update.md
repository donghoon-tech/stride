# UI Font Update to Pretendard Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Geist Sans with Pretendard Variable font for improved legibility and aesthetic balance.

**Architecture:**
- Download the Pretendard Variable font asset to the local project.
- Use `next/font/local` for optimized loading and zero layout shift.
- Integrate with Tailwind CSS v4 using CSS variables and the `@theme` block.

**Tech Stack:** Next.js (next/font/local), Tailwind CSS v4.

---

## Chunk 1: Asset Acquisition

### Task 1: Download Pretendard Variable Font

**Files:**
- Create: `public/fonts/PretendardVariable.woff2`

- [ ] **Step 1: Create fonts directory**
Run: `mkdir -p public/fonts`

- [ ] **Step 2: Download the font file**
We use the official jsDelivr CDN for a reliable source.
Run: `curl -L https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/public/static/PretendardVariable.woff2 -o public/fonts/PretendardVariable.woff2`

- [ ] **Step 3: Verify download**
Run: `ls -lh public/fonts/PretendardVariable.woff2`
Expected: File exists and is approximately 1.5MB - 2MB.

- [ ] **Step 4: Commit**
```bash
git add public/fonts/PretendardVariable.woff2
git commit -m "chore: add Pretendard Variable font asset"
```

---

## Chunk 2: Layout Integration

### Task 2: Configure next/font in layout.tsx

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update imports and font definition**
Replace `Geist` with `localFont` from `next/font/local`. Define the `pretendard` font. Keep `Geist_Mono`.

```tsx
// src/app/layout.tsx
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google"; // Keep Mono

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920", // Variable font weight range
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```

- [ ] **Step 2: Update RootLayout class names**
Replace `geistSans.variable` with `pretendard.variable`. Keep `geistMono.variable`.

```tsx
// src/app/layout.tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${pretendard.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* ... */}
    </html>
  );
}
```

- [ ] **Step 3: Commit**
```bash
git add src/app/layout.tsx
git commit -m "refactor: replace Geist Sans with Pretendard using next/font/local"
```

---

## Chunk 3: Tailwind CSS v4 Configuration

### Task 3: Update CSS Variables and Theme

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update @theme block**
Map `--font-sans` to the new `--font-pretendard` variable.

```css
/* src/app/globals.css */
@theme inline {
  /* ... */
  --font-sans: var(--font-pretendard);
  --font-mono: var(--font-geist-mono);
  /* ... */
}
```

- [ ] **Step 2: Cleanup (Optional)**
If `Geist` sans is no longer used, we can remove any custom mapping for it if it exists.

- [ ] **Step 3: Commit**
```bash
git add src/app/globals.css
git commit -m "feat: map Tailwind sans font to Pretendard"
```

---

## Chunk 4: Verification

### Task 4: Verify Implementation

- [ ] **Step 1: Run dev server**
Run: `npm run dev`

- [ ] **Step 2: Check browser dev tools**
- Verify `html` has the `--font-pretendard` class.
- Verify computed `font-family` is "Pretendard Variable".
- Verify the font file is loaded from `/fonts/PretendardVariable.woff2` in the Network tab.

- [ ] **Step 3: Final Commit**
```bash
git commit --allow-empty -m "docs: finalize Pretendard font update"
```
