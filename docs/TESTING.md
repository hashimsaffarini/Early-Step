# Testing

## Tooling

- **Vitest** (jsdom environment, globals enabled) — config in `vite.config.ts`.
- **React Testing Library** + `@testing-library/jest-dom` matchers (`src/test/setup.ts`).
- `npm run test` (CI/once), `npm run test:watch` (development).

## What to test

| Level       | Target                                                                                                       | When                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Unit        | Zod schemas, permission model, `normalizeError`/`extractBackendDetails`, pure utils, role/enum label mapping | As soon as the logic exists                                  |
| Component   | Components with behavior: forms (validation, error display), guards, conditional rendering                   | With the feature                                             |
| Integration | Feature flows: page + hooks + router with the API mocked at the network layer                                | For critical flows (login, add child, assessment submission) |
| End-to-end  | Full browser flows against a real/staging backend                                                            | Only if justified later (e.g. Playwright) — ADR required     |

## Priorities per area (from discovery)

| Area                | Unit                                                                                                                | Component                                                                 | API integration (MSW)                                  | Route / permission                                                                          | E2E                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------ |
| Authentication      | login/register schemas; token/session parsing; `extractBackendDetails` for string / `{message}` / `string[]` errors | Login & register forms: validation messages, server errors, pending state | login success/401, register errors, forgot/reset flows | public-only redirect when signed in                                                         | Login per role (once staging exists) |
| Authorization       | permission map (`can()`), role-value mapping (Arabic ↔ key)                                                         | `<Can>` rendering                                                         | 401 → session cleared; 403 → unauthorized page         | Every `RoleGuard`: allowed role passes, other roles → `/unauthorized`, anonymous → `/login` | Cross-role URL access                |
| Child CRUD          | child schema (Age, gender values)                                                                                   | ChildForm validation; delete confirm                                      | add/edit/delete invalidate list + detail               | parent-only                                                                                 | Add child happy path                 |
| Assessment          | runner state machine (index, answered, can complete)                                                                | question renderers per type; "complete" disabled until all answered       | start → answer → complete; errors mid-flow             | operator guard                                                                              | Full assessment run                  |
| Content CRUD        | multipart builders (`Options[i].*` keys)                                                                            | Activity/question editors; destructive confirms                           | create/edit/delete + invalidation                      | admin-only                                                                                  | —                                    |
| Training plans      | ordering, completion display                                                                                        | add/remove activity UI                                                    | add/remove invalidation; "no plan" message             | specialist-only editor                                                                      | —                                    |
| Assignments         | —                                                                                                                   | assign dialogs (multi-select children)                                    | assign specialist / teacher                            | admin / specialist                                                                          | —                                    |
| Feedback            | note schema                                                                                                         | note form, edit/delete                                                    | CRUD invalidation                                      | teacher-only                                                                                | —                                    |
| Destructive actions | —                                                                                                                   | ConfirmDialog: cancel does nothing, confirm calls once, pending disables  | delete endpoints                                       | —                                                                                           | —                                    |
| Chat                | message ordering/merging (old/new cursors), unread math                                                             | thread rendering, send, optimistic message                                | pagination `beforeId`/`afterId`, seen, unread count    | per-role availability                                                                       | Two-user exchange (staging)          |

Visual markup and static layouts are not tested beyond smoke tests. Accessibility checks (labels,
roles, names) come for free via Testing Library `getByRole`/`getByLabelText` queries.

E2E (Playwright) becomes justified once a stable staging backend and non-secret test accounts
exist — ADR required; credentials only via CI secrets.

## Conventions

- Colocate tests: `Thing.test.tsx` next to `Thing.tsx`.
- Query by role/label/text (as users do), not by class names or test IDs, unless necessary.
- Test behavior and outcomes, not implementation details.
- Arabic text in assertions is fine and expected.
- **Mocked HTTP (MSW, ADR-020):** `src/test/setup.ts` starts the MSW server with
  `onUnhandledRequest: 'error'`, resets the in-memory mock DB before each test, wires the auth
  hooks (requests carry the signed-in test user's token) and signs out after each test. Handlers
  live in `src/mocks/handlers/<domain>.ts` (built from the Swagger contracts; mock authorization
  mirrors the intended backend rules). Override per test with `server.use(...)`.
- Helpers: `renderWithRouter(routes, path)` / `renderInRouter(element)` (fresh QueryClient, no
  retries), `signInAs(role)` / `signInForPath(path)` (`src/test/session.ts`).
- Assert request methods, URLs, query params and bodies (JSON or multipart `FormData`) in
  `server.use` handlers; assert cache refresh by the UI updating after mutations.
- The unit/integration suite never calls the live backend.
- **Live contract tests** (`npm run test:live`, `vitest.live.config.ts`, `src/test/live/`): the app's
  own login + GET fetchers + Zod schemas against the real API for Parent, Specialist, Admin and
  Super Admin, credentials from the gitignored `.env.e2e.local`. Read-only, no data printed,
  excluded from `npm run test`/`validate`. Result 2026-10-06: **6/6 pass**. Write flows wait for
  authorized disposable test records; browser E2E with real logins is run by a person (the
  assistant does not type real passwords into the browser).

## Don't

- Don't write tests for empty scaffolding or trivial markup.
- Don't snapshot whole pages.
- Don't commit real credentials or real children's data as fixtures.

## Current tests (2026-10-06)

**305 tests in 61 files** (`npm run test`), all against MSW:

| Area                                                  | Files | Covers                                                                                                                                                                                       |
| ----------------------------------------------------- | ----: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core (`services`, `constants`, `utils`, `components`) |    12 | error normalization, multipart builder, media URLs, role normalization, players, primitives                                                                                                  |
| App (`app`)                                           |     3 | route guards (signed-out → login with return path, wrong role → unauthorized, signed-in away from login), logout clears session + cache, role navigation, shell unread badge                 |
| Auth                                                  |     6 | login (multipart fields, session stored, wrong password, unknown role refused), register (role value, server errors), forgot (neutral for unknown email), reset (email + code, invalid code) |
| Children                                              |     3 | list states, add/edit (multipart, age), delete with confirm, parent vs staff profile, 403/404 → not found, admin blocked                                                                     |
| Assessment & activities                               |    16 | start → answer → complete bodies, unsupported types, errors, plan-activity player + "not saved", practice labels, game logic                                                                 |
| Content (admin)                                       |     6 | categories/activities/questions/options CRUD, multipart per question type, initial-assessment composition                                                                                    |
| Plans & reports                                       |     5 | plan add/remove, read-only views, reports per role, create/edit/delete, PDF download                                                                                                         |
| Dashboards, users, notes                              |     8 | server-only stats, admin users params + assign specialist, super admin tabs, teacher notes CRUD                                                                                              |
| Chat                                                  |     1 | conversations, seen, send without duplicates, polling, older messages, new conversation                                                                                                      |
| Landing                                               |     1 | hero, CTAs, no fabricated stats                                                                                                                                                              |

Helpers: `src/test/renderWithRouter.tsx`. `src/test/setup.ts` stubs
`HTMLDialogElement.showModal/close` (missing in jsdom).
