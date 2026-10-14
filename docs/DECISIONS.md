# Architecture Decision Log

New decisions are appended. Superseded decisions are marked, not deleted.

## ADR-001 — React + TypeScript + Vite

### Status

Accepted

### Context

Early Step is a client-rendered, authenticated web app backed by an external API. SEO and
server rendering are not requirements.

### Decision

Use React 19, TypeScript (strict), and Vite as the build tool. No Next.js.

### Consequences

Fast dev server and simple static deployment. Routing, data fetching, and auth are handled in
the client.

## ADR-002 — Feature-oriented architecture with one-way dependencies

### Status

Accepted

### Context

The product has many domains (children, assessments, plans, chat, ...) and five roles. A
type-based structure (all components together, all hooks together) degrades as it grows.

### Decision

Group code by domain in `src/features/<domain>/`. Dependencies flow
`app → features → shared layers`. Features don't import each other and expose a public
`index.ts`. Subfolders are created only when needed.

### Consequences

Clear ownership and boundaries. Cross-feature composition must happen in `app/` or via shared
layers, which requires some discipline (to be tooling-enforced later if needed).

## ADR-003 — TanStack Query for server state; Zustand only for justified client state

### Status

Accepted

### Context

Most state will be server data. Duplicating it in a global store causes staleness bugs.

### Decision

TanStack Query owns server state. React state owns local UI state. Zustand is installed but
used only for genuinely global client state (e.g. session), each use recorded here. No Redux.

### Consequences

Less boilerplate; caching/invalidation handled consistently. Developers must resist putting
API data in Zustand.

## ADR-004 — Axios HTTP layer with normalized `AppError` and injected auth hooks

### Status

Accepted

### Context

The API contract is not yet known, but every feature needs consistent auth headers, error
handling, and 401 behavior.

### Decision

One Axios instance (`services/http/httpClient.ts`). Interceptors resolve the base URL, attach
the bearer token, normalize all failures into `AppError`, and call an `onUnauthorized` hook.
Auth is injected with `registerHttpAuthHooks()` so `services/` does not depend on
`features/auth`. Backend error-body parsing is a TBD stub until the API is documented.
TanStack Query's `defaultError` type is registered as `AppError`.

### Consequences

Components see one error type. The token scheme, refresh flow, and error body parsing must be
completed when the API docs arrive.

## ADR-005 — Arabic-only RTL, no localization library

### Status

Accepted

### Context

The product is Arabic only; no other languages are planned.

### Decision

`<html lang="ar" dir="rtl">` globally, CSS logical properties, Arabic strings written
directly in components. No i18n library or language switcher. Backend English enum values are
mapped to Arabic labels via constant maps (e.g. `ROLE_LABELS`).

### Consequences

Simpler code. Adding another language later would require extracting strings (accepted risk).

## ADR-006 — React Router 7 data router with centralized paths

### Status

Accepted

### Context

Five role namespaces, public auth routes, and child activity routes need consistent layouts
and guards.

### Decision

Use `react-router` v7 in data-router mode (`createBrowserRouter`). One route tree in
`app/router/routes.tsx`; features export route objects; paths are constants in
`app/router/paths.ts`.

### Consequences

Route errors and lazy loading are supported natively. Adding a route requires touching
`app/router` — intentional, to keep the tree in one place.

## ADR-007 — React Hook Form + Zod, schemas colocated with features

### Status

Accepted

### Decision

Forms use React Hook Form with `@hookform/resolvers/zod`. Schemas live in
`features/<x>/schemas/`. Server field errors (`AppError.fieldErrors`) are mapped with
`setError`.

### Consequences

Consistent validation and typed form values. Schemas must mirror backend validation rules
from the API docs.

## ADR-008 — Plain CSS with design tokens; no UI library yet

### Status

Accepted

### Context

The visual design must match the existing Replit app, which hasn't been inspected yet.

### Decision

Use plain CSS with custom-property tokens in `src/styles/tokens.css` (neutral placeholders).
No UI kit or CSS framework until the Replit design is reviewed.

### Consequences

Nothing to undo when the real design arrives. The styling approach (plain CSS, CSS modules,
or a framework) may be revisited after inspecting Replit — record a new ADR if so.

## ADR-009 — Vitest + React Testing Library

### Status

Accepted

### Decision

Vitest (shares the Vite config, jsdom environment) with React Testing Library and jest-dom.
E2E tooling is deferred until justified.

### Consequences

Fast tests with no separate Babel/Jest configuration.

## ADR-010 — Tool versions compatible with Node 20.17

### Status

Accepted

### Context

The development machine runs Node 20.17.0. The latest majors of Vite (8), @vitejs/plugin-react
(5+), ESLint (10), and jsdom (27+) require Node ≥ 20.19 or 22.

### Decision

Pin to the newest majors that support Node 20.17: Vite 6, @vitejs/plugin-react 4, ESLint 9,
jsdom 26, TypeScript 5.9 (typescript-eslint doesn't support TypeScript 7 yet), Vitest 4.
`.nvmrc` = 20.17.0.

### Consequences

Everything works on the current machine. Upgrading Node to 22 LTS would allow moving to the
latest tool majors — do it as a separate, validated change.

## ADR-011 — Environment config in `src/config`, validated lazily with Zod

### Status

Accepted

### Context

The setup request suggested `src/app/config/env.ts`. The HTTP layer (`services/`) needs the
env, and shared layers must not import from `app/` (ADR-002).

### Decision

Place `env.ts` in `src/config/`. Validate `import.meta.env` with Zod on first access
(`getEnv()`), not at startup, so the shell runs before the API URL is known.

### Consequences

Dependency direction stays clean. A misconfigured env surfaces on the first API request, with a
clear message.

## ADR-012 — ESLint strict type-checked + Prettier

### Status

Accepted

### Decision

ESLint flat config with `typescript-eslint` `strictTypeChecked` + `stylisticTypeChecked`,
React Hooks and React Refresh rules, `no-explicit-any`, type-only imports, and a ban on
`../../` imports. Prettier handles formatting (`eslint-config-prettier` disables conflicting
rules). Lint runs with `--max-warnings=0`.

### Consequences

Strict baseline from day one. Occasionally verbose code to satisfy type-aware rules.

## ADR-013 — Replit is a visual reference only; the Apidog API is the contract

### Status

Accepted

### Context

Discovery (2026-09-28) showed the Replit project is a full-stack prototype with its own Express +
PostgreSQL backend (session cookies, integer ids, English enums, OpenAI evaluation) that never
calls the real Early Step API. Its data model, permissions and several features (rewards, AI
risk scoring, notifications, IEP, difficulty, dark mode, EN toggle) have no counterpart in the
real API.

### Decision

Use Replit only for visual design, layout and UX patterns. Take all contracts, enums,
permissions and capabilities from the Apidog API (verified live when possible). Replit-only
features are out of scope unless the product owner requests them and the backend supports them.

### Consequences

No Replit data-layer code is migrated. Some Replit screens (AI report builder, rewards, IEP) will
not exist in the new app. Conflicts are tracked in `GAP_ANALYSIS.md`.

## ADR-014 — Feature boundaries after discovery

### Status

Accepted

### Context

The foundation listed provisional features (`categories`, `activities`, `games`, `progress`
separately). The API groups categories, activities, questions, options and initial-assessment
composition under admin content management, and exposes progress only as training-plan results.

### Decision

Features: `auth`, `children`, `users`, `content`, `assessments`, `training-plans`, `feedback`,
`reports`, `chat`, `dashboards`. Question renderers shared by assessments and training plans
live in `src/components/question-players/` (presentational, no API; implemented as `src/components/players/`, ADR-019). Details in
`ARCHITECTURE.md`.

### Consequences

Fewer, larger domains that mirror the API. Route path constants will move to
`src/constants/routes.ts` when the first feature needs cross-area links (separate ADR).

## ADR-015 — Role-namespaced routes

### Status

Accepted

### Context

The API is partitioned by role (`/Parent`, `/Teacher`, `/specialist`, `/Admin`, `/SuperAdmin`),
each with its own dashboard/children endpoints. Replit's flat routes with in-page role branching
caused redirect loops and hooks-order bugs.

### Decision

Use `/parent/*`, `/teacher/*`, `/specialist/*`, `/admin/*`, `/super-admin/*`, plus public auth
routes and a full-screen `/play/*` area. Shared screens (chat, change password) reuse the same
page component in each namespace. See `ROUTING.md`.

### Consequences

One `RoleGuard` per subtree; unambiguous URLs; some route-table repetition for shared pages.

## ADR-016 — Visual direction decisions

### Status

Accepted (product owner, 2026-09-28)

### Context

The Replit audit (`REPLIT_AUDIT.md`, `DESIGN_SYSTEM.md`) surfaced open visual questions: product
name, dark mode, which of Replit's child-facing styles to follow, and failing contrast of the brand
blue.

### Decision

- Product name: **Early Step**.
- Dark mode: **not in scope** for now; light theme only (tokens stay dark-ready).
- Child-facing UI: the **light assessment style**; the dark test-player style is not used.
- Contrast: `#0DA2E7` stays the brand/decorative blue; `#0A7AAE` for filled buttons and important
  text; dark text on amber backgrounds.
- Preserve Cairo (body), Tajawal (headings), warm cream background, rounded cards, gradient
  banners, playful feedback, stars/sounds/confetti where appropriate.
- Fix Replit's RTL drawer, dropdown positioning, mobile chat, tiny text, labels, colour-only
  feedback, reduced motion, broken decorative classes, fabricated statistics.

### Consequences

One light visual dialect. The UI foundation stage applies these tokens; no theme toggle is built.

## ADR-017 — UI foundation implementation choices

### Status

Accepted

### Context

The UI foundation stage applies the Replit-derived design system (ADR-016) to shared layouts and
core components without building product features.

### Decision

- **Styling:** plain CSS with design tokens (`src/styles/tokens.css`) + **CSS Modules** per
  component (built into Vite; no CSS framework, no UI kit). Only logical properties; no raw
  colours outside the tokens file.
- **Fonts:** self-hosted via Fontsource — `@fontsource-variable/cairo` (body) and
  `@fontsource/tajawal` 700/800/900 (headings). No third-party font requests (children's
  platform, privacy, offline reliability).
- **Icons:** `lucide-react` (same icon family as Replit, tree-shaken).
- **Dialogs / drawer:** native `<dialog>` + `showModal()` for focus trapping, inert background and
  Escape handling — no dialog library.
- **Animation:** CSS transitions/keyframes only (no framer-motion); the global
  `prefers-reduced-motion` override disables them.
- **Dev UI preview:** `/ui-preview` routes are lazy-loaded and registered only when
  `import.meta.env.DEV` is true, so they never ship to production.
- **Testing:** `@testing-library/user-event` added for interaction tests; jsdom lacks
  `HTMLDialogElement.showModal`, so `src/test/setup.ts` provides a minimal stand-in.

### Consequences

Small dependency footprint; components are portable and token-driven. Breakpoints are written
literally in media queries (CSS variables are not allowed there) and documented at the top of
`tokens.css`.

## ADR-018 — Shared route constants and lazy auth routes

### Status

Accepted

### Context

The auth and landing features link to each other's routes, but features must not import `app/`.
The auth screens also pulled React Hook Form + Zod into the main bundle (> 500 kB warning).

### Decision

- Route constants move from `app/router/paths.ts` to `src/constants/routes.ts`.
- `/login`, `/register`, `/forgot-password`, `/reset-password` use React Router `lazy`; the landing
  page stays eager for first paint.

### Consequences

Features stay independent of `app/`. Main bundle ≈ 370 kB, auth chunk ≈ 144 kB loaded on demand.

## ADR-019 — Complete Replit UI migration: role areas, shared players, mock roster

### Status

Accepted (2026-09-29)

### Context

The remaining Replit screens (tests, games, initial assessment, reports, messages, notifications,
education plans, teacher/specialist/admin dashboards, super admin panel) are migrated as UI only,
before backend integration. In Replit most screens are shared by four roles at flat URLs
(`/children`, `/tests`, …) with role branching inside pages. Authentication does not exist yet.

### Decision

- **Role areas.** Each role gets its own namespace (ADR-015): `/parent`, `/teacher`, `/specialist`,
  `/admin` share one set of screens built by `buildAreaRoute(role)` in `app/router/areaRoutes.tsx`
  (dashboard, children, child profile, education plans, tests, games, reports, report detail,
  messages; create report only for Specialist/Admin). Full-screen child pages (test player, game
  player, initial assessment) live in the same namespace but outside the sidebar shell. The Super
  Admin has a single panel at `/super-admin`.
- **`useRoleArea()`** (`src/hooks/useRoleArea.ts`) exposes the current role and its path builders
  (`getAreaPaths` in `src/constants/routes.ts`) so shared pages build role-scoped links and vary
  role-specific UI. It is display/navigation only — **not** access control. Areas remain
  **temporarily unguarded** for UI development (mock session users in `app/dev/mockSessions.ts`).
- **Shared players** in `src/components/players/` (PlayerShell, PlayerBanner, StartScreen,
  AnswerTile, QuestionProgress, FeedbackMessage, ResultPanel, StarRating, StatPill, SoundToggle +
  `useSoundEffects`, Confetti) are used by games, tests and the assessment — presentational, no
  data access. `CategoryTile` + category gradient tokens (text-safe) are shared UI; category keys
  live in `src/constants/activityCategories.ts`.
- **`features/activities`** owns the child-facing catalogues and players (tests + games). Admin
  content CRUD stays planned in `features/content` (ADR-014).
- **One light visual language.** Replit's dark test player and dark super-admin app are rebuilt in
  the Early Step light style (ADR-016).
- **Mock data** stays per feature (features never import each other) but follows one documented
  roster (`docs/MOCK_DATA.md`) so ids, names and facts agree across screens.
- **Excluded or neutralized:** AI report generation and "AI" branding, risk levels/probabilities,
  percentage scores, clinical result claims, rewards (XP, levels, streaks, badges, leaderboard),
  countdown timers for children, PDF generation, real messaging (no sockets).

### Consequences

Every Replit screen has a route in each role that can use it, with no dead links. When auth
arrives, guards wrap each area route and `useRoleArea` keeps working; the mock sessions and
mock files are deleted as screens are connected to the API.

## ADR-020 — Backend integration approach

### Status

Accepted (2026-10-06)

### Context

The live backend (`https://earlystep22.runasp.net/api/`) publishes a Swagger document whose paths
are all under `/api/` with consistent casing, but it documents response schemas only for chat. No
demo account could sign in, and the Admin controller was found unauthenticated (see
`SECURITY.md`); live testing is paused at the user's request.

### Decision

- **Contract source:** the Swagger snapshot (`docs/api/swagger.json`). Apidog examples fill gaps;
  every inferred response shape is parsed leniently with Zod and marked NOT LIVE-VERIFIED.
- **Paths:** relative to `VITE_API_BASE_URL` (which must end with `/api/`) — no duplicated prefix.
- **Session:** shared Zustand store (`services/session`), sessionStorage by default, localStorage
  with "remember me"; login response parsed leniently (token + role from body or JWT claims,
  unknown role → refused). No refresh/logout/me endpoints → local logout, clear cache on 401.
- **Roles:** one normalization module; observed Arabic values mapped; unknown → no access.
- **Query keys:** one central factory module; cross-feature reads (children lists, child reports,
  child plan activities) live in shared `services/api` + `hooks/api`.
- **Mocked HTTP:** MSW (`msw@2`, dev dependency) for all tests (unhandled requests fail) and an
  opt-in development mock mode (`VITE_USE_MOCKS=true`, dev only, banner shown, worker removed from
  production builds) so the integrated UI can be reviewed without backend accounts.
- **Honesty:** missing backend capabilities are BLOCKED BY BACKEND in the UI and docs — no fake
  persistence, results, pickers or history.

### Consequences

Every integration is testable deterministically; going live requires only working accounts to
verify the lenient schemas (`BACKEND_INTEGRATION_STATUS.md` lists each one).

## ADR-021 — Session user from `GET Auth/me`

### Status

Accepted (2026-10-14)

### Context

The backend added `GET Auth/me` (`{ id, fullName, email, roles }`). The session used to store the
login response's user (name, email, role) in web storage and trust it after reloads.

### Decision

Login posts `Auth/login` for the token, then calls `Auth/me` (with the new token as an explicit
header) for the user. Only `{ accessToken, expiresAt }` is stored. After a reload the store holds a
`pending` token; the route guards render `SessionRestore`, which calls `Auth/me` and restores the
session (401 → signed out, cache cleared; other errors → retry). The request interceptor never
overrides an explicit `Authorization` header.

### Consequences

One source of truth for who is signed in and for the routing role (the server's current role); no
personal data in web storage; one extra request on login and on each reload; protected pages wait
for `Auth/me` before rendering.

## ADR-022 — Staff-only assessment results and kept result history

### Status

Accepted (2026-10-14, business-rule clarifications from the backend developer)

### Context

Live, the Parent gets 403 on `GET initial-assessment/{childId}/result`, and deleting a child or
removing a plan activity with saved results fails. The backend developer clarified that both are
intended.

### Decision

The Result endpoint is staff-only: the Parent UI never calls it, and the parent's assessment ends
with a confirmation (no score; `complete` only completes). Records with results are kept: the
parent's delete action is disabled for a child whose plan has a completed activity, and played
plan activities have no remove action. No frontend workaround is added for backend errors.

### Consequences

Parents see their child's progress through the specialist (reports, plan), not raw assessment
scores. The empty 500 on such deletes remains a small backend improvement (descriptive 400/409).
