# Production data audit — zero dummy data in real runtime

Audit of 2026-10-15 (branch `feature/backend-integration`), completed the same day with the final
checks in §7–§15. Goal: in a production build, every
business value on screen comes from the backend (`https://earlystep22.runasp.net/api/`) or is
derived from backend data; failures show loading / error + retry / empty states, never fake
content. Decision record: ADR-023 in `DECISIONS.md`.

Classes: **A** test-only · **B** static UI copy · **C** static product content (frontend-owned) ·
**D** live business data (from the API) · **E** fallback / workaround.

## 1. Mock mode cannot reach production

| Mechanism                                    | Behaviour                                                                                                                                                                                                                        |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `isMockMode()` (`src/config/env.ts`)         | `import.meta.env.DEV && VITE_USE_MOCKS === 'true'`. `DEV` is `false` in every `vite build`, so a production build ignores `VITE_USE_MOCKS` (verified: built with `=true`, no MSW code in `dist/`).                               |
| MSW worker start (`src/main.tsx`)            | Dynamic import of `@/mocks/browser` only when `isMockMode()`; dropped from production bundles.                                                                                                                                   |
| `public/mockServiceWorker.js`                | Deleted from the build output by the `drop-mock-service-worker` Vite plugin (now follows the configured `outDir`). Nothing registers a service worker in production.                                                             |
| `showPracticeCatalogs` (`src/config/env.ts`) | Same condition as mock mode. The static practice tests / games (see §3) are routed and listed in the sidebar **only** in development mock mode; production bundles contain none of their content (verified by grepping `dist/`). |
| `/ui-preview` dev routes                     | `import.meta.env.DEV` only (unchanged).                                                                                                                                                                                          |
| `MockModeBanner`                             | Renders only in mock mode.                                                                                                                                                                                                       |

`npm run dev` with `.env` (`VITE_USE_MOCKS=false`) uses the live backend with the same screens as
production. `VITE_USE_MOCKS=true npm run dev` is the only way to see mock data.

There is no API-failure → mock fallback anywhere: the HTTP client has no mock adapter, and query
functions throw normalized `AppError`s to their screens.

## 2. Inventory and actions

| Area / item                                                                         | Class | Finding                                                                                                                                          | Action                                                                                                                                   |
| ----------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `src/mocks/**`, `*.test.*`, `src/test/**`, `contentTestUtils`, `reportsTestUtils`   | A     | Fixtures and MSW handlers; imported only by tests and mock mode                                                                                  | Kept                                                                                                                                     |
| `src/app/dev/**` (`/ui-preview`, banner)                                            | A     | DEV-gated                                                                                                                                        | Kept                                                                                                                                     |
| Tests / Games sidebar catalogs (`features/activities/data/*`, `games/*/content.ts`) | E     | 6 static tests + 11 static games, "TEMPORARY UI DEMO CONTENT", results never saved — a second, fake activity list next to the backend Activities | **Removed from production**: routes and nav only in mock mode (`showPracticeCatalogs`); pages moved to `features/activities/practice.ts` |
| Plan player result (`PlanActivityPlayerPage`)                                       | E     | Always showed 3 / 3 stars (no score exists for the child)                                                                                        | Stars removed; the confirmation states only what was saved                                                                               |
| Option images (plan player, initial assessment)                                     | D     | `optionImageUrl` parsed but never shown                                                                                                          | Rendered in `AnswerTile` (`imageUrl`)                                                                                                    |
| Plan activity icons (child profile)                                                 | D     | Server `iconUrl` ignored, emoji shown                                                                                                            | `ServerImage` with the server icon; emoji only when there is none                                                                        |
| Plan activity answer counts                                                         | E     | A missing count was shown as 0                                                                                                                   | Only counts the server sent are shown                                                                                                    |
| Parent dashboard counts                                                             | E     | A failed per-child query left "…" forever                                                                                                        | "—" plus an error line with retry                                                                                                        |
| Parent dashboard "التقارير"                                                         | D     | Counted children that have a report, labelled as reports                                                                                         | Relabelled "أطفال لديهم تقرير"                                                                                                           |
| Parent child card plan progress                                                     | E     | Hidden on error (looked like "no plan")                                                                                                          | Error text shown                                                                                                                         |
| Parent child delete                                                                 | E     | Enabled when the plan failed to load (results rule bypassed)                                                                                     | Disabled until the plan is loaded; message on error                                                                                      |
| `fetchAssessmentResult`                                                             | E     | Any 404 meant "not completed"                                                                                                                    | Only the live text "No completed assessment found…" means not completed                                                                  |
| Super Admin children: "الأخصائي: لم يُعيَّن بعد"                                    | E     | `SuperAdmin/children` has no specialist field → every child shown as unassigned                                                                  | Line shown only when the server sends a specialist                                                                                       |
| Super Admin users-by-role                                                           | E     | Counted on the client from the user list; hidden on error                                                                                        | Server `usersByRole` from `SuperAdmin/dashboard`, with error + retry                                                                     |
| Super Admin user active state                                                       | D     | `isActive` now returned by `SuperAdmin/users`                                                                                                    | "موقوف" badge, "إيقاف" only for active accounts, "تفعيل" via `PUT SuperAdmin/users/{id}`                                                 |
| `Admin/specialists` `isActive ?? true`                                              | E     | Missing value assumed active                                                                                                                     | Field required (live always sends it); a missing value is a load error                                                                   |
| `Admin/users/{id}` `children ?? []`                                                 | E     | Missing list shown as "no children"                                                                                                              | Field required                                                                                                                           |
| Admin activities `questionCount ?? 0`, categories `count ?? 0`                      | E     | Missing value shown as 0                                                                                                                         | Null → badge hidden                                                                                                                      |
| `isInInitialAssessment`                                                             | E     | Live still always false (re-tested 2026-10-15)                                                                                                   | No longer mapped; membership only from `initial-assessment/categories`                                                                   |
| Question edit type default `?? 'SingleChoice'`                                      | E     | Unknown server type silently saved as SingleChoice                                                                                               | Admin must pick a type                                                                                                                   |
| Admin activities category filter, assessment test picker, assign forms              | E     | Load failures left silently empty lists / no retry                                                                                               | `ApiErrorAlert` with retry                                                                                                               |
| Landing copy                                                                        | C     | "تحليل ذكي ودقيق", "تقارير دقيقة", fixed age range "4 إلى 10" — unverifiable                                                                     | Replaced with descriptive text                                                                                                           |
| Parent tips (`dashboards/parent/content/tips.ts`)                                   | C     | Static advice, no data                                                                                                                           | Kept                                                                                                                                     |
| Greeting / date, notification bell "قريباً", Super Admin reports tab                | B     | No business data                                                                                                                                 | Kept                                                                                                                                     |
| Game engines (`features/activities/games/*`), `components/players/*`                | C     | Presentation engines; no backend type maps to them yet                                                                                           | Kept as engines (mock-mode practice only)                                                                                                |
| `RecentActivityCard` (parent)                                                       | —     | Dead code                                                                                                                                        | Deleted                                                                                                                                  |
| Chat optimistic bubble timestamp                                                    | D     | `new Date()` only until the server message replaces it                                                                                           | Kept (normal optimistic update)                                                                                                          |
| Session storage                                                                     | D     | Only `{ accessToken, expiresAt }`; user from `Auth/me`                                                                                           | Kept                                                                                                                                     |

No hardcoded users, children, reports, messages, notifications, GUIDs, `Math.random` values or
invented fields (completion date, attempt id, risk, AI insight, strengths) were found in runtime
code.

## 3. Games and tests: engine vs. content

- **Content from the backend (production):** training-plan activities (`TrainingPlan/children/
{id}/activities`, played by `PlanActivityPlayerPage`, submitted with `…/submit`), the initial
  assessment (`initial-assessment/*`), admin content management (`Admin/categories`,
  `Admin/activities/*`, questions, options). Title, icon, questions, option text and images come
  from the API.
- **Engines (static code, allowed):** `components/players/*` (answer tiles, progress, shell) and
  the four game engines of `components/games` (صيد الحروف, طابق الرقم, تحدي الذاكرة, تحدي التركيز —
  `docs/GAME_ENGINE.md`). The engines carry **no content**: they play the real questions of a
  backend game activity whose `slug` names a template, and submit through the real Training Plan
  endpoint. The live plan endpoints do not return `slug` yet, so live games open in the generic
  player (requested from the backend). The 11 old practice game components still carry their own
  demo content and run only in mock-mode practice.

## 4. Dashboard statistics matrix

| Dashboard   | Card / stat                                    | Source                                                                           | Kind              | Action                                               |
| ----------- | ---------------------------------------------- | -------------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------- |
| Parent      | عدد الأطفال                                    | `GET Parent/GetMyChildren` length                                                | Derived from live | Kept                                                 |
| Parent      | أنشطة الخطط التدريبية                          | Σ `totalCount` of `TrainingPlan/children/{id}/activities/summary`                | Derived from live | Error state + retry added                            |
| Parent      | أطفال لديهم تقرير                              | children with a `Reports/child/{id}` report                                      | Derived from live | Relabelled; error state + retry                      |
| Parent      | أنشطة الخطة المنجزة (per child bar)            | completed / total of the child's plan activities                                 | Derived from live | Error text added                                     |
| Teacher     | all numeric fields                             | `GET Teacher/dashboard` (only numeric fields sent)                               | Live              | Kept — **not live-verified** (Teacher login blocked) |
| Teacher     | child cards                                    | `GET Teacher/children`                                                           | Live              | Kept — not live-verified                             |
| Specialist  | الأطفال المتابَعون, التقارير                   | `GET specialist/dashboard`                                                       | Live              | Kept                                                 |
| Specialist  | child cards                                    | `GET specialist/children` (`progressPercentage` not displayed — it stays 0 live) | Live              | Kept; inconsistent field not shown                   |
| Admin       | المستخدمين, التقارير, الأنشطة, الفئات, الأطفال | `GET Admin/dashboard`                                                            | Live              | Kept                                                 |
| Admin       | user totals (users page)                       | `GET Admin/users` totals                                                         | Live              | Kept                                                 |
| Super Admin | totalUsers, totalReports, totalActivities      | `GET SuperAdmin/dashboard`                                                       | Live              | Kept                                                 |
| Super Admin | المستخدمون حسب الدور                           | `SuperAdmin/dashboard` `usersByRole`                                             | Live              | Switched from client counting                        |
| Super Admin | users tab count                                | `GET SuperAdmin/users` length                                                    | Derived from live | Kept                                                 |
| All         | unread messages badge                          | `GET Chats/unread-count` (30 s polling)                                          | Live              | Kept (badge hidden on error)                         |

No decorative or hardcoded statistic remains.

## 5. Charts, progress and percentages

| Element                                    | Source                                                                                  |
| ------------------------------------------ | --------------------------------------------------------------------------------------- |
| Assessment overall score, category %       | `GET initial-assessment/{childId}/result` (staff only)                                  |
| Per-question correct / child answers       | same endpoint                                                                           |
| Plan progress %                            | plan `progress` from the server; otherwise completed / total of the server's activities |
| Plan activity score, correct / wrong, date | `TrainingPlan/…/result` and plan activities (server values, null hidden)                |
| Profile summary tiles                      | `…/activities/summary`                                                                  |

There are no charts in the app.

## 6. API source of truth (production)

Every production feature reads and writes the live API. "Runtime mock?" is **No** for all of them:
MSW runs only in tests and in development mock mode (§1). Allowed statuses: LIVE VERIFIED,
LIVE INTEGRATED / BLOCKED BY BACKEND, TEST-ONLY MOCK.

| Feature                                               | Role                         | API endpoint                                                                                   | Live verified                                                                         | Runtime mock?  | Status                               |
| ----------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------- | ------------------------------------ |
| Login, session restore, logout                        | all                          | `POST Auth/login`, `GET Auth/me`                                                               | Yes (Parent, Specialist, Admin, SuperAdmin)                                           | No             | LIVE VERIFIED                        |
| Register (Parent only)                                | public                       | `POST Auth/register` (no `Role`)                                                               | Not executed live (no user delete in the API — it would leave an undeletable account) | No             | LIVE INTEGRATED / BLOCKED BY BACKEND |
| Forgot password                                       | public                       | `POST Auth/ForgotPassword`                                                                     | Yes (neutral 200)                                                                     | No             | LIVE VERIFIED                        |
| Reset password                                        | public                       | `POST Auth/reset-password`                                                                     | Not executed (needs a disposable mailbox for the code)                                | No             | LIVE INTEGRATED / BLOCKED BY BACKEND |
| Parent dashboard counts                               | Parent                       | `Parent/GetMyChildren`, `…/activities/summary`, `Reports/child/{id}`                           | Yes                                                                                   | No             | LIVE VERIFIED                        |
| Children list / profile / create / edit / delete      | Parent                       | `Parent/GetMyChildren`, `Parent/{id}` (GET/POST/PATCH/DELETE)                                  | Yes (writes on E2E data)                                                              | No             | LIVE VERIFIED                        |
| Initial assessment (start → answer → complete)        | Parent                       | `initial-assessment/{childId}/start`, `/{assessmentId}/answer`, `/complete`                    | Yes                                                                                   | No             | LIVE VERIFIED                        |
| Training plan (list, play, submit)                    | Parent                       | `TrainingPlan/children/{id}/activities[?type]`, `…/{activityId}`, `…/{planActivityId}/submit`  | Yes (submit opt-in)                                                                   | No             | LIVE VERIFIED                        |
| Reports (read, PDF)                                   | Parent, Specialist           | `Reports/child/{id}`, `specialist/Reports`, `Reports/{id}/download`                            | Yes                                                                                   | No             | LIVE VERIFIED                        |
| Report create / edit / delete                         | Specialist                   | `specialist/CreateReport`, `specialist/{id}` (PUT/DELETE)                                      | Yes (E2E data)                                                                        | No             | LIVE VERIFIED                        |
| Chat (contacts, conversations, send, polling, unread) | all                          | `Chats/*`                                                                                      | Yes                                                                                   | No             | LIVE VERIFIED                        |
| Specialist dashboard, children                        | Specialist                   | `specialist/dashboard`, `specialist/children`                                                  | Yes                                                                                   | No             | LIVE VERIFIED                        |
| Assessment result (per question)                      | Specialist (assigned), Admin | `initial-assessment/{childId}/result`                                                          | Yes                                                                                   | No             | LIVE VERIFIED                        |
| Plan management + activity result                     | Specialist                   | `TrainingPlan/specialist/children/{id}`, `…/available-activities`, `…/{planActivityId}/result` | Yes                                                                                   | No             | LIVE VERIFIED                        |
| Assign teacher                                        | Specialist                   | `specialist/teachers`, `specialist/assign-teacher`                                             | Yes                                                                                   | No             | LIVE VERIFIED                        |
| Teacher feedback (read)                               | Specialist                   | `Teacher/children/{id}/feedbacks`                                                              | Yes (1 item, 2026-10-15)                                                              | No             | LIVE VERIFIED                        |
| Admin dashboard, users, user detail                   | Admin                        | `Admin/dashboard`, `Admin/users`, `Admin/users/{id}`                                           | Yes                                                                                   | No             | LIVE VERIFIED                        |
| Categories, activities, questions, options            | Admin                        | `Admin/categories*`, `Admin/activities/*`, `Admin/questions/*`, `Admin/options/*`              | Yes (E2E data)                                                                        | No             | LIVE VERIFIED                        |
| Initial-assessment configuration                      | Admin                        | `initial-assessment/categories`, add/remove category and question                              | Yes                                                                                   | No             | LIVE VERIFIED                        |
| Specialist assignment                                 | Admin                        | `Admin/specialists`, `Admin/assign-children-to-specialist`                                     | Yes                                                                                   | No             | LIVE VERIFIED                        |
| Super Admin dashboard, users, children                | SuperAdmin                   | `SuperAdmin/dashboard`, `SuperAdmin/users`, `SuperAdmin/children`                              | Yes                                                                                   | No             | LIVE VERIFIED                        |
| Deactivate / re-activate account                      | SuperAdmin                   | `DELETE` / `PUT SuperAdmin/users/{id}`                                                         | Yes (test teacher)                                                                    | No             | LIVE VERIFIED                        |
| Create staff                                          | SuperAdmin                   | `POST SuperAdmin/users`                                                                        | 201 yes; the account cannot log in                                                    | No             | LIVE INTEGRATED / BLOCKED BY BACKEND |
| Teacher dashboard, children, profile, plan            | Teacher                      | `Teacher/dashboard`, `Teacher/children`, plan endpoints                                        | No (login bug)                                                                        | No             | LIVE INTEGRATED / BLOCKED BY BACKEND |
| Teacher notes (list, create, edit, delete)            | Teacher                      | `Teacher/children/{id}/feedbacks`, `Teacher/children/{id}/notes`, `Teacher/notes/{id}`         | No (login bug)                                                                        | No             | LIVE INTEGRATED / BLOCKED BY BACKEND |
| Practice tests / games                                | — (not in production)        | none (static engines)                                                                          | —                                                                                     | Mock mode only | TEST-ONLY MOCK                       |

No production feature is a runtime mock.

## 7. Empty, loading, error and retry states

Every production query renders loading, an error with the server's message, a retry action and
an Arabic empty state where a list can be empty; no failure shows demo or default data. Fixed in
the final pass: report creation waits for the existing reports (error + retry, so a child that
already has a report is never offered), a failed question/option delete closes its dialog so the
error is visible, retry added to the chat contacts picker, older-message loading ("تعذّر تحميل
الرسائل الأقدم"), the plan player (non-404 errors), the plan activity result and the parent's
child plan progress; Arabic empty / loading text for the assessment test picker and the
specialist picker; the Super Admin users-by-role section says when the server sent no counts;
the plan page's children error has its own title. Remaining by design: the unread badge hides on
error (it polls again every 30 s) and chat polling errors are retried on the next tick.

## 8. Images and URLs

Every backend image (activity `iconUrl`, question `questionImageUrl`, option `optionImageUrl`) goes
through `resolveMediaUrl` / `ServerImage`, which resolve `/uploads/...` against the API host and
reject non-http(s) URLs. A neutral icon is shown only when the field is null or the image fails to
load (`ServerImage` `fallback`). Images that were dropped are now shown: option pictures in the
plan player, the assessment, the assessment result and the plan activity result; activity icons in
the child profile, the specialist plan list and the add-activity picker. People have initials-only
avatars (no image field exists). The only bundled images are the logo and the landing hero.

## 9. Hardcoded IDs

A GUID scan of runtime code finds none. The two test helpers that held fixture GUIDs
(`contentTestUtils`, `reportsTestUtils`) moved from `src/features/*/pages` to `src/test/`. The
string ids in `features/activities/data/*` are engine keys of the mock-mode-only practice games,
not business records.

## 10. Stale backend compatibility removed

| Removed                                                                                               | Live contract now                                     |
| ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Assessment start: `data` wrapper, `id`, flat `questions[]`, `text` aliases                            | `{ assessmentId, categories: [{ name, questions }] }` |
| "HTTP 200 with `{ message }` = failure" (Apidog) for start / answer / complete                        | real 4xx with `{ message }`                           |
| Plan activity: question id fallbacks (`id`, `planQuestionId`, `''`); any parse error as a fake 404    | `questionId` required; missing activity is a real 404 |
| `SuperAdmin/users` `{ users }` wrapper, `childrenCount`, optional `isActive`                          | plain array, `isActive` always                        |
| Child `birthDate` age computation, `Male`/`Female`, `specialistId`, `teacherId`, `progressPercentage` | integer `age`, `ولد` / `بنت`                          |
| `Admin/users/{id}` `phoneNumber` (Apidog)                                                             | not sent                                              |
| Teacher feedback `noteId`, `updatedAt`, optional `id`                                                 | `{ id, …, teacherName, content, createdAt }`          |
| Assessment result "0 / 0 means not counted" (from `complete`)                                         | the GET result always counts                          |
| Login `token` alias; unobserved role aliases; activity-type aliases                                   | `accessToken`; 5 role values; `اختبارات` / `ألعاب`    |
| Session user without id (chat "not from the contact" fallback)                                        | `Auth/me` always sends `id`                           |
| Teacher calling the staff-only assessment result                                                      | neutral note for the Teacher                          |

Also deleted: `ComingSoonButton`, two unused type barrels, `AREA_ROLES`, `toIsoDateString`,
`ageInYears`, `countAnswerable`, `listSections`; `testSound` moved to `src/test/`. Stale
"NOT LIVE-VERIFIED / Apidog" comments were corrected. There are no TODOs, debug logs or
commented-out code in runtime files. `docs/api/swagger.json` now holds the live 84-operation spec.

## 11. Production dependency audit

No runtime file imports `src/mocks`, `src/test` or fixtures (the only `@/mocks` import is the
dynamic `@/mocks/browser` behind `isMockMode()`). Names searched: `mockData`, `fixtures`,
`fakeApi`, `sampleUsers`, `demoChildren`, `testData` — no runtime hits. The production bundle
contains no MSW code, no `mockServiceWorker.js`, no practice content, no `E2E` test data and no
demo credential (each `.env.e2e.local` value grepped against `dist/`).

## 12. Production environment

- `.env` (gitignored): `VITE_API_BASE_URL=https://earlystep22.runasp.net/api/`,
  `VITE_USE_MOCKS=false` — nothing else. `.env.example` has the same two keys, no secrets.
- Tracked env files: `.env.example` only. `.env.e2e.local` (live test accounts) is gitignored and
  its `E2E_*` keys have no `VITE_` prefix, so they can never be bundled.
- No localhost backend URL in runtime code; the only `localhost` strings in `dist/` are axios /
  React Router internal fallbacks.
- No API keys or secrets exist in the frontend.

## 13. Production build and preview (2026-10-15)

`npm run build` then `npm run preview`:

- Direct refresh of `/`, `/login`, `/register`, `/parent/dashboard`, `/specialist/children`,
  `/admin/content/categories`, `/super-admin` and unknown paths → 200 `index.html` (SPA fallback);
  protected routes then show the login page.
- Assets (`/assets/*.js`, `*.css`, favicons) → 200. `/mockServiceWorker.js` is not shipped (the
  preview answers with the SPA page).
- In the browser: no mock banner; the login form posts to
  `https://earlystep22.runasp.net/api/Auth/login` (made-up credentials → 401 and the Arabic error).

## 14. Live verification by role (2026-10-15)

Browser sign-in with the real accounts is done by the user (project rule: no real passwords typed
into browser forms by the assistant). Each role's screens were verified live through the app's own
API functions (live suites) and a read-only walkthrough of every endpoint those screens call:

| Role       | Verified live                                                                                                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Parent     | `Auth/me`; children list + detail; plan activities (`?type=`) + summary; report (404 = none); chat contacts, conversations, unread; result 403 (not called by the app); create/edit child, full assessment (write suite) |
| Specialist | `Auth/me`, dashboard, children (3), assessment result 200 (assigned), plan (specialist view), completed activity result 200, teacher feedbacks (1 item), reports, teachers, conversations                                |
| Admin      | `Auth/me`, dashboard, users + detail, categories, activities (test/game), categoriesActivity, assessment categories, specialists; content CRUD + assignment (write suite)                                                |
| SuperAdmin | `Auth/me`, dashboard (`usersByRole`), users (`isActive` on all 40), children; deactivate / re-activate of the test teacher                                                                                               |
| Teacher    | **Blocked** — SuperAdmin-created accounts cannot log in (empty 500). Not faked.                                                                                                                                          |

## 15. Client revisions 2026-10 — data sources of the new UI

| New element                                          | Source                                                                                    | Kind                                       |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------ |
| Child card counts (tests, games, reports)            | `GET Parent/{childId}` `testsCount`, `gamesCount`, `reportsCount`                         | LIVE API (hidden until sent)               |
| «ملخص الأنشطة» total / completed / remaining         | plan rows (`isCompleted`)                                                                 | DERIVED FROM LIVE API                      |
| «نسبة الإنجاز»                                       | plan `progress` (Specialist) or completed × 100 / total                                   | LIVE API / DERIVED                         |
| Correct / wrong totals, mean score                   | completed rows' `correctAnswers`, `wrongAnswers`, `score` — only when the rows carry them | DERIVED FROM LIVE API (hidden otherwise)   |
| Activity result line (score, correct, wrong, dates)  | plan row fields                                                                           | LIVE API (null → not shown)                |
| Specialist list + active state                       | `GET Admin/specialists`                                                                   | LIVE API                                   |
| Assigned children / current specialist of each child | `GET Admin/users/{id}` `children[].specialistName`                                        | LIVE API                                   |
| Assessment category membership                       | `GET initial-assessment/categories`                                                       | LIVE API                                   |
| Category → questions                                 | `GET Admin/activities/{type}?categoryId=` + activity details                              | LIVE API                                   |
| Question membership state                            | this session's add / remove actions only (no list endpoint)                               | LIVE API actions, labelled as session-only |
| Images                                               | server paths through `resolveMediaUrl`; neutral icon only for null / failed               | LIVE API                                   |
| Teacher notes in the plan                            | `GET Teacher/children/{id}/feedbacks`                                                     | LIVE API                                   |
| Games                                                | plan rows of type `ألعاب` (none exist live)                                               | LIVE API — empty state, no demo games      |

No new value is static, placeholder or invented; a value the server does not send is hidden.

## 16. Verification still blocked

The Teacher area (dashboard, children, profile, plan, feedback, chat) is wired to the real
endpoints but cannot be verified live: accounts created with `POST SuperAdmin/users` still answer
`Auth/login` with an empty 500 (re-tested 2026-10-15). No mock data is used to fill it.
