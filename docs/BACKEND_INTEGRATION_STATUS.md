# Backend integration status

Branch `feature/backend-integration` · updated 2026-10-07 (final live verification with
authorized disposable writes) · backend `https://earlystep22.runasp.net/api/` · per-endpoint
results: `API_VERIFICATION_MATRIX.md` · shapes: `api/LIVE_CONTRACTS.md` · open backend items:
`BACKEND_REQUESTS.md` · players: `PLAYER_BACKEND_COMPATIBILITY.md`.

## Status values

| Status                         | Meaning                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| **VERIFIED LIVE**              | Read path verified against the real backend with the app's own fetcher + schema       |
| **VERIFIED LIVE — WRITE**      | Write executed live on disposable `E2E Test …` data, effect re-read, cleanup verified |
| **PARTIALLY VERIFIED**         | Works live, but with a backend bug or limitation (see Notes)                          |
| **IMPLEMENTED**                | Wired, but not verified live or with mocks (no screen path to test)                   |
| **MOCK TESTED**                | Wired and tested against MSW only                                                     |
| **BLOCKED BY BACKEND**         | No (working) endpoint; the UI shows an honest "not available" state                   |
| **BLOCKED BY MISSING ACCOUNT** | Needs an account we do not have (Teacher)                                             |
| **NOT REQUIRED**               | Not needed by the product / not used                                                  |

## How verification was done

- Demo accounts Parent, Specialist, Admin, SuperAdmin (gitignored `.env.e2e.local`); no Teacher.
- `npm run test:live:read` (6 tests) and `npm run test:live:write` (6 tests) run the **app's own**
  API functions against the live API. The write suite creates `E2E Test …` records, tracks ids,
  deletes them in `afterAll` and fails if anything remains — **both pass**.
- Python scripts outside the repo for what the suite does not cover (icon uploads, all question
  types, chat, plan add/remove on an existing plan) — structures and status codes only.
- Browser: real-account sign-in is done by the user (the assistant does not type real passwords).

## Matrix

### Auth & core

| Capability                          | API                     | Status                     | Notes                                                       |
| ----------------------------------- | ----------------------- | -------------------------- | ----------------------------------------------------------- |
| Login, role normalization, expiry   | `POST Auth/login`       | **VERIFIED LIVE**          | 4 accounts; JWT 120 h                                       |
| Route guards / server authorization | —                       | **VERIFIED LIVE**          | anon 401 (67/69 protected ops), cross-role 403              |
| Error parsing                       | ProblemDetails, message | **VERIFIED LIVE**          |                                                             |
| Parent registration                 | `POST Auth/register`    | MOCK TESTED                | not created live: no user-delete endpoint for cleanup       |
| Forgot password                     | `Auth/ForgotPassword`   | PARTIALLY VERIFIED         | unknown email → 400 (enumeration); UI shows neutral message |
| Reset password                      | `Auth/reset-password`   | BLOCKED BY MISSING ACCOUNT | needs a disposable mailbox                                  |
| Change password, email confirmation | —                       | NOT REQUIRED               | no screen (confirmation link is served by the backend)      |
| Refresh token / `me` / logout       | —                       | BLOCKED BY BACKEND         |                                                             |

### Parent & children

| Capability                | API                                           | Status                    | Notes                                                      |
| ------------------------- | --------------------------------------------- | ------------------------- | ---------------------------------------------------------- |
| My children, child detail | `GET Parent/GetMyChildren`, `GET Parent/{id}` | **VERIFIED LIVE**         |                                                            |
| Add / edit / delete child | `POST/PATCH/DELETE Parent`                    | **VERIFIED LIVE — WRITE** | delete cascades reports, assessment, plan                  |
| Plan activities + summary | `TrainingPlan/children/{id}/activities…`      | **VERIFIED LIVE**         | `type` required → app fetches tests + games                |
| Plan activity player      | `…/activities/{activityId}`                   | PARTIALLY VERIFIED        | questions load (bug fixed); no result submission (backend) |
| Child reports             | `GET Reports/child/{id}`                      | PARTIALLY VERIFIED        | backend returns only ONE report                            |
| Report PDF                | `GET Reports/{id}/download`                   | **VERIFIED LIVE**         | parent and specialist                                      |

### Initial assessment

| Capability                        | API                           | Status                    | Notes                                                    |
| --------------------------------- | ----------------------------- | ------------------------- | -------------------------------------------------------- |
| Start / answer / complete         | `POST initial-assessment/{…}` | **VERIFIED LIVE — WRITE** | complete returns the result; shown on the results screen |
| Result shown after completion     | `complete` response           | **VERIFIED LIVE — WRITE** | overall + per-category percentages; "not a diagnosis"    |
| Result later (profile tab, staff) | —                             | BLOCKED BY BACKEND        | no GET results endpoint                                  |
| MultiSelect / Sequence / Matching | —                             | BLOCKED BY BACKEND        | one option id per answer; app skips these honestly       |

### Admin content

| Capability                                       | API                                        | Status                    | Notes                              |
| ------------------------------------------------ | ------------------------------------------ | ------------------------- | ---------------------------------- |
| Lists and detail (categories, activities, Qs)    | `GET Admin/…`                              | **VERIFIED LIVE**         |                                    |
| Category create / rename / delete                | `Admin/categories`                         | **VERIFIED LIVE — WRITE** |                                    |
| Activity create / edit (+ icon) / delete         | `Admin/activities/{type}`                  | **VERIFIED LIVE — WRITE** | test and game                      |
| Question create (4 types), edit, option edit/del | `Admin/questions…`, `question-options`     | **VERIFIED LIVE — WRITE** |                                    |
| Delete all options                               | `DELETE Admin/questions/{id}/options`      | BLOCKED BY BACKEND        | 200 but no effect                  |
| Assessment composition                           | `initial-assessment/categories, questions` | **VERIFIED LIVE — WRITE** | category flags disagree (reported) |
| Add one option; list assessment questions        | —                                          | BLOCKED BY BACKEND        |                                    |

### Admin users & assignment

| Capability                    | API                                        | Status                    | Notes |
| ----------------------------- | ------------------------------------------ | ------------------------- | ----- |
| Dashboard, users, user detail | `GET Admin/…`                              | **VERIFIED LIVE**         |       |
| Assign children to specialist | `POST Admin/assign-children-to-specialist` | **VERIFIED LIVE — WRITE** |       |
| User create / edit / delete   | —                                          | BLOCKED BY BACKEND        |       |

### Specialist & training plans

| Capability                            | API                                | Status                    | Notes                                    |
| ------------------------------------- | ---------------------------------- | ------------------------- | ---------------------------------------- |
| Dashboard, children, teachers         | `GET specialist/…`                 | **VERIFIED LIVE**         |                                          |
| Plan, available activities            | `GET TrainingPlan/specialist/…`    | **VERIFIED LIVE**         |                                          |
| Assign teacher                        | `POST specialist/assign-teacher`   | **VERIFIED LIVE — WRITE** |                                          |
| Add plan activity                     | `POST …/activities`                | PARTIALLY VERIFIED        | 500 for a child without a plan (backend) |
| Remove plan activity                  | `DELETE …/activities/{activityId}` | **VERIFIED LIVE — WRITE** |                                          |
| Reports list / create / edit / delete | `specialist/*`                     | **VERIFIED LIVE — WRITE** |                                          |
| Reading teacher feedback              | —                                  | BLOCKED BY BACKEND        |                                          |

### Teacher

| Capability                      | API                 | Status                     | Notes       |
| ------------------------------- | ------------------- | -------------------------- | ----------- |
| Dashboard, children, notes CRUD | `Teacher/*`         | BLOCKED BY MISSING ACCOUNT | MOCK TESTED |
| Notes list                      | `Teacher/feedbacks` | BLOCKED BY BACKEND         | 404 live    |

### Super Admin

| Capability                 | API                | Status             | Notes |
| -------------------------- | ------------------ | ------------------ | ----- |
| Dashboard, users, children | `GET SuperAdmin/…` | **VERIFIED LIVE**  |       |
| User management, reports   | —                  | BLOCKED BY BACKEND |       |

### Chat & notifications

| Capability                       | API                                | Status                    | Notes                                        |
| -------------------------------- | ---------------------------------- | ------------------------- | -------------------------------------------- |
| Contacts, conversations, unread  | `GET Chats/…`                      | **VERIFIED LIVE**         | contacts list every user (privacy, reported) |
| Messages, older/newer pagination | `GET Chats`, `messages/old`, `new` | **VERIFIED LIVE**         | polling                                      |
| Send, mark seen                  | `POST Chats/send`, `mark-…-seen`   | **VERIFIED LIVE — WRITE** | 2 E2E messages remain (no delete endpoint)   |
| Real-time hub                    | —                                  | BLOCKED BY BACKEND        | `/chatHub/negotiate` → 404                   |
| Notifications                    | —                                  | BLOCKED BY BACKEND        | no API                                       |

### Practice content

The 6 local tests and 11 local games remain frontend practice only (no backend catalogue for
parents/children; nothing saved) — labelled in the UI. See `PLAYER_BACKEND_COMPATIBILITY.md`.

## Totals (44 matrix rows)

| Status                     | Rows |
| -------------------------- | ---: |
| VERIFIED LIVE              |   13 |
| VERIFIED LIVE — WRITE      |   12 |
| PARTIALLY VERIFIED         |    4 |
| MOCK TESTED                |    1 |
| BLOCKED BY BACKEND         |   11 |
| BLOCKED BY MISSING ACCOUNT |    2 |
| NOT REQUIRED               |    1 |
