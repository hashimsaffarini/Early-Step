# Design System

**Visual source of truth: the existing Early Step Replit application**
(<https://replit.com/@Zainmoneer04/Earlysteps>). Values below were **extracted from its source**
(`artifacts/learning-app/src/index.css`, `index.html`, and a scan of all `.tsx` class usage) on
2026-09-28. Values marked _(inferred)_ are not directly in source.

> **Status:** documented, **not yet applied**. `src/styles/tokens.css` still holds neutral
> placeholders. Migrating these values is Stage 1 of `IMPLEMENTATION_PLAN.md`.
>
> Replit mixes several visual "dialects" (token-based sky/amber; stone + emerald on cream for
> auth-recovery/assessment/specialist; forced-dark admin; forced-dark test player). The
> **token-based dialect** (layout, dashboard, children, login, register, landing) is the primary
> reference. The others are inconsistencies, not a spec.

## 1. Colors

HSL tokens from `:root` / `.dark`, converted to HEX.

| Token                | Light                              | Dark      | Usage                              |
| -------------------- | ---------------------------------- | --------- | ---------------------------------- |
| background           | `#FCFAF8` (40 33% 98%, warm cream) | `#121821` | Page background                    |
| foreground           | `#1F2937` (215 28% 17%)            | `#FCFAF8` | Main text                          |
| border / input       | `#E1E7EF`                          | `#253141` | Borders, inputs                    |
| ring                 | `#0DA2E7`                          | `#0DA2E7` | Focus ring                         |
| card / popover       | `#FFFFFF`                          | `#161D27` | Surfaces                           |
| primary              | `#0DA2E7` (199 89% 48%, sky blue)  | same      | Brand, primary actions, active nav |
| primary-foreground   | `#FFFFFF`                          | same      |                                    |
| secondary            | `#E7F6FE`                          | `#253141` | Soft primary surfaces              |
| secondary-foreground | `#086591`                          | `#FCFAF8` |                                    |
| muted                | `#F1F5F9`                          | `#1C2431` | Subtle surfaces                    |
| muted-foreground     | `#65758B`                          | `#97A3B4` | Secondary text                     |
| accent               | `#F59F0A` (38 92% 50%, amber)      | same      | Highlights, badges, CTA accent     |
| destructive          | `#EF4343`                          | same      | Errors, delete                     |
| success              | `#36D399` (158 64% 52%, mint)      | `#29BC86` | Success                            |
| warning              | `#F59F0A` (= accent)               | same      |                                    |
| info                 | `#0DA2E7` (= primary)              | same      |                                    |

Selection: primary at 20% background, primary text. Scrollbar: 8px, thumb muted-foreground 30%/50%.

**Frequent hard-coded colours (not tokens):** emerald (success/"easy"), amber ("medium"), red
(risk/errors), violet/purple/indigo gradients for banners and category tiles. Decision needed
whether these become named tokens (recommended: `--color-category-*`, `--gradient-banner-*`) —
**TBD**.

**Recurring gradients (verified):**

- Category/avatar tiles: purple→indigo, cyan→blue, amber→orange, emerald→teal, pink→rose,
  violet→purple, sky→indigo, slate→slate.
- Page banners: `135deg #0d9488 → #6366f1 → #8b5cf6` (reports/tests), `#0ea5e9 → #6366f1 →
#8b5cf6` (teacher), `#7c3aed → #6366f1 → #0ea5e9` (plans), `#7c3aed → #6366f1 → #4f46e5`
  (specialist); games `amber-500 → orange-500 → pink-500`.

Charts (if any are built later): radar `#4F46E5`, line `#10B981`, weak/medium/strong
`#EF4444`/`#F59E0B`/`#10B981`.

### Dark mode

Replit supports dark mode (`.dark` class, follows OS, persisted). The requirements don't mention
it. **TBD — product decision.** Recommendation: ship light first; keep tokens dark-ready.

## 2. Typography

| Item                 | Value (verified)                                                                     |
| -------------------- | ------------------------------------------------------------------------------------ |
| Body font            | `'Cairo', 'Noto Sans Arabic', 'Inter', sans-serif`                                   |
| Heading font (h1–h6) | `'Tajawal', 'Cairo', 'Noto Sans Arabic', sans-serif`, `letter-spacing: -0.02em`      |
| Source               | Google Fonts: Cairo 400–900, Tajawal 400/500/700/800/900, Noto Sans Arabic 400–800   |
| Weights              | Heavy: 900 (`font-black`) for headings/numbers, 700 for labels/buttons/body emphasis |

| Role               | Size / weight                                          |
| ------------------ | ------------------------------------------------------ |
| Landing hero       | 3rem → 3.75rem → 4.5rem (sm/lg), 900, line-height 1.15 |
| Page title         | 1.875rem (`text-3xl`), 900 + muted subtitle            |
| Dashboard greeting | 1.875rem → 3rem (md), 900                              |
| Section title      | 1.5rem (`text-2xl`) or 1.25rem, 900                    |
| Card title         | 1.25rem 700 / 1.125rem 800                             |
| Stat value         | 1.875rem 900                                           |
| Body in cards      | 0.875rem (`text-sm`) — most common size                |
| Labels             | 0.875rem 700                                           |
| Captions           | 0.75rem 500 muted; 10px chips (accessibility issue)    |

Font loading decision (Google Fonts vs self-hosted): **TBD** (self-hosting recommended for privacy
and offline reliability).

## 3. Layout

| Item                 | Value                                                                          |
| -------------------- | ------------------------------------------------------------------------------ |
| Sidebar              | 18rem (`w-72`), card background, inline-end border, visible from `lg` (1024px) |
| Mobile               | Header (sticky, p-4) with menu button → drawer 85% width, max 320px            |
| Content padding      | 1rem → 1.5rem (md) → 2rem (lg)                                                 |
| Content max width    | 80rem (`max-w-7xl`)                                                            |
| Page vertical rhythm | `space-y-8` (2rem) or `space-y-6`                                              |
| Stats grid           | 1 → 2 (sm) → 4 (lg) columns, gap 1.5rem                                        |
| Card grids           | 1 → 2 → 3 columns (children); up to 4 at xl (games), gap 1.25–1.5rem           |
| Main + side          | 3 columns at lg with 2-col main, gap 2rem                                      |
| Breakpoints          | 640 / 768 / 1024 / 1280 px (Tailwind defaults)                                 |
| Auth card            | max 28rem; landing nav height 5rem                                             |

## 4. Radius, shadows, spacing

**Radius** — base `--radius: 1.5rem`. Replit's Tailwind scale is shifted up, so effective values
are large and soft:

| Token (proposed) | Value         | Replit class it corresponds to                 |
| ---------------- | ------------- | ---------------------------------------------- |
| `--radius-sm`    | 1rem (16px)   | `rounded-[1rem]` avatars                       |
| `--radius-md`    | 1.5rem (24px) | `card-fancy`, `btn-*`                          |
| `--radius-lg`    | 2rem (32px)   | `rounded-xl` (buttons, icon tiles)             |
| `--radius-xl`    | 2.5rem (40px) | `rounded-2xl` (inputs, list items, stat icons) |
| `--radius-2xl`   | 3rem (48px)   | `rounded-3xl` (banners, modals, child cards)   |
| `--radius-full`  | 9999px        | pills, badges                                  |

**Shadows** (custom scale, light):

| Token         | Value                                |
| ------------- | ------------------------------------ |
| `--shadow-sm` | `0 4px 12px -2px rgb(0 0 0 / 0.04)`  |
| `--shadow`    | `0 8px 24px -4px rgb(0 0 0 / 0.05)`  |
| `--shadow-md` | `0 16px 32px -6px rgb(0 0 0 / 0.06)` |
| `--shadow-lg` | `0 24px 48px -8px rgb(0 0 0 / 0.08)` |
| `--shadow-xl` | `0 32px 64px -12px rgb(0 0 0 / 0.1)` |

Coloured shadows (`primary/20–30`, category colour at 40%) are used on primary buttons and tiles.

**Spacing** — Tailwind 0.25rem scale; most used: gap 0.5/0.75rem, padding 1/1.5/1.25rem.

**Control heights** _(derived)_: primary button ≈ 48px (`py-3`); auth input ≈ 56px (`py-4`);
app input ≈ 48px; child answer tiles ≈ 68px.

## 5. Components (verified patterns)

| Component           | Spec                                                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button primary      | primary bg, white text, 700, padding 0.75rem 1.5rem, radius 1.5rem, shadow-sm, hover 90% + shadow, press scale 0.95. Large: 1rem 2rem / 1.25rem 2.5rem    |
| Button accent       | same with amber                                                                                                                                           |
| Button outline      | card bg, 2px border, hover border+text primary                                                                                                            |
| Button ghost        | muted text, hover muted bg, radius 2.5rem                                                                                                                 |
| Button destructive  | hover destructive 10% bg + destructive text (logout)                                                                                                      |
| Icon button         | 2.25–2.5rem square, radius 2rem (renders round), muted bg                                                                                                 |
| Input (auth)        | background, 1px border, radius 2.5rem, padding 1rem 3rem (icon at inline-start 1rem, turns primary on focus), focus: primary border + 4px ring primary/10 |
| Input (app)         | muted/50 bg, 2px transparent border → primary on focus, radius 2rem, padding 0.75rem 1rem                                                                 |
| Textarea            | 1px border, radius 2rem, padding 0.75rem, no resize                                                                                                       |
| Label               | 0.875rem 700                                                                                                                                              |
| Form error (block)  | destructive/10 bg, destructive text, 700, radius 2.5rem, 1px destructive/20 border                                                                        |
| Card (`card-fancy`) | white, 1px border, radius 1.5rem, shadow-sm; hover shadow-md + border primary/30 (0.3s); padding 1.5rem → 2rem                                            |
| Hover lift          | translateY(-4px), `cubic-bezier(.34,1.56,.64,1)` 0.3s, shadow-lg                                                                                          |
| Stat card           | card + icon tile 3.5rem (tone/10 bg, tone text), label 0.875rem 700 muted, value 1.875rem 900                                                             |
| Child card          | radius 3rem, padding 1.5rem, hover border primary/50, shadow-xl, lift                                                                                     |
| Badge               | 0.75rem 700, padding 0.25rem 0.75rem, full radius, tone/10 bg + tone text                                                                                 |
| Difficulty badges   | easy emerald-100/700, medium amber-100/700, hard red-100/600                                                                                              |
| Tabs                | 0.875rem 700, padding 0.75rem 1.25rem, radius 2rem; active primary bg + white + shadow primary/30                                                         |
| Nav item            | padding 0.75rem 1rem, radius 2.5rem, 0.875rem; active primary text 700 + primary/10 bg; idle muted 600, hover muted bg                                    |
| Modal               | overlay black/50 + blur; panel card, radius 3rem, shadow-2xl, max-width 28rem, max-height 80vh; header 1.25rem 1.5rem with bottom border                  |
| Page banner         | radius 3rem (2.5rem dashboard), padding 2rem, white text, gradient, two blurred white circles, shadow-xl                                                  |
| Empty state         | centered, padding 5rem 0, card bg, radius 3rem, **dashed** border, 4rem icon, 1.25rem 700 title                                                           |
| Loading             | spinner (Loader2) primary, 2–2.5rem page / 1.25rem inline; skeleton = card + pulse                                                                        |
| Progress bar        | track 0.5–0.75rem muted, full radius; fill primary or gradient                                                                                            |
| Avatar              | initial letter, primary/10 bg, primary text 900, radius 1rem                                                                                              |
| Tables              | Barely used — lists are cards. Table style **TBD** (design needed for admin lists)                                                                        |
| Pagination          | **Not present in Replit.** TBD                                                                                                                            |
| Toast / tooltip     | shadcn defaults, **never used** in Replit. TBD                                                                                                            |

## 6. Child-facing UI

- Full-screen players, `max-w-2xl` (games/tests) or `max-w-sm` (assessment).
- Question text 1.5–1.875rem 900; answer tiles padding 1.25rem 1.5rem, 2px border, radius 2.5rem,
  1.125rem 700 (~68px tall), 2 columns from `sm`.
- Feedback: correct emerald, wrong red, selected highlight + scale 1.02; big ✅/❌ overlay; stars;
  confetti; synthesized sound effects.
- Emoji used as illustrations.
- Test player uses a forced dark teal→purple gradient; assessment uses a light mint→blue→lavender
  gradient — **decide one child theme (TBD)**.

## 7. Motion

Page fade-up (opacity 0 → 1, y 10 → 0, 0.3s); staggered section entrance; hover scale 1.02 /
tap 0.95–0.98; floating decorative loops; confetti. **Reduced motion is not respected in Replit —
must be added** (the foundation already disables animation under `prefers-reduced-motion`).
Whether to add an animation library (framer-motion) is **TBD** — ADR required; CSS transitions
cover most patterns.

## 8. Icons

Replit uses **lucide-react** (84 icons; top: Loader2, CheckCircle2, Sparkles, Brain, Star,
FileText, Zap, X, Users, ArrowRight). Adding `lucide-react` is recommended (small, tree-shaken)
— **needs an ADR before install**. Directional icons must be mirrored/selected for RTL (back =
ArrowRight, forward = ArrowLeft/ChevronLeft).

## 9. Accessibility corrections (preserve look, fix problems)

Computed WCAG contrast of Replit pairs:

| Pair                                             | Ratio | Status      | Proposed fix _(pending approval)_                                                                      |
| ------------------------------------------------ | ----- | ----------- | ------------------------------------------------------------------------------------------------------ |
| White on primary `#0DA2E7` (buttons, active tab) | 2.86  | Fail        | Keep `#0DA2E7` for brand accents; use `--color-primary-strong: #0A7AAE` (4.76) for filled buttons/text |
| `text-primary` on white                          | 2.86  | Fail        | Use primary-strong for text links                                                                      |
| White on accent `#F59F0A`                        | 2.13  | Fail        | Dark text on amber (`#1F2937` → 6.88)                                                                  |
| White on success `#36D399`                       | 1.92  | Fail        | `#1C7D5A` (5.08) for filled success / text                                                             |
| muted-foreground on muted                        | 4.29  | Fail (body) | `#5A687C` (5.17)                                                                                       |
| foreground / background                          | 14.1  | Pass        | —                                                                                                      |
| red-600 on red-100 badge                         | 3.95  | Fail        | darker text shade                                                                                      |

Other required fixes: associate every label with its input (`htmlFor`/`id`), accessible names on
icon-only buttons (Arabic), no text below 12px, remove `maximum-scale=1` (allow pinch-zoom),
respect reduced motion, don't rely on colour alone (add icons/text), keyboard-operable
alternatives to drag, visible focus (keep Replit's 2px primary outline, don't remove it).

## 10. Component inventory for the new app (plan — not implemented)

### Shared UI (`src/components/ui/`)

Button (primary/accent/outline/ghost/destructive, sizes, loading), IconButton, Input, PasswordInput,
Textarea, Select, Checkbox, FormField (label + control + error), Card, Badge, Tabs, Modal/Dialog,
ConfirmDialog, ProgressBar, Avatar (initial), Spinner, Skeleton, Toast _(if needed)_, Table
_(design TBD)_, Pagination _(if API adds it — only chat has cursors)_.

### Shared product components (`src/components/shared/` or `layout/`)

AppSidebar + MobileDrawer + NavItem, UserBadge, PageHeader, PageBanner (gradient hero), StatCard,
EmptyState / ErrorState / LoadingState (exist; restyle), SearchField, RoleBadge.

### Feature-specific (stay inside features)

| Feature        | Components                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| auth           | LoginForm, RegisterForm, RoleCardPicker, PasswordStrengthMeter, ResetCodeForm                                      |
| children       | ChildCard, ChildForm, ChildProfileHeader                                                                           |
| assessments    | AssessmentIntro, AssessmentProgress, QuestionView, AssessmentComplete                                              |
| activities     | ActivityCard, CategoryChips, QuestionEditor, OptionEditor, choice/order/match players, AnswerFeedback, ResultStars |
| training-plans | PlanActivityList, AvailableActivityPicker                                                                          |
| reports        | ReportCard, ReportForm, ReportDetail                                                                               |
| feedback       | NoteForm, NoteCard                                                                                                 |
| chat           | ConversationList, MessageThread, MessageBubble, Composer, ContactPicker                                            |
| users          | UserTable/List, UserDetail                                                                                         |
| dashboards     | per-role dashboard sections                                                                                        |

## 11. Rules

- RTL-first; logical properties only.
- Components consume tokens only — no raw hex in components.
- Preserve the Replit visual identity; deviate only for documented accessibility/RTL/responsive
  fixes (table above).
- Don't copy Replit's broken classes (it references undefined utilities such as `glass`,
  `gradient-text`, `bg-gradient-primary`) — implement the intended look only when confirmed.
