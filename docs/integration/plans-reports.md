# Integration status — Training plans & Reports

> **Superseded statuses (2026-10-06 live round):** current statuses are in
> `../BACKEND_INTEGRATION_STATUS.md` and verified shapes in `../api/LIVE_CONTRACTS.md`. This file
> keeps the per-feature design notes and assumptions.

Branch `feature/backend-integration`. Contracts from `docs/api/swagger.json` (+ Apidog examples).
Nothing here has been verified against the live backend (no working demo account yet), so every
connected item is **IMPLEMENTED, NOT LIVE-VERIFIED**. Tests use MSW (`src/mocks/handlers/
trainingPlans.ts`, `src/mocks/handlers/reports.ts`).

| Feature                                  | API                                                                          | UI                                               | Integration | Tests                                               | Status                                               |
| ---------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------ | ----------- | --------------------------------------------------- | ---------------------------------------------------- |
| Child plan — read-only (Parent, Teacher) | `GET TrainingPlan/children/{id}/activities` (+ `/summary` shared)            | `ChildPlansPage` read-only view                  | Yes         | list, status, progress, empty, error, 403→not-found | IMPLEMENTED, NOT LIVE-VERIFIED                       |
| Child plan — specialist view             | `GET TrainingPlan/specialist/children/{id}`                                  | `ChildPlansPage` specialist editor               | Yes         | "no plan" message state                             | IMPLEMENTED, NOT LIVE-VERIFIED                       |
| Available activities                     | `GET …/available-activities?type=test\|game`                                 | `AssignActivityDialog` (tabs, search)            | Yes         | tabs/type filter                                    | IMPLEMENTED, NOT LIVE-VERIFIED                       |
| Add activity to plan                     | `POST …/activities` `{ activityId }`                                         | picker "إضافة"                                   | Yes         | request body + cache refresh                        | IMPLEMENTED, NOT LIVE-VERIFIED                       |
| Remove activity from plan                | `DELETE …/activities/{activityId}` (catalogue activity id)                   | "إزالة" + ConfirmDialog                          | Yes         | cancel / confirm + DELETE path                      | IMPLEMENTED, NOT LIVE-VERIFIED                       |
| Plans for Admin                          | —                                                                            | explanatory empty state                          | —           | blocked message                                     | BLOCKED BY BACKEND                                   |
| Assign teacher to children               | `POST specialist/assign-teacher { teacherId, childIds }`                     | none (no picker built)                           | —           | —                                                   | BLOCKED BY BACKEND (no teacher list for specialists) |
| Activity results / specialist review     | —                                                                            | results shown only from plan fields              | —           | —                                                   | BLOCKED BY BACKEND (no submit/review endpoint)       |
| Reports list — Specialist                | `GET specialist/Reports`                                                     | `ReportsListPage`                                | Yes         | list, create link, empty, error                     | IMPLEMENTED, NOT LIVE-VERIFIED                       |
| Reports list — Parent / Teacher          | `GET Reports/child/{id}` per child (children via shared role list)           | `ReportsListPage` (merged, child filter, search) | Yes         | merge, one request per child, filters               | IMPLEMENTED, NOT LIVE-VERIFIED                       |
| Reports for Admin                        | —                                                                            | explanatory empty state                          | —           | blocked message                                     | BLOCKED BY BACKEND                                   |
| Report detail                            | none by id → resolved from the role's list                                   | `ReportDetailPage`                               | Yes         | fields, numbered recommendations, not-found         | IMPLEMENTED, NOT LIVE-VERIFIED                       |
| Create report                            | `POST specialist/CreateReport` (JSON)                                        | `CreateReportPage` (RHF + Zod)                   | Yes         | validation, JSON body, server error                 | IMPLEMENTED, NOT LIVE-VERIFIED                       |
| Edit report                              | `PUT specialist/{reportId}` (multipart `Title, Weaknesses, Recommendations`) | `EditReportPage`                                 | Yes         | prefill, multipart fields, not-found                | IMPLEMENTED, NOT LIVE-VERIFIED                       |
| Delete report                            | `DELETE specialist/{reportId}`                                               | detail "حذف" + ConfirmDialog                     | Yes         | cancel / confirm + redirect                         | IMPLEMENTED, NOT LIVE-VERIFIED                       |
| PDF download                             | `GET Reports/{reportId}/download` (blob)                                     | detail "تحميل PDF"                               | Yes         | blob → object URL → download; error                 | IMPLEMENTED, NOT LIVE-VERIFIED                       |

## Changes from the Replit UI (because of the real API)

- **Training plan model:** the API stores a list of assigned activities per child. Replit's
  free-text IEP plan (title, status, goals, strategies, review date, notes) and the local "خطة
  جديدة" form are removed — there is no API for them. Progress = completed / assigned activities.
- **Report fields:** only `title`, `weaknesses` ("جوانب تحتاج إلى دعم") and `recommendations`
  ("التوصيات", one per line → numbered rows). The "نقاط القوة" section, report types and the type
  filter are removed (no API field). Date and author are shown only when the response has them.
- **Report authors:** create/edit/delete exist only under `/specialist/*` → `REPORT_AUTHOR_ROLES`
  is now Specialist only (Replit also allowed Admin).
- The disabled "تحميل PDF (قريباً)" button is replaced by the real server PDF download.

## Assumptions to verify live

- Response item shape of `GET specialist/Reports` and `GET Reports/child/{id}` (read leniently:
  `id, childId, childName, title, weaknesses, recommendations, createdAt, specialistName`).
- `GET TrainingPlan/specialist/children/{id}`: array, or object with `activities`, or `{ message }`
  for "no plan" (Apidog shows only the message).
- `DELETE …/activities/{activityId}` takes the catalogue activity id (Apidog example), not the
  plan-activity id.
- Whether Parent/Teacher are allowed to call `GET Reports/child/{id}` and
  `GET TrainingPlan/children/{id}/activities` (folder placement suggests yes).
- Whether `Reports/{id}/download` returns `Content-Disposition`.

## Backend gaps (BLOCKED BY BACKEND)

1. No teacher list for specialists → `assign-teacher` cannot be used from the UI.
2. No endpoint to submit training-plan activity answers or for a specialist to review results.
3. No reports or training-plan endpoints for Admin.
4. No `GET report by id` (detail is resolved from the list).
