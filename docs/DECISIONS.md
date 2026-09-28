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
