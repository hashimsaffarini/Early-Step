# Backend integration status

Branch `feature/backend-integration` · updated 2026-10-06 (live verification round) · backend
`https://earlystep22.runasp.net/api/` · contracts: `api/LIVE_CONTRACTS.md` (live, sanitized) and
`api/swagger.json`.

## Status values

| Status                       | Meaning                                                                                                                                             |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **VERIFIED LIVE**            | The app's own API function + schema succeeded against the real backend (`npm run test:live`, read-only) and the UI is wired to it                   |
| **PARTIALLY VERIFIED**       | Endpoint verified live, but part of the response (e.g. list items) or the UI path was not observable with the demo data                             |
| **IMPLEMENTED, MOCK-TESTED** | Wired and tested against MSW only — typically **write** operations (no authorized disposable records yet) or roles without a demo account (Teacher) |
| **BLOCKED BY BACKEND**       | No (working) endpoint; the UI shows an honest "not available" state                                                                                 |

## How verification was done

- Demo accounts (Parent, Specialist, Admin, SuperAdmin) — all four sign in. No Teacher account.
- Python (`requests`, scripts outside the repo) for discovery: status codes, shapes, enums,
  errors — printing structures only.
- `npm run test:live` (`src/test/live/`) re-runs the **app's own** login and GET fetchers with
  their Zod schemas against the live API: **6/6 pass**.
- **No create/update/delete request was sent to the live backend** (waiting for authorized
  disposable test records). No further unauthenticated requests to personal data.

## Matrix

### Auth & core

| Capability                           | API                                          | Status                            | Notes                                                            |
| ------------------------------------ | -------------------------------------------- | --------------------------------- | ---------------------------------------------------------------- |
| Login                                | `POST Auth/login`                            | **VERIFIED LIVE**                 | `{ id, fullName, accessToken, role }`, JWT 120 h, all 4 accounts |
| Role normalization                   | role values                                  | **VERIFIED LIVE**                 | `ولي أمر`, `معلم/ة`, `أخصائي/ة`, `Admin`, `SuperAdmin`           |
| Session expiry                       | JWT `exp`                                    | **VERIFIED LIVE**                 | read from the token                                              |
| Route guards / server authorization  | —                                            | **VERIFIED LIVE** (authenticated) | cross-role calls return 403                                      |
| Error parsing                        | ProblemDetails, `{ message }`                | **VERIFIED LIVE**                 |                                                                  |
| Parent registration                  | `POST Auth/register`                         | IMPLEMENTED, MOCK-TESTED          | write — not exercised live                                       |
| Forgot / reset password              | `Auth/ForgotPassword`, `Auth/reset-password` | IMPLEMENTED, MOCK-TESTED          | would send real emails — not exercised                           |
| Change password, email confirmation  | —                                            | not implemented                   | no screen yet (NOT STARTED)                                      |
| Refresh token / `me` / server logout | —                                            | BLOCKED BY BACKEND                |                                                                  |

### Parent & children

| Capability                              | API                                               | Status                   | Notes                                                                         |
| --------------------------------------- | ------------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------- |
| My children                             | `GET Parent/GetMyChildren`                        | **VERIFIED LIVE**        | age (int), Arabic gender                                                      |
| Child detail                            | `GET Parent/{id}`                                 | **VERIFIED LIVE**        | includes games/tests/reports counts                                           |
| Add / edit / delete child               | `POST/PATCH/DELETE Parent`                        | IMPLEMENTED, MOCK-TESTED | writes                                                                        |
| Plan activities                         | `GET TrainingPlan/children/{id}/activities?type=` | **VERIFIED LIVE**        | `type` required → app fetches tests + games                                   |
| Plan summary                            | `…/activities/summary`                            | **VERIFIED LIVE**        |                                                                               |
| Activity detail (player)                | `…/activities/{activityId}`                       | **PARTIALLY VERIFIED**   | shape verified; the sample had no questions, so question play is mock-tested  |
| Child reports                           | `GET Reports/child/{id}`                          | **PARTIALLY VERIFIED**   | "no reports" = 404 + message (handled → empty); report items not yet observed |
| Staff child lists                       | `specialist/children`                             | **VERIFIED LIVE**        | `Teacher/children` mock-tested (no teacher account)                           |
| Admin children list, staff child detail | —                                                 | BLOCKED BY BACKEND       |                                                                               |

### Initial assessment

| Capability                                | API                           | Status                   | Notes                                                                        |
| ----------------------------------------- | ----------------------------- | ------------------------ | ---------------------------------------------------------------------------- |
| Start / answer / complete                 | `POST initial-assessment/{…}` | IMPLEMENTED, MOCK-TESTED | writes — creates real assessment records; needs authorized test child        |
| Results                                   | —                             | **BLOCKED BY BACKEND**   | no results endpoint in Swagger or Apidog — **pending backend clarification** |
| MultiSelect / Sequence / Matching answers | —                             | BLOCKED BY BACKEND       | answer contract takes one option id                                          |

### Admin content

| Capability                                                                            | API                                  | Status                   | Notes                                       |
| ------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------ | ------------------------------------------- |
| Categories list                                                                       | `GET Admin/categories`               | **VERIFIED LIVE**        |                                             |
| Categories with counts                                                                | `GET Admin/categoriesActivity?type=` | **VERIFIED LIVE**        | `type` required                             |
| Activities list / detail                                                              | `GET Admin/activities/{type}[/{id}]` | **VERIFIED LIVE**        |                                             |
| Question                                                                              | `GET Admin/questions/{id}`           | **VERIFIED LIVE**        | types seen: SingleChoice, MultiSelect       |
| Assessment categories                                                                 | `GET initial-assessment/categories`  | **VERIFIED LIVE**        | ids now returned; used as membership source |
| Create/edit/delete categories, activities, questions, options; assessment composition | various                              | IMPLEMENTED, MOCK-TESTED | writes                                      |
| Add one option to an existing question; list assessment questions                     | —                                    | BLOCKED BY BACKEND       |                                             |

### Admin users & assignment

| Capability                                | API                                        | Status                   | Notes |
| ----------------------------------------- | ------------------------------------------ | ------------------------ | ----- |
| Dashboard                                 | `GET Admin/dashboard`                      | **VERIFIED LIVE**        |       |
| Users list (+ Role, Search)               | `GET Admin/users`                          | **VERIFIED LIVE**        |       |
| User detail with children                 | `GET Admin/users/{id}`                     | **VERIFIED LIVE**        |       |
| Assign children to specialist             | `POST Admin/assign-children-to-specialist` | IMPLEMENTED, MOCK-TESTED | write |
| User create / edit / delete / role change | —                                          | BLOCKED BY BACKEND       |       |

### Specialist & training plans

| Capability                         | API                                         | Status                   | Notes                              |
| ---------------------------------- | ------------------------------------------- | ------------------------ | ---------------------------------- |
| Dashboard                          | `GET specialist/dashboard`                  | **VERIFIED LIVE**        | Arabic keys                        |
| Specialist plan                    | `GET TrainingPlan/specialist/children/{id}` | **VERIFIED LIVE**        | no plan = 404 + message            |
| Available activities               | `…/available-activities?type=`              | **VERIFIED LIVE**        |                                    |
| Teachers list                      | `GET specialist/teachers`                   | **VERIFIED LIVE**        | new endpoint                       |
| Assign teacher                     | `POST specialist/assign-teacher`            | IMPLEMENTED, MOCK-TESTED | new UI on the plan page; write     |
| Add / remove plan activity         | `POST/DELETE …/activities`                  | IMPLEMENTED, MOCK-TESTED | writes                             |
| Reports list                       | `GET specialist/Reports`                    | **PARTIALLY VERIFIED**   | empty for the demo account         |
| Create / edit / delete report, PDF | `specialist/*`, `Reports/{id}/download`     | IMPLEMENTED, MOCK-TESTED | writes / no report to download yet |
| Reading teacher feedback           | —                                           | BLOCKED BY BACKEND       |                                    |

### Teacher

| Capability                            | API                            | Status                   | Notes                                                   |
| ------------------------------------- | ------------------------------ | ------------------------ | ------------------------------------------------------- |
| Dashboard, children, notes CRUD       | `Teacher/*`                    | IMPLEMENTED, MOCK-TESTED | **no teacher demo account**                             |
| Notes list (multiple notes per child) | Apidog `GET Teacher/feedbacks` | BLOCKED BY BACKEND       | 404 live — not deployed; backend says it is in progress |

### Super Admin

| Capability               | API                        | Status             | Notes                  |
| ------------------------ | -------------------------- | ------------------ | ---------------------- |
| Dashboard                | `GET SuperAdmin/dashboard` | **VERIFIED LIVE**  | includes `usersByRole` |
| Users (+ filters)        | `GET SuperAdmin/users`     | **VERIFIED LIVE**  | array, all five roles  |
| Children                 | `GET SuperAdmin/children`  | **VERIFIED LIVE**  |                        |
| User management, reports | —                          | BLOCKED BY BACKEND |                        |

### Chat & notifications

| Capability                   | API                       | Status                   | Notes                                    |
| ---------------------------- | ------------------------- | ------------------------ | ---------------------------------------- |
| Contacts                     | `GET Chats/users`         | **VERIFIED LIVE**        |                                          |
| Conversations                | `GET Chats/conversations` | **PARTIALLY VERIFIED**   | empty for the demo parent                |
| Unread count                 | `GET Chats/unread-count`  | **VERIFIED LIVE**        |                                          |
| Messages, send, seen         | `Chats`, `Chats/send`, …  | IMPLEMENTED, MOCK-TESTED | send is a write; no conversation to read |
| Real-time hub, notifications | —                         | BLOCKED BY BACKEND       |                                          |

### Practice content

Tests/games catalogues for non-admin roles and the 11 games remain local practice content (no
backend catalogue for those roles) — labelled in the UI.

## Totals (counted from the 53 matrix rows)

| Status                   | Rows |
| ------------------------ | ---: |
| VERIFIED LIVE            |   27 |
| PARTIALLY VERIFIED       |    4 |
| IMPLEMENTED, MOCK-TESTED |   11 |
| BLOCKED BY BACKEND       |   10 |
| Not started (no screen)  |    1 |

## Needed to continue

1. **Authorization to use disposable test records** (e.g. a clearly named test child under the
   demo parent) to verify writes: child CRUD, assessment start/answer/complete, plan add/remove,
   assign teacher/specialist, reports CRUD + PDF, chat send, admin content CRUD.
2. A **Teacher** demo account.
3. Backend: the **assessment results** endpoint (route + response), the **notes list**
   endpoint, and confirmation that **unauthenticated** access to `/api/Admin/*` is fixed.
