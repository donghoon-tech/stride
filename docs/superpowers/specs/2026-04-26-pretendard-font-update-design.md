# Spec: UI Font Update to Pretendard (Tailwind v4 Optimized)

## 1. Overview
Replace the current default sans-serif font "Geist Sans" with "Pretendard" to improve legibility and aesthetic balance. This update leverages Next.js font optimization and aligns with the project's Tailwind CSS v4 architecture.

## 2. Goals
- Set Pretendard as the primary sans-serif typeface.
- Ensure seamless rendering for English and future Korean text.
- Maintain zero layout shift (CLS) using Next.js font features.
- Keep `Geist Mono` for fixed-width/code text.

## 3. Design
### Typography
- **Primary Font**: Pretendard Variable (`public/fonts/PretendardVariable.woff2`)
- **Mono Font**: Geist Mono (Existing)
- **Fallback Hierarchy**: `-apple-system`, `BlinkMacSystemFont`, `system-ui`, `Apple SD Gothic Neo`, `sans-serif`.

### Implementation Approach
- Use `next/font/local` in `src/app/layout.tsx` to load the variable font.
- Define a CSS variable `--font-pretendard`.
- Map `--font-sans` to `var(--font-pretendard)` in the Tailwind CSS v4 `@theme` block in `src/app/globals.css`.

## 4. Technical Architecture
### Asset Management
- **Source**: `public/fonts/PretendardVariable.woff2`

### Files to Modify
- `src/app/layout.tsx`: 
    - Import `localFont` from `next/font/local`.
    - Replace `Geist` with `Pretendard`.
    - Apply the font variable to the `body` tag.
- `src/app/globals.css`:
    - Update the `@theme` block to map `--font-sans` to the new Pretendard variable.

## 5. Security & Validation
- **License**: SIL Open Font License (Free & Open Source).
- **Performance**: Variable fonts minimize file size by bundling all weights into a single file.

## 6. Testing Strategy
- **Baseline Check**: Verify vertical alignment in buttons and inputs (ensure text isn't shifted up or down).
- **Fallback Test**: Disable the custom font in dev tools to ensure fallbacks render correctly.
- **Responsive Test**: Verify legibility across different screen sizes (Mobile/Desktop).
