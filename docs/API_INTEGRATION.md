# API Integration

> Backend documentation: <https://e3mockwfb7.apidog.io/> (Apidog). Endpoint catalogue:
> [`API_ENDPOINTS.md`](API_ENDPOINTS.md). **Never invent endpoints, fields, or response
> formats.** The Replit prototype has its own unrelated backend and is **not** a contract source.

## Live backend (verified 2026-10-06)

| Topic                 | Verified fact                                                                                                                                                            | Frontend handling                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Base URL              | `https://earlystep22.runasp.net/api/` (root `/` answers "API is running")                                                                                                | `VITE_API_BASE_URL` (must end with `/api/`); request paths are **relative** (`Parent/GetMyChildren`) so `/api/api` can't happen |
| Contract              | Public Swagger at `/swagger/v1/swagger.json` — 74 operations, **all under `/api/`**, consistent casing                                                                   | Snapshot in `docs/api/swagger.json`; Swagger is the contract source (Apidog is outdated)                                        |
| Auth                  | `Bearer` scheme; 401 = ProblemDetails                                                                                                                                    | Interceptor adds the token; 401 → sign out + clear cache                                                                        |
| Errors                | ProblemDetails (`title`, `status`, `errors{Field:[…]}`), `{ message }`, string, string[]                                                                                 | `extractBackendDetails()` in `services/http/apiError.ts`                                                                        |
| CORS                  | Preflight from `http://localhost:5173` allowed (`*`)                                                                                                                     | Dev server talks to the API directly                                                                                            |
| Login response        | **Verified:** `{ id, fullName, accessToken, role }`, JWT 120 h, no refresh/cookie                                                                                        | `parseLoginResponse` (verified shape; JWT claims as fallback)                                                                   |
| Enums                 | Roles `ولي أمر`, `معلم/ة`, `أخصائي/ة` (observed); gender `ولد`/`بنت` (Swagger); question types `SingleChoice`, `MultiSelect`, `Sequence` (`Matching` removed 2026-10-08) | `constants/backendRoles.ts`, `services/api/childrenLists.ts`, `services/api/activityType.ts`                                    |
| Child model           | `FullName`, **`Age` (int)**, `Gender` — no birth date                                                                                                                    | Add/edit child asks for age                                                                                                     |
| Responses             | Swagger documents response schemas only for chat; the others were **verified live** for every readable endpoint (`api/LIVE_CONTRACTS.md`)                                | Zod schemas follow the verified shapes; `npm run test:live` re-checks them                                                      |
| "No data" responses   | Reports and specialist plans answer **404 + Arabic message** when empty                                                                                                  | Mapped to empty states (`fetchChildReports`, `fetchSpecialistPlan`); other 404s stay errors                                     |
| Required query params | `type` on `TrainingPlan/children/{id}/activities` and `Admin/categoriesActivity`                                                                                         | The child plan fetches tests and games in parallel                                                                              |

## Mocked API (tests + development mock mode)

`src/mocks/` (MSW) implements the Swagger contracts with fictional data. Vitest runs every test
against it (unhandled requests fail). `VITE_USE_MOCKS=true` (local `.env`, dev only) serves the
whole app from it with a "وضع المحاكاة" banner; the worker is stripped from production builds.

## Environment

| Variable            | Required | Description                                                                  |
| ------------------- | -------- | ---------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | yes*     | Backend base URL ending with `/api/` (`https://earlystep22.runasp.net/api/`) |
| `VITE_USE_MOCKS`    | no       | `true` = development mock mode (ignored in production builds)                |

\* Validated lazily by `getEnv()` (`src/config/env.ts`) the first time a request is made. A
missing/invalid value throws a descriptive error. All `VITE_*` values are **public** (bundled
into the client) — never put secrets in them.

## Layers

```text
Component
  └─ feature hook       features/<x>/api/*Queries.ts     (useQuery / useMutation, keys from services/api/queryKeys.ts)
       └─ request fn    features/<x>/api/<x>Api.ts       (Zod-validated DTO → mapped domain model)
            (shared cross-feature reads: services/api/* + hooks/api/childResources.ts)
            └─ httpClient   services/http/httpClient.ts
                 └─ interceptors  base URL · auth header · error normalization · 401 hook
```

Components only call feature hooks. They never import `httpClient` or Axios.

## Axios client

- `httpClient` — one shared instance, `timeout` 30s, JSON `Accept` header.
- Request interceptor: sets `baseURL` from env; adds `Authorization: Bearer <token>` when the
  registered `getAccessToken()` returns a token (header scheme TBD against API docs).
- Response interceptor: converts every failure to `AppError`; calls `onUnauthorized()` on 401.

## Auth token handling

- `AuthHttpBridge` (`app/providers`) registers `registerHttpAuthHooks({ getAccessToken, onUnauthorized })`
  at startup, keeping `services/http` independent of features.
- Session = `services/session` (Zustand): token + user (name, role, id/email if present) +
  expiry; sessionStorage, or localStorage with "تذكّرني". Details and limits: `SECURITY.md`.
- No refresh token, `me` or logout endpoint exists: on expiry/401 the user signs in again;
  logout is local (drop token, clear cache).

## Error normalization

```ts
class AppError extends Error {
  kind: 'http' | 'network' | 'timeout' | 'canceled' | 'unknown';
  status?: number;
  code?: string;
  fieldErrors?: Record<string, string[]>;
}
```

- `normalizeError(unknown): AppError` handles Axios errors, timeouts, cancellations, network
  failures. Arabic fallback messages are defined per case/status.
- `extractBackendDetails()` is a **TBD stub**: implement it against the documented backend
  error body to extract message, code, and field errors.
- Forms map `fieldErrors` onto React Hook Form with `setError`.
- TanStack Query's `defaultError` type is registered as `AppError`.

## TanStack Query conventions

- Defaults (`src/app/providers/queryClient.ts`): `staleTime` 30s, no refetch on focus, up to
  2 retries only for network/5xx errors, no mutation retries. Tune per query when justified.
- One **query-key factory** per feature, typed with `as const`:

```ts
// features/children/api/childrenKeys.ts  (illustrative shape — not a real endpoint)
export const childrenKeys = {
  all: ['children'] as const,
  lists: () => [...childrenKeys.all, 'list'] as const,
  list: (filters: ChildrenFilters) => [...childrenKeys.lists(), filters] as const,
  details: () => [...childrenKeys.all, 'detail'] as const,
  detail: (id: ChildId) => [...childrenKeys.details(), id] as const,
};
```

- Never write inline array keys in components.
- Prefer `queryOptions()` helpers so keys and fetchers stay together.

## Mutation invalidation strategy

- After a mutation, invalidate the narrowest affected keys (e.g. `childrenKeys.lists()` and
  `childrenKeys.detail(id)`), not the whole cache.
- Use `setQueryData` only when the server returns the updated entity.
- Optimistic updates only where UX clearly benefits and rollback is implemented.
- On logout: `queryClient.clear()`.

## API typing conventions

- Types mirror backend field names exactly (no renaming). Arabic labels are mapped in UI.
- Request/response types live in `features/<x>/types/` (or `api/` if API-only).
- Shared envelope/pagination types (once documented) go in `src/services/api/`.
- Use Zod to parse responses when shape reliability is uncertain; otherwise TypeScript types.
- Branded or aliased ID types (e.g. `type ChildId = string`) once ID formats are known.
- Dates: keep as ISO strings at the boundary; format for display with `Intl` in `ar` locale.

## Contract notes (re-verified 2026-10-08)

- **Initial assessment:** every question type is answered with one
  `{ questionId, selectedOptionId }` (`features/assessments/state/assessmentRun.ts`); the result is
  the `complete` response (`AssessmentResult`) — there is no GET, so it is shown only right after
  completion.
- **Reports:** one report per child — `fetchChildReport(childId): ChildReport | null`
  (`services/api/childReports.ts`, query key `reports.byChild`).
- **Training plans:** the first `POST …/activities` creates the plan once a teacher is assigned;
  an empty 500 is shown as "assign a teacher first".
- **Chat:** REST + polling; no SignalR hub is deployed.

## Unknowns (TBD)

Deployed SignalR hub path/events · `Teacher/feedbacks` response shape (no Teacher account) ·
training-plan answer submission · persistent assessment-result read · canonical forgot-password
route · API versioning. Current backend list: `BACKEND_REQUESTS.md`.
