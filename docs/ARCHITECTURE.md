# Architecture

## Philosophy

- **Feature-oriented**: code is grouped by business domain, not by technical type.
- **Explicit boundaries**: one-way dependencies, public feature APIs, no cross-feature imports.
- **Build on demand**: folders and abstractions appear when real code needs them.
- **Sources of truth outside the repo**: API docs for data, Replit for visuals. Don't guess.

## Folder structure

```text
src/
├── app/                     # Composition root (the only layer that knows every feature)
│   ├── App.tsx
│   ├── pages/               # App-level pages not owned by a feature (home, 404, 401)
│   ├── providers/           # AppProviders + QueryClient factory
│   └── router/              # route tree, AppRouter, paths, route error page
├── components/
│   ├── layout/              # RootLayout, AuthLayout, DashboardLayout, ChildActivityLayout
│   ├── shared/              # Cross-feature components (AppErrorBoundary, states)
│   └── ui/                  # design-system primitives, one folder per component (Component.tsx + Component.module.css + index.ts)
├── config/                  # env.ts — typed, validated environment
├── constants/               # App-wide constants (ROLE_LABELS, ...)
├── features/                # One folder per domain (see features/README.md)
├── hooks/                   # (on demand) generic, feature-agnostic hooks
├── lib/                     # (on demand) thin wrappers/config for third-party libs
├── services/
│   ├── http/                # httpClient, interceptors, AppError, HTTP status constants
│   └── api/                 # (on demand) cross-feature API contracts, e.g. response envelope/pagination types once documented
├── styles/                  # tokens.css, base.css, layout.css
├── test/                    # Test setup (dialog stand-in) + renderWithRouter helpers
├── types/                   # Cross-feature domain types (UserRole, ...)
└── utils/                   # small pure functions, grouped by topic (classNames.ts)
```

"(on demand)" folders do not exist yet; create them when the first real file needs them.

#### Component conventions

- One folder per component: `Name.tsx`, `Name.module.css`, `index.ts` (+ `Name.test.tsx` when it
  has behaviour). Non-component helpers live in their own file (fast-refresh rule).
- Styles use tokens only (`var(--…)`) and logical properties; no raw colours outside
  `tokens.css`.
- Icon-only buttons require an Arabic `label`; form controls are wrapped in `FormField`, which
  guarantees `htmlFor`/`id`, `aria-describedby` and `aria-invalid`.
- `src/app/dev/` holds development-only tooling (the `/ui-preview` gallery) — never imported by
  features.

## Feature folder

```text
features/<name>/
├── api/         # request functions, query-key factory, useQuery/useMutation hooks
├── components/
├── hooks/
├── pages/
├── schemas/     # Zod schemas
├── types/
├── utils/
├── routes.tsx   # RouteObject[] for this feature
└── index.ts     # public API
```

Create only the subfolders a feature needs. A feature with one type file can have `types.ts`
instead of `types/`.

## Dependency direction

```text
app  ──►  features  ──►  shared layers
                         (components, services, config, constants, types, hooks, lib, utils, styles)
```

- `app/` may import anything.
- `features/<x>/` may import shared layers and its own files. **Never another feature.**
- Shared layers **never** import from `features/` or `app/`.
- Within shared layers, `services/` must not import React components.
- Outside a feature, import it only via `features/<x>/index.ts`.

### Cross-feature needs

- Shared **types** (e.g. `UserRole`) → `src/types/`.
- Shared **UI** → `src/components/`.
- **Composition** (e.g. a dashboard showing children + progress) → the page in the owning
  feature receives data via props/slots, or the composition happens in `app/`.
- If two features constantly need each other, the boundary is wrong — revisit it and log an ADR.

## Shared vs feature code

Code goes in a shared layer only when **at least two features** need it _now_. Until then it
lives in its feature. Moving it later is cheap; un-sharing a premature abstraction is not.

## API layer

- `services/http/httpClient.ts`: the single Axios instance.
- `services/http/interceptors.ts`: base URL, `Authorization` header, error normalization,
  401 hook. Auth is injected via `registerHttpAuthHooks()` so HTTP never depends on the
  auth feature.
- `services/http/apiError.ts`: `AppError` + `normalizeError()`.
- `features/<x>/api/`: typed request functions + TanStack Query hooks.

See `API_INTEGRATION.md`.

## Feature boundaries (decided after discovery, 2026-09-28)

Based on the real API partitioning (`API_ENDPOINTS.md`) and the Replit screens
(`REPLIT_AUDIT.md`). Folders are still created **only when implemented**.

| Feature          | Owns                                                                                                                                                       | API areas                                                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth`           | login, register, forgot/reset/change password, session, `registerHttpAuthHooks`, guards' session source                                                    | Account                                                                                                                                                          |
| `children`       | parent child CRUD, child lists/profiles per role (parent/teacher/specialist/super-admin views), specialist→teacher assignment, admin→specialist assignment | Parent, `/specialist/children`, `/Teacher/children`, `/SuperAdmin/children`, assign endpoints                                                                    |
| `users`          | admin & super-admin user lists/details                                                                                                                     | `/Admin/users*`, `/SuperAdmin/users`                                                                                                                             |
| `content`        | admin content management: categories, activities (tests/games), questions, options, **initial-assessment composition**                                     | `/Admin/categories*`, `/Admin/activities*`, `/Admin/questions*`, `/Admin/question-options*`, `/initial-assessment/categories*`, `/initial-assessment/questions*` |
| `assessments`    | taking the initial assessment (start → answer → complete), results (when API exists)                                                                       | `/initial-assessment/{id}/start                                                                                                                                  | answer | complete` |
| `training-plans` | specialist plan editor, plan views, child activity play/results, progress summary                                                                          | `/TrainingPlan/*`                                                                                                                                                |
| `feedback`       | teacher notes CRUD                                                                                                                                         | `/Teacher/notes*`, `/Teacher/children/{id}/notes`                                                                                                                |
| `reports`        | report CRUD, lists, PDF download                                                                                                                           | `/specialist/Reports`, `/specialist/CreateReport`, `/specialist/{id}`, `/Reports/*`                                                                              |
| `chat`           | conversations, messages, unread, seen, hub connection                                                                                                      | `/api/Chats/*`, `/Chats*`, hub                                                                                                                                   |
| `dashboards`     | per-role home/dashboard pages                                                                                                                              | `/Admin/dashboard`, `/specialist/dashboard`, `/Teacher/dashboard`, `/SuperAdmin/dashboard`                                                                       |

Changes from the foundation plan: `categories`, `activities` and `games` are merged into
**`content`** (one admin CRUD domain; "game" is an activity type — `ACTIVITY_ENGINE.md`);
`progress` is part of **`training-plans`** (the API exposes progress only as plan results).

### Shared product components needed by several features

- **Question players** (choice / order / match renderers, answer feedback, result stars) are
  used by `assessments` and `training-plans` → `src/components/question-players/` (presentational,
  props-driven, **no API calls**).
- Enum display maps (roles, gender, activity type) → `src/constants/` (one module per enum).
- Media URL helper (`/uploads/...` → absolute) → `src/services/api/` or `src/lib/`.
- Route path constants: features must link to other areas without importing `app/`. When the
  first feature needs a path, **move `ROUTE_PATHS` / `ROLE_NAMESPACES` from `app/router/paths.ts`
  to `src/constants/routes.ts`** (ADR required).

### Feature dependency rules

```text
dashboards ─┐
children ───┤
reports ────┤  → shared layers only (components, services, constants, types, config)
chat ───────┤
...         ┘
app/router  → every feature (composition root)
```

No feature imports another. Cross-feature screens (e.g. a teacher's child page showing the plan
**and** notes) are composed in `app/router` from each feature's public components, or the owning
feature renders a slot passed by the route.

## Routing

Centralized in `app/router/`. Features export route objects; `app/router/routes.tsx`
assembles them under the right layout and guards. Paths are constants. See `ROUTING.md`.

## Layouts

| Layout                | Purpose                                                      |
| --------------------- | ------------------------------------------------------------ |
| `RootLayout`          | Top-level outlet for all routes                              |
| `AuthLayout`          | Login / register                                             |
| `DashboardLayout`     | Role dashboards: skip link, header, nav (inline-start), main |
| `ChildActivityLayout` | Distraction-free shell for child tests/games                 |

Layouts are structural only; visual design follows `DESIGN_SYSTEM.md` (extracted from Replit)
and is applied in Stage 1. `DashboardLayout` will take role-specific navigation config from
`app/router`; the mobile drawer must open from the inline-start edge (right side in RTL) — Replit
animates it from the wrong side.

## Preventing architecture degradation

1. No cross-feature imports. Code review rejects them.
2. No `../../` imports (ESLint enforces). Use `@/`.
3. No new top-level folders without an ADR.
4. No `helpers/`, `misc/`, `common/` dumping grounds; `utils/` files are topic-named
   (`date.ts`, not `utils.ts`).
5. No API calls in components — always through a feature `api/` hook.
6. No server data in Zustand.
7. No hardcoded paths, URLs, colors, role strings — use constants/tokens.
8. Files that grow past a single clear responsibility get split.
9. Architectural changes update `DECISIONS.md` and the relevant docs in the same change.
10. Consider adding `eslint-plugin-boundaries` (or `import/no-restricted-paths`) once several
    features exist, to enforce rules 1 and the dependency direction automatically.
