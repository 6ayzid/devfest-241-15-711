# CONTEST RULES (Zero-Tolerance)
- Frontend only. No backend servers, serverless functions, Firebase, Supabase, Appwrite or remote databases. Persistence = localStorage only (keys prefixed `app:v1:`).
- All code written fresh in this repo during the contest. Rule 5.3 bans reusing old projects or mock-test code (including old tokens.css or algorithms).
- Setup window: only README.md and MIT LICENSE may be committed before T+0. AGENTS.md stays untracked until T+0 and MUST be in the first project commit (Rule 8.2). `brief/` and `.contest/` stay untracked forever (listed in .git/info/exclude).
- No secrets or API keys in code or git, ever. AI features need the user's own key typed into the UI, never hardcoded; all main features work 100% without AI.
- Full Bangla/English parity: every user-visible string, button, badge and seed record exists in bn and en with an instant header toggle. Zero hardcoded strings.
- Only external HTTPS CORS APIs; the app must work smoothly if they fail.
- Public HTTPS static deploy (Vercel) that loads without login in latest Chrome by T+90.
- Deliverables: a `/screenshots` folder with the images the brief's Deliverables section requires.
- The phone is banned for contest work, including timers (use the laptop Clock app / clock.html or a watch). No pen drive at the venue (Section 12).
- Organizers may change rules (13.1): diff any rulebook found in the problem zip against the baseline; a changed rule overrides this file.

# COMMITS (Rules 8.3 / 8.4)
- Rule 8.3: at least one commit every 30 minutes, 3 total minimum. Our target: every 25 minutes.
- Every message: line 1 = one-line summary; line 2 blank; line 3 = `Prompt: "<exact prompt>"` or `Prompt: "Manual edit"`. For the long master prompt write its first line plus `see .contest/PLAYBOOK.md Phase N`.
- Never rebase, force-push or reset pushed history. Undo with `git revert <sha> --no-edit`. `git restore .` on uncommitted slop is fine.

# TWO-TAB RULES (Single Writer)
- Tab 1 = BUILDER: the ONLY tab that edits files, runs npm or runs git. One branch (main). No branches, no worktrees.
- Tab 2 = QA, read-only: never edits, never runs git or npm. Outputs a numbered findings list (i18n gaps, edge cases vs SPEC matrix, squint failures, requirement misses).
- The human pastes the top 3 findings into Tab 1 as the next prompt, so the commit's Prompt line stays accurate.
- Tab 2's only write: drafting README.md at T+75; Tab 1 commits it. Never run Tab 2 mid-build; run it right after a slice commit.

# SCAFFOLD (tested; critical)
NEVER use `--overwrite` or scaffold into the repo root directly: `--overwrite` deletes untracked files (AGENTS.md, brief/, .contest/) and LICENSE and overwrites README.md; without it create-vite cancels in a non-empty folder. Use exactly (PowerShell):
```
npm create vite@latest _vite -- --template react-ts --no-interactive --no-immediate
Get-ChildItem _vite -Force | Where-Object { $_.Name -ne 'README.md' } | Move-Item -Destination . -Force
Remove-Item _vite -Recurse -Force
npm install
git status
```
Then check: git status must NOT list brief/ or .contest/; README.md and LICENSE unchanged; AGENTS.md is in the first commit.

# STACK & ARCHITECTURE (Fixed)
- Vite + React 19 + TypeScript strict. Tailwind CSS v4 with M3 Expressive tokens in `tokens.css`. Light / Dark / System toggle using M3 tonal surface tokens.
- `src/logic/*`: pure TypeScript, no JSX, no styling (algorithms, models, validation, storage, i18n formatters). `src/ui/*`: presentation only (components, layouts, tokens.css, error boundaries). A UI rewrite never touches `src/logic`.
- Icons: authored inline SVGs, 1.5–2px stroke. Never emoji icons.
- State: `useReducer` for the core flow + typed `useLocalStorage` hook (try/catch, safe defaults). No external state libraries.
- Routing: hash-based or single-page tabs (static-host safe).

# DEFENSIVE LOGIC (hidden-test immunity, in src/logic)
1. Parse/validate boundary that NEVER throws: returns `{ ok: true, data }` or `{ ok: false, errors: ValidationError[] }` with typed error codes mapped to bilingual i18n keys + params. `JSON.parse` in try/catch. Enforce every constraint in the brief, e.g. field types, trimmed non-empty names, type enums, finite x/y, unique case-sensitive IDs, valid edge endpoints, positive integer costs (reject 0, negative, floats, NaN, strings), no self-loops, no duplicate undirected pairs (A–B and B–A), stated count limits (e.g. 2–60 nodes, 1–150 edges), required category minimums. MISSING required fields/arrays (e.g. every `initial_state` array) are rejected, never silently defaulted to `[]`.
2. Total compute function: returns a union `ok | no_route | start_blocked | no_start`; handles disconnected graphs, all exits closed, start is exit, everything blocked.
3. Drop stale IDs on dataset load AND on localStorage restore.
4. Tie-breaks by plain code-unit comparison (`<`), never `localeCompare`; on equal cost compare the full sequence.
5. UI safety: React error boundary around the visualization (designed bilingual error state); coordinate-safe SVG viewBox (zero-width ranges, negative/huge coords, identical points, padding); 2 MB upload cap; truncate very long labels.

# DESIGN: Material 3 Expressive
## Color (generated, never hand-picked)
- Generate from ONE seed hex with `@material/material-color-utilities` `SchemeVibrant` (NOT `SchemeExpressive`, which rotates the hue), light and dark, every role as a CSS variable. If the import fails twice, derive the tonal roles from the seed by hand (max 2 minutes).
- Roles: primary, onPrimary, primaryContainer, onPrimaryContainer, secondaryContainer, onSecondaryContainer, tertiaryContainer, onTertiaryContainer, surface, surfaceContainerLow/–/High/Highest, onSurface, onSurfaceVariant, outlineVariant, error, errorContainer, onErrorContainer.
- Seed from the domain (safety = red-orange or teal, finance = green, education = indigo). Saturated, not gray.
- COLOR BLOCKING, each container a different role: hero = primaryContainer; secondary stat = tertiaryContainer; controls = secondaryContainer; page = surface; resting lists/tables = surfaceContainerLow; errors/warnings = large errorContainer blocks. All cards one color = fail.

## Shape
Scale 8 / 12 / 16 / 20 / 28 / 32 / 48 / full. Hero 40–48, cards 28–32, tiles 16–20.

## Hard bans
Borders/1px hairlines, backdrop-filter, blur, glass/frosted panels, gradients on surfaces, glow, neumorphism, emoji icons, native select popovers, tiny gray helper text, subtext restating its label, more than 4 elements in a card, running dashed-line loops. Separation = color roles + space.

# BUTTON PHYSICS (every pressable: buttons, chips, icon buttons, dock items, FAB)
- Sizes S 40px, M 56px (default), L 72px; touch target >= 48px.
- Resting radius = height/2 as an EXPLICIT px value (M = 28px). NEVER rounded-full / 9999px / infinity (it cannot animate).
- Pressed: radius 12px, scale 0.97, 100ms ease-out in; release 400ms spring `cubic-bezier(0.34, 1.56, 0.64, 1)`.
- Transition ONLY border-radius, transform, background-color, width. Never `transition: all`.
- Pressed state via pointerdown/pointerup/pointercancel/pointerleave setting `data-pressed`, held at least 150ms so a quick tap shows the morph.
- Toggle/selected: unselected pill (h/2), selected squared 16px, same spring; press morph on top.
- Connected button groups (language, theme, mode): outer corners h/2, inner 8px; pressed segment grows 8px wider, group width constant.
- Icon buttons: circle at rest -> 12px rounded square when pressed.
- prefers-reduced-motion: keep the instant shape change, drop scale and overshoot.
- Focus ring 3px primary, 2px offset. `touch-action: manipulation; -webkit-tap-highlight-color: transparent`.
- VERIFY: DevTools animation speed 10%, press every button type; the radius must visibly change, else fix before continuing.

# MOBILE (< 640px, required)
- Viewport `width=device-width, initial-scale=1, viewport-fit=cover`. dvh, not vh. No horizontal scroll at 360px.
- TOP BAR (56px): app icon + truncated title left; right holds ONLY the language segmented pill (EN | বাং) and the theme icon button (cycles Light/Dark/System).
- BOTTOM DOCK: floating pill (surfaceContainerHigh, radius 28px, 64px tall, 12px margin + env(safe-area-inset-bottom)) with the 3–4 highest-priority actions, icon + one-word bn/en label; the primary item is filled primaryContainer with expanded label; same press physics.
- ONE actions array `{id, icon, labelKey, priority, onPress}`: >= 640px render all in the top bar and hide the dock; < 640px top N by priority in the dock. No duplicated logic.
- `<main>` padding-bottom = dock height + margin + safe-area + 16px.
- Modals become bottom sheets (top radius 28px, drag handle, max-height 85dvh, inner scroll).
- 48px hit areas incl. SVG/map elements (invisible larger hit shapes). No hover-only affordances. Inputs >= 16px.
- Verify at 360x800, 390x844, 768x1024, 1280x800, in English and Bangla.

# TYPOGRAPHY (locked)
- One family for everything: Noto Sans Bengali Variable, self-hosted via `npm i @fontsource-variable/noto-sans-bengali`, imported once from `"@fontsource-variable/noto-sans-bengali/wght.css"`. No CDN. If the package fails twice, use the Google Fonts link for Noto Sans Bengali, weights 400-800.
- Stack: "Noto Sans Bengali Variable", "Nirmala UI", "Noto Sans Bengali", system-ui, sans-serif. Set `<html lang>` to bn/en on every language toggle.
- Weights: body 400, labels 600, titles 650, headlines 700, hero 700-800 (capped at 700 in Bangla). Line-height: Bangla body 1.7, titles 1.45, hero minimum 1.35; English display 1.15. No tight line-height or overflow:hidden on Bangla. letter-spacing 0 for :lang(bn); negative tracking only on English display. Intl for numbers and dates (bn-BD / en-US), tabular-nums on the hero stat. Test the longest Bangla string on every button, chip and dock label at 360px; truncate with ellipsis, never clip.
- Sizes: hero 56–72px (>= 3x body, one per screen); headline 28–32px; title 20px; body 16px; label 13–14px.

# LAYOUT (desktop)
Max 3 containers per screen; padding 24–32px; gaps 16–24px; asymmetric 7/5 split. One primary action per screen (extended FAB or 56px filled button). Optional: one big rounded decorative SVG polygon in a container role behind the hero. No gradients.

# SIGNATURE: "Result Morph" + DELTA CHIP
- Recompute synchronously on every input; animate only the visual delta in 350–450ms `cubic-bezier(0.34, 1.56, 0.64, 1)` (effects 150–200ms ease-out); never block input.
- One `useReducer` holds `{result, prevResult, lastCause, changeId}`; each action recomputes and sets `prevResult = old result`, `lastCause = {type, id}`, `changeId += 1`. No useRef for previous state.
- Pure `describeDelta(prev, next, cause)` in src/logic returns `{key, params}` (i18n key + params): rerouted, cost up, cost down, route lost, route restored, start blocked, unchanged.
- Delta chip rendered bn/en with Intl numbers, keyed on `changeId` so its animation replays.
- Hero number tweened prev -> next with requestAnimationFrame over 400ms (instant under reduced motion; cancel on unmount).

# SQUINT TEST (before every UI commit)
Blur your eyes: 2–3 distinct color blocks, one dominant hero, clear size hierarchy. Uniform gray rectangles with equal text = rewrite.

# DATA & STORAGE
- `app:v1:` keys, versioned; every read/write in try/catch.
- Seed data from the brief, bilingual. Provide "Reset demo data". Export (UTF-8 BOM CSV / JSON) if the brief asks.

# WORKFLOW
- Follow MASTER_PROMPT / .contest/PLAYBOOK.md phases in order. Stop only at GATE 1 (plan) and GATE 2 (freeze check).
- Commit before every UI prompt. Never patch slop; do a clean UI rewrite pass.
- Before claiming done: `npm run build` with 0 TypeScript/bundler warnings or errors.
