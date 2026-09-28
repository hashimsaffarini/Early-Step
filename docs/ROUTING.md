# Routing

## Strategy

- React Router 7, data router (`createBrowserRouter` + `RouterProvider`), in `src/app/router/`.
- `routes.tsx` is the single route tree. Features export their own `RouteObject[]`
  (`features/<x>/routes.tsx`); `app/router` composes them under layouts and guards.
- Paths are constants in `app/router/paths.ts` (`ROUTE_PATHS`, `ROLE_NAMESPACES`). No
  hardcoded path strings in components.
- Route-level errors → `RouteErrorPage` (`errorElement`). Unknown paths → `NotFoundPage`.
- Route-level code splitting with `lazy` once role areas exist.

## Current routes

| Path            | Element                            |
| --------------- | ---------------------------------- |
| `/`             | Foundation placeholder (temporary) |
| `/unauthorized` | UnauthorizedPage                   |
| `*`             | NotFoundPage                       |

## Planned namespaces (pages TBD)

| Path                  | Audience   | Layout              |
| --------------------- | ---------- | ------------------- |
| `/login`              | public     | AuthLayout          |
| `/register`           | public     | AuthLayout          |
| `/parent/*`           | Parent     | DashboardLayout     |
| `/teacher/*`          | Teacher    | DashboardLayout     |
| `/specialist/*`       | Specialist | DashboardLayout     |
| `/admin/*`            | Admin      | DashboardLayout     |
| `/super-admin/*`      | SuperAdmin | DashboardLayout     |
| child activity routes | TBD        | ChildActivityLayout |

Whether shared resources (e.g. a child's profile) live under each role namespace or under a
common path is TBD after the API/Replit review.

## Planned guards (not implemented — no fake auth)

```text
RootLayout
├── public routes (AuthLayout): /login, /register
└── ProtectedRoute (requires session)
    ├── RoleGuard(Parent)      → /parent/*
    ├── RoleGuard(Teacher)     → /teacher/*
    ├── RoleGuard(Specialist)  → /specialist/*
    ├── RoleGuard(Admin)       → /admin/*
    └── RoleGuard(SuperAdmin)  → /super-admin/*
```

- Guards read the session from the auth feature and permissions from the central permission
  model (`ROLES_AND_PERMISSIONS.md`).
- `/` will redirect to the signed-in user's `ROLE_NAMESPACES[role]` or to `/login`.
- Typed route metadata (e.g. `handle: { title, allowedRoles }`) may be added when guards and
  page titles are implemented.
