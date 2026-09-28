# Roles and Permissions

Discovery audit, 2026-09-28. Frontend checks are **UX only** — the backend enforces access.

## Status legend

| Status            | Meaning                                                                                                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **VERIFIED**      | Endpoint documented **and** confirmed against the live backend with a demo account                                                                                     |
| **PARTIAL**       | Endpoint documented in Apidog under this role's folder/path, **not yet tested live** (base URL + demo accounts pending) — or only part of the capability is documented |
| **TBD**           | Unclear which role owns it, or contract missing                                                                                                                        |
| **NOT SUPPORTED** | No documented endpoint                                                                                                                                                 |

> As of this audit **nothing is VERIFIED**: the backend base URL and demo accounts have not been
> provided yet. Replit behaviour is listed for reference only — its backend is a separate
> prototype and **does not** define real permissions.

## Role values — CONFLICT (TBD)

| Role       | Frontend key (foundation) | API evidence                                          | Replit value | Arabic label (Replit UI) |
| ---------- | ------------------------- | ----------------------------------------------------- | ------------ | ------------------------ |
| Parent     | `Parent`                  | `ولي أمر` (register example, user detail, chat users) | `Parent`     | ولي أمر                  |
| Teacher    | `Teacher`                 | **not documented**                                    | `Teacher`    | معلم                     |
| Specialist | `Specialist`              | **not documented**                                    | `Specialist` | أخصائي                   |
| Admin      | `Admin`                   | **not documented**                                    | `Admin`      | مدير                     |
| SuperAdmin | `SuperAdmin`              | **not documented**                                    | `SuperAdmin` | سوبر أدمن / مدير النظام  |

The API appears to use **Arabic role strings** on the wire. `src/types/roles.ts` currently assumes
English values. **Do not change it until the login/user response is inspected live**; then keep
backend values as-is and map them in one place (ADR required).

## Parent

| Capability               | Status        | Evidence                                                             |
| ------------------------ | ------------- | -------------------------------------------------------------------- |
| Registration             | PARTIAL       | `POST /api/Auth/register` (role `ولي أمر`)                           |
| Login                    | PARTIAL       | `POST /api/Auth/login`                                               |
| Child creation           | PARTIAL       | `POST /Parent`                                                       |
| Child editing            | PARTIAL       | `PATCH /Parent/{id}`                                                 |
| Child deletion           | PARTIAL       | `DELETE /Parent/{id}`                                                |
| Child list               | PARTIAL       | `GET /Parent/GetMyChildren`                                          |
| Child profile            | PARTIAL       | `GET /Parent/{id}`                                                   |
| Start initial assessment | PARTIAL       | `POST /initial-assessment/{childId}/start` (role inferred)           |
| Continue assessment      | TBD           | answer endpoint exists; resume not documented                        |
| Results                  | NOT SUPPORTED | no results endpoint                                                  |
| Reports                  | PARTIAL       | `GET /Reports/child/{childId}`; download role TBD                    |
| Progress                 | TBD           | `/TrainingPlan/children/{id}/activities[/summary]` — role not stated |
| Training plan            | TBD           | same as above                                                        |
| Chat                     | PARTIAL       | `/api/Chats/*` (all authenticated users; restrictions TBD)           |
| Dashboard                | NOT SUPPORTED | no parent dashboard endpoint                                         |

## Admin

| Capability                     | Status              | Evidence                                                                                               |
| ------------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------ |
| Dashboard                      | PARTIAL             | `GET /Admin/dashboard` (shape TBD)                                                                     |
| Children                       | PARTIAL             | via `GET /Admin/users/{id}` (children embedded); no children list for Admin                            |
| Assessment results             | NOT SUPPORTED       | no endpoint                                                                                            |
| Specialist assignment          | PARTIAL             | `POST /Admin/assign-children-to-specialist`; unassign NOT SUPPORTED                                    |
| Categories CRUD                | PARTIAL             | `/Admin/categories` GET/POST/PUT/DELETE                                                                |
| Activities CRUD (tests)        | PARTIAL             | `/Admin/activities/test` GET/POST/PUT/DELETE                                                           |
| Activities CRUD (games)        | TBD                 | no documented game endpoints                                                                           |
| Questions / options management | PARTIAL             | create/get/edit/delete question; edit/delete option; **add option to existing question NOT SUPPORTED** |
| Initial assessment composition | PARTIAL             | `/initial-assessment/categories`, `/initial-assessment/questions` (role inferred)                      |
| Reports                        | TBD                 | no Admin report endpoints                                                                              |
| Users                          | PARTIAL (read-only) | `GET /Admin/users`, `GET /Admin/users/{id}`; create/edit/delete NOT SUPPORTED                          |
| Chat                           | PARTIAL             | `/api/Chats/*`                                                                                         |

## Specialist

| Capability                   | Status        | Evidence                                                                                                       |
| ---------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------- |
| Dashboard                    | PARTIAL       | `GET /specialist/dashboard`                                                                                    |
| Assigned children            | PARTIAL       | `GET /specialist/children`                                                                                     |
| Child profile                | TBD           | no specialist child-detail endpoint                                                                            |
| Assessment results           | NOT SUPPORTED |                                                                                                                |
| Training plans (view)        | PARTIAL       | `GET /TrainingPlan/specialist/children/{id}`                                                                   |
| Adding / removing activities | PARTIAL       | `POST` / `DELETE /TrainingPlan/specialist/children/{id}/activities`                                            |
| Teacher assignment           | PARTIAL       | `POST /specialist/assign-teacher`; **no teacher list endpoint**                                                |
| Feedback review              | NOT SUPPORTED | no endpoint to list teacher notes                                                                              |
| Reports CRUD + PDF           | PARTIAL       | `/specialist/CreateReport`, `PUT/DELETE /specialist/{id}`, `GET /specialist/Reports`, `/Reports/{id}/download` |
| Progress                     | PARTIAL       | plan activity results / summary                                                                                |
| Chat                         | PARTIAL       | `/api/Chats/*`                                                                                                 |

## Teacher

| Capability        | Status        | Evidence                                                   |
| ----------------- | ------------- | ---------------------------------------------------------- |
| Dashboard         | PARTIAL       | `GET /Teacher/dashboard`                                   |
| Assigned children | PARTIAL       | `GET /Teacher/children`                                    |
| Training plan     | TBD           | `/TrainingPlan/children/{id}/activities` (role not stated) |
| Activities        | TBD           | same                                                       |
| Feedback creation | PARTIAL       | `POST /Teacher/children/{childId}/notes`                   |
| Feedback editing  | PARTIAL       | `PUT /Teacher/notes/{id}`                                  |
| Feedback deletion | PARTIAL       | `DELETE /Teacher/notes/{id}`                               |
| Feedback list     | NOT SUPPORTED | only get-by-id                                             |
| Progress          | TBD           |                                                            |
| Chat              | PARTIAL       | `/api/Chats/*`                                             |

## Super Admin

| Capability                                              | Status        | Evidence                                                        |
| ------------------------------------------------------- | ------------- | --------------------------------------------------------------- |
| Dashboard                                               | PARTIAL       | `GET /SuperAdmin/dashboard`                                     |
| Users (read)                                            | PARTIAL       | `GET /SuperAdmin/users?Search&Role`                             |
| Children (read)                                         | PARTIAL       | `GET /SuperAdmin/children?Name`                                 |
| User create / edit role / delete                        | NOT SUPPORTED | (Replit prototype has role change + delete)                     |
| Admin capabilities (categories, activities, assignment) | TBD           | whether SuperAdmin tokens are accepted on `/Admin/*` is unknown |

### Super Admin vs Admin

**Not determinable from documentation.** Documented differences: SuperAdmin has a separate
dashboard and a global children list; Admin owns content (categories/activities/questions), the
initial-assessment composition and specialist assignment. In Replit, SuperAdmin is confined to a
management panel (users/roles/delete) and Admin behaves like a staff user. **TBD — must be
confirmed by the backend team and live testing.**

## Planned authorization architecture (not implemented)

- One permission module mapping `Permission → roles` (typed), built from the verified matrix
  above; `can(role, permission)` used by guards and conditional rendering.
- `ProtectedRoute` (session), `RoleGuard` (per role namespace), optional `<Can>`.
- No inline `role === ...` checks in components.
- Unit tests for the permission map; route tests for each guard.
