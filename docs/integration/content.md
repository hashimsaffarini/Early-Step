# Integration status — Admin content management

> **Superseded statuses (2026-10-06 live round):** current statuses are in
> `../BACKEND_INTEGRATION_STATUS.md` and verified shapes in `../api/LIVE_CONTRACTS.md`. This file
> keeps the per-feature design notes and assumptions.

Screens (new design; Replit had no content UI): `/admin/content/categories`,
`/admin/content/activities?type=test|game[&categoryId=]`,
`/admin/content/activities/:activityType/:activityId`, `/admin/content/initial-assessment`.
Code: `src/features/content` (API `api/contentApi.ts`, hooks `api/contentQueries.ts`, form schemas
`schemas/contentForms.ts`). Mocks: `src/mocks/handlers/content.ts`, `src/mocks/fixtures/content.ts`.

No admin account could sign in, so **nothing here is live-verified**. Request shapes follow
Swagger; response shapes are read leniently from the Apidog examples.

| Feature                                    | API                                                                                                                                                                         | UI                                                                                    | Integration                                | Tests                                             | Status                           |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------- | -------------------------------- |
| List categories (+ counts)                 | `GET Admin/categories`                                                                                                                                                      | Categories page                                                                       | `useCategories`                            | list, empty, error + retry                        | IMPLEMENTED, NOT LIVE-VERIFIED   |
| Create / rename category                   | `POST Admin/categories`, `PUT Admin/categories/{id}` (`{ name }`)                                                                                                           | dialog with validation                                                                | mutations → invalidate `content`           | validation, create, server error, rename          | IMPLEMENTED, NOT LIVE-VERIFIED   |
| Delete category                            | `DELETE Admin/categories/{id}`                                                                                                                                              | confirm dialog                                                                        | mutation                                   | cancel keeps, confirm removes                     | IMPLEMENTED, NOT LIVE-VERIFIED   |
| Category counts / assessment flag          | `GET Admin/categoriesActivity?type=`                                                                                                                                        | initial-assessment page                                                               | `useCategoriesWithCounts` (deleted hidden) | toggle test                                       | IMPLEMENTED, NOT LIVE-VERIFIED   |
| List activities by type + category         | `GET Admin/activities/{test\|game}?categoryId=`                                                                                                                             | Activities page (type toggle, filter in URL)                                          | `useActivities`                            | type switch, filter, empty                        | IMPLEMENTED, NOT LIVE-VERIFIED   |
| Create / edit activity                     | `POST`/`PUT Admin/activities/{type}[/{id}]` multipart `Title, Description, Slug, CategoryId, Icon`                                                                          | dialog + icon preview                                                                 | `useSaveActivity`                          | multipart fields incl. file, slug validation      | IMPLEMENTED, NOT LIVE-VERIFIED   |
| Delete activity                            | `DELETE Admin/activities/{type}/{id}`                                                                                                                                       | confirm dialog                                                                        | mutation                                   | confirm removes                                   | IMPLEMENTED, NOT LIVE-VERIFIED   |
| Activity detail with questions             | `GET Admin/activities/{type}/{id}`                                                                                                                                          | detail page                                                                           | `useActivity`                              | render, not-found                                 | IMPLEMENTED, NOT LIVE-VERIFIED   |
| Create question with options               | `POST Admin/activities/{activityId}/questions` multipart `QuestionText, QuestionImage, Type, Options[i].{OptionText, OptionImage, Order, IsCorrect, CorrectOrder, PairKey}` | dialog, fields per type                                                               | `buildQuestionForm`                        | per-type form keys (unit), UI create + validation | IMPLEMENTED, NOT LIVE-VERIFIED   |
| Edit question info                         | `PUT Admin/questions/{id}/info` multipart `QuestionText, QuestionImage, Type`                                                                                               | dialog                                                                                | mutation                                   | edit text                                         | IMPLEMENTED, NOT LIVE-VERIFIED   |
| Delete question                            | `DELETE Admin/questions/{id}`                                                                                                                                               | confirm                                                                               | mutation                                   | — (same confirm path as options)                  | IMPLEMENTED, NOT LIVE-VERIFIED   |
| Edit option                                | `PUT Admin/question-options/{id}` multipart                                                                                                                                 | dialog (fields per type)                                                              | mutation                                   | edit text                                         | IMPLEMENTED, NOT LIVE-VERIFIED   |
| Delete option / all options                | `DELETE Admin/question-options/{id}`, `DELETE Admin/questions/{id}/options`                                                                                                 | confirm dialogs                                                                       | mutations                                  | both, confirmed                                   | IMPLEMENTED, NOT LIVE-VERIFIED   |
| Add an option to an existing question      | —                                                                                                                                                                           | not offered                                                                           | —                                          | —                                                 | BLOCKED BY BACKEND (no endpoint) |
| Initial assessment: add/remove category    | `POST`/`DELETE initial-assessment/categories/{id}`                                                                                                                          | toggle buttons + membership badge                                                     | mutation                                   | add → badge/button update                         | IMPLEMENTED, NOT LIVE-VERIFIED   |
| Initial assessment: add/remove question    | `POST initial-assessment/questions` `{ questionIds }`, `DELETE initial-assessment/questions/{id}`                                                                           | per-question buttons (pick a test first)                                              | mutation                                   | add + session status                              | IMPLEMENTED, NOT LIVE-VERIFIED   |
| Initial assessment: list current questions | —                                                                                                                                                                           | info alert; only session actions shown                                                | —                                          | —                                                 | BLOCKED BY BACKEND (no endpoint) |
| `GET initial-assessment/categories`        | returns `{ categories: string[] }` (names) per Apidog                                                                                                                       | not used — membership comes from `categoriesActivity.isInInitialAssessment` (has ids) | —                                          | mocked                                            | NOT USED                         |

## Assumptions to verify live

- Response shapes of every GET (lenient Zod; unknown fields ignored, missing ones defaulted).
- Activity `type` in responses is Arabic (`اختبارات`), path segment is `test`/`game`; game
  activities exist on the backend (Swagger `{type}`) but none were observed.
- The initial assessment is composed from **test** categories/questions (`categoriesActivity?type=test`).
- `Sequence` = `CorrectOrder` 1..n; `Matching` = options sharing a `PairKey` (semantics inferred from
  field names; the UI requires each key to appear at least twice).
- Editing an activity without a new icon omits `Icon` (assumed to keep the existing icon).
- Changing a question's type does not migrate its options (warned in the dialog).

## Security notes

- **Critical (backend):** the live Admin controller answered `GET Admin/*` requests **without
  authentication** (2026-10-06, reported). The admin write endpoints were not tested. Frontend route
  guards (`RequireRole('Admin')`) are UX only and do not fix this — the backend must add
  `[Authorize(Roles = Admin)]`.
- Uploads: client-side limit **2 MB**, PNG/JPEG/WEBP/GIF only (SVG excluded — scriptable). This is a
  frontend safeguard; backend limits/validation are unknown and must be enforced server-side.
- All server text (names, questions, options) is rendered as plain text; server image paths go
  through `resolveMediaUrl` (only `http(s)` URLs against the API origin).
- Mock handlers enforce the intended authorization (Admin only; 401/403 otherwise).
