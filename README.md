# Tender Document Package Builder (টেন্ডার ডকুমেন্ট প্যাকেজ বিল্ডার)

**Contest**: AI DevFest 2026 — Vibe Coding Challenge  
**Participant**: Bayzid Ahmed  
**Registration Number**: 241-15-711  
**Live Application**: [https://devfest241-15-711.vercel.app](https://devfest241-15-711.vercel.app)  
**Repository**: [https://github.com/6ayzid/devfest241-15-711](https://github.com/6ayzid/devfest241-15-711)

---

## Architecture & Core Philosophy
- **Pure Logic Isolation (`src/logic/*`)**: 100% testable, zero-DOM TypeScript modules for validation, file parsing, deduplication, status evaluation, and PDF synthesis. UI rewrites never touch core algorithms.
- **Client-Side Execution & Zero Secret Leaks**: 100% static client-side application. No backend servers, remote databases, or hardcoded secrets. All state persists safely in `localStorage` under `app:v1:`.
- **Defensive In-Browser PDF Engine**: Powered by `pdf-lib` with magic-byte (`%PDF-`) inspection, SHA-256 binary deduplication, and defensive validation that never throws unhandled errors.

---

## Key Feature Highlights

### 1. Responsive Design & M3 Expressive Layout
- **1024px Breakpoint Switch**:
  - **Desktop (≥ 1024px)**: Complete actions row (`Load sample`, `Export CSV`, `Reset`, `Upload`, and AI settings) accessible directly in the top bar as text buttons.
  - **Mobile / Tablet (< 1024px)**: Top bar holds only the brand (truncated), language segmented pill (`EN | বাং`), and theme button. All workspace actions move to a floating M3 bottom dock with priority-based color blocking.
  - Viewport-safe bottom clearance (`pb-[calc(92px+env(safe-area-inset-bottom))]`) ensures the dock never obscures workspace content or table rows.
- **Compact Blocked Hero Card**:
  - Displays a clean single-row status banner with alert icon, issue count, ready ratio, and a responsive thin progress bar.
  - Styled with the tonal `errorContainer` role instead of an overwhelming saturated slab.
  - Collapses issues to a maximum of 3 items with an in-place `+X more` / `Show less` expander.
  - Features plain-language guidance (*"Fix these to continue."* / *"এগোতে এগুলো ঠিক করুন।"*) and houses the primary action button directly inside the container.

### 2. Smart Read Layer 1: Heuristic Matcher (`src/logic/matcher.ts`)
- **Automated Slot Matching**: Evaluates unmatched uploaded files against tender requirements using a bilingual keyword scoring matrix (Bangla & English procurement dictionaries).
- **Year & Expiry Scoring**: Penalizes filenames matching past years (`2024`, `2025`) and prioritizes active years (`2026`, `2027`) to resolve valid files first.
- **Collision & Duplicate Prevention**: Strictly enforces 1-to-1 slot mapping and rejects matching duplicate binary copies (identical SHA-256 hashes) across distinct requirements.

### 3. Optional AI Feature: Client-Side Gemini Document Reader (`src/ui/AiSettingsSheet.tsx`)
- **Strict Privacy**: Zero hardcoded keys or backend proxies. Users provide their own Google Gemini API key.
- **In-Memory / Tab-Only Storage**: Key is held in memory and only stored in `sessionStorage` if the user explicitly opts in for that tab; never stored in persistent `localStorage`.
- **Explicit Consent**: Requires active opt-in consent before any document payload is transmitted.
- **Resilient Fallback**: The entire application and all core features remain 100% functional without AI.

### 4. Bilingual Parity & Accessibility
- **Full English & Bangla Parity**: Every user-visible label, button, badge, status description, and formatted number (`Intl`) has instant bilingual parity.
- **Light / Dark / System Themes**: Adaptive M3 surface tones generated with high-contrast accessibility across all viewport widths.
- **Button Physics**: M3 spring release animations (`cubic-bezier(0.34, 1.56, 0.64, 1)`) with `whitespace-nowrap` labels and morphing pressed states.

---

## Local Development & Build

```powershell
# Install dependencies
npm install

# Start development server
npm run dev

# Run strict production build (0 warnings/errors)
npm run build
```

---

## Deliverables in Repository
- `output/T-2026-0417_Package.pdf`: Full verified tender package generated from the sample pack.
- `screenshots/`:
  - `screenshots/document_statuses_desktop.png`: Status dashboard and checklist matching view.
  - `screenshots/mobile_view_390px.png`: Mobile layout view with floating bottom dock.
- `LICENSE`: MIT License.

---

## License
MIT License — Copyright (c) 2026 Bayzid Ahmed
