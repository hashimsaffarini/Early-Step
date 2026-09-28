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
│   └── ui/                  # (on demand) design-system primitives — after Replit inspection
├── config/                  # env.ts — typed, validated environment
├── constants/               # App-wide constants (ROLE_LABELS, ...)
├── features/                # One folder per domain (see features/README.md)
├── hooks/                   # (on demand) generic, feature-agnostic hooks
├── lib/                     # (on demand) thin wrappers/config for third-party libs
├── services/
│   ├── http/                # httpClient, interceptors, AppError, HTTP status constants
│   └── api/                 # (on demand) cross-feature API contracts, e.g. response envelope/pagination types once documented
├── styles/                  # tokens.css, base.css, layout.css
├── test/                    # Test setup and (later) test utilities
├── types/                   # Cross-feature domain types (UserRole, ...)
└── utils/                   # (on demand) small pure functions, grouped by topic
```

"(on demand)" folders do not exist yet; create them when the first real file needs them.

### Feature folder

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

## Domain boundaries (planned, TBD against API)

`auth`, `users`, `children`, `assessments`, `activities`, `categories`, `games`,
`training-plans`, `progress`, `reports`, `feedback`, `chat`, `dashboards`.

Boundaries will be confirmed once the API documentation is available (e.g. whether tests and
games are separate resources or both "activities").

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

Layouts are structural only; visual design is pending the Replit reference.

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
