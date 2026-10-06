# Visual QA — design parity review (2026-10-03)

Review of every implemented screen against the Replit visual reference after the UI migration
(ADR-019). No features were added and nothing touches the backend.

**Reference used:** the Replit values recorded in `DESIGN_SYSTEM.md` (§2 typography, §3 shape,
§5 spacing & layout, §6 components) and `REPLIT_AUDIT.md`, which were extracted from the Replit
source and verified in the running prototype. The temporary local copy of the Replit source is no
longer available, so values were not re-read from source in this pass.

**Method:** each route rendered in a fixed-width frame at 1440, 820 and 500 px (1280 where a
breakpoint sits between). Computed sizes were measured (sidebar, banners, headings, buttons,
inputs, cards, radii, paddings), screenshots compared with the spec, and an automated sweep checked
every route for horizontal overflow and for content escaping its card.

## Fixes

| Screen                               | Issue found                                                                                                                                  | Replit reference                                                                  | Change made                                                                                                                                                                        | Type                  |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| Parent + Admin dashboards            | Child cards fixed at 3 columns inside the main (2/3) column → ~218 px wide cards; progress text wrapped, status pills pushed out of the card | Card grids 1 → 2 → 3; cards never narrower than ≈ 18 rem                          | Child grids (`ChildrenPreviewSection`, `ChildrenDirectory`) use `auto-fill, minmax(16rem, 1fr)`: 3 per row at full width (teacher/specialist), 2 in the main column (parent/admin) | Parity / layout       |
| All child cards (shared `ChildCard`) | Long status pill ("بانتظار بدء التقييم") overflowed the card's inline-end edge on narrow cards                                               | Pill sits beside the avatar                                                       | Card header row wraps, so the pill moves under the avatar when space runs out                                                                                                      | Responsive correction |
| Parent + Admin dashboards            | "آخر النشاطات" side card stretched to the full height of the children column, leaving a large empty area                                     | Side card is content-height                                                       | Removed the forced 100% height                                                                                                                                                     | Parity / layout       |
| All dashboards, Super Admin overview | Stat cards used compact 16 px padding (≈ 95 px tall), smaller and denser than Replit                                                         | Stat card padding 1.5 rem, icon tile 56 px, value 1.875 rem 900, grid gap 1.5 rem | Stat card padding 24 px from 768 px (16 px on phones so stacked cards stay short), equal heights per row, stat grid gap 1.5 rem                                                    | Parity / sizing       |
| Every screen with icon buttons       | Buttons with an icon grew past the control height (52 px instead of 48, 44 instead of 40, 60 instead of 56) because icons rendered at 24 px  | Primary button ≈ 48 px (`0.75rem 1.5rem`), icons 16–20 px                         | Button icons are 20 px (16 px for small buttons), so all buttons keep 48 / 40 / 56 px                                                                                              | Consistency           |
| Super Admin — overview               | "المستخدمون حسب الدور" was a plain 20 px/800 heading, unlike every other section title (24 px/900 with an icon tile)                         | Section title 1.5 rem 900                                                         | Uses the shared `SectionHeader`                                                                                                                                                    | Consistency           |
| Super Admin — users                  | Extra ~24 px gap between the role chips and the list (empty status line took a flex gap)                                                     | Toolbar → list spacing 1.5 rem                                                    | The empty status line no longer takes part in the layout (still announced when it fills)                                                                                           | Layout                |
| Super Admin — users                  | Emails (LTR text) were pushed to the far side of the row instead of under the name                                                           | Email directly under the name                                                     | Email aligned to the row's inline-start, truncated with an ellipsis                                                                                                                | RTL correction        |
| Tests catalogue                      | Four chips (difficulty, category, questions, time) wrapped to a second line with a single orphan chip on each card                           | Test cards show difficulty + question count + time                                | Test cards drop the category chip (the filter and emoji already show it); game cards (no meta) keep it                                                                             | Parity                |
| Messages                             | Chat panes stopped well above the fold on short screens (height `100dvh − 16rem`)                                                            | Chat fills the available height                                                   | Height `100dvh − 11rem` (min 30 rem, max 56 rem)                                                                                                                                   | Parity / layout       |

Earlier in the migration pass (recorded in ADR-019 / the completeness audit) the same review
style already fixed: blank active category chip, half-width plan cards, plan goals/strategies side
by side, low-contrast colour-memory symbols, greeting emoji spacing, honorific avatar initials.

## Verified without changes

| Area            | Result                                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Shell           | Sidebar 288 px (18 rem); main padding 32 px at desktop; content max 80 rem; mobile header + drawer from the right                           |
| Banners         | Radius 40 px, padding 32 px, greeting h1 48 px/900 (30 px on phones); heights differ only with content (actions, date chip)                 |
| Typography      | Page title 30 px/900, section title 24 px/900, card titles 18–20 px, body 14–16 px, nothing below 12 px                                     |
| Inputs / search | 48 px pill controls (auth 56 px), radius 24 px                                                                                              |
| Tabs            | One segmented `Tabs` style for profile and super admin                                                                                      |
| Modals          | One `Modal` size system: default (≈ 28 rem, Replit), `lg` for the plan form and assign-activity picker; radius 40 px                        |
| Players         | 42 rem stage, 4 rem sticky top bar, answer tiles ≥ 72 px, result panel max 30 rem; assessment card at 42 rem (wider than Replit's 24 rem)   |
| Reports         | List 2 columns ≥ 1024 px; detail column ≈ 48 rem; numbered recommendation rows                                                              |
| Chat            | Conversation pane 20 rem; bubbles ≤ 80 % of the thread (max 32 rem); composer 48 px; list ↔ thread on phones                                |
| Overflow        | No horizontal overflow on any route at 1440 / 820 / 500 px; no card content clipped (the landing hero's floating cards overlap by design)   |
| RTL             | Drawer on the right, back arrows → , forward chevrons ‹, badges on the icon's inline-end, notifications panel inside the viewport, math LTR |

## Intentional differences kept

- Accessible contrast colours (`#0A7AAE` buttons, darkened banner and category gradients, dark text on amber).
- 12 px minimum text (Replit used 10–11 px chips and counters).
- Light test player and Super Admin panel (Replit: separate dark styles).
- Wider assessment/question card (Replit's 24 rem column wasted desktop space and pushed answers below the fold).
- Responsive chat, right-side drawer, in-viewport notifications (Replit was broken on these).
- No fabricated stats, risk, percentages, rewards or charts.
- Card radius 24 px for content cards, 40 px for child cards, banners and empty states (Replit used 24 / 40–48 px; we keep one value per role of component).

## Validation

`npm run validate` passes (typecheck, lint with zero warnings, 224 tests, build). No tests were
changed — the fixes are visual only.
