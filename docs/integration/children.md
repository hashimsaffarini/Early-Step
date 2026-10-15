# Integration — Children & Parent (fork I-A)

> **Superseded statuses (2026-10-06 live round):** current statuses are in
> `../BACKEND_INTEGRATION_STATUS.md` and verified shapes in `../api/LIVE_CONTRACTS.md`. This file
> keeps the per-feature design notes and assumptions.

Nothing here is VERIFIED WORKING: no demo account can sign in yet, so every row is tested only
against MSW mocks that follow the Swagger contracts. Response shapes are undocumented in Swagger
and are read leniently (`childListItemSchema`).

| Feature                                                      | API                                                                     | UI                                                          | Integration                                  | Tests                                                    | Status                               |
| ------------------------------------------------------------ | ----------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------- | ------------------------------------ |
| Parent children list                                         | `GET Parent/GetMyChildren`                                              | `/parent/children`                                          | `useChildrenForRole('Parent')`               | list, loading, error + retry, empty, search              | IMPLEMENTED, NOT LIVE-VERIFIED       |
| Add child                                                    | `POST Parent` (multipart `FullName`, `Age` int32, `Gender` `ولد`/`بنت`) | Add dialog (age in years)                                   | `useCreateChild`, invalidates `children.all` | validation, multipart fields, list refresh, server error | IMPLEMENTED, NOT LIVE-VERIFIED       |
| Edit child                                                   | `PATCH Parent/{id}` (multipart)                                         | Profile → "تعديل البيانات"                                  | `useUpdateChild`                             | prefilled dialog, PATCH body, header refresh             | IMPLEMENTED, NOT LIVE-VERIFIED       |
| Delete child                                                 | `DELETE Parent/{id}`                                                    | Profile → "حذف الملف" + ConfirmDialog                       | `useDeleteChild` (removes child caches)      | cancel keeps, confirm deletes + returns to list          | IMPLEMENTED, NOT LIVE-VERIFIED       |
| Parent child profile                                         | `GET Parent/{childId}`                                                  | `/parent/children/:id`                                      | `useParentChild`; 403/404 → not found        | API fields only, 404, 403, 500 error state               | IMPLEMENTED, NOT LIVE-VERIFIED       |
| Teacher / Specialist children                                | `GET Teacher/children`, `GET specialist/children`                       | `/{role}/children` with parent names                        | `useChildrenForRole`                         | teacher list, no add button                              | IMPLEMENTED, NOT LIVE-VERIFIED       |
| Staff child profile                                          | — (no staff child-detail endpoint)                                      | profile resolved from the role list                         | `useChildProfile`                            | teacher found / not assigned → not found                 | PARTIALLY WORKING (list fields only) |
| Admin children list / profile                                | — (no endpoint)                                                         | honest blocked states + link to users                       | —                                            | blocked state                                            | BLOCKED BY BACKEND                   |
| Profile → plan activities / progress                         | `GET TrainingPlan/children/{id}/activities`, `.../summary`              | overview tiles + progress, activities tab with "ابدأ" links | shared hooks                                 | progress, play links, specialist manage link, empty      | IMPLEMENTED, NOT LIVE-VERIFIED       |
| Profile → reports                                            | `GET Reports/child/{id}`                                                | overview + reports tab → report detail                      | `useChildReports`                            | links, empty                                             | IMPLEMENTED, NOT LIVE-VERIFIED       |
| Profile → assessment status / history                        | — (no read endpoint)                                                    | honest note + "بدء التقييم" (parent)                        | —                                            | note, parent-only start link                             | BLOCKED BY BACKEND                   |
| Profile → recent events feed                                 | —                                                                       | removed                                                     | —                                            | —                                                        | BLOCKED BY BACKEND                   |
| Parent dashboard                                             | children list + per-child plan summary + reports                        | counts, child cards with plan progress, tips                | `useQueries` on shared keys                  | counts, cards, empty, error                              | IMPLEMENTED, NOT LIVE-VERIFIED       |
| Parent dashboard activity feed / completed assessments count | —                                                                       | removed                                                     | —                                            | asserted absent                                          | BLOCKED BY BACKEND                   |

## UI changes driven by the API

- **Age instead of birth date.** Swagger stores `Age` as an integer; the add/edit form asks for the
  age in years (1–18) and cards show "العمر". Replit used a birth date (and an optional developmental
  age, still omitted). If a response returns `birthDate` instead, the age is computed from it.
- **No journey status badge** on child cards (the API has no such field).
- Gender is shown with the backend's Arabic values (`ولد` / `بنت`; `Male`/`Female` normalized).
- Plan cards show progress only (no plan title / start date / specialist — not on this endpoint).
- The local "تعيين نشاط جديد" dialog was removed from the profile; the specialist manages the plan on
  `/specialist/children/:id/plans` (training-plans feature).
- Teacher profile links to `/teacher/children/:id/notes` (feedback feature).

## Assumptions to verify live

- List/detail item shape `{ id, fullName, age | birthDate, gender, parentName, specialistName }`.
- `GET Parent/{childId}` answers 403 or 404 for another parent's child (both treated as not found).
- POST/PATCH accept `Gender` as the Arabic enum string; responses are not relied on (lists refetch).
