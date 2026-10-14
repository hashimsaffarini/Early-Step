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
- **Live tests** (`vitest.live.config.ts`, `src/test/live/`, credentials from the gitignored
  `.env.e2e.local`, excluded from `npm run test`/`validate`, nothing printed):
  - `npm run test:live:read` — the app's own login + GET fetchers + Zod schemas for Parent,
    Specialist, Admin, Super Admin.
  - `npm run test:live:write` — the app's own write functions on disposable `E2E Test …` records:
    child create/edit/delete, assessment start/answer/complete (result), assign specialist,
    assign teacher, report create/edit/PDF/delete (parent sees it), first plan activity creates the
    plan, category / test + game
    activities / question / option CRUD, assessment composition. Every record is tracked and
    deleted in `afterAll`; a 404 counts as already gone (cascades); **any other leftover fails the
    run** with its id. Not covered: chat send (messages cannot be deleted), registration (users
    cannot be deleted).
  - `npm run test:live` runs both, sequentially. Result 2026-10-07: read 6/6, write 6/6.
    Result 2026-10-08: read 5/6, write 5/6 (backend issues, since fixed).
    **Result 2026-10-10: read 5/6, write 6/6** — the one failure is the backend's new Admin 403 on
    `initial-assessment/categories`; cleanup verified. The write suite now also checks the saved
    assessment result (`GET …/result`, Parent and Specialist) and a plan-activity submission whose
    counts appear in the specialist plan.
  - Live errors are redacted (`liveSession.ts` strips request config/response) so no token or
    response body reaches the test output.
  - Browser E2E with real logins is run by a person (the assistant does not type real passwords
    into the browser).

## Don't

- Don't write tests for empty scaffolding or trivial markup.
- Don't snapshot whole pages.
- Don't commit real credentials or real children's data as fixtures.

## Current tests (2026-10-14)

**341 tests in 66 files** (`npm run test`), all against MSW:

| Area                                                  | Files | Covers                                                                                                                                                                                    |
| ----------------------------------------------------- | ----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core (`services`, `constants`, `utils`, `components`) |    14 | error normalization, multipart builder, media URLs, role normalization, password policy, shared choice answers (payload per type), players, primitives                                    |
| App (`app`)                                           |     3 | route guards, session restore after reload (`Auth/me` ok / 401 → login / 5xx → retry / role from `Auth/me` for direct URLs), logout clears session + cache, role navigation, unread badge |
| Auth                                                  |     7 | login → `Auth/me` (user and role from `Auth/me`, only the token stored, explicit header wins over a stale token), unknown role refused, register (no `Role`), forgot (neutral), reset     |
| Children                                              |     3 | list states, add/edit/delete, parent vs staff profile, saved result with per-question details (staff), teacher-notes tab (specialist only)                                                |
| Assessment & activities                               |    16 | start → answer (exact MultiSelect set, Sequence order + reset) → complete, plan player (all types, 409 without retry, unanswerable activity blocked), practice labels, game logic         |
| Content (admin)                                       |     6 | categories/activities/questions/options CRUD, assessment composition (badges; error + retry when membership cannot be read)                                                               |
| Plans & reports                                       |     5 | plan add/remove, score + server progress + child's answers on demand, no-teacher 400 message, reports per role, PDF                                                                       |
| Dashboards, users, notes                              |     9 | stats, `Admin/specialists` picker (inactive disabled) + assignment refresh, super admin create staff / deactivate, teacher notes list + CRUD                                              |
| Chat                                                  |     1 | conversations, seen, send, polling, older messages                                                                                                                                        |
| Landing                                               |     1 | hero, CTAs, no fabricated stats                                                                                                                                                           |

**Live suites (2026-10-14):** `test:live:read` **12/13** — the only failure is the Parent 403 on
`GET initial-assessment/{childId}/result` (backend regression, `BACKEND_REQUESTS.md` §1); covers
`Auth/me` for every role + anonymous 401, `Admin/specialists` (= the specialist users, Specialist
403), Admin assessment membership, specialist results and teacher feedback lists.
`test:live:write` **6/7** — same single failure; covers every question type in the assessment,
staff result details, `Admin/specialists` assignment, no-teacher 400, empty / partial submit 400,
plan result 403 / 404, duplicate report 409; cleanup verified. A successful plan submission
(score, 409, result) runs only with `E2E_PLAN_SUBMIT=1`, because the backend then cannot delete
the child (`BACKEND_REQUESTS.md` §2); it was verified with Python on 2026-10-14.

**Browser regression (2026-10-14, development mock mode, localhost):** every role signed in with
the mock fixture accounts — login → `Auth/me` → area, direct-URL reload restore, invalid stored token
→ login with storage cleared, logout clears storage, role mismatch → `/unauthorized`; parent child
profile, assessment with all three types, completed plan activity, reports, chat; specialist plan
(score, progress, answers), profile tabs; teacher notes create / edit / delete and the specialist
seeing the note; admin assessment categories add / remove, specialist assignment; super admin
create staff / deactivate; RTL; 390 px width without horizontal scroll; no console errors. Browser
sign-in with the real accounts is left to the team (no real passwords typed by the assistant).

Helpers: `src/test/renderWithRouter.tsx`. `src/test/setup.ts` stubs
`HTMLDialogElement.showModal/close` (missing in jsdom).
