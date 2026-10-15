# Production data audit — zero dummy data in real runtime

Audit of 2026-10-15 (branch `feature/backend-integration`). Goal: in a production build, every
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
  the 11 game components. The game components still carry their own demo content and no backend
  activity type maps to them, so they run only in mock-mode practice. Plan activities of type
  game are played with the generic multiple-choice player from their server questions.

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

## 6. Verification still blocked

The Teacher area (dashboard, children, profile, plan, feedback, chat) is wired to the real
endpoints but cannot be verified live: accounts created with `POST SuperAdmin/users` still answer
`Auth/login` with an empty 500 (re-tested 2026-10-15). No mock data is used to fill it.
