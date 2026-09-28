# Design System

**Visual source of truth: the existing Replit prototype**
(<https://replit.com/@Zainmoneer04/Earlysteps>).

Values were extracted from its source (`artifacts/learning-app/src/index.css`, `index.html`, a
scan of every `.tsx` class string) **and verified in the running UI** — the prototype was
reconstructed and run locally with its own prototype backend and local-only seed data
(2026-09-28), and every role's screens were inspected at 1440 / 820 / 500 px. Values marked
_(inferred)_ are not directly in source.

> **Status:** **applied** in the UI foundation stage (ADR-017). `src/styles/tokens.css` now holds
> the Replit-based tokens; see `UI_COMPONENT_INVENTORY.md` for what is implemented. Visual QA
> gallery: `/ui-preview` (development only).

Related: [`REPLIT_AUDIT.md`](REPLIT_AUDIT.md) (per-screen audit),
[`UI_COMPONENT_INVENTORY.md`](UI_COMPONENT_INVENTORY.md),
[`UI_MIGRATION_MAP.md`](UI_MIGRATION_MAP.md).

## Approved decisions (2026-09-28)

| Decision               | Outcome                                                                                                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product name           | **Early Step** (Replit's "مستكشف القدرات" is not used)                                                                                                                     |
| Dark mode              | **Not in scope** — light theme only (tokens stay dark-ready)                                                                                                               |
| Child-facing direction | **Light assessment style** (mint→blue→lavender canvas, white cards) — the dark test-player style is **not** used                                                           |
| Contrast               | Keep `#0DA2E7` as brand/decorative blue; use `#0A7AAE` for filled buttons and important text; dark text on amber                                                           |
| Preserve               | Cairo body, Tajawal headings, warm cream background, rounded cards, gradient banners, playful feedback, stars/sounds/confetti where appropriate                            |
| Fix                    | RTL drawer direction, dropdown positioning, mobile chat, tiny text, labels, colour-only feedback, reduced motion, broken decorative classes/spacing, fabricated statistics |

See ADR-016.

## 0. Visual identity in one paragraph

Warm cream canvas, white rounded cards with hair-line borders and very soft shadows, a **sky-blue
primary** with **amber accents**, heavy Arabic display type (Tajawal 900) over Cairo body text,
**very large, pill-like radii**, saturated **gradient hero banners** with blurred white "bubbles",
colourful gradient category tiles with emoji, and playful motion (lift on hover, press-scale,
confetti) on child-facing screens.

**Dialects (inconsistencies, not spec):** the token-based sky/amber look (layout, dashboards,
children, login/register, landing, reports) is the reference. Other screens drift: stone + emerald
on cream `#FBF7F0` (forgot/reset password, assessment, specialist dashboard), forced-dark navy +
rose/purple (Super Admin panel), forced-dark teal→purple (test player).

## 1. Colors

HSL tokens from `:root` / `.dark`, converted to HEX.

| Token                | Light                              | Dark      | Usage                                     |
| -------------------- | ---------------------------------- | --------- | ----------------------------------------- |
| background           | `#FCFAF8` (40 33% 98%, warm cream) | `#121821` | Page canvas                               |
| foreground           | `#1F2937` (215 28% 17%)            | `#FCFAF8` | Main text                                 |
| border / input       | `#E1E7EF` (214 32% 91%)            | `#253141` | Borders, input borders                    |
| ring                 | `#0DA2E7`                          | `#0DA2E7` | Focus ring                                |
| card / popover       | `#FFFFFF`                          | `#161D27` | Surfaces                                  |
| primary              | `#0DA2E7` (199 89% 48%, sky blue)  | same      | Brand, primary buttons, active nav, links |
| primary-foreground   | `#FFFFFF`                          | same      | Text on primary                           |
| secondary            | `#E7F6FE` (199 89% 95%)            | `#253141` | Soft primary surface                      |
| secondary-foreground | `#086591`                          | `#FCFAF8` | Text on secondary                         |
| muted                | `#F1F5F9` (210 40% 96%)            | `#1C2431` | Subtle surfaces, chips                    |
| muted-foreground     | `#65758B` (215 16% 47%)            | `#97A3B4` | Secondary text                            |
| accent               | `#F59F0A` (38 92% 50%, amber)      | same      | Highlights, unread badge, accent CTA      |
| destructive          | `#EF4343` (0 84% 60%)              | same      | Errors, delete                            |
| success              | `#36D399` (158 64% 52%, mint)      | `#29BC86` | Success, online dot                       |
| warning              | `#F59F0A` (= accent)               | same      | Warnings                                  |
| info                 | `#0DA2E7` (= primary)              | same      | Info                                      |

Other globals: selection = primary 20% bg + primary text; scrollbar 8px, thumb muted-foreground at
30% (50% hover), fully rounded.

### Supporting palette (hard-coded Tailwind colours, frequent)

| Role                        | Colours                                                              | Where                                |
| --------------------------- | -------------------------------------------------------------------- | ------------------------------------ |
| Success / "easy" / low risk | emerald-50/100/200/500/600/700                                       | badges, risk chips, assessment       |
| Medium / warning            | amber-50/100/200/500/600/700                                         | difficulty "متوسط", risk "متوسط"     |
| High risk / error           | red-50/100/200/500/600/700                                           | risk "مرتفع", form errors            |
| Decorative gradients        | violet, purple, indigo, pink, rose, cyan, teal, orange, fuchsia, sky | banners, category tiles, avatars     |
| Neutral alt dialect         | stone-100…900 on `#FBF7F0`                                           | assessment, forgot/reset, specialist |

### Gradients (verified)

| Name (proposed)                | Value                                                                                                  | Used by                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| Category: memory               | `purple-500 → indigo-600`                                                                              | memory tiles, card match game             |
| Category: reading              | `cyan-500 → blue-600`                                                                                  | reading                                   |
| Category: math                 | `amber-500 → orange-600`                                                                               | math                                      |
| Category: writing              | `emerald-500 → teal-600`                                                                               | writing, word scramble                    |
| Category: logic                | `pink-500 → rose-600`                                                                                  | logic, balloon                            |
| Category: listening            | `violet-500 → purple-600`                                                                              | listening                                 |
| Extra tiles                    | `fuchsia-500 → purple-600`, `sky-500 → indigo-600`, `violet-500 → indigo-600`, `violet-500 → pink-600` | colour memory, spot-it, story, audio quiz |
| Banner: parent/admin dashboard | primary `#0DA2E7` → blue/indigo (solid-looking sky gradient)                                           | dashboard hero                            |
| Banner: tests/reports          | `135deg #0d9488 → #6366f1 → #8b5cf6`                                                                   | tests, reports                            |
| Banner: teacher                | `#0ea5e9 → #6366f1 → #8b5cf6`                                                                          | teacher dashboard                         |
| Banner: plans                  | `#7c3aed → #6366f1 → #0ea5e9`                                                                          | IEP/plan page                             |
| Banner: specialist             | `#7c3aed → #6366f1 → #4f46e5`                                                                          | specialist dashboard                      |
| Banner: games                  | `amber-500 → orange-500 → pink-500`                                                                    | games catalogue                           |
| Banner: child profile          | `primary → indigo-600 → violet-600`                                                                    | child profile header                      |
| Child play background          | `160deg #f0fdf4 → #eff6ff → #faf5ff`                                                                   | assessment                                |
| Test player background (dark)  | `135deg #042f2e → #134e4a → #4c1d95`                                                                   | test player                               |

Charts (only if data exists later): radar `#4F46E5`, line `#10B981`, weak/medium/strong
`#EF4444` / `#F59E0B` / `#10B981`, grid `#e2e8f0`/`#f1f5f9`.

### Dark mode

`.dark` class on `<html>`, follows OS `prefers-color-scheme` unless a stored choice exists; toggle
(moon/sun) only in the app sidebar. **Verified inconsistent:** pastel tiles (`bg-*-50`), charts,
assessment, forgot/reset and specialist dashboard stay light; admin and test player are always
dark. **Decision: dark mode is out of scope** — light only; tokens stay dark-ready.

## 2. Typography

| Item                 | Value (verified)                                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Body font            | `'Cairo', 'Noto Sans Arabic', 'Inter', sans-serif` (computed on `<body>` in the live app)                            |
| Display font (h1–h6) | `'Tajawal', 'Cairo', 'Noto Sans Arabic', sans-serif`, `letter-spacing: -0.02em`                                      |
| Source               | Google Fonts: Cairo 400–900, Tajawal 400/500/700/800/900, Noto Sans Arabic 400–800                                   |
| Weights              | Very heavy: 900 (`font-black`, 249 uses) for titles/numbers, 700 (`font-bold`, 228) for labels/buttons; 500/600 rare |
| Most used sizes      | 0.875rem (`text-sm`, 225), 0.75rem (`text-xs`, 141), 1.125rem, 1.5rem, 1.875rem                                      |
| Line heights         | `leading-relaxed` (1.625) for body copy, `leading-tight` (1.25) for big titles, hero 1.15                            |
| Numerals             | Mostly Latin digits; chat timestamps use Arabic-Indic (`ar-SA` locale) — **inconsistent**                            |

| Role                      | Size / weight                                                              |
| ------------------------- | -------------------------------------------------------------------------- |
| Landing hero              | 3rem → 3.75rem (sm) → 4.5rem (lg), 900, lh 1.15, tracking tight            |
| Dashboard greeting        | 1.875rem → 3rem (md), 900                                                  |
| Page title                | 1.875rem, 900 + muted subtitle 1rem                                        |
| Section title             | 1.5rem 900 (most common) / 1.25rem 900                                     |
| Card title                | 1.25rem 700 / 1.125rem 800 / 1rem 800 (game card)                          |
| Stat value                | 1.875rem 900 (admin 2.25rem)                                               |
| Body in cards             | 0.875rem                                                                   |
| Form label                | 0.875rem 700                                                               |
| Caption / meta            | 0.75rem 500 muted                                                          |
| Micro (chips, XP, badges) | 10–11px 700 — **too small**, see §9                                        |
| Nav section label         | 0.75rem 700, muted 50%, wide tracking (uppercase is meaningless in Arabic) |

Arabic-specific notes: display headings use tight negative tracking (fine for Tajawal); diacritics
render correctly in the reading game (`نَجْمَةٌ`); long Arabic titles wrap (sidebar brand wraps to
two lines because of the bell + theme buttons).

## 3. Shape language

Base `--radius: 1.5rem`. Replit **shifted Tailwind's radius scale**, so class names lie:
`rounded-xl` = 32px, `rounded-2xl` = 40px, `rounded-3xl` = 48px. Small squares with those classes
render as **circles** (icon tiles, stat icons, checkbox).

| Element                                | Effective radius                                    | Notes                                     |
| -------------------------------------- | --------------------------------------------------- | ----------------------------------------- |
| Card (`card-fancy`)                    | 24px                                                | the canonical card                        |
| Child card, modal, banner, empty state | 48px                                                | `rounded-3xl`                             |
| Dashboard hero banner                  | 40px                                                | `rounded-[2.5rem]`                        |
| Button (`btn-primary`)                 | 24px (h≈48px → pill)                                | inline buttons `rounded-xl` = 32px → pill |
| Input (auth)                           | 40px → pill                                         | `rounded-2xl`, h≈56px                     |
| Input (app forms)                      | 32px → pill                                         | h≈48px                                    |
| Textarea                               | 32px                                                |                                           |
| Nav item, list item                    | 40px → pill                                         |                                           |
| Tabs / segmented control               | 32px → pill                                         |                                           |
| Badge / chip                           | full                                                | `rounded-full`                            |
| Avatar (initial)                       | 16px square-ish (sidebar), 40–48px (cards → circle) |                                           |
| Game tiles / answer cards              | 40px                                                |                                           |

**Pill style:** padding 0.25rem 0.75rem, 0.75rem 700 text, tone/10 background + tone text,
optional 6px dot.

## 4. Shadows

Custom scale (declared on `:root`; in Tailwind v4 the `shadow-*` utilities still use their own
defaults, so these apply mainly via `.card-fancy:hover` and `.hover-lift` — _(inferred)_).

| Token          | Light                                | Dark                                 |
| -------------- | ------------------------------------ | ------------------------------------ |
| `--shadow-2xs` | `0 1px 2px 0 rgb(0 0 0 / 0.02)`      | `… / 0.2`                            |
| `--shadow-xs`  | `0 2px 4px 0 rgb(0 0 0 / 0.03)`      | `… / 0.3`                            |
| `--shadow-sm`  | `0 4px 12px -2px rgb(0 0 0 / 0.04)`  | `0 4px 8px -1px rgb(0 0 0 / 0.4)`    |
| `--shadow`     | `0 8px 24px -4px rgb(0 0 0 / 0.05)`  | `0 8px 16px -4px rgb(0 0 0 / 0.5)`   |
| `--shadow-md`  | `0 16px 32px -6px rgb(0 0 0 / 0.06)` | `0 14px 24px -6px rgb(0 0 0 / 0.6)`  |
| `--shadow-lg`  | `0 24px 48px -8px rgb(0 0 0 / 0.08)` | `0 24px 40px -8px rgb(0 0 0 / 0.7)`  |
| `--shadow-xl`  | `0 32px 64px -12px rgb(0 0 0 / 0.1)` | `0 30px 60px -15px rgb(0 0 0 / 0.8)` |

Coloured glows are a signature: primary buttons `shadow-lg shadow-primary/20–30`, category buttons
`shadow-{colour}-400/40`, colour-memory pads glow when lit.

## 5. Spacing & layout

| Item              | Value                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| Spacing scale     | 0.25rem steps; most used gaps 0.5 / 0.75 / 1 / 1.5rem                                              |
| Sidebar           | 18rem (288px) wide, card background, inline-end border, visible ≥ 1024px                           |
| Sidebar blocks    | brand `p-6`, user badge `p-3` with `mx-4 mb-6`, nav `px-4` items `py-3 px-4` gap 4px, footer `p-4` |
| Mobile header     | `p-4`, sticky, card bg, bottom border (≈72px tall)                                                 |
| Mobile drawer     | 85% width, max 320px, spring slide                                                                 |
| Page padding      | 1rem → 1.5rem (≥768) → 2rem (≥1024)                                                                |
| Content max width | 80rem (`max-w-7xl`); report detail ≈ 48rem; auth card 28rem; players 42rem; assessment 24rem       |
| Section spacing   | 2rem (`space-y-8`) dashboards/catalogues, 1.5rem profile                                           |
| Card padding      | 1.5rem → 2rem (`p-6 md:p-8`); list items 1rem; stat cards 1.5rem                                   |
| Stat grid         | 1 → 2 (≥640) → 4 (≥1024) columns, gap 1.5rem                                                       |
| Card grids        | children 1 → 2 → 3; games 1 → 2 → 3 → 4 (≥1280), gap 1.25–1.5rem                                   |
| Main + side       | 3 columns ≥1024 (main spans 2), gap 2rem                                                           |
| Player header     | 4rem tall, sticky                                                                                  |
| Landing nav       | 5rem tall                                                                                          |
| Breakpoints       | 640 / 768 / 1024 / 1280 px (Tailwind defaults)                                                     |

## 6. Components (visual spec)

| Component                                | Spec                                                                                                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button primary                           | primary bg, white 700 text, `0.75rem 1.5rem`, radius 24px, shadow-sm; hover 90% + shadow; press scale 0.95. Large: `1rem 2rem` 1.125rem; CTA `1.25rem 2.5rem` |
| Button accent                            | same, amber                                                                                                                                                   |
| Button gradient (catalogue, profile CTA) | category/brand gradient, white 700, radius 32px, coloured shadow; framer hover 1.02 / tap 0.97                                                                |
| Button outline                           | card bg, 2px border, hover primary border + text                                                                                                              |
| Button soft                              | primary/10 bg + primary text (e.g. "عرض الملف")                                                                                                               |
| Button ghost                             | muted text, hover muted bg                                                                                                                                    |
| Button destructive                       | red-500 solid (admin confirm) / destructive/10 hover (logout)                                                                                                 |
| Icon button                              | 36–40px, muted bg or bordered, rounded (renders circular)                                                                                                     |
| Input (auth)                             | background fill, 1px border, pill, `1rem 3rem` with leading icon at inline-start (turns primary on focus), focus: primary border + 4px ring primary/10        |
| Input (app)                              | muted/50 fill, 2px transparent border → primary on focus, pill, `0.75rem 1rem`                                                                                |
| Search field                             | card, pill, shadow-sm, leading magnifier                                                                                                                      |
| Select                                   | same as app input, native select                                                                                                                              |
| Date input                               | native (shows `dd/mm/yyyy` LTR)                                                                                                                               |
| Range slider                             | native, RTL-filled (report probability)                                                                                                                       |
| Textarea                                 | 1px border, radius 32px, `0.75rem`, no resize                                                                                                                 |
| Checkbox                                 | custom 20px box (renders round), primary when checked                                                                                                         |
| Label                                    | 0.875rem 700                                                                                                                                                  |
| Error (block)                            | destructive/10 bg, destructive text 700, 1px destructive/20 border, radius 40px                                                                               |
| Card                                     | white, 1px border `#E1E7EF`, radius 24px, shadow-sm; hover shadow-md + primary/30 border                                                                      |
| Hover lift                               | translateY(-4px), `cubic-bezier(.34,1.56,.64,1)` 0.3s, shadow-lg                                                                                              |
| Stat card                                | card + icon tile 56px (tone/10 bg; teacher/specialist use **solid** tone bg + white icon), label 0.875rem 700 muted, value 1.875rem 900                       |
| Hero banner                              | gradient, radius 40–48px, `p-8`, white text, date chip (white/10 glass pill), two soft white circles, shadow-xl, CTA pills (white solid + white/10 outline)   |
| Tabs                                     | pill segmented; active primary bg + white + shadow primary/30; inactive muted text + optional count bubble                                                    |
| Category chips                           | pill, 2px border, icon + label + count bubble; active = category gradient                                                                                     |
| Badge / pill                             | full radius, 0.75rem 700, tone/10 + tone text (+ dot)                                                                                                         |
| Difficulty badge                         | easy emerald, medium amber, hard red (100 bg / 700 text / 200 border)                                                                                         |
| Risk badge                               | `مرتفع` red, `متوسط` amber, `طبيعي/منخفض` emerald, with dot                                                                                                   |
| Count badge                              | 18px circle, 10px 900, amber (messages) / red (notifications), ring-2 background                                                                              |
| Avatar                                   | initial letter(s) in primary/10 tile (sidebar) or gradient circle with white text (dashboards)                                                                |
| Progress bar                             | track 8–12px muted, full radius; fill primary or gradient; animated width                                                                                     |
| Modal                                    | overlay black/50–80 + blur; card panel radius 48px, max-width 28rem, shadow-2xl; header title 1.25rem 900; close X icon                                       |
| Confirm dialog                           | icon circle (warning), title, body, two buttons: neutral "إلغاء" + destructive "حذف" with icon                                                                |
| Dropdown (notifications)                 | 20rem panel, list items with type icon, "قراءة الكل" action, empty text                                                                                       |
| Empty state                              | centred, `py-20`, card, radius 48px, **dashed** border, 64px muted icon, 1.25rem 700 title, optional link                                                     |
| Loading                                  | spinner (Loader2) primary 32–40px + pulsing Arabic text; skeleton = card + pulse (rewards only)                                                               |
| Toast / tooltip                          | shadcn defaults present but **never used**; tooltips are native `title`                                                                                       |
| Table                                    | **none** — every list is cards/rows (admin users = rounded dark rows)                                                                                         |
| Pagination                               | **none**                                                                                                                                                      |

## 7. Motion

| Pattern         | Spec                                                                       |
| --------------- | -------------------------------------------------------------------------- |
| Page enter      | opacity 0→1, y 10→0, 0.3s                                                  |
| Section stagger | y 20→0, delay 0.05–0.1s × index                                            |
| Hover           | card lift −4px; button `-translate-y-0.5`; icon tile scale 1.1 + rotate 6° |
| Press           | scale 0.95–0.98                                                            |
| Floating decor  | y ±8px loop 5–6s (landing cards), emoji wobble ±8° 3s (game cards)         |
| Answer feedback | ✅/❌ overlay scale 0.5→1→1.5 (test player), card flip rotateY (memory)    |
| Celebration     | canvas-confetti bursts (all games + test player)                           |
| Drawer          | spring, bounce 0, 0.4s                                                     |

**No reduced-motion support** anywhere — must be added (foundation already has a global
`prefers-reduced-motion` override).

## 8. Iconography & illustration

- **lucide-react** line icons (84 distinct; top: Loader2, CheckCircle2, Sparkles, Brain, Star,
  FileText, Zap, X, Users, ArrowRight, Gamepad2, BookOpen). Stroke ~2px, 16–24px.
- **Emoji as illustration** everywhere in child UI (🧩 📖 🔢 ✍️ 🎨 🔊 🎈 🔤 👁️ 📚, animals, ✅ ❌ ⭐ 🎯).
- One raster illustration: landing hero (`attached_assets/hero-children.png`, 1280×896, mother +
  child). Favicon is a brain icon on sky blue.
- Brand mark: white `Brain` icon in a primary tile.

## 9. Accessibility corrections (preserve look, fix problems)

Computed WCAG 2.x contrast:

| Pair                                                     | Ratio       | Status      | Proposed fix _(pending approval)_                                                                             |
| -------------------------------------------------------- | ----------- | ----------- | ------------------------------------------------------------------------------------------------------------- |
| White on primary `#0DA2E7` (buttons, active tab, badges) | 2.86        | Fail        | Keep `#0DA2E7` for decorative brand; `--color-primary-strong: #0A7AAE` (4.76) for filled buttons / text links |
| `text-primary` on white / on primary/10                  | 2.86 / ≈2.6 | Fail        | primary-strong                                                                                                |
| White on accent `#F59F0A`                                | 2.13        | Fail        | dark text `#1F2937` on amber (6.88)                                                                           |
| White on success `#36D399`                               | 1.92        | Fail        | `#1C7D5A` (5.08) for filled success / text                                                                    |
| muted-foreground on muted                                | 4.29        | Fail (body) | `#5A687C` (5.17)                                                                                              |
| muted-foreground at 50–60% opacity                       | ≈2.0–2.3    | Fail        | full-opacity muted text                                                                                       |
| red-600 on red-100                                       | 3.95        | Fail        | red-700 text                                                                                                  |
| amber-600 on amber-50 (risk chip)                        | 3.07        | Fail        | amber-800 text                                                                                                |
| foreground / background                                  | 14.1        | Pass        | —                                                                                                             |

Also required: no text < 12px (10–11px chips, balloon labels), label ↔ input association
(0 `htmlFor` in Replit), Arabic accessible names on icon-only buttons (only 2 exist), keep the
global 2px focus outline and don't remove it with `outline-none`, allow pinch-zoom (Replit sets
`maximum-scale=1`), respect reduced motion, never signal correct/wrong by colour alone, provide tap
alternatives to drag (story sequence), child tap targets ≥ 56px.

## 10. Proposed token map (not yet applied)

Replaces the neutral placeholders in `src/styles/tokens.css` during the design-system stage.

```css
:root {
  /* Brand */
  --color-primary: #0da2e7; /* decorative brand, rings, icons */
  --color-primary-strong: #0a7aae; /* NEW (a11y): filled buttons, text links */
  --color-primary-soft: #e7f6fe; /* secondary */
  --color-primary-soft-text: #086591;
  --color-on-primary: #ffffff;
  --color-accent: #f59f0a;
  --color-on-accent: #1f2937; /* a11y: dark text on amber */

  /* Surfaces */
  --color-background: #fcfaf8;
  --color-surface: #ffffff;
  --color-surface-muted: #f1f5f9;
  --color-border: #e1e7ef;
  --color-focus-ring: #0da2e7;

  /* Text */
  --color-text-primary: #1f2937;
  --color-text-secondary: #5a687c; /* a11y-adjusted from #65758B */

  /* Status */
  --color-success: #36d399;
  --color-success-strong: #1c7d5a;
  --color-warning: #f59f0a;
  --color-danger: #ef4343;
  --color-info: #0da2e7;

  /* Typography */
  --font-family-base: 'Cairo', 'Noto Sans Arabic', system-ui, sans-serif;
  --font-family-display: 'Tajawal', 'Cairo', 'Noto Sans Arabic', system-ui, sans-serif;
  --font-weight-regular: 400;
  --font-weight-bold: 700;
  --font-weight-black: 900;
  --letter-spacing-display: -0.02em;

  /* Shape */
  --radius-sm: 1rem; /* avatars, small tiles */
  --radius-card: 1.5rem; /* cards, primary buttons */
  --radius-control: 2rem; /* inputs, tabs, icon buttons */
  --radius-lg: 2.5rem; /* list items, nav items, dashboard hero */
  --radius-xl: 3rem; /* modals, banners, child cards, empty states */
  --radius-pill: 9999px;

  /* Elevation */
  --shadow-card: 0 4px 12px -2px rgb(0 0 0 / 0.04);
  --shadow-card-hover: 0 16px 32px -6px rgb(0 0 0 / 0.06);
  --shadow-raised: 0 24px 48px -8px rgb(0 0 0 / 0.08);
  --shadow-overlay: 0 32px 64px -12px rgb(0 0 0 / 0.1);

  /* Layout */
  --layout-sidebar-width: 18rem;
  --layout-content-max-width: 80rem;
  --layout-reading-max-width: 48rem;
  --layout-player-max-width: 42rem;
  --layout-header-height: 4.5rem;
  --control-height: 3rem;
  --control-height-lg: 3.5rem;
  --tap-target-child: 3.5rem;

  /* Motion */
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-fast: 150ms;
  --duration-base: 300ms;
}
```

Category/gradient tokens (`--gradient-category-*`, `--gradient-banner-*`) follow the §1 gradient
table, **darkened for contrast** in the implementation: every banner stop keeps white text ≥ 4.5:1
(brand `#0A7AAE → #2563EB → #4F46E5`, violet `#7C3AED → #4F46E5 → #0369A1`, teal
`#0F766E → #4F46E5 → #7C3AED`, sunset `#B45309 → #C2410C → #BE185D`).

## 11. Rules

- RTL-first; logical properties only.
- Components consume tokens only — no raw hex in components.
- Preserve the Replit visual identity; deviate only for documented accessibility / RTL /
  responsive fixes.
- Don't reproduce Replit's broken styles: undefined classes (`blob`, `glass`, `glass-strong`,
  `gradient-text`, `bg-gradient-primary`, `animate-float-slow`, `sticker`, `dot-grid`…) — the
  undefined `blob` class verifiably pushes game players ~700px down the page.
- Don't copy fabricated statistics (landing "+85%", dashboard "85%").
