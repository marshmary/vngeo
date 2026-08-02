---
name: vngeo
description: Vietnam Economic Zones — an educational atlas for Vietnam's six economic regions. Tailwind CSS + Headless UI; this file is the single source of truth for the visual identity.
status: draft
updated: 2026-08-02

colors:
  # ── Brand layer (indigo/purple — promoted from the de-facto live palette) ──
  brand: '#4f46e5'            # indigo-600 — primary actions, active nav, links, focus, progress
  brand-hover: '#4338ca'      # indigo-700
  brand-foreground: '#ffffff'
  brand-subtle: '#eef2ff'     # indigo-50 — soft / selected backgrounds
  brand-ring: '#6366f1'       # indigo-500 — focus rings
  accent-from: '#6366f1'      # indigo-500 — gradient start
  accent-to: '#9333ea'        # purple-600 — gradient end
  accent-foreground: '#ffffff'
  # ── Neutrals (slate) ──
  surface: '#ffffff'
  surface-muted: '#f8fafc'
  surface-sunken: '#f1f5f9'
  border: '#e2e8f0'
  text: '#1e293b'
  text-secondary: '#64748b'
  text-muted: '#94a3b8'
  # ── Status (key = icons/borders/foreground; soft/strong = tinted badge pairs) ──
  success: '#10b981'
  success-soft: '#d1fae5'
  success-strong: '#065f46'
  warning: '#f59e0b'
  warning-soft: '#fef3c7'
  warning-strong: '#92400e'
  danger: '#ef4444'
  danger-foreground: '#ffffff'
  danger-soft: '#fee2e2'
  danger-strong: '#991b1b'
  info: '#3b82f6'
  info-soft: '#dbeafe'
  info-strong: '#1e40af'

typography:
  body:
    fontFamily: 'Inter'
    fontSize: '16px'
    fontWeight: '400'
    lineHeight: '1.5'
  body-small:
    fontFamily: 'Inter'
    fontSize: '14px'
    fontWeight: '400'
    lineHeight: '1.5'
  label:
    fontFamily: 'Inter'
    fontSize: '14px'
    fontWeight: '500'
    lineHeight: '1.4'
  caption:
    fontFamily: 'Inter'
    fontSize: '12px'
    fontWeight: '400'
    lineHeight: '1.4'
  heading-3:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: '22px'
    fontWeight: '600'
    lineHeight: '1.3'
  heading-2:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: '28px'
    fontWeight: '700'
    lineHeight: '1.25'
    letterSpacing: '-0.01em'
  heading-1:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: '36px'
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: '-0.02em'
  display:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: '48px'
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: '-0.03em'

rounded:
  sm: '6px'      # tight chips, inner details
  md: '8px'      # buttons, inputs
  lg: '12px'     # cards, modals
  xl: '16px'     # large feature surfaces
  full: '9999px' # badges, pills, avatars

spacing:
  # Inherits Tailwind's 4px base scale. Named tokens for recurring layout gaps.
  gutter: '16px'
  gutter-lg: '24px'
  page-padding: '24px'
  page-padding-mobile: '16px'
  card-padding: '24px'
  card-padding-sm: '16px'
  section-gap: '32px'

components:
  button-primary:
    background: '{colors.brand}'
    foreground: '{colors.brand-foreground}'
    radius: '{rounded.md}'
    hover-background: '{colors.brand-hover}'
    focus-ring: '{colors.brand-ring}'
    font: '{typography.label}'
  button-secondary:
    background: '{colors.surface}'
    foreground: '{colors.text}'
    border: '{colors.border}'
    radius: '{rounded.md}'
    hover-background: '{colors.surface-muted}'
  button-outline:
    background: 'transparent'
    foreground: '{colors.brand}'
    border: '{colors.brand}'
    radius: '{rounded.md}'
  button-ghost:
    background: 'transparent'
    foreground: '{colors.text-secondary}'
    radius: '{rounded.md}'
    hover-background: '{colors.surface-muted}'
  button-danger:
    background: '{colors.danger}'
    foreground: '{colors.danger-foreground}'
    radius: '{rounded.md}'
  card:
    background: '{colors.surface}'
    border: '{colors.border}'
    radius: '{rounded.lg}'
    shadow: 'card'
    padding: '{spacing.card-padding}'
  input:
    background: '{colors.surface}'
    border: '{colors.border}'
    radius: '{rounded.md}'
    focus-border: '{colors.brand}'
    focus-ring: '{colors.brand-ring}'
    font: '{typography.body}'
  badge:
    radius: '{rounded.full}'
    font: '{typography.caption}'
  badge-success:
    background: '{colors.success-soft}'
    foreground: '{colors.success-strong}'
  badge-warning:
    background: '{colors.warning-soft}'
    foreground: '{colors.warning-strong}'
  badge-danger:
    background: '{colors.danger-soft}'
    foreground: '{colors.danger-strong}'
  badge-info:
    background: '{colors.info-soft}'
    foreground: '{colors.info-strong}'
  spinner:
    border-track: '{colors.border}'
    border-spinner: '{colors.brand}'
  modal:
    background: '{colors.surface}'
    radius: '{rounded.lg}'
    shadow: 'overlay'
    overlay: 'rgb(15 23 42 / 0.5)'
  nav-active:
    background: 'linear-gradient(to right, {colors.accent-from}, {colors.accent-to})'
    foreground: '{colors.accent-foreground}'
  focus-ring:
    ring-color: '{colors.brand-ring}'
    ring-offset: '2px'
---

## How to use this document

This is the **single source of truth** for how vngeo looks. It wins on conflict with any mockup, screenshot, or inherited utility class. The token chain flows one direction:

```
DESIGN.md  →  tailwind.config.js + :root CSS vars  →  shared primitives  →  pages
```

- To **change look-and-feel**, edit a token here. Never edit raw `indigo-600` in a page.
- Token references in prose and component specs use `{path.to.token}` (e.g. `{colors.brand}`, `{rounded.lg}`).
- **Implementation status:** Phase 0 (dead-code cleanup + font loading) is done. Phase 1 wires these tokens into `tailwind.config.js` + `:root`; Phase 2 builds the primitives; Phase 3 migrates pages off raw utilities; Phase 4 adds a lint check that blocks raw color utilities/hex from returning. Until Phase 3, pages still contain raw `indigo-600` — that is expected, not a violation.
- **Confidence:** the brand palette, fonts, radius scale, and shadow levels are locked. Exact status *shades* (`-soft` / `-strong`) and heading pixel sizes are indicative and get verified against the live UI in Phase 1.

## Brand & Style

vngeo is an educational atlas for Vietnam's six economic regions — a calm, cartographic tool. The posture is *trustworthy, legible, slightly academic, never flashy*. The brand expression is an indigo/purple primary that reads "considered and modern," **one** gradient reserved for moments of emphasis (logo, hero, active navigation), generous white surfaces, and color carried by the map's zone fills rather than by chrome. The discipline is restraint: one brand family, one gradient, status colors used only for status.

## Colors

- **Brand (`{colors.brand}`)** — the workhorse. Primary buttons, active navigation, links, focus rings, progress bars, selected states. If a thing is *the action*, it is brand-colored.
- **Brand gradient (`{colors.accent-from}` → `{colors.accent-to}`)** — the *only* gradient in the system. Logo, hero moments, active sidebar item. Reserved for emphasis; never decoration, never on cards or panels.
- **Brand-subtle (`{colors.brand-subtle}`)** — soft tinted backgrounds: selected rows, active filter pills, hover washes.
- **Neutrals** — a slate ramp: `{colors.surface}` white, `{colors.surface-muted}` for recessed areas, `{colors.border}`, and three text weights (`{colors.text}` / `-secondary` / `-muted`).
- **Status** — `{colors.success}` / `{colors.warning}` / `{colors.danger}` / `{colors.info}`, each with a **soft** (tinted background) and **strong** (foreground text) partner for badges. Status means state (success/error/difficulty), never brand.
- **Data colors — EXEMPT.** The six economic-zone fills live in `src/utils/constants.ts` and `src/utils/zoneProvinces.ts` and render through Leaflet (`src/components/map/**`). They are **semantic data, not chrome**. They are deliberately outside this token system and must not be "tidied" into brand colors.

## Typography

Two faces, no more. **Inter** is the global default (body, labels, UI, inputs); **Plus Jakarta Sans** is the heading face. Both load from Google Fonts via `<link>` in `index.html`; Vietnamese diacritic coverage is strong.

- Body: `{typography.body}` (16 / 1.5).
- Headings: a four-step ramp — display `{48}` / h1 `{36}` / h2 `{28}` / h3 `{22}` — with progressively tighter tracking. The Phase-0 audit found headings sprinkled as ad-hoc `text-3xl`/`text-4xl`; they collapse to this ramp.
- Labels `{typography.label}` (14 / 500) for buttons, form labels, table headers. Captions `{typography.caption}` (12) for metadata, badges.

Avoid: a third typeface, decorative or script fonts, weights outside 400–800, and using the heading face for body text to "make it pretty."

## Layout & Spacing

Tailwind's 4px base scale is inherited wholesale. Named gaps codify the recurring rhythms: `{spacing.gutter}` 16 between paired elements, `{spacing.page-padding}` 24 at the page edge (16 on mobile), `{spacing.card-padding}` 24 inside cards (16 in dense variants), `{spacing.section-gap}` 32 between major sections.

Layout is the existing app shell — a fixed sidebar + fluid main area. Do **not** reintroduce the legacy centered `#root { max-width: 1280px }` (removed in Phase 0); pages are full-bleed within the shell.

## Elevation & Depth

Two shadow levels only:

- **card** — resting surfaces (cards, panels). Subtle; reads as a layer, not a float.
- **overlay** — modals, popovers, dropdown menus. Deeper; reads as elevated above content.

Shadow is never decorative. The previous `--shadow-sm/md/lg/xl` quad was never consumed and is retired. Avoid `shadow-2xl` flourishes and colored shadows except `{colors.brand-ring}` on focus.

## Shapes

One radius scale — `{rounded.sm}` 6 / `{rounded.md}` 8 / `{rounded.lg}` 12 / `{rounded.xl}` 16 / `{rounded.full}`. Radius is chosen **by role**, not by mood:

- Cards and modals → `{rounded.lg}` (12)
- Buttons and inputs → `{rounded.md}` (8)
- Badges, pills, avatars → `{rounded.full}`

The Phase-0 audit found the same "card" rendered at four different radii (`lg` / `xl` / `2xl` / `3xl`) and a single stray `rounded-md` on modal buttons. That drift ends here. Avoid `rounded-2xl` / `rounded-3xl` entirely.

## Components

Visual specs live in the `components:` frontmatter above; behavioral specs (loading / empty / disabled / error states, focus order, motion) belong in `EXPERIENCE.md`. The primitives to build in Phase 2, each consuming only token classes:

- **Button** — five variants: `primary`, `secondary`, `outline`, `ghost`, `danger`. Sizes sm/md/lg. Replaces the 28 inline re-typings.
- **Input** (+ Textarea, Select) — replaces the 10 duplicated input patterns.
- **Card** — the single surface container; replaces ad-hoc card `<div>`s.
- **Badge** — four status variants (`success`/`warning`/`danger`/`info`); replaces the 3 hand-rolled color maps.
- **Spinner** — replaces the shared `LoadingSpinner` and its 5 hand-rolled copies (which disagreed on color).
- **Pagination** — replaces the 2 verbatim copies.
- **StatTile** — unifies the 3 divergent implementations (HomePage inline, `StatsCard`, FileManager inline).
- **Modal** — wraps Headless UI `Dialog`; replaces `ConfirmationModal`'s ad-hoc styling and the 2 rogue modals.

The active-navigation treatment uses the brand gradient via `{components.nav-active}`.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Reference tokens by name — `bg-brand`, `{colors.brand}` | Hardcode `indigo-600` / `purple-600` / raw hex in pages |
| Build UI from the 8 primitives | Re-type a button, spinner, or input inline |
| Use the gradient only for logo / hero / active nav | Apply gradients to cards, panels, or page backgrounds |
| Use status colors for state only | Use red / green / blue as decoration or primary brand |
| Pick one radius per role from the scale | Mix `rounded-xl` / `2xl` / `3xl` on the same component |
| Edit this file to change look-and-feel | Edit raw utilities in a page and call it "styled" |
| Treat map zone fills as exempt data | Replace zone colors with brand colors to "match" |
| Load both fonts via the `index.html` link | Assume fonts work without the `<link>` (they don't) |
