# Integration status — dashboards, users (Admin / Super Admin), teacher notes

Branch `feature/backend-integration`. Contracts from the Swagger snapshot (`docs/api/swagger.json`)
and Apidog examples. **No live requests were made** — every integration below is tested with MSW
mocks only. Statuses: VERIFIED WORKING · IMPLEMENTED, NOT LIVE-VERIFIED · PARTIALLY WORKING ·
BLOCKED BY BACKEND · NOT STARTED.

| Feature                                   | API                                                                                       | UI                                                                       | Integration                        | Tests                                         | Status                                                     |
| ----------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------- | --------------------------------------------- | ---------------------------------------------------------- |
| Teacher dashboard stats                   | `GET Teacher/dashboard` (shape undocumented)                                              | stat cards (server fields only)                                          | lenient mapping `toDashboardStats` | dashboards.test, dashboardStats.test          | IMPLEMENTED, NOT LIVE-VERIFIED                             |
| Teacher dashboard children                | `GET Teacher/children` (shared `useChildrenForRole`)                                      | "طلاب الفصل" cards → profile                                             | yes                                | dashboards.test                               | IMPLEMENTED, NOT LIVE-VERIFIED                             |
| Specialist dashboard stats + children     | `GET specialist/dashboard`, `GET specialist/children`                                     | stats, cards, "تقرير جديد" links                                         | yes                                | dashboards.test                               | IMPLEMENTED, NOT LIVE-VERIFIED                             |
| Admin dashboard stats                     | `GET Admin/dashboard` (Arabic keys observed live)                                         | stat cards + shortcuts                                                   | yes                                | dashboards.test, dashboardStats.test          | IMPLEMENTED, NOT LIVE-VERIFIED (keys observed; values not) |
| Admin children list on dashboard          | —                                                                                         | replaced by "users" shortcut                                             | —                                  | —                                             | BLOCKED BY BACKEND (no admin children-list endpoint)       |
| Admin/parent activity feed                | —                                                                                         | removed                                                                  | —                                  | —                                             | BLOCKED BY BACKEND (no endpoint)                           |
| Admin users list                          | `GET Admin/users?Role=&Search=`                                                           | search (debounced, server-side), role chips (Arabic wire values), totals | yes                                | AdminUsersPage.test                           | IMPLEMENTED, NOT LIVE-VERIFIED                             |
| Admin user detail                         | `GET Admin/users/{userId}`                                                                | profile, parent's children, not-found                                    | yes                                | AdminUserDetailPage.test                      | IMPLEMENTED, NOT LIVE-VERIFIED                             |
| Assign children to specialist             | `POST Admin/assign-children-to-specialist` + specialists from `Admin/users?Role=أخصائي/ة` | form, validation, confirm, success/error                                 | yes, invalidates users + children  | AdminUserDetailPage.test                      | IMPLEMENTED, NOT LIVE-VERIFIED                             |
| User create / edit / delete / role change | —                                                                                         | not offered (info notice)                                                | —                                  | AdminUsersPage.test, SuperAdminPanelPage.test | BLOCKED BY BACKEND                                         |
| Super Admin stats                         | `GET SuperAdmin/dashboard` (shape undocumented)                                           | overview stats                                                           | lenient mapping                    | SuperAdminPanelPage.test                      | IMPLEMENTED, NOT LIVE-VERIFIED                             |
| Super Admin users                         | `GET SuperAdmin/users?Search=&Role=` (shape undocumented; array or `{ users }` accepted)  | users tab + users-by-role tiles (counted from real list)                 | yes                                | SuperAdminPanelPage.test                      | IMPLEMENTED, NOT LIVE-VERIFIED                             |
| Super Admin children                      | `GET SuperAdmin/children?Name=`                                                           | children tab, name search                                                | yes                                | SuperAdminPanelPage.test                      | IMPLEMENTED, NOT LIVE-VERIFIED                             |
| Super Admin reports tab                   | —                                                                                         | "غير متاحة" state                                                        | —                                  | SuperAdminPanelPage.test                      | BLOCKED BY BACKEND (no endpoint)                           |
| Teacher notes — create                    | `POST Teacher/children/{childId}/notes { content }`                                       | form (RHF + Zod)                                                         | yes                                | ChildNotesPage.test                           | IMPLEMENTED, NOT LIVE-VERIFIED                             |
| Teacher notes — read / edit / delete      | `GET / PUT / DELETE Teacher/notes/{noteId}`                                               | note cards, edit, confirmed delete                                       | yes                                | ChildNotesPage.test                           | IMPLEMENTED, NOT LIVE-VERIFIED                             |
| Teacher notes — history list              | —                                                                                         | only this session's notes (ids in sessionStorage) + notice               | —                                  | ChildNotesPage.test                           | BLOCKED BY BACKEND (no list endpoint)                      |
| Specialist reads teacher notes            | —                                                                                         | —                                                                        | —                                  | —                                             | BLOCKED BY BACKEND (no endpoint)                           |

## Assumptions to verify live

- Dashboard responses (Teacher, Specialist, SuperAdmin) — any numeric field is shown; known English
  keys get Arabic labels, unknown keys keep the server's own name. Admin keys observed live.
- `Admin/users` role filter accepts the Arabic wire values (`ولي أمر`, `معلم/ة`, `أخصائي/ة`).
  Admin / SuperAdmin role wire values are unknown, so they are not offered as filters.
- `SuperAdmin/users` response shape (array or the Admin-style object).
- Note create response contains the new note id (`{ id }`, `{ noteId }` or a bare GUID). If not, the
  note is saved but cannot be shown again or edited (the UI says so).
- Note GET response has `content` (and optionally `createdAt` / `updatedAt`).
- Child list items may carry `age` (int) or `birthDate`; both are handled.

## Removed mock dependencies

`src/features/dashboards/mock/roster.mock.ts`, `admin/mock/adminActivity.mock.ts` and `roster.ts`
are deleted; the staff dashboards, admin pages and super admin panel read only from the API (MSW in
tests / dev mock mode). Local "delete user" and "change role" actions were removed.
