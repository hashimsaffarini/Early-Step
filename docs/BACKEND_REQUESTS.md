# Backend requests

For the backend developer — **only what is still needed**, re-verified live on 2026-10-10 against
`https://earlystep22.runasp.net/api/` after your update.

**Confirmed working since the last list (thank you):** `GET initial-assessment/{childId}/result`
(same object as `complete`, readable by Parent, Specialist, Admin, Super Admin);
`POST TrainingPlan/children/{childId}/activities/{planActivityId}/submit` (all three types,
`selectedOptionIds` / `orderedOptionIds`, correct scoring, counts saved on the plan); the two
option-less assessment questions are gone (every child can complete the assessment again);
`GET Chats/users` works again and returns only related users; `Auth/register` no longer takes a
`Role`. These are integrated in the frontend.

Production hardening (CORS, Swagger exposure, refresh tokens, notifications) is in `SECURITY.md`
and is not part of this list.

## Please fix

### 1. Admin cannot read the initial-assessment composition (regression)

- **Now:** `GET initial-assessment/categories` → **403 for Admin** (and Super Admin, Parent); only
  the Specialist gets 200. On 2026-10-08 the Admin got 200. The fallback flag
  `isInInitialAssessment` in `Admin/categoriesActivity` is `false` for every category.
- **Impact:** the admin assessment page cannot show which categories are in the assessment (the
  frontend now shows "status unknown"; add/remove still work).
- **Fix:** allow Admin on `GET initial-assessment/categories` (and/or return the real
  `isInInitialAssessment` flag).

### 2. Initial assessment: MultiSelect and Sequence answers

- **Now:** `POST initial-assessment/{assessmentId}/answer` still takes one `selectedOptionId`
  (Swagger `SubmitInitialAssessmentAnswerRequest`); `selectedOptionIds` / `orderedOptionIds` are
  ignored (→ 404 "option not found"). A MultiSelect is correct when the one option is correct;
  **a Sequence is always scored incorrect** (choosing the `CorrectOrder` 1 option → `isCorrect: false`).
- **Fix:** accept the same fields as the plan `submit` (`selectedOptionIds`, `orderedOptionIds`) and
  score them the same way. The frontend player already builds these answers for plan activities
  and will switch the assessment as soon as the endpoint accepts them.

### 3. Plan activity result: who can read it?

- **Now:** `GET TrainingPlan/children/{childId}/activities/{planActivityId}/result` → **403 for
  Parent, Specialist, Admin and Super Admin**, before and after a submit (401 anonymous). We could
  not test a Teacher (no account).
- **Needed:** the parent (child's result screen) and the specialist (progress) read it. Until then
  the frontend shows the counts from the specialist plan (`correctAnswers`, `wrongAnswers`,
  `isCompleted`, `completedAt`).

### 4. Plan activity submit: clear errors

| Case                                  | Now         | Suggested                                       |
| ------------------------------------- | ----------- | ----------------------------------------------- |
| Second submit of a completed activity | empty `500` | `400 { message: "تم إرسال هذا النشاط مسبقاً" }` |
| `answers: []`                         | empty `500` | `400 { message }`                               |

Also: after a completed activity the plan's `score` stays `null` and `specialist/children`
`progressPercentage` stays `0` — please confirm whether they should change.

## Small fixes

| #   | Now                                                                                                                                           | Suggested                                                            |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 5   | First plan activity for a child **without a teacher** → empty `500`, nothing created                                                          | `400 { message: "أسند معلماً للطفل أولاً" }`                         |
| 6   | `specialist/CreateReport` accepts a **second** report for the same child; `Reports/child` returned the newest on 10-08 and the first on 10-10 | `409 { message }` (one report per child), or update the existing one |
| 7   | Assessment result has no `completedAt` / `assessmentId`                                                                                       | Add both (the profile would show the completion date)                |

## Questions

8. **Teacher feedback readers:** `GET Teacher/feedbacks` is Teacher-only (403 for everyone else).
   Should the specialist read a child's feedback? If yes, which endpoint?
9. **SignalR:** nothing new is exposed — `POST /chatHub/negotiate` (and `/api/chatHub/…`) is 404
   on the deployed server and Swagger lists no hub. Please share the deployed hub path, how the
   JWT is passed, and the event names; until then the frontend uses REST + polling.
10. **Forgot password:** `Auth/ForgotPassword` and `Auth/forgot-password` both exist — which one is
    canonical?

## Accounts / data

- A **Teacher demo account** with an assigned child (Teacher endpoints, the feedback list and
  probably the plan result are unverified without it).
- Two chat messages "E2E TEST MESSAGE — SAFE TO DELETE" (demo parent → demo specialist,
  2026-10-07) remain — there is no delete endpoint; please delete them in the database.
