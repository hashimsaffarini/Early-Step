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
- When API mocking is needed, add **MSW** (record an ADR) and build handlers from the
  **documented** API contracts only — never invented shapes.
- Create a shared `renderWithProviders` helper in `src/test/` when the first test needs
  providers beyond `<App />`.

## Don't

- Don't write tests for empty scaffolding or trivial markup.
- Don't snapshot whole pages.
- Don't commit real credentials or real children's data as fixtures.

## Current tests

- `src/app/App.test.tsx` — smoke test: app boots with providers + router.
- `Button.test.tsx` — click, loading disables + `aria-busy`, default `type="button"`.
- `FormField.test.tsx` — label/hint/error associations, `aria-invalid`; PasswordInput toggle.
- `Tabs.test.tsx` — selection + panel, RTL arrow-key order, wrap-around.
- `ConfirmDialog.test.tsx` — confirm once, cancel/close, disabled while confirming.
- `DashboardLayout.test.tsx` — nav + active link, capped/labelled badge, mobile drawer opens and
  closes after navigation.

Helpers: `src/test/renderWithRouter.tsx`. `src/test/setup.ts` stubs
`HTMLDialogElement.showModal/close` (missing in jsdom).
