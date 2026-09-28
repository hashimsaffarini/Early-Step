# Replit Prototype Audit

Project: <https://replit.com/@Zainmoneer04/Earlysteps> (private). Audited 2026-09-28 by reading
the running dev server and its source (served by Vite with source maps). **No code was copied
into this repository.**

> Authenticated screens were audited from **source code only**: signing in to a remote site with a
> password is not something the assistant does on the user's behalf. Public screens (landing,
> login, register) were inspected live at 1440, 820 and 500 px widths. A live walkthrough of
> authenticated screens can be done if the user signs in in the browser.

## 1. Technology

| Area           | Replit                                                                                                                                                                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repo           | pnpm monorepo: `artifacts/learning-app` (frontend), `artifacts/api-server` (Express 5), `lib/db` (Drizzle + PostgreSQL), `lib/api-spec` (OpenAPI + Orval), `lib/api-client-react` (generated React Query hooks), `lib/api-zod`, OpenAI integration |
| Frontend       | React 19, Vite, **wouter** router, TanStack Query (generated hooks), Tailwind CSS v4 (CSS variables, shadcn-style tokens), Radix (dialog/toast/tooltip), framer-motion, lucide-react, recharts, canvas-confetti, html2canvas + jsPDF               |
| Backend        | **Own prototype backend** — session cookies, integer IDs, English enums, OpenAI GPT evaluation, Resend email. **Does not call the real Early Step API.**                                                                                           |
| App name shown | **مستكشف القدرات** ("Ability Explorer") — not "Early Step"                                                                                                                                                                                         |
| Language       | Arabic default; an EN dictionary + toggle exist but the toggle is never rendered                                                                                                                                                                   |
| Theme          | Light + dark (`.dark` class, follows OS `prefers-color-scheme`, persisted in localStorage)                                                                                                                                                         |

## 2. Screens

| Route                                         | Roles                                          | Purpose                                                                                               | Complete?       | Notes                                                          |
| --------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------- | -------------------------------------------------------------- |
| `/`                                           | public                                         | Landing: hero, image, CTA                                                                             | Visual complete | Fabricated stats (+85%, 100% safe); "learn more" goes to login |
| `/login`                                      | public                                         | Email/password login                                                                                  | Complete        | "Remember me" not wired; generic error                         |
| `/register`                                   | public                                         | Role cards (ولي أمر / معلم / أخصائي), name, email, password + strength meter, confirm                 | Complete        | 3-column role grid has no mobile fallback                      |
| `/forgot-password`, `/reset-password`         | public                                         | Email → code (6 digits) → new password                                                                | Complete        | Hard-coded stone colours (no dark mode)                        |
| `/dashboard`                                  | Parent, Admin                                  | Greeting banner, 4 stats (one hard-coded 85%), rewards, leaderboard, insights, charts, recent reports | Prototype       | Mock/fabricated elements                                       |
| `/dashboard`                                  | Specialist                                     | Stats, searchable child cards with risk badge                                                         | Prototype       | Gender bug, hard-coded colours                                 |
| `/dashboard`                                  | Teacher                                        | Stats, assigned students                                                                              | Prototype       |                                                                |
| `/children`                                   | Parent, Teacher, Specialist, Admin             | Card grid, search, add-child dialog                                                                   | Partial         | No edit/delete UI                                              |
| `/children/:id`                               | same                                           | Header card, tabs (overview radar, activities, reports), assign activity modal                        | Partial         |                                                                |
| `/children/:id/iep`                           | same (edit: Specialist/Admin/SuperAdmin)       | Free-text education plans CRUD                                                                        | Prototype       | Not in real API                                                |
| `/tests`, `/tests/:id/play`                   | all staff + parent                             | Catalogue + 4-option timed quiz player                                                                | Buggy           | Saves to first child; mock fallback questions                  |
| `/games`, `/games/:id/play`                   | same                                           | Catalogue + 11 hard-coded games                                                                       | Buggy           | 3 games never submit, 1 crashes                                |
| `/assessment/:id`                             | any                                            | Initial assessment: 4 mini-games + results screen                                                     | Prototype       | Client-scored; progress lost on refresh                        |
| `/reports`, `/reports/:id`, `/reports/create` | list: all; create: Specialist/Admin/SuperAdmin | AI or manual report, risk bars, client-side PDF                                                       | Prototype       | Child name not shown on report                                 |
| `/messages`                                   | all non-super                                  | Two-pane chat, new conversation modal                                                                 | Prototype       | Polling 3 s, not responsive                                    |
| `/admin`                                      | SuperAdmin only                                | Dark panel: overview, users (role change, delete), children, reports                                  | Prototype       | "Open app" / "view report" buttons bounce back                 |
| `*`                                           | —                                              | English Replit boilerplate 404                                                                        | Placeholder     |                                                                |

Detailed per-page notes (forms, validation messages, states) were captured during the audit;
the reusable facts are folded into `USER_FLOWS.md`, `DESIGN_SYSTEM.md`, `ACTIVITY_ENGINE.md`.

### Validation rules observed (Replit — reference only)

| Form            | Rules                                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------- |
| Register        | name ≥ 2 chars; email format; password ≥ 8 with upper, lower, digit, symbol; confirm matches                   |
| Add child       | name required; birth date required; developmental age 0–25 optional; gender ولد/بنت; parent required for staff |
| Report (manual) | child required; strengths, weaknesses, recommendations required; probability 0–100 step 5                      |
| IEP             | goals, strategies, timeline required                                                                           |

Real validation rules must come from the API (TBD).

## 3. Source → new architecture mapping

| Replit implementation                                        | New React feature/module                                               | Reuse                                                                    |
| ------------------------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `index.css` tokens, `.card-fancy`, `.btn-*`                  | `src/styles/tokens.css`, `components/ui`                               | **Design values**                                                        |
| `components/layout.tsx` (sidebar, mobile drawer, user badge) | `components/layout/DashboardLayout` + `features/dashboards` nav config | Structure + visual; fix RTL drawer direction                             |
| `lib/auth-context.tsx` (`ProtectedRoute`)                    | `features/auth` + `app/router` guards                                  | Concept only (session model differs)                                     |
| `pages/auth/*`                                               | `features/auth/pages`                                                  | Layout, copy, password-strength UX                                       |
| `pages/children/*`                                           | `features/children`                                                    | Card/grid design; fields per API                                         |
| `pages/assessment/*`                                         | `features/assessments`                                                 | Visual shell (progress dots, results bars); engine per API               |
| `pages/tests/player.tsx`, `src/games/*`                      | `features/activities` players (choice/order/match)                     | Visual/feedback patterns, `useGameSounds` idea; **not** content or logic |
| `pages/iep/*`                                                | `features/training-plans`                                              | Visual only (different model)                                            |
| `pages/reports/*`                                            | `features/reports`                                                     | Card/detail layout; server PDF instead of html2canvas                    |
| `pages/messages/*`                                           | `features/chat`                                                        | Visual only; API + hub                                                   |
| `pages/dashboard/*`                                          | `features/dashboards`                                                  | Banner, stat cards                                                       |
| `pages/admin/index.tsx`                                      | `features/users` + super-admin dashboard                               | Tabs concept                                                             |
| `components/charts.tsx`                                      | TBD (only if API provides data)                                        | —                                                                        |
| rewards, notifications, AI, skills, difficulty               | —                                                                      | **Not migrated** (no API)                                                |
| `lib/lang-context.tsx`                                       | —                                                                      | **Not migrated** (Arabic only); Arabic strings may be reused as copy     |

## 4. Useful existing knowledge

- Arabic copy and labels (nav, roles, empty states, validation messages).
- Role-based nav structure and greeting banners.
- Child-facing feedback patterns: large option tiles, ✅/❌ overlay, stars/medal result screen,
  synthesized sound effects, confetti.
- Password-strength meter UX; role picker cards on register.
- Arabic font stack (Cairo / Tajawal) and soft, rounded visual language.

## 5. Technical debt — do not copy

- Separate backend with IDOR holes and no role checks (games/tests/IEP CRUD open to all).
- Wrong/invented query keys → stale data; mismatched notification endpoint.
- Hooks-order violation in dashboard; stale-closure timer in test player.
- Results saved to the first child; hard-coded `timeTaken`; games that never submit/crash.
- Hard-coded emoji/metadata keyed by DB id; fabricated statistics and marketing claims.
- Two colour systems (tokens vs hard-coded `stone-*`/hex); admin panel separate dark theme.
- Physical direction classes in places (`text-right`, `right-4`, `rounded-br-sm`, drawer slides from wrong side).
- Dead code: language toggle, difficulty context, ResponsiveVoice script (loaded, unused, third-party).
- Client-side PDF via screenshot (non-selectable text).
- Messages polling every 3 s with no pagination.

## 6. Responsive audit

| Area                 | Observed behaviour                                                                                                     | Desired                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Landing              | Fluid, no horizontal overflow at 500/820/1440. At ~820 px the hero words "قدراته" and "بسهولة" collide (missing space) | Fix spacing in heading                                               |
| Auth screens         | Centered card, works at 500 px; register role grid stays 3 columns                                                     | Stack role cards on narrow screens                                   |
| Sidebar              | Desktop `lg` (≥1024) fixed 18 rem (`w-72`); below `lg` a drawer + mobile header with hamburger                         | Keep; drawer must enter from the inline-end edge in RTL (right side) |
| Dashboards           | Grid of stat cards collapses by breakpoint (source)                                                                    | Keep                                                                 |
| Tables               | Few tables; mostly cards                                                                                               | Cards on mobile                                                      |
| Chat                 | Fixed 20 rem list + pane, fixed height — **not responsive**                                                            | List/thread stacked views on mobile                                  |
| Players / assessment | Full-screen, mobile-first (`max-w-sm` for assessment)                                                                  | Keep; ensure landscape tablet works                                  |
| Modals               | Radix dialog, physical `right-4` close button                                                                          | Logical positioning                                                  |

Authenticated screens were assessed from source; confirm visually once signed in.

## 7. Accessibility observations

See `DESIGN_SYSTEM.md` §Accessibility for contrast values. Key issues:

- Games have no ARIA attributes; feedback relies on colour; instructions are text-only (hard for
  pre-readers 4–6); drag-only interactions (story sequence); timers with no pause.
- Icon-only buttons (menu, close, theme, bell) lack accessible names in several places.
- Very small text (`text-[10px]`) in badges and SVG labels.
- No `prefers-reduced-motion` handling despite heavy framer-motion use.
- Global `:focus-visible` outline exists (good) — keep.
