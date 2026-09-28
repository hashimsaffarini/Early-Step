# Routing

## Strategy

- React Router 7, data router (`createBrowserRouter` + `RouterProvider`), in `src/app/router/`.
- `routes.tsx` is the single route tree. Features export page components (and optionally
  `RouteObject[]`); `app/router` composes them under layouts and guards.
- Paths are constants in `app/router/paths.ts` (`ROUTE_PATHS`, `ROLE_NAMESPACES`). No
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

## Current routes (implemented)

| Path            | Element                            |
| --------------- | ---------------------------------- |
| `/`             | Foundation placeholder (temporary) |
| `/unauthorized` | UnauthorizedPage                   |
| `*`             | NotFoundPage                       |

## Planned route hierarchy (not implemented)

Legend — Guard: `public` (redirect signed-in users to their home), `auth` (session required),
`role:X` (session + role X). APIs refer to `API_ENDPOINTS.md` numbering/paths.

### Public / auth (AuthLayout)

| Path               | Page                                                          | Feature | Required APIs               | Guard                           |
| ------------------ | ------------------------------------------------------------- | ------- | --------------------------- | ------------------------------- |
| `/`                | Landing (design from Replit, no fabricated stats) or redirect | app     | —                           | public (TBD: landing in scope?) |
| `/login`           | LoginPage                                                     | auth    | `POST /api/Auth/login`      | public                          |
| `/register`        | RegisterPage                                                  | auth    | `POST /api/Auth/register`   | public                          |
| `/forgot-password` | ForgotPasswordPage                                            | auth    | `POST /Auth/ForgotPassword` | public                          |
| `/reset-password`  | ResetPasswordPage                                             | auth    | `POST /Auth/reset-password` | public                          |
| `/unauthorized`    | UnauthorizedPage                                              | app     | —                           | none                            |

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
│   ├── RoleGuard(Parent)      → /parent/*       (DashboardLayout, parent nav)
│   ├── RoleGuard(Teacher)     → /teacher/*
│   ├── RoleGuard(Specialist)  → /specialist/*
│   ├── RoleGuard(Admin)       → /admin/*
│   ├── RoleGuard(SuperAdmin)  → /super-admin/*
│   └── RoleGuard(TBD)         → /play/*         (ChildActivityLayout)
└── /unauthorized, *
```

- `/` redirects signed-in users to `ROLE_NAMESPACES[role]`.
- Wrong-role access → `/unauthorized` (not a silent redirect loop as in Replit).
- Route `handle` metadata: `{ title: string (Arabic), roles?: UserRole[] }` for document titles
  and breadcrumbs.
- Session restoration on refresh depends on the auth response (TBD).
