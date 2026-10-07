# Backend requests

For the backend developer. Verified live on 2026-10-07 against `https://earlystep22.runasp.net/api/`.
Each item: what the backend does now → what the frontend needs → a suggested contract. Ordered by
priority. Full endpoint status: `API_VERIFICATION_MATRIX.md`.

## Bugs

### 1. Adding the first activity to a child without a plan returns 500

- **Feature:** specialist builds a training plan (`ChildPlansPage`).
- **Now:** `POST TrainingPlan/specialist/children/{childId}/activities` → **500** when the child has
  no plan yet; nothing is created. With an existing plan it works. There is no "create plan" endpoint.
- **Needed:** the first activity creates the plan, or a separate create call.
- **Suggested:** create the plan implicitly on first add (→ 200), or
  `POST TrainingPlan/specialist/children/{childId}` → `201 { id, status: "Active", activities: [] }`.

### 2. "Delete all options" does nothing

- **Feature:** question editor (replace options).
- **Now:** `DELETE Admin/questions/{questionId}/options` → 200, but every option is still there.
- **Needed:** the options are actually removed (or a 4xx if not allowed).
- **Suggested:** delete the options and return 204.

### 3. `Reports/child/{childId}` returns one report, not a list

- **Feature:** child profile → reports tab (parent and specialist).
- **Now:** returns a **single report object** (the first) when reports exist, and
  `404 { message: "لا يوجد تقرير ." }` when there are none.
- **Needed:** all reports of the child.
- **Suggested:** `200 [ { id, childId, childName, specialistId, specialistName, title, weaknesses,
recommendations, createdAt } ]`, `200 []` when none. (The frontend already accepts both shapes.)

## Security (please fix before release)

### 4. Two endpoints still answer without authentication

- **Now:** `GET Admin/categoriesActivity?type=…` → **200 anonymously** (all other `Admin/*` now
  return 401 — thank you). `POST initial-assessment/{assessmentId}/answer` is processed
  anonymously (404 "assessment not found" for an unknown id instead of 401).
- **Suggested:** `[Authorize(Roles = "Admin")]` on the first; `[Authorize]` + ownership check
  (the child belongs to the caller) on the second.

### 5. Public registration and role

- **Now:** `POST Auth/register` takes a free-text `Role`.
- **Question:** is the role restricted server-side to Parent for public registration? Please confirm.
- **Suggested:** ignore the client role on public registration (always Parent).

### 6. Smaller issues

| Issue               | Now                                                       | Suggested                                                       |
| ------------------- | --------------------------------------------------------- | --------------------------------------------------------------- |
| Forgot-password     | unknown email → `400 "Email not found."` (reveals emails) | same 200 response for known and unknown emails                  |
| CORS                | `Access-Control-Allow-Origin: *`                          | allow only the deployed frontend origin(s)                      |
| Chat contacts       | `GET Chats/users` gives a parent **every** user           | only the specialist/teacher of the parent's children (and back) |
| `parentName` values | some `SuperAdmin/children` values are emails              | store display names                                             |

## Missing features

### 7. Initial-assessment results cannot be read again

- **Now:** `complete` returns `{ childId, childName, parentId, parentName, overallScore,
categories: [{ categoryName, percentage }] }` (not in Swagger); there is no GET.
- **Needed:** the parent, specialist and admin open the result later.
- **Suggested:** `GET initial-assessment/children/{childId}/result` → same object (404 if none);
  document the `complete` response in Swagger.

### 8. Answer payloads for MultiSelect / Sequence / Matching

- **Now:** answers take one `selectedOptionId`.
- **Suggested:** `{ questionId, selectedOptionIds: [guid] }` (MultiSelect),
  `{ questionId, orderedOptionIds: [guid] }` (Sequence),
  `{ questionId, pairs: [{ leftOptionId, rightOptionId }] }` (Matching).

### 9. Plan activities: no way to save the child's answers or result

- **Now:** the child-facing activity detail hides answers (good) but nothing accepts answers;
  `score`, `correctAnswers`, `wrongAnswers`, `isCompleted` can never change.
- **Suggested:** `POST TrainingPlan/children/{childId}/activities/{activityId}/answers`
  `{ answers: [{ questionId, selectedOptionIds?, orderedOptionIds?, pairs? }] }` →
  `{ score, correctAnswers, wrongAnswers, isCompleted, completedAt }`. For Matching the child view
  also needs the two sides (e.g. `side: "left"|"right"` on options, without `pairKey`).

### 10. Teacher notes list

- **Now:** `GET Teacher/feedbacks` (Apidog) → 404; Swagger has only single-note routes.
- **Suggested:** `GET Teacher/children/{childId}/notes` → `[{ id, childId, content, createdAt }]`,
  and a read endpoint for the specialist/parent.

### 11. Other gaps

| Need                                | Suggested                                                                                            |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Real-time chat                      | Confirm whether a SignalR hub exists (`/chatHub/negotiate` → 404); if yes, its URL and event names   |
| Notifications                       | `GET Notifications`, `GET Notifications/unread-count`, `POST Notifications/{id}/read`                |
| Delete chat message                 | `DELETE Chats/messages/{id}` (sender only)                                                           |
| User management (Admin/Super Admin) | create staff user, edit, deactivate/delete, change role                                              |
| Delete own account / test cleanup   | a way to delete a user, so registration can be tested with disposable accounts                       |
| Assessment composition              | `GET initial-assessment/questions` to list the questions already in the assessment                   |
| Category flags                      | `isInInitialAssessment` in `Admin/categoriesActivity` disagrees with `initial-assessment/categories` |

## Accounts / data

- A **Teacher demo account** (with at least one assigned child) — Teacher endpoints are
  unverified.
- Two chat messages "E2E TEST MESSAGE — SAFE TO DELETE" (demo parent → demo specialist) remain
  because there is no delete endpoint; please delete them from the database.
