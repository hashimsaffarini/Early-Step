# Routing

## Strategy

- React Router 7, data router + `RouterProvider`, in `src/app/router/`: `createBrowserRouter` in
  development, `createHashRouter` in production builds (GitHub Pages, `/Early-Step/#/…` — ADR-024,
  `DEPLOYMENT.md`). Paths below are the same in both; production shows them after `#`.
- `routes.tsx` is the single route tree. Features export page components (and optionally
  `RouteObject[]`); `app/router` composes them under layouts and guards.
- Paths are constants in `src/constants/routes.ts` (`ROUTE_PATHS`, `ROLE_NAMESPACES`; ADR-018). No
  hardcoded path strings in components.
- Route-level errors → `RouteErrorPage` (`errorElement`). Unknown paths → `NotFoundPage`.
- Route-level code splitting with `lazy` per role namespace.

## Why role namespaces

The API itself is partitioned by role (`/Parent`, `/Teacher`, `/specialist`, `/Admin`,
`/SuperAdmin`), each role has its own dashboard endpoint and its own children list, and the
sidebar differs per role. One namespace per role keeps guards simple (one `RoleGuard` per
subtree) and URLs unambiguous. Shared screens (chat, change password) are the **same page
component** mounted inside each namespace so the role's layout/nav stays consistent.

(Replit used flat URLs like `/dashboard`, `/children` with role branching inside pages — not
carried over: it produced hooks-order bugs and redirect loops.)

## Current routes (implemented — UI only, mock data)

### Public

| Path               | Element                                | Layout / loading                  |
| ------------------ | -------------------------------------- | --------------------------------- |
| `/`                | `features/landing` LandingPage         | own page (navbar + footer), eager |
| `/login`           | `features/auth` LoginPage              | `AuthLayout`, lazy                |
| `/register`        | `features/auth` RegisterPage (parents) | `AuthLayout`, lazy                |
| `/forgot-password` | `features/auth` ForgotPasswordPage     | `AuthSplitShell` (in page), lazy  |
| `/reset-password`  | `features/auth` ResetPasswordPage      | `AuthSplitShell` (in page), lazy  |
| `/unauthorized`    | UnauthorizedPage                       | —                                 |
| `/ui-preview/*`    | Dev-only gallery (+ role-area links)   | registered only in DEV, lazy      |
| `*`                | NotFoundPage                           | —                                 |

### Role areas — `/{role}` for `parent`, `teacher`, `specialist`, `admin`

Built by `buildAreaRoute(role)` in `src/app/router/areaRoutes.tsx` (ADR-019). Paths come from
`getAreaPaths(role)` (`src/constants/routes.ts`); pages read the current role with
`useRoleArea()`. All pages are lazy.

| Segment (under `/{role}`) | Screen                                                            | Feature        | Roles                  |
| ------------------------- | ----------------------------------------------------------------- | -------------- | ---------------------- |
| _(index)_                 | redirect → `dashboard`                                            | —              | all four               |
| `dashboard`               | Parent / Teacher / Specialist / Admin dashboard                   | dashboards     | all four               |
| `children`                | ChildrenListPage (parent: add child; staff: parent names, no add) | children       | all four               |
| `children/:childId`       | ChildProfilePage (staff: assign activity)                         | children       | all four               |
| `children/:childId/plans` | ChildPlansPage — education plans (Specialist/Admin: new plan)     | training-plans | all four               |
| `tests`                   | TestsCatalogPage — **development mock mode only** (ADR-023)       | activities     | all four               |
| `games`                   | GamesCatalogPage — **development mock mode only** (ADR-023)       | activities     | all four               |
| `reports`                 | ReportsListPage                                                   | reports        | all four               |
| `reports/new`             | CreateReportPage                                                  | reports        | Specialist, Admin only |
| `reports/:reportId`       | ReportDetailPage                                                  | reports        | all four               |
| `messages`                | MessagesPage                                                      | chat           | all four               |
| `tests/:testId/play`      | TestPlayerPage — full screen; **mock mode only**                  | activities     | all four               |
| `games/:gameId/play`      | GamePlayerPage — full screen; **mock mode only**                  | activities     | all four               |
| `assessment/:childId`     | AssessmentPage (initial assessment) — **full screen**, no sidebar | assessments    | all four               |

Shell pages render inside `RoleAreaLayout` (DashboardLayout + role navigation + notifications
menu + mock session user). Full-screen pages render inside `RoleAreaRoot` only, so they still
know their role (exit links go back into the same area).

### Super Admin — `/super-admin`

| Path           | Screen                                                                  | Layout           |
| -------------- | ----------------------------------------------------------------------- | ---------------- |
| `/super-admin` | SuperAdminPanelPage (tabs: نظرة عامة / المستخدمون / الأطفال / التقارير) | `RoleAreaLayout` |

### Navigation

Every sidebar item is a real route — no "قريباً" nav items remain. Parent: الرئيسية, أطفالي,
التقارير, الرسائل (unread badge). Teacher/Specialist/Admin: لوحة القيادة, الأطفال (+ Admin:
المستخدمون, إدارة المحتوى), التقارير, الرسائل. Super Admin: لوحة التحكم. The static practice
الاختبارات / الألعاب items are added only in development mock mode (ADR-023): children play the
backend activities of their training plan from the child profile.
Unfinished actions **inside** screens (edit child, change role, PDF download…) are disabled
"قريباً" buttons, never links to empty pages.

### TEMPORARY UI-development access

All role areas are **unguarded** — authentication does not exist yet. Each area renders with a
mock session user (`src/app/dev/mockSessions.ts`) and per-feature mock data following
`docs/MOCK_DATA.md`. `useRoleArea()` is for display and links only — it is **not** access
control. Reach the areas by URL or from the dev-only `/ui-preview` page. When auth arrives,
wrap each area route in `ProtectedRoute` + `RoleGuard(role)`.

### Not-found and visibility states

Unknown or not-visible ids never fall back to other data: an unknown child, report, test, game
or assessment child renders an in-page not-found state with a link back. A locally added
(unsaved) child opens its profile via router state from its card. Tabs (profile, super admin) are
local UI state, not sub-routes.

### Status

UI for every Replit screen is implemented (see `docs/UI_COMPLETENESS_AUDIT.md`). **No backend
integration, no real authentication, no guards, no persistence** — forms validate locally and
say that nothing is saved; mutations change local state only.

## API-era route plan (future)

The UI routes above are the structure for integration. The tables below record the planned API
mapping and the screens that **do not exist yet** (edit child, account/change password, admin
content management, user detail, assign teacher/specialist). Where they differ, the implemented
routes above win (e.g. child activities now live at `/{role}/tests|games/:id/play` and the
assessment at `/{role}/assessment/:childId`, instead of `/play/*`).

Legend — Guard: `public` (redirect signed-in users to their home), `auth` (session required),
`role:X` (session + role X). APIs refer to `API_ENDPOINTS.md` numbering/paths.

### Public / auth (AuthLayout)

| Path               | Page                                                      | Feature | Required APIs               | Guard  |
| ------------------ | --------------------------------------------------------- | ------- | --------------------------- | ------ |
| `/`                | Landing (implemented; redirect for signed-in users later) | landing | —                           | public |
| `/login`           | LoginPage                                                 | auth    | `POST /api/Auth/login`      | public |
| `/register`        | RegisterPage                                              | auth    | `POST /api/Auth/register`   | public |
| `/forgot-password` | ForgotPasswordPage                                        | auth    | `POST /Auth/ForgotPassword` | public |
| `/reset-password`  | ResetPasswordPage                                         | auth    | `POST /Auth/reset-password` | public |
| `/unauthorized`    | UnauthorizedPage                                          | app     | —                           | none   |

### Parent — `/parent/*` (DashboardLayout)

| Path                                 | Page                                                    | Feature        | Required APIs                                                              | Guard       |
| ------------------------------------ | ------------------------------------------------------- | -------------- | -------------------------------------------------------------------------- | ----------- |
| `/parent`                            | ParentHome (children overview; no parent dashboard API) | dashboards     | `GET /Parent/GetMyChildren`                                                | role:Parent |
| `/parent/children`                   | ChildrenListPage                                        | children       | `GET /Parent/GetMyChildren`                                                | role:Parent |
| `/parent/children/new`               | ChildFormPage (or modal)                                | children       | `POST /Parent`                                                             | role:Parent |
| `/parent/children/:childId`          | ChildProfilePage                                        | children       | `GET /Parent/{id}`, `GET /Reports/child/{id}`, training-plan summary (TBD) | role:Parent |
| `/parent/children/:childId/edit`     | ChildFormPage                                           | children       | `PATCH /Parent/{id}`                                                       | role:Parent |
| `/parent/children/:childId/reports`  | ChildReportsPage                                        | reports        | `GET /Reports/child/{id}`, download                                        | role:Parent |
| `/parent/children/:childId/plan`     | ChildPlanPage                                           | training-plans | `GET /TrainingPlan/children/{id}/activities[?type]` (role TBD)             | role:Parent |
| `/parent/messages[/:conversationId]` | ChatPage                                                | chat           | `/api/Chats/*`, hub                                                        | role:Parent |
| `/parent/account`                    | ChangePasswordPage                                      | auth           | `POST /Auth/change-password`                                               | role:Parent |

### Child activity (ChildActivityLayout, full-screen)

| Path                                             | Page             | Feature     | Required APIs                                                                             | Guard                      |
| ------------------------------------------------ | ---------------- | ----------- | ----------------------------------------------------------------------------------------- | -------------------------- |
| `/play/assessment/:childId`                      | AssessmentRunner | assessments | `start`, `answer`, `complete`                                                             | role:Parent (operator TBD) |
| `/play/children/:childId/activities/:activityId` | ActivityPlayer   | activities  | `GET /TrainingPlan/children/{id}/activities/{activityId}` + **submit endpoint (missing)** | TBD                        |

### Teacher — `/teacher/*`

| Path                                  | Page                            | Feature                  | Required APIs                          | Guard        |
| ------------------------------------- | ------------------------------- | ------------------------ | -------------------------------------- | ------------ |
| `/teacher`                            | TeacherDashboard                | dashboards               | `GET /Teacher/dashboard`               | role:Teacher |
| `/teacher/children`                   | AssignedChildrenPage            | children                 | `GET /Teacher/children`                | role:Teacher |
| `/teacher/children/:childId`          | TeacherChildPage (plan + notes) | training-plans, feedback | plan activities (TBD role), notes CRUD | role:Teacher |
| `/teacher/messages[/:conversationId]` | ChatPage                        | chat                     | chat APIs                              | role:Teacher |
| `/teacher/account`                    | ChangePasswordPage              | auth                     | change-password                        | role:Teacher |

### Specialist — `/specialist/*`

| Path                                     | Page                          | Feature        | Required APIs                                                  | Guard           |
| ---------------------------------------- | ----------------------------- | -------------- | -------------------------------------------------------------- | --------------- |
| `/specialist`                            | SpecialistDashboard           | dashboards     | `GET /specialist/dashboard`                                    | role:Specialist |
| `/specialist/children`                   | AssignedChildrenPage          | children       | `GET /specialist/children`                                     | role:Specialist |
| `/specialist/children/:childId`          | SpecialistChildPage           | children       | TBD (no detail endpoint)                                       | role:Specialist |
| `/specialist/children/:childId/plan`     | TrainingPlanEditor            | training-plans | plan, available-activities, add/remove                         | role:Specialist |
| `/specialist/assign-teacher`             | AssignTeacherPage (or dialog) | children       | `POST /specialist/assign-teacher` + **teacher list (missing)** | role:Specialist |
| `/specialist/reports`                    | ReportsListPage               | reports        | `GET /specialist/Reports`                                      | role:Specialist |
| `/specialist/reports/new`                | ReportFormPage                | reports        | `POST /specialist/CreateReport`                                | role:Specialist |
| `/specialist/reports/:reportId/edit`     | ReportFormPage                | reports        | `PUT /specialist/{id}`                                         | role:Specialist |
| `/specialist/messages[/:conversationId]` | ChatPage                      | chat           | chat APIs                                                      | role:Specialist |
| `/specialist/account`                    | ChangePasswordPage            | auth           | change-password                                                | role:Specialist |

### Admin — `/admin/*`

| Path                                                     | Page                                           | Feature         | Required APIs                                                        | Guard      |
| -------------------------------------------------------- | ---------------------------------------------- | --------------- | -------------------------------------------------------------------- | ---------- |
| `/admin`                                                 | AdminDashboard                                 | dashboards      | `GET /Admin/dashboard`                                               | role:Admin |
| `/admin/users`                                           | UsersListPage                                  | users           | `GET /Admin/users?Role&Search`                                       | role:Admin |
| `/admin/users/:userId`                                   | UserDetailPage (+ children, assign specialist) | users, children | `GET /Admin/users/{id}`, `POST /Admin/assign-children-to-specialist` | role:Admin |
| `/admin/categories`                                      | CategoriesPage (CRUD)                          | categories      | `/Admin/categories*`, `/Admin/categoriesActivity`                    | role:Admin |
| `/admin/activities`                                      | ActivitiesListPage                             | activities      | `GET /Admin/activities/test?categoryId`                              | role:Admin |
| `/admin/activities/new`, `/admin/activities/:activityId` | ActivityEditorPage (+ questions/options)       | activities      | activity + question + option endpoints                               | role:Admin |
| `/admin/initial-assessment`                              | AssessmentCompositionPage                      | assessments     | `/initial-assessment/categories*`, `/initial-assessment/questions*`  | role:Admin |
| `/admin/messages[/:conversationId]`                      | ChatPage                                       | chat            | chat APIs                                                            | role:Admin |
| `/admin/account`                                         | ChangePasswordPage                             | auth            | change-password                                                      | role:Admin |

### Super Admin — `/super-admin/*`

| Path                    | Page                 | Feature    | Required APIs                       | Guard           |
| ----------------------- | -------------------- | ---------- | ----------------------------------- | --------------- |
| `/super-admin`          | SuperAdminDashboard  | dashboards | `GET /SuperAdmin/dashboard`         | role:SuperAdmin |
| `/super-admin/users`    | UsersListPage        | users      | `GET /SuperAdmin/users?Search&Role` | role:SuperAdmin |
| `/super-admin/children` | ChildrenOverviewPage | children   | `GET /SuperAdmin/children?Name`     | role:SuperAdmin |
| `/super-admin/messages` | ChatPage             | chat       | chat APIs (SuperAdmin access TBD)   | role:SuperAdmin |
| `/super-admin/account`  | ChangePasswordPage   | auth       | change-password                     | role:SuperAdmin |

Whether SuperAdmin also gets the Admin content pages is **TBD** (see
`ROLES_AND_PERMISSIONS.md`).

## Guards (planned)

```text
RootLayout
├── PublicOnly (AuthLayout): /login, /register, /forgot-password, /reset-password
├── ProtectedRoute
│   ├── RoleGuard(Parent)      → /parent/*       (shell pages + full-screen play pages)
│   ├── RoleGuard(Teacher)     → /teacher/*
│   ├── RoleGuard(Specialist)  → /specialist/*
│   ├── RoleGuard(Admin)       → /admin/*
│   ├── RoleGuard(SuperAdmin)  → /super-admin/*
└── /unauthorized, *
```

- `/` redirects signed-in users to `ROLE_NAMESPACES[role]`.
- Wrong-role access → `/unauthorized` (not a silent redirect loop as in Replit).
- Route `handle` metadata: `{ title: string (Arabic), roles?: UserRole[] }` for document titles
  and breadcrumbs.
- Session restoration on refresh depends on the auth response (TBD).
