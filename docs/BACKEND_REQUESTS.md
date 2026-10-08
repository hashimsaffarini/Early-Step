# Backend requests

For the backend developer — **only what is still needed**, re-verified live on 2026-10-08 against
`https://earlystep22.runasp.net/api/` after your update. Thank you for the fixes: anonymous access
on `Admin/categoriesActivity` and `initial-assessment/{id}/answer` (now 401), "delete all options",
forgot-password (same answer for every email), the `Teacher/feedbacks` endpoint, and the first plan
activity (works once a teacher is assigned) are all confirmed working.

Production hardening (CORS, Swagger exposure, refresh tokens, notifications) is listed separately
in `SECURITY.md` and is **not** part of this list.

## Blocking (please fix)

### 1. No child can finish the initial assessment right now

- **Now:** the live assessment contains two questions with **no options**:
  `95fb31c4-b1cf-49bc-8466-04fcd09c4eea` (SingleChoice) and `10b71e85-203c-4d29-8e84-08b55da47119`
  (MultiSelect). They cannot be answered, and `complete` requires every question →
  `400 "لا يمكن إنهاء التقييم. تأكد من الإجابة على جميع الأسئلة."` for every child.
- **Fix:** add options to those questions or remove them from the assessment. Suggested guard:
  reject adding a question without options to the assessment (or let `complete` ignore them).

### 2. `GET Chats/users` returns 500 for Parent and Specialist

- **Now:** empty `500` for Parent and Specialist (Admin and Super Admin get 200). Yesterday it
  returned 200 for everyone. Conversations, messages, send and seen still work.
- **Impact:** parents and specialists cannot start a new conversation.
- **Expected:** `200 [{ id, name, role }]` — ideally only the people related to the user's
  children (yesterday a parent received every user).

## Needed for the workflow

### 3. Assessment result after the session

- **Now (documented flow):** `POST initial-assessment/{assessmentId}/complete` returns
  `{ childId, childName, parentId, parentName, overallScore, categories: [{ categoryName, percentage }] }`.
  The frontend shows it right after completion. Afterwards it cannot be read again: there is no GET,
  and `start` for a completed child returns 404, so the frontend never learns the `assessmentId`.
- **Needed:** the specialist (who writes the report) and the parent see the result later.
- **Suggested:** `GET initial-assessment/children/{childId}/result` → the same object plus
  `assessmentId` and `completedAt` (404 when not completed).

### 4. MultiSelect and Sequence scoring

- **Now:** every type takes one `{ questionId, selectedOptionId }`; a second answer → 400
  "تمت الإجابة على هذا السؤال مسبقًا"; array fields are ignored. MultiSelect = correct when the one
  chosen option is a correct one. **Sequence can never be correct** — its options have
  `IsCorrect = false`, so choosing the right first step returned `isCorrect: false`.
- **Please confirm one of:** (a) this single-option behaviour is intended (then Sequence needs a
  rule, e.g. "correct = the option with `CorrectOrder` 1"), or (b) accept
  `selectedOptionIds: [guid]` (MultiSelect) / `orderedOptionIds: [guid]` (Sequence). The frontend
  sends one option today and can switch to (b) as soon as it exists.

### 5. Saving a child's plan-activity answers

- **Now:** plan activities expose `score`, `correctAnswers`, `wrongAnswers`, `isCompleted`, but no
  endpoint sets them, so progress never changes when a child plays.
- **Suggested:** `POST TrainingPlan/children/{childId}/activities/{activityId}/answers`
  `{ answers: [{ questionId, selectedOptionId }] }` → `{ score, correctAnswers, wrongAnswers, isCompleted, completedAt }`.
  If this exists under another route, please share it.

### 6. Real-time chat (SignalR) on the deployed server

- **Now:** Apidog documents `wss://localhost:7256/chatHub`; on `earlystep22.runasp.net`,
  `POST /chatHub/negotiate?negotiateVersion=1` (and `/api/chatHub/...`) returns 404 with or
  without a token. Swagger lists no hub.
- **Needed:** the deployed hub path (`app.MapHub<…>("…")`), how the JWT is passed (`access_token`
  query string?), and the server → client event names (new message, seen). The frontend uses
  REST + polling until then.

## Small fixes

| #   | Now                                                                                                             | Suggested                                                                           |
| --- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 7   | First plan activity for a child **without a teacher** → empty `500`, nothing created                            | `400 { message: "أسند معلماً للطفل أولاً" }` (or create the plan without a teacher) |
| 8   | `specialist/CreateReport` accepts a **second** report for the same child (one-report rule)                      | `409 { message }`, or update the existing report                                    |
| 9   | `isInInitialAssessment` in `Admin/categoriesActivity` is `false` for all, while the assessment has 3 categories | Return the real flag (the frontend uses `initial-assessment/categories`)            |

## Questions

10. **Public registration role:** our rule is _public registration creates Parent accounts only_;
    staff accounts are created by seed data or an admin-only flow. Please confirm the server
    ignores (or rejects) any other `Role` value on `POST Auth/register`. We did not test this by
    sending privileged roles, because a created account could not be deleted.
11. **Teacher feedback readers:** `GET Teacher/feedbacks` returns 403 for Specialist, Parent, Admin
    and Super Admin. Should the specialist (and parent) be able to read a child's feedback? If yes,
    which endpoint?
12. **Forgot password:** both `Auth/ForgotPassword` and `Auth/forgot-password` answer neutrally.
    Which one is canonical? The frontend uses `Auth/ForgotPassword` with the reset-code flow.

## Accounts / data

- A **Teacher demo account** with at least one assigned child (Teacher endpoints, including the new
  feedback list, are unverified).
- Two chat messages "E2E TEST MESSAGE — SAFE TO DELETE" (demo parent → demo specialist, from
  2026-10-07) remain — there is no delete endpoint; please delete them in the database.
