# Backend requests

For the backend developer — **only what is still open**, re-verified live on 2026-10-14 against
`https://earlystep22.runasp.net/api/` after your update.

**Confirmed working since the last list (thank you):** `GET Auth/me` (now the app's only source
of the signed-in user, also after a reload); `GET Admin/specialists` (the assignment picker uses
it); Admin can read `initial-assessment/categories` again; the initial assessment accepts
`selectedOptionIds` / `orderedOptionIds` and scores MultiSelect (exact set) and Sequence (exact
order) correctly; `assessmentId` and per-question details in the assessment result; the plan
activity result endpoint (Specialist), `score` and plan `progress`; clear errors on plan submit
(empty → 400, partial → 400, second attempt → 409); first plan activity without a teacher → 400
with a message; a second report for a child → 409; the Specialist can read
`Teacher/children/{childId}/feedbacks`; `SuperAdmin/users` create / deactivate; one forgot-password
route. All of these are integrated in the frontend.

Production hardening (CORS, Swagger exposure, refresh tokens, notifications) is in `SECURITY.md`
and is not part of this list.

## Please fix

### 1. The parent cannot read their child's saved assessment result (regression)

- **Now:** `GET initial-assessment/{childId}/result` → **403 for the Parent** (own children, every
  child tried) and for Super Admin; Specialist and Admin get 200. On 2026-10-10 the Parent got 200.
- **Impact:** after a reload the parent no longer sees the result (child profile "التقييمات" tab
  and overview card show an error). The screen right after `complete` still shows it.
- **Fix:** allow the Parent for their own children (as before).

### 2. A child with a submitted plan activity cannot be deleted

- **Now:** after `POST …/activities/{planActivityId}/submit`, `DELETE TrainingPlan/specialist/
children/{childId}/activities/{activityId}` → empty **500**, and `DELETE Parent/{childId}` →
  empty **500** (a child with only a completed assessment deletes fine). Probably the new saved
  answers have no cascade delete.
- **Impact:** parents cannot delete such a child; specialists cannot remove a played activity. Our
  test child "E2E Test Child 6acf4742" is stuck (see Accounts / data).
- **Fix:** cascade (or clean up) the saved answers when the plan activity / child is deleted, or
  return a clear 400 if removing a played activity is not allowed.

### 3. Accounts created with `POST SuperAdmin/users` cannot log in

- **Now:** a teacher created with `{ fullName, email, password, role: "معلم/ة" }` → 201, but
  `POST Auth/login` with its password → empty **500** (a wrong password for that email also gives
  500; an unknown email gives 401). The account has `emailConfirmed: false`.
- **Fix:** let staff created by the Super Admin log in (confirm the email on creation, or skip the
  confirmation check for them), or tell us the intended activation step.

## Small fixes

| #   | Now                                                                                                                                                                                                      | Suggested                                                               |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 4   | `GET SuperAdmin/users` has no `isActive`; a deactivated user looks like an active one, and `PUT SuperAdmin/users/{id}` needs `isActive` (so the app cannot offer editing without risking a deactivation) | Add `isActive` to the list items                                        |
| 5   | `GET initial-assessment/{childId}/result` is readable by a specialist who is **not** assigned to the child                                                                                               | Limit it to the child's parent, assigned specialist / teacher and Admin |
| 6   | `complete` returns `totalQuestions: 0`, `correctAnswers: 0`, `questions: []` per category (the GET fills them)                                                                                           | Return the same object as the GET                                       |
| 7   | `specialist/children` → `progressPercentage` stays 0 although the plan's `progress` is 50 / 100                                                                                                          | Use the plan progress                                                   |
| 8   | Assessment result has no completion date                                                                                                                                                                 | Add `completedAt` (optional improvement)                                |
| 9   | `Admin/categoriesActivity` → `isInInitialAssessment` is false for categories that are in the assessment                                                                                                  | Fill it (the app uses `initial-assessment/categories` meanwhile)        |

## Questions

10. **SignalR:** still nothing deployed — `POST /chatHub/negotiate` is 404 and Swagger lists no hub.
    Please share the deployed hub path, how the JWT is passed and the event names; until then the
    frontend uses REST + polling (not a blocker).
11. **Teacher feedback items:** every `Teacher/children/{childId}/feedbacks` list we could read was
    empty, so we could not see an item. Please confirm the item fields (we expect
    `id, content, createdAt, updatedAt`).

## Accounts / data

- A **Teacher demo account** that can log in, with an assigned child (Teacher dashboard, children,
  notes and chat are still unverified live; blocked by request 3 if created through Super Admin).
- Please delete in the database (no API can):
  - the child **"E2E Test Child 6acf4742"** (demo parent; stuck because of request 2);
  - the deactivated user **"E2E Test Teacher 6acf46e5 Edited"** (created to test
    `SuperAdmin/users`; `DELETE` only deactivates);
  - two chat messages "E2E TEST MESSAGE — SAFE TO DELETE" (demo parent → demo specialist,
    2026-10-07).
