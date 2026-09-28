# API Integration

> Backend documentation: <https://e3mockwfb7.apidog.io/> (Apidog). Endpoint catalogue:
> [`API_ENDPOINTS.md`](API_ENDPOINTS.md). **Never invent endpoints, fields, or response
> formats.** The Replit prototype has its own unrelated backend and is **not** a contract source.

## Discovery findings (2026-09-28, documentation only — not yet verified live)

| Topic                           | Finding                                                                                                      | Consequence for the frontend                                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Base URL                        | Not documented (`servers: []`); chat hub example is `wss://localhost:7256/chatHub`                           | `VITE_API_BASE_URL` stays empty until provided; a separate hub URL may be needed (TBD)                                                       |
| `/api` prefix                   | Only on register, login and 4 chat routes                                                                    | Keep full paths per endpoint in request functions; verify live before assuming a typo                                                        |
| Auth scheme                     | `bearer` (HTTP) on protected routes; format (JWT/opaque) undocumented                                        | Interceptor already supports bearer injection                                                                                                |
| Login                           | `POST /api/Auth/login`, `multipart/form-data` (`email`, `password`, `rememberMe`); **response undocumented** | Token field, user/role payload, expiry: **TBD — blocking for Stage 2**                                                                       |
| Register                        | `POST /api/Auth/register`, multipart, `role` is an Arabic string (e.g. `ولي أمر`)                            | Role values must be confirmed                                                                                                                |
| Current user / logout / refresh | **Not documented**                                                                                           | Session restore strategy TBD (decode JWT? store user from login response?)                                                                   |
| Password                        | change (bearer), forgot (email), reset (email + code)                                                        | JSON bodies                                                                                                                                  |
| Content types                   | Mixed multipart (auth, child add/edit, activity, question, option, report edit) and JSON                     | Request functions must send `FormData` where documented; Axios sets the multipart boundary automatically — don't set `Content-Type` manually |
| File uploads                    | Activity `Icon`, `QuestionImage`, `Options[i].OptionImage`                                                   | Indexed multipart keys (`Options[0].OptionText`) — ASP.NET model binding                                                                     |
| Media URLs                      | Relative (`/uploads/...`)                                                                                    | Build absolute URLs from the API origin in one helper                                                                                        |
| Response envelopes              | Inconsistent: bare string, `{ message }`, `string[]`, entity                                                 | Normalize per endpoint in the feature API layer                                                                                              |
| Errors                          | No status codes documented; Arabic messages; some failures shown with 200                                    | `extractBackendDetails()` must handle string / `{message}` / `string[]` / ProblemDetails — **verify live**                                   |
| Pagination                      | Only chat (`take`, `beforeId`, `afterId`)                                                                    | Infinite queries for chat only                                                                                                               |
| Enum values                     | Arabic strings (role, gender, activity type) mixed with English (question types, `type=test`)                | Keep backend values as-is; map for display; single mapping module per enum                                                                   |
| Real-time                       | SignalR-style hub `/chatHub`; methods/events undocumented                                                    | `@microsoft/signalr` may be needed (ADR at Stage "Chat")                                                                                     |
| PDF                             | `GET /Reports/{id}/download` returns PDF bytes                                                               | `responseType: 'blob'`                                                                                                                       |

## Environment

| Variable            | Required | Description                      |
| ------------------- | -------- | -------------------------------- |
| `VITE_API_BASE_URL` | yes*     | Absolute base URL of the backend |

\* Validated lazily by `getEnv()` (`src/config/env.ts`) the first time a request is made. A
missing/invalid value throws a descriptive error. All `VITE_*` values are **public** (bundled
into the client) — never put secrets in them.

## Layers

```text
Component
  └─ feature hook       features/<x>/api/use<Thing>.ts   (useQuery / useMutation)
       └─ request fn    features/<x>/api/<x>Api.ts       (typed, uses httpClient)
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

- The auth feature (future) calls `registerHttpAuthHooks({ getAccessToken, onUnauthorized })`
  once at startup. This keeps `services/` independent of `features/`.
- Token storage strategy is **TBD** — depends on the backend (httpOnly cookie vs bearer token,
  refresh tokens, expiry). Decide after reading the API docs and record an ADR.
- Refresh tokens (if supported): implement in the response interceptor with a single in-flight
  refresh promise, queued retries, and logout on refresh failure. Not implemented until the
  API confirms the flow.

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

## Unknowns (TBD)

Base URL/environments · CORS · login response & token format/lifetime · refresh/logout/me ·
all role enum values · error body format & status codes · hub protocol & auth · initial
assessment result endpoint · training-plan answer submission · game endpoints · API versioning.
