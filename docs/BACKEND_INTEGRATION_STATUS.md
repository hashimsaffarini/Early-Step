# Backend integration status

Branch `feature/backend-integration` · updated 2026-10-10 (re-verification after the backend
updates) · backend `https://earlystep22.runasp.net/api/` · per-endpoint results:
`API_VERIFICATION_MATRIX.md` · shapes: `api/LIVE_CONTRACTS.md` · open backend items:
`BACKEND_REQUESTS.md` · players: `PLAYER_BACKEND_COMPATIBILITY.md`.

## Status values

| Status                         | Meaning                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| **VERIFIED LIVE**              | Read path verified against the real backend with the app's own fetcher + schema       |
| **VERIFIED LIVE — WRITE**      | Write executed live on disposable `E2E Test …` data, effect re-read, cleanup verified |
| **PARTIALLY VERIFIED**         | Works live, with a backend limitation (see Notes)                                     |
| **MOCK TESTED**                | Wired and tested against MSW only                                                     |
| **BLOCKED BY BACKEND**         | Missing or broken on the backend; the UI shows an honest state                        |
| **BLOCKED BY MISSING ACCOUNT** | Needs an account we do not have (Teacher)                                             |
| **OUT OF SCOPE**               | Agreed out of the graduation-project scope (production recommendation at most)        |
| **NOT REQUIRED**               | Not needed by the product                                                             |

## How verification was done

- Demo accounts Parent, Specialist, Admin, SuperAdmin (gitignored `.env.e2e.local`); no Teacher.
- `npm run test:live:read` / `npm run test:live:write` run the **app's own** API functions against
  the live API; the write suite creates `E2E Test …` records, deletes them in `afterAll` and fails
  on any leftover. Live errors are redacted (no token or body reaches the test output).
- Python scripts outside the repo for what the suites do not cover — status codes and shapes only.
- Browser sign-in with real accounts is done by the user (the assistant does not type real passwords).

## Matrix

### Auth & core

| Capability                          | API                   | Status                     | Notes                                                                      |
| ----------------------------------- | --------------------- | -------------------------- | -------------------------------------------------------------------------- |
| Login, role normalization, expiry   | `POST Auth/login`     | **VERIFIED LIVE**          | JWT 120 h                                                                  |
| Server authorization                | —                     | **VERIFIED LIVE**          | anonymous → 401 everywhere checked; cross-role → 403                       |
| Forgot password                     | `Auth/ForgotPassword` | **VERIFIED LIVE**          | neutral answer for unknown emails (fixed 10-08)                            |
| Reset password                      | `Auth/reset-password` | BLOCKED BY MISSING ACCOUNT | needs a disposable mailbox                                                 |
| Parent registration                 | `POST Auth/register`  | MOCK TESTED                | no `Role` in the contract (parent-only); not created live (no user delete) |
| Refresh token / server logout       | —                     | OUT OF SCOPE               | backend decision; production recommendation                                |
| Change password, email confirmation | —                     | NOT REQUIRED               | no screen                                                                  |

### Parent & children

| Capability                         | API                                                      | Status                    | Notes                                                          |
| ---------------------------------- | -------------------------------------------------------- | ------------------------- | -------------------------------------------------------------- |
| My children, child detail          | `GET Parent/GetMyChildren`, `GET Parent/{id}`            | **VERIFIED LIVE**         |                                                                |
| Add / edit / delete child          | `POST/PATCH/DELETE Parent`                               | **VERIFIED LIVE — WRITE** | delete cascades reports, assessment, plan                      |
| Plan activities + summary          | `TrainingPlan/children/{id}/activities…`                 | **VERIFIED LIVE**         |                                                                |
| Plan activity result               | `GET …/{planActivityId}/result`                          | BLOCKED BY BACKEND        | 403 for every available role                                   |
| Plan activity player + save result | `…/activities/{activityId}`, `…/{planActivityId}/submit` | **VERIFIED LIVE — WRITE** | all 3 types; one attempt; counts appear in the specialist plan |
| Child report                       | `GET Reports/child/{id}`                                 | **VERIFIED LIVE**         | one report per child (confirmed business rule)                 |
| Report PDF                         | `GET Reports/{id}/download`                              | **VERIFIED LIVE**         |                                                                |

### Initial assessment

| Capability                          | API                                       | Status                    | Notes                                             |
| ----------------------------------- | ----------------------------------------- | ------------------------- | ------------------------------------------------- |
| Start, answer (all 3 types)         | `POST initial-assessment/{…}`             | **VERIFIED LIVE — WRITE** | one option per question for every type            |
| Complete + result screen            | `complete` response                       | **VERIFIED LIVE — WRITE** | completes again (option-less questions removed)   |
| Result later (profile, specialist)  | `GET initial-assessment/{childId}/result` | **VERIFIED LIVE**         | assessment page after refresh + child profile     |
| MultiSelect / Sequence (assessment) | `…/answer`                                | PARTIALLY VERIFIED        | one option only; Sequence always scored incorrect |

### Admin content

| Capability                                       | API                                        | Status                    | Notes                                                        |
| ------------------------------------------------ | ------------------------------------------ | ------------------------- | ------------------------------------------------------------ |
| Lists and detail                                 | `GET Admin/…`                              | **VERIFIED LIVE**         |                                                              |
| Category / activity (test, game, icon) CRUD      | `Admin/categories`, `Admin/activities`     | **VERIFIED LIVE — WRITE** |                                                              |
| Questions (3 types), options, delete all options | `Admin/questions…`, `question-options`     | **VERIFIED LIVE — WRITE** | Matching removed by the backend                              |
| Assessment composition (add/remove)              | `initial-assessment/categories, questions` | **VERIFIED LIVE — WRITE** | reading membership: Admin 403 since 10-10 → "status unknown" |

### Admin users & assignment

| Capability                    | API                                        | Status                    | Notes |
| ----------------------------- | ------------------------------------------ | ------------------------- | ----- |
| Dashboard, users, user detail | `GET Admin/…`                              | **VERIFIED LIVE**         |       |
| Assign children to specialist | `POST Admin/assign-children-to-specialist` | **VERIFIED LIVE — WRITE** |       |

### Specialist & training plans

| Capability                          | API                              | Status                    | Notes                                                     |
| ----------------------------------- | -------------------------------- | ------------------------- | --------------------------------------------------------- |
| Dashboard, children, teachers       | `GET specialist/…`               | **VERIFIED LIVE**         |                                                           |
| Plan, available activities          | `GET TrainingPlan/specialist/…`  | **VERIFIED LIVE**         |                                                           |
| Assign teacher                      | `POST specialist/assign-teacher` | **VERIFIED LIVE — WRITE** |                                                           |
| Add first / further plan activities | `POST …/activities`              | **VERIFIED LIVE — WRITE** | first activity needs an assigned teacher (else empty 500) |
| Remove plan activity                | `DELETE …/activities/{id}`       | **VERIFIED LIVE — WRITE** |                                                           |
| Report create / edit / delete       | `specialist/*`                   | **VERIFIED LIVE — WRITE** | one per child enforced in the UI                          |
| Reading teacher feedback            | `Teacher/feedbacks`              | BLOCKED BY BACKEND        | 403 for specialist — question open                        |

### Teacher

| Capability                            | API                     | Status                     | Notes                             |
| ------------------------------------- | ----------------------- | -------------------------- | --------------------------------- |
| Dashboard, children, notes CRUD       | `Teacher/*`             | BLOCKED BY MISSING ACCOUNT | mock-tested                       |
| Feedback history (multiple per child) | `GET Teacher/feedbacks` | BLOCKED BY MISSING ACCOUNT | deployed (401/403); shape unknown |

### Super Admin

| Capability                 | API                | Status            | Notes |
| -------------------------- | ------------------ | ----------------- | ----- |
| Dashboard, users, children | `GET SuperAdmin/…` | **VERIFIED LIVE** |       |

### Chat & notifications

| Capability                      | API                              | Status                    | Notes                                  |
| ------------------------------- | -------------------------------- | ------------------------- | -------------------------------------- |
| Contacts                        | `GET Chats/users`                | **VERIFIED LIVE**         | fixed 10-10; filtered to related users |
| Conversations, messages, unread | `GET Chats/…`                    | **VERIFIED LIVE**         | REST + polling                         |
| Send, mark seen                 | `POST Chats/send`, `mark-…-seen` | **VERIFIED LIVE — WRITE** |                                        |
| Real-time hub (SignalR)         | —                                | BLOCKED BY BACKEND        | no hub on the deployed server          |
| Notifications                   | —                                | OUT OF SCOPE              |                                        |

## Totals (39 matrix rows)

| Status                     | Rows |
| -------------------------- | ---: |
| VERIFIED LIVE              |   15 |
| VERIFIED LIVE — WRITE      |   13 |
| PARTIALLY VERIFIED         |    1 |
| MOCK TESTED                |    1 |
| BLOCKED BY BACKEND         |    3 |
| BLOCKED BY MISSING ACCOUNT |    3 |
| OUT OF SCOPE               |    2 |
| NOT REQUIRED               |    1 |
