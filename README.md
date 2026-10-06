# Tender Document Package Builder (টেন্ডার ডকুমেন্ট প্যাকেজ বিল্ডার)

**Contest**: AI DevFest 2026 — Vibe Coding Challenge  
**Participant**: Bayzid Ahmed  
**Registration Number**: 241-15-711  
**Live Application**: [https://devfest241-15-711.vercel.app](https://devfest241-15-711.vercel.app)  
**Repository**: [https://github.com/6ayzid/devfest241-15-711](https://github.com/6ayzid/devfest241-15-711)

---

## 5-Line Architecture Summary
- **Pure Logic Isolation (`src/logic/*`)**: 100% testable, zero-DOM TypeScript modules for validation, file parsing, deduplication, status evaluation, and PDF synthesis.
- **Presentation (`src/ui/*`)**: React 19 + Tailwind CSS v4 driven strictly by Material 3 Expressive tonal color roles and spring physics.
- **In-Browser PDF Engine**: Powered by `pdf-lib` without external servers, workers, or cloud dependencies.
- **Zero-Throw Boundary**: Defensive JSON and PDF magic-byte (`%PDF-`) verification returning typed error unions.
- **Predictable State Flow**: Single `useReducer` managing synchronous Result Morphs, animated Delta Chips, and versioned `localStorage` under `app:v1:`.

---

## Key Features (Main Tasks)
1. **Requirements Loading**: Dynamic loading and validation of `requirements.json` with fallback defaults and order sorting.
2. **Robust Multi-PDF Upload**: Drag-and-drop pool with magic-byte (`%PDF-`) checking, page counting, and file size/count limits (30 files / 50 MB). Non-PDF files are caught and rejected cleanly.
3. **Smart 1-to-1 Matching**: Match files to tender requirement slots with full change and undo capabilities.
4. **Duplicate Content Detection**: Identical binary content flagged via SHA-256 hashing; matching multiple copies of duplicate files is disallowed.
5. **Real-Time Expiry & Status Verification**: Instant calculation across all 5 requirement statuses (`Missing`, `Expiry date needed`, `Expired`, `Not provided`, `OK`) using direct `YYYY-MM-DD` string comparison against submission deadline (`2026-10-20`).
6. **Compliant PDF Assembly**: Single English cover page + ordered document pages + non-obscuring running footer (`<tender_id> | Page X of Y`) inside an expanded 32pt bottom band.
7. **Full Bangla / English Parity**: Instant toggle with complete language parity for all UI text, status descriptions, numbers (`Intl`), and document titles (`title_bn`).

---

## Bonus Features
- **CSV Checklist Export**: Downloadable checklist in UTF-8 BOM CSV format containing document orders, titles, filenames, page counts, expiry dates, and statuses.
- **Table of Contents / Index Page**: Optional second-page index calculated in two passes for exact page numbers.
- **Smart Auto-Match**: Heuristic name and keyword matcher resolving file associations and filtering out expired copies.
- **Client-Side Persistence**: Automatic state recovery via `localStorage` with `app:v1:` key prefix.

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
- `output/T-2026-0417_Package.pdf`: Full 16-page verified tender package generated from the provided sample pack.
- `screenshots/`:
  - `screenshots/document_statuses_desktop.png`: Status dashboard and checklist matching view.
  - `screenshots/mobile_view_390px.png`: Mobile layout view at 390px width with floating bottom dock.
- `LICENSE`: MIT License.

---

## AI Tools & Prompts
- **AI Tool**: Antigravity with Gemini 3.8 Flash (DeepMind).
- **Most Useful Prompt**:
  > *"pdf-lib only. Page count via PDFDocument.load. Duplicates via SHA-256 of file bytes. PDF check = .pdf extension AND first bytes %PDF-. Status logic: no file + mandatory = Missing; no file + optional = Not provided; file + has_expiry + no date = Expiry date needed; date < deadline = Expired; else OK. Build each output page taller than the source page by a 32pt bottom band, draw the original page in the upper part, and put the footer in the band."*

---

## License
MIT License — Copyright (c) 2026 Bayzid Ahmed
