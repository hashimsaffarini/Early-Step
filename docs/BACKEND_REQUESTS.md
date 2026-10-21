# Backend requests

For the backend developer — **only what is still open**, re-verified live on 2026-10-16 against
`https://earlystep22.runasp.net/api/` (Swagger unchanged: 84 operations), including the checks
made for the client revisions of October 2026 (`CLIENT_REVISIONS_2026-10.md`).

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

- **Now (re-tested 2026-10-16):** a teacher created with
  `{ fullName, email, password, role: "معلم/ة" }` → 201, but `POST Auth/login` for that account →
  empty **500** — even with a wrong password (an unknown email or a demo account with a wrong
  password gives 401), so it fails before the password check. The account has
  `emailConfirmed: false`.
- **Impact:** no Teacher can be onboarded, so the Teacher flow (dashboard, children, plan,
  feedback, chat) cannot be verified live.
- **Fix:** let staff created by the Super Admin log in (confirm the email on creation, or skip the
  confirmation check for them), or tell us the intended activation step.

## Please fix (block client-requested features)

### 2. Uploaded images are not served — every `/uploads/...` file answers 404

- **Now (2026-10-16):** creating or editing an activity icon, a question image or an option image
  works — the API stores a new path (`/uploads/activities/….png`, `/uploads/questions/….png`,
  `/uploads/question-options/….png`) and an edit without a file keeps it. But
  `GET https://earlystep22.runasp.net/uploads/…` returns **404** for every file, old and new (also
  under `/api/uploads/…`). So no image ever displays — the client's "image does not update / show".
- **Fix:** serve the upload folder as static files (e.g. `UseStaticFiles` on the folder the files
  are written to, and make sure it is deployed / persisted on the host).
- The app shows «الصورة محفوظة لكن الخادم لا يعرضها حالياً» to the admin until then.

### 3. Question options: `Order` is required on update but never stored

- **Now (2026-10-16):** `POST Admin/activities/{id}/questions` with `Options[i].Order = 1, 2, 3`
  stores `order: 0` for every option, and `PUT Admin/question-options/{id}` does not store it
  either. Yet the update requires `Order` and rejects a value used by another option ("لا يمكن
  تكرار ترتيب الخيار (Order) داخل نفس السؤال."). Sending the stored `0` therefore fails as soon as
  two options exist — this blocked editing the correct answer.
- **Fix:** store `Order` on create and update (or stop requiring a unique value that is not kept).
- The app sends each option's display position (1…n) on every option update, which the backend
  accepts today.

### 4. No endpoint lists the questions in the initial assessment

- **Now:** questions can be added (`POST initial-assessment/questions`) and removed
  (`DELETE …/questions/{id}`), but nothing returns which questions are in the assessment, so the
  admin's category → questions view cannot show a question's real membership (only what was done
  in the current session).
- **Fix:** e.g. `GET initial-assessment/questions` (or the question ids per category in
  `GET initial-assessment/categories`).

## Small improvements (not merge blockers)

| #   | Now                                                                                                                                                                           | Suggested                                                                                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 5   | Deleting a child with saved results (`DELETE Parent/{id}`) or removing a played plan activity → **empty 500**                                                                 | 400 / 409 with a message (e.g. "لا يمكن حذف طفل لديه نتائج محفوظة") — the app already blocks these actions |
| 6   | `Admin/categoriesActivity` → `isInInitialAssessment` was false for categories in the assessment (2026-10-15); `Admin/categories` now follows add / remove (2026-10-16)        | Keep both lists consistent (the app reads membership from `initial-assessment/categories`)                 |
| 7   | `specialist/children` → `progressPercentage` stays 0 while the plan's `progress` is 50 / 100 (the app does not display it)                                                    | Use the plan progress                                                                                      |
| 8   | `SuperAdmin/children` has no specialist / teacher fields                                                                                                                      | Optional: add `specialistName` (the panel then shows it)                                                   |
| 9   | The Training Plan activity responses (`TrainingPlan/children/{id}/activities[/{activityId}]`, `available-activities`) do not include the activity `slug` (saved by the Admin) | Return `slug` — the game engines then open automatically for games (`docs/GAME_ENGINE.md`)                 |

## Accounts / data

- **Content:** the shared initial assessment currently has **no categories** (it had two on
  2026-10-15), so a parent's «بدء التقييم» answers "لا يوجد تقييم أولي متاح حالياً." The Admin can
  add categories again from «التقييم المبدئي» (every category is listed now). There are also no
  game activities yet (`Admin/activities/game` → `[]`).
- A **Teacher demo account** that can log in, with an assigned child — or the fix for request 1.
  (A teacher feedback item now exists live and is shown to the specialist; the Teacher's own
  screens still cannot be verified.)
- Please delete in the database (test data the API cannot remove):
  - the child **"E2E Test Child 6acf4742"** (demo parent; kept by the results rule);
  - the deactivated user **"E2E Test Teacher 6acf46e5 Edited"**;
  - two chat messages "E2E TEST MESSAGE — SAFE TO DELETE" (demo parent → demo specialist,
    2026-10-07).
