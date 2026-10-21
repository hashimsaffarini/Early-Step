# Backend integration status

Branch `feature/backend-integration` (client revisions on `feature/earlystep-client-revisions`, 2026-10-16) · updated 2026-10-15 (production data audit and final checks —
no dummy data in production, strict live contracts, `PRODUCTION_DATA_AUDIT.md`) · backend `https://earlystep22.runasp.net/api/` · per-endpoint results:
`API_VERIFICATION_MATRIX.md` · shapes: `api/LIVE_CONTRACTS.md` · open backend items:
`BACKEND_REQUESTS.md` · players: `PLAYER_BACKEND_COMPATIBILITY.md`.

## Status values

| Status                         | Meaning                                                                                                   |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| **VERIFIED LIVE**              | Read path verified against the real backend with the app's own fetcher + schema                           |
| **VERIFIED LIVE — WRITE**      | Write executed live on disposable `E2E Test …` data, effect re-read, cleanup verified                     |
| **PARTIALLY VERIFIED**         | Works live, with a backend limitation (see Notes)                                                         |
| **MOCK TESTED**                | Wired and tested against MSW only                                                                         |
| **BLOCKED BY BACKEND**         | Missing or broken on the backend; the UI shows an honest state                                            |
| **BLOCKED BY MISSING ACCOUNT** | Needs an account we cannot use (Teacher: none provided; one created via `SuperAdmin/users` cannot log in) |
| **OUT OF SCOPE**               | Agreed out of the graduation-project scope (production recommendation at most)                            |
| **NOT REQUIRED**               | Not needed by the product                                                                                 |

## How verification was done

- Demo accounts Parent, Specialist, Admin, SuperAdmin (gitignored `.env.e2e.local`); no usable Teacher.
- `npm run test:live:read` / `npm run test:live:write` run the **app's own** API functions against
  the live API; the write suite creates `E2E Test …` records, deletes them in `afterAll` and fails
  on any leftover. Live errors are redacted (no token or body reaches the test output).
- Python scripts outside the repo for what the suites do not cover — status codes and shapes only.
- Browser regression (2026-10-14) in development mock mode with every role, incl. Teacher (mock
  fixture accounts on localhost); browser sign-in with the real accounts is done by the user.

## Matrix

### Auth & core

| Capability                          | API                              | Status                     | Notes                                                                          |
| ----------------------------------- | -------------------------------- | -------------------------- | ------------------------------------------------------------------------------ |
| Login → `Auth/me` → role → area     | `POST Auth/login`, `GET Auth/me` | **VERIFIED LIVE**          | JWT 120 h; the user (id, name, email, role) comes only from `Auth/me`          |
| Reload / direct URL restore         | `GET Auth/me`                    | **VERIFIED LIVE**          | stored token only; guards wait for `Auth/me`; 401 → signed out + cache cleared |
| Server authorization                | —                                | **VERIFIED LIVE**          | anonymous → 401 everywhere checked; cross-role → 403                           |
| Forgot password                     | `Auth/ForgotPassword`            | **VERIFIED LIVE**          | the only route since 10-14; neutral 200 for unknown emails                     |
| Reset password                      | `Auth/reset-password`            | BLOCKED BY MISSING ACCOUNT | needs a disposable mailbox                                                     |
| Parent registration                 | `POST Auth/register`             | MOCK TESTED                | no `Role` in the contract (parent-only); not created live (no user delete)     |
| Refresh token / server logout       | —                                | OUT OF SCOPE               | backend decision; production recommendation                                    |
| Change password, email confirmation | —                                | NOT REQUIRED               | no screen                                                                      |

### Parent & children

| Capability                         | API                                                      | Status                    | Notes                                                                                                                                                      |
| ---------------------------------- | -------------------------------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| My children, child detail          | `GET Parent/GetMyChildren`, `GET Parent/{id}`            | **VERIFIED LIVE**         |                                                                                                                                                            |
| Add / edit / delete child          | `POST/PATCH/DELETE Parent`                               | **VERIFIED LIVE — WRITE** | a child with saved activity results is kept (product rule): delete is disabled in the app; the server answers an empty 500 (message improvement requested) |
| Plan activities + summary          | `TrainingPlan/children/{id}/activities…`                 | **VERIFIED LIVE**         |                                                                                                                                                            |
| Plan activity player + save result | `…/activities/{activityId}`, `…/{planActivityId}/submit` | **VERIFIED LIVE — WRITE** | all 3 types; every question required; 409 on a 2nd attempt                                                                                                 |
| Assessment completion (parent)     | `complete`                                               | **VERIFIED LIVE — WRITE** | the parent flow ends with the submission; the saved result is staff-only (product decision) and not called as Parent                                       |
| Child report                       | `GET Reports/child/{id}`                                 | **VERIFIED LIVE**         | one report per child, enforced by the backend (409)                                                                                                        |
| Report PDF                         | `GET Reports/{id}/download`                              | **VERIFIED LIVE**         |                                                                                                                                                            |

### Initial assessment

| Capability                                          | API                                       | Status                    | Notes                                                                                             |
| --------------------------------------------------- | ----------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------- |
| Start, answer SingleChoice / MultiSelect / Sequence | `POST initial-assessment/{…}`             | **VERIFIED LIVE — WRITE** | exact set (any order) / exact order, scored correctly                                             |
| Complete                                            | `complete` response                       | **VERIFIED LIVE — WRITE** | completes only; its body is not read (the Result endpoint is the source of truth)                 |
| Result with per-question details (staff)            | `GET initial-assessment/{childId}/result` | **VERIFIED LIVE**         | assigned Specialist, Admin (unassigned specialist 403 since 10-15); child profile "التقييمات" tab |

### Admin content

| Capability                                       | API                                        | Status                    | Notes                                                                                     |
| ------------------------------------------------ | ------------------------------------------ | ------------------------- | ----------------------------------------------------------------------------------------- |
| Lists and detail                                 | `GET Admin/…`                              | **VERIFIED LIVE**         |                                                                                           |
| Category / activity (test, game, icon) CRUD      | `Admin/categories`, `Admin/activities`     | **VERIFIED LIVE — WRITE** |                                                                                           |
| Questions (3 types), options, delete all options | `Admin/questions…`, `question-options`     | **VERIFIED LIVE — WRITE** | no Matching in the backend                                                                |
| Assessment composition (read + add/remove)       | `initial-assessment/categories, questions` | **VERIFIED LIVE — WRITE** | Admin reads membership; `categoriesActivity.isInInitialAssessment` still false (not used) |

### Admin users & assignment

| Capability                    | API                                        | Status                    | Notes                                                                      |
| ----------------------------- | ------------------------------------------ | ------------------------- | -------------------------------------------------------------------------- |
| Dashboard, users, user detail | `GET Admin/…`                              | **VERIFIED LIVE**         |                                                                            |
| Specialist picker             | `GET Admin/specialists`                    | **VERIFIED LIVE**         | replaces the `Admin/users?Role=` workaround; inactive specialists disabled |
| Assign children to specialist | `POST Admin/assign-children-to-specialist` | **VERIFIED LIVE — WRITE** | re-read after refresh                                                      |
| Create / edit / delete staff  | —                                          | NOT REQUIRED              | Admin has no staff endpoints (403); this is a Super Admin capability       |

### Specialist & training plans

| Capability                                   | API                                   | Status                    | Notes                                                                                                   |
| -------------------------------------------- | ------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------- |
| Dashboard, children, teachers                | `GET specialist/…`                    | **VERIFIED LIVE**         | `progressPercentage` still 0                                                                            |
| Plan (score, progress), available activities | `GET TrainingPlan/specialist/…`       | **VERIFIED LIVE**         | `score` per activity and plan `progress` are filled now                                                 |
| Child's answers to an activity               | `GET …/{planActivityId}/result`       | **VERIFIED LIVE**         | Specialist only; "عرض إجابات الطفل" in the plan                                                         |
| Assign teacher                               | `POST specialist/assign-teacher`      | **VERIFIED LIVE — WRITE** |                                                                                                         |
| Add first / further plan activities          | `POST …/activities`                   | **VERIFIED LIVE — WRITE** | no teacher → 400 with a message (shown as sent)                                                         |
| Remove plan activity                         | `DELETE …/activities/{id}`            | **VERIFIED LIVE — WRITE** | unplayed activities only; played ones keep their results (no remove button)                             |
| Report create / edit / delete                | `specialist/*`                        | **VERIFIED LIVE — WRITE** | 2nd report → 409                                                                                        |
| Read the teacher's notes                     | `GET Teacher/children/{id}/feedbacks` | **VERIFIED LIVE**         | Specialist 200; item shape verified 2026-10-15 with one existing feedback (teacher name and date shown) |

### Teacher

| Capability                             | API         | Status                     | Notes                                 |
| -------------------------------------- | ----------- | -------------------------- | ------------------------------------- |
| Dashboard, children, notes list + CRUD | `Teacher/*` | BLOCKED BY MISSING ACCOUNT | mock- and browser-tested in mock mode |

### Super Admin

| Capability                  | API                            | Status                    | Notes                                                                                                                    |
| --------------------------- | ------------------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Dashboard, users, children  | `GET SuperAdmin/…`             | **VERIFIED LIVE**         | users-by-role from the server's `usersByRole`; `isActive` shown ("موقوف")                                                |
| Create teacher / specialist | `POST SuperAdmin/users`        | PARTIALLY VERIFIED        | 201, but the created account cannot log in (empty 500)                                                                   |
| Deactivate account          | `DELETE SuperAdmin/users/{id}` | **VERIFIED LIVE — WRITE** | soft: stays listed; login refused                                                                                        |
| Re-activate account         | `PUT SuperAdmin/users/{id}`    | **VERIFIED LIVE — WRITE** | "تفعيل" sends the user's own values + `isActive: true` (list has `isActive` since 10-15); name/email editing not offered |

### Chat & notifications

| Capability                      | API                              | Status                    | Notes                                              |
| ------------------------------- | -------------------------------- | ------------------------- | -------------------------------------------------- |
| Contacts                        | `GET Chats/users`                | **VERIFIED LIVE**         | filtered to related users                          |
| Conversations, messages, unread | `GET Chats/…`                    | **VERIFIED LIVE**         | REST + polling                                     |
| Send, mark seen                 | `POST Chats/send`, `mark-…-seen` | **VERIFIED LIVE — WRITE** |                                                    |
| Real-time hub (SignalR)         | —                                | OUT OF SCOPE              | REST + polling is the accepted chat implementation |
| Notifications                   | —                                | OUT OF SCOPE              |                                                    |

### Client revisions 2026-10 (not counted in the totals below)

| Capability                                           | API                                                                                 | Status                     | Notes                                                               |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------- |
| Parent child cards with server counts                | `GET Parent/{childId}`                                                              | **VERIFIED LIVE**          | tests / games / reports counts                                      |
| Plan activity summary + completion %                 | plan endpoints                                                                      | **VERIFIED LIVE**          | derived from real rows; server `progress` for the Specialist        |
| Specialist assignment page                           | `Admin/specialists`, `Admin/users/{id}`, `POST Admin/assign-children-to-specialist` | **VERIFIED LIVE — WRITE**  | several children per call                                           |
| Correct-answer editor                                | `PUT Admin/question-options/{id}`                                                   | **VERIFIED LIVE — WRITE**  | positional `Order` (backend does not store it — BACKEND_REQUESTS 3) |
| Image create / replace                               | activity / question / option endpoints                                              | PARTIALLY VERIFIED         | paths stored; files 404 (BACKEND_REQUESTS 2)                        |
| Initial-assessment hierarchy + category add / remove | `initial-assessment/categories`, `Admin/activities/*`                               | **VERIFIED LIVE — WRITE**  | question membership not listable (BACKEND_REQUESTS 4)               |
| Teacher plan-focused page + notes inside             | Teacher plan + notes endpoints                                                      | BLOCKED BY MISSING ACCOUNT | SuperAdmin-created accounts cannot log in                           |
| Games                                                | `Admin/activities/game`, plan endpoints                                             | **VERIFIED LIVE**          | no game activities exist yet; empty states                          |

## Totals (44 matrix rows)

| Status                     | Rows |
| -------------------------- | ---: |
| VERIFIED LIVE              |   19 |
| VERIFIED LIVE — WRITE      |   16 |
| PARTIALLY VERIFIED         |    1 |
| MOCK TESTED                |    1 |
| BLOCKED BY BACKEND         |    0 |
| BLOCKED BY MISSING ACCOUNT |    2 |
| OUT OF SCOPE               |    3 |
| NOT REQUIRED               |    2 |
