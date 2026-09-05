# Styling Migration Contract — e2e-safe

Single source of truth for the Phase 3 migration. Read fully before editing.
Visual contract: `DESIGN.md`. Tokens resolve via `tailwind.config.js`.

## Goal
Replace ad-hoc Tailwind color utilities with semantic design tokens and adopt the shared primitives in `src/components/ui/`, WITHOUT breaking any Playwright e2e test (`playwright/e2e/*.spec.ts`). Do not edit tests unless a holdout below explicitly says to.

## Primitives available (`import { … } from '@/components/ui'`)
`Button` (variant: primary|secondary|outline|ghost|danger; size: sm|md|lg), `Card`, `Input`, `Textarea`, `Select`, `Badge` (tone: success|warning|danger|info|neutral), `Spinner`, `Pagination`.
All primitives spread `{...props}` onto their root element, so `data-testid`, `aria-*`, `disabled`, `ref`, and `type` forward automatically.

## Token swap map (replace LEFT with RIGHT)
```
bg-indigo-600                 -> bg-brand
hover:bg-indigo-700           -> hover:bg-brand-hover
text-indigo-600               -> text-brand
border-indigo-600             -> border-brand
ring-indigo-500               -> ring-brand
focus:ring-indigo-500         -> focus:ring-brand
bg-indigo-50                  -> bg-brand-subtle
from-indigo-500 to-purple-600 -> from-accent-from to-accent-to   (the brand gradient)
hover:from-indigo-600 to-purple-700 -> from-accent-from to-accent-to  (+ optional hover:opacity-90)

bg-white (surfaces/cards)     -> bg-card
bg-gray-50 / bg-slate-50      -> bg-muted
border-gray-200/300           -> border-border
text-gray-900                 -> text-foreground
text-gray-700                 -> text-foreground
text-gray-600 / text-gray-500 -> text-muted-foreground
text-gray-400                 -> text-faint-foreground

rounded-lg / rounded-xl / rounded-2xl / rounded-3xl  on CARDS   -> rounded-card
rounded-lg / rounded-xl                              on BUTTONS -> rounded-button
rounded-lg / rounded-xl                              on INPUTS  -> rounded-input
rounded-full (badges/pills)                          -> keep rounded-full
shadow-sm / shadow-md / shadow-lg on cards           -> shadow-card
shadow-xl / shadow-2xl on modals/popovers            -> shadow-overlay

# status colors (soft bg + strong text)
bg-green-100 text-green-800   -> bg-success-soft text-success-strong
bg-red-100 text-red-800       -> bg-danger-soft text-danger-strong
bg-yellow-100 text-yellow-800 -> bg-warning-soft text-warning-strong
bg-blue-100 text-blue-800     -> bg-info-soft text-info-strong
# solid status fills
bg-red-600                    -> bg-danger
bg-green-600                  -> bg-success
bg-yellow-600                 -> bg-warning
bg-blue-600                   -> bg-info
```
Blue/purple/green/orange/red utility shades NOT in the map above and NOT covered by a holdout: map to the closest semantic token (blue→info, green→success, amber/yellow/orange→warning, red→danger, purple→brand). When unsure, prefer the neutral/token equivalent and keep the element's role/affordance identical.

## Global preservation rules (test contract)
1. **Never change** `data-testid` values (static or dynamic like `quiz-row-{id}`, `question-row-{i}`, `option-text-input-{i}-{opt}`, `zone-button-{id}`, `file-menu-button-{id}`). Keep them on the same element.
2. **Never change** visible button/link/heading text (English or Vietnamese) — tests click by text.
3. **Never change** `aria-label`s. Notably: pagination `aria-label` (kept by `<Pagination>` caller), Notification's close button accessible name `Close notification`, and any `aria-label`/`aria-valuenow` on live regions.
4. **Never change element tags tests depend on:**
   - Download = `<a>` with BOTH `href` and `download` attributes (do not convert to `<Button>`).
   - Card/file/document titles inside cards = `<h3>` (keep heading tag).
   - Quiz editor = a real `<form>` element (keep `<form>`, don't swap for `<div>`).
   - Buttons with disabled state = real `<button disabled>` (Button primitive is fine — it renders `<button>` and forwards `disabled`).
   - Feedback `<iframe>` must keep literal `frameBorder="0" marginHeight="0" marginWidth="0"` and the Google Forms `src`.
5. **Never change routing** — paths, query params (`?section=quiz|settings|files`), route shapes (`/admin/quiz/{id}/edit`, `/quiz/{id}`).
6. Preserve each button's `type` prop (`submit` vs `button`) when adopting `<Button>` — `<Button>` has NO default type, matching native `<button>` (omitted = submit). Pass type through.
7. Preserve sibling ORDER where lists are indexed (`question-row-{i}`, `quiz-row-{id}`, `zone-button-` order) — don't reorder mapped arrays.
8. Spinners must keep the literal class `animate-spin`.

## HOLDOUTS — keep these EXACT classes verbatim (tests assert/locate by them)
1. **Active/selected state `bg-indigo-600`** — admin tabs (AdminPage), DocumentsPage "All" filter button, DocumentsPage active page button, and any other `bg-indigo-600` that marks an active/selected toggle. Do NOT swap to `bg-brand`. (`documents.spec.ts` & `admin.spec.ts` assert `toHaveClass(/bg-indigo-600/)`; `document-helpers.ts` `getCurrentPage` filters by it.) Note `bg-indigo-600` IS the brand color, so this is visually correct.
2. **Document card root**: keep `bg-white rounded-xl shadow-md` on that card (selectors in `documents.spec.ts` & `document-helpers.ts`). Do NOT switch to `<Card>`/token classes for the document card.
3. **Category/folder badge**: keep `bg-indigo-50 text-indigo-600` (order-insensitive) verbatim.
4. **File-extension span**: keep `text-gray-500`. **File-size span**: keep `text-xs text-gray-500`.
5. **Info box** (bottom of DocumentsPage): keep `bg-blue-50`.
6. **Quiz option selected marker**: keep the literal `selected` class on the option when selected (`quiz-helpers` checks `className.includes('selected')`).
7. **Pagination**: use the shared `<Pagination>` primitive (it already keeps the `bg-indigo-600` active page + aria-labels). Pass the existing i18n labels as `previousPageLabel`/`nextPageLabel`.

## Do NOT touch
- `src/components/map/**` Leaflet DOM and `.leaflet-*` classes (library-controlled).
- `src/utils/constants.ts`, `src/utils/zoneProvinces.ts` — map zone data colors (semantic data, not chrome).
- Feedback `<iframe>` (keep attrs/src).
- Any routing, state logic, or business behavior — styling only.
- `tailwind.config.js`, `src/index.css`, `DESIGN.md`, the `src/components/ui/*` primitives, `ConfirmationModal.tsx`, `LoadingSpinner.tsx`, `Pagination.tsx` — already migrated; treat as read-only.

## StatTile guidance
There are 3 stat-tile implementations (HomePage inline, `StatsCard`, FileManager inline) with a 4-color category scheme (blue/green/purple/orange). Map the colors to tokens IN PLACE (blue→info, green→success, purple→brand, orange→warning) using the soft/strong pairs for backgrounds and text. Keep each tile's existing structure/tag. Do NOT introduce a shared `<StatTile>` component this pass (the 3 layouts differ; extraction risks the e2e count/structure assertions).

## When you finish
Report: files changed, primitives adopted, any raw color utility you intentionally kept (with reason), and anything you were unsure about. Do not run the test suite — the lead will verify.
