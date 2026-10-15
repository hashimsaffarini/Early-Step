# Backend requests

For the backend developer — **only what is still open**, re-verified live on 2026-10-15 against
`https://earlystep22.runasp.net/api/` (Swagger unchanged: 84 operations).

**Fixed since the last list (verified live 2026-10-15, now used by the app):**

- `GET SuperAdmin/users` returns `isActive` for every user — the panel shows deactivated accounts
  and re-activates them with `PUT SuperAdmin/users/{id}`.
- `GET initial-assessment/{childId}/result` answers 403 to a specialist not assigned to the child
  (assigned specialist and Admin: 200).

**Product decisions (not requests any more):** the parent does not reopen the saved assessment
result (the Result endpoint is for staff; the app no longer calls it as Parent); records with
assessment / training results are kept (the app blocks deleting a child with results and removing
a played activity); `complete` only completes the assessment (the Result endpoint is the source of
truth); no completion date is needed; SignalR is out of scope (REST + polling); teacher feedback
works (it will be re-checked with a working Teacher account).

Production hardening (CORS, Swagger exposure, refresh tokens, notifications) is in `SECURITY.md`
and is not part of this list.

## Please fix (merge blocker)

### 1. Accounts created with `POST SuperAdmin/users` cannot log in

- **Now (re-tested 2026-10-15):** a teacher created with
  `{ fullName, email, password, role: "معلم/ة" }` → 201, but `POST Auth/login` for that account →
  empty **500** — even with a wrong password (an unknown email or a demo account with a wrong
  password gives 401), so it fails before the password check. The account has
  `emailConfirmed: false`.
- **Impact:** no Teacher can be onboarded, so the Teacher flow (dashboard, children, plan,
  feedback, chat) cannot be verified live.
- **Fix:** let staff created by the Super Admin log in (confirm the email on creation, or skip the
  confirmation check for them), or tell us the intended activation step.

## Small improvements (not merge blockers)

| #   | Now                                                                                                                                           | Suggested                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 2   | Deleting a child with saved results (`DELETE Parent/{id}`) or removing a played plan activity → **empty 500**                                 | 400 / 409 with a message (e.g. "لا يمكن حذف طفل لديه نتائج محفوظة") — the app already blocks these actions |
| 3   | `Admin/categoriesActivity` → `isInInitialAssessment` is still **false** for both categories that are in the assessment (re-tested 2026-10-15) | Fill the flag (the app uses `initial-assessment/categories` meanwhile)                                     |
| 4   | `specialist/children` → `progressPercentage` stays 0 while the plan's `progress` is 50 / 100 (the app does not display it)                    | Use the plan progress                                                                                      |
| 5   | `SuperAdmin/children` has no specialist / teacher fields                                                                                      | Optional: add `specialistName` (the panel then shows it)                                                   |

## Accounts / data

- A **Teacher demo account** that can log in, with an assigned child — or the fix for request 1.
  (A teacher feedback item now exists live and is shown to the specialist; the Teacher's own
  screens still cannot be verified.)
- Please delete in the database (test data the API cannot remove):
  - the child **"E2E Test Child 6acf4742"** (demo parent; kept by the results rule);
  - the deactivated user **"E2E Test Teacher 6acf46e5 Edited"**;
  - two chat messages "E2E TEST MESSAGE — SAFE TO DELETE" (demo parent → demo specialist,
    2026-10-07).
