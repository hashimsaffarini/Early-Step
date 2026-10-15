# API Endpoints

> **Live verification 2026-10-06:** verified response shapes per endpoint are in
> `api/LIVE_CONTRACTS.md` (new: `GET specialist/teachers`; `type` is required on
> `TrainingPlan/children/{id}/activities` and `Admin/categoriesActivity`; "no data" is a 404 with a
> message for reports and specialist plans; no assessment-results endpoint exists yet).
>
> **Update 2026-10-06 — the live Swagger supersedes this catalogue.** The backend publishes
> `https://earlystep22.runasp.net/swagger/v1/swagger.json` (snapshot: `api/swagger.json`):
> **74 operations, all under `/api/`, consistent casing** — the "inconsistent `/api` prefix" below
> was an Apidog artefact. Differences from the list below: activities use a `{type}` path segment
> (`Admin/activities/{type}` with `test` / `game`); `GET Auth/confirmEmail?userId&token` exists;
> question types include `Matching`; child bodies use `Age` (int32) and Arabic `Gender`; report
> edit is multipart. Swagger has response schemas **only for chat**. Integration status per
> endpoint: `BACKEND_INTEGRATION_STATUS.md` and `integration/*.md`.

Source: Apidog documentation — <https://e3mockwfb7.apidog.io/> (machine index:
`https://e3mockwfb7.apidog.io/llms.txt`). Inspected 2026-09-28. **77 endpoints** (76 HTTP + 1
WebSocket hub) in 13 Apidog folders.

> **Reliability warning.** Every endpoint is marked `x-apidog-status: developing`. Most
> response schemas are empty (`{}`), no error responses are documented, and there is **no
> server/base URL** (`servers: []`). Shapes below come from request definitions and the few
> response examples. Anything else is **TBD** and must be verified against the live backend.
>
> **Security note.** The public docs contain example emails and passwords. They are
> intentionally **not** reproduced here. See `docs/SECURITY.md`.

## Conventions observed

| Aspect        | Observation                                                                                                                                                                                                                                                                                                |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Base URL      | **Not documented.** Chat hub example uses `wss://localhost:7256/chatHub` (dev machine).                                                                                                                                                                                                                    |
| Path prefix   | Inconsistent: only `/api/Auth/register`, `/api/Auth/login`, `/api/Chats/send`, `/api/Chats/conversations`, `/api/Chats/unread-count`, `/api/Chats/mark-conversation-seen` use `/api`. All others don't (e.g. `/Auth/change-password`, `/Parent`, `/Chats`). **TBD whether this is a documentation error.** |
| Path casing   | Mixed (`/Admin`, `/Teacher`, `/SuperAdmin`, `/Parent` vs `/specialist`, `/initial-assessment`, `/Reports`). ASP.NET routing is usually case-insensitive — **TBD**.                                                                                                                                         |
| Auth          | `bearer` HTTP scheme on all endpoints except register/login/forgot/reset. Token format TBD.                                                                                                                                                                                                                |
| IDs           | GUID strings.                                                                                                                                                                                                                                                                                              |
| Content types | **Mixed**: `multipart/form-data` for register, login, add/edit child, create/edit activity, create/edit question, edit option, edit report. JSON for everything else.                                                                                                                                      |
| Enum values   | Several are **Arabic strings**: role `ولي أمر`, gender `بنت` / `ولد`, activity type `اختبارات`. Edit-child response shows `gender: Female`. **Inconsistent — TBD.**                                                                                                                                        |
| Messages      | Many responses/errors are Arabic strings or `{ message }`.                                                                                                                                                                                                                                                 |
| Pagination    | Only in chat (`take`, `beforeId`, `afterId`). Nowhere else.                                                                                                                                                                                                                                                |
| Errors        | Not documented. Examples show 200-with-message for failures (e.g. start assessment). **TBD real status codes.**                                                                                                                                                                                            |

Legend — **Role** column: roles inferred from the Apidog folder and path, **not verified**
against server authorization.

---

## 1. Account (Auth)

| #   | Method | Path                    | Purpose                                                                                                 | Auth       | Role (inferred) |
| --- | ------ | ----------------------- | ------------------------------------------------------------------------------------------------------- | ---------- | --------------- |
| 1   | POST   | `/api/Auth/register`    | Register a user                                                                                         | none       | public          |
| 2   | POST   | `/api/Auth/login`       | Login (3 Apidog entries: "Login-t", "Login Admin", "Login-Sp" — same endpoint, different example users) | none       | all             |
| 3   | POST   | `/Auth/change-password` | Change own password                                                                                     | bearer     | any signed-in   |
| 4   | POST   | `/Auth/ForgotPassword`  | Send reset code by email                                                                                | none (TBD) | public          |
| 5   | POST   | `/Auth/reset-password`  | Reset password with code                                                                                | none (TBD) | public          |

**Register** — `multipart/form-data`: `fullName`, `email`, `password`, `confirmPassword`,
`role` (example value `ولي أمر`). Response schema empty. Which roles can register: **TBD**.

**Login** — `multipart/form-data`: `email`, `password`, `rememberMe` (boolean). Response
schema **empty** — token/user shape **TBD** (critical).

**Change password** — JSON `{ currentPassword, newPassword, confirmPassword }` → Arabic
success string.

**Forgot password** — JSON `{ email }`.

**Reset password** — JSON `{ email, code, newPassword, confirmPassword }` (code is a 4-digit
string in the example). Error example: `["Invalid or expired code."]`.

Not documented: current-user (`me`) endpoint, logout, refresh token, email confirmation.

## 2. Parent

| #   | Method | Path                       | Purpose                            | Auth   |
| --- | ------ | -------------------------- | ---------------------------------- | ------ |
| 6   | POST   | `/Parent`                  | Add child                          | bearer |
| 7   | PATCH  | `/Parent/{childId}`        | Edit child                         | bearer |
| 8   | DELETE | `/Parent/{childId}`        | Delete child                       | bearer |
| 9   | GET    | `/Parent/GetMyChildren`    | List own children                  | bearer |
| 10  | GET    | `/Parent/{childId}`        | Child info                         | bearer |
| 11  | GET    | `/Reports/child/{childId}` | Child report (listed under Parent) | bearer |

**Add / edit child** — `multipart/form-data`: `FullName` (`fullName` on edit), `Age` (string
number), `gender` (`بنت` / `ولد`). Edit response example:
`{ id, fullName, age, gender: "Female" }`. Other responses show `birthDate` instead of `age` —
**conflict, TBD**.

## 3. Admin

| #   | Method | Path                                   | Purpose                         | Auth   |
| --- | ------ | -------------------------------------- | ------------------------------- | ------ |
| 12  | GET    | `/Admin/dashboard`                     | Admin dashboard stats           | bearer |
| 13  | GET    | `/Admin/users?Role=&Search=`           | List users + counts             | bearer |
| 14  | GET    | `/Admin/users/{userId}`                | User detail with children       | bearer |
| 15  | GET    | `/Admin/categories`                    | List categories                 | bearer |
| 16  | POST   | `/Admin/categories`                    | Create category                 | bearer |
| 17  | PUT    | `/Admin/categories/{categoryId}`       | Edit category                   | bearer |
| 18  | DELETE | `/Admin/categories/{categoryId}`       | Delete category                 | bearer |
| 19  | POST   | `/Admin/assign-children-to-specialist` | Assign children to a specialist | bearer |

- **Users list** response: `{ totalUsers, totalParents, totalSpecialists, totalTeachers, users[] }`
  (item shape undocumented).
- **User detail** example: `{ id, fullName, email, phoneNumber|null, role, emailConfirmed,
childrenCount, children: [{ id, fullName, birthDate, gender, parentId, parentName,
specialistId|null, specialistName|null }] }`.
- **Category** create/edit JSON `{ name }`. Edit response `{ id, name, count }`. Delete →
  Arabic success string.
- **Assign specialist** JSON `{ specialistId, childIds: string[] }`.

## 4. Activities (Admin)

| #   | Method | Path                                       | Purpose                          | Auth   |
| --- | ------ | ------------------------------------------ | -------------------------------- | ------ |
| 20  | GET    | `/Admin/activities/test?categoryId=`       | List activities (tests)          | bearer |
| 21  | GET    | `/Admin/activities/test/{activityId}`      | Get one activity                 | bearer |
| 22  | GET    | `/Admin/categoriesActivity?type=test`      | Categories with activity counts  | bearer |
| 23  | POST   | `/Admin/activities/test`                   | Create activity                  | bearer |
| 24  | PUT    | `/Admin/activities/test/{activityId}`      | Edit activity                    | bearer |
| 25  | DELETE | `/Admin/activities/test/{activityId}`      | Delete activity                  | bearer |
| 26  | POST   | `/Admin/activities/{activityId}/questions` | Create question (with options)   | bearer |
| 27  | GET    | `/Admin/questions/{questionId}`            | Get question                     | bearer |
| 28  | PUT    | `/Admin/questions/{questionId}/info`       | Edit question text/image/type    | bearer |
| 29  | DELETE | `/Admin/questions/{questionId}`            | Delete question                  | bearer |
| 30  | PUT    | `/Admin/question-options/{optionId}`       | Edit option                      | bearer |
| 31  | DELETE | `/Admin/questions/{questionId}/options`    | Delete all options of a question | bearer |
| 32  | DELETE | `/Admin/question-options/{optionId}`       | Delete option                    | bearer |

- **Activity** (`multipart/form-data`): `title`, `description`, `slug`, `categoryId`, `Icon`
  (file). Get-one response: `{ id, title, description, slug, type, categoryId, categoryName,
questionCount, createdById, createdByName, questions[] }`.
- **The `test` path segment** strongly suggests a `game` counterpart (`/Admin/activities/game`)
  that is **not documented** — **TBD**.
- **Categories-activity** item: `{ id, name, count, isDeleted, isInInitialAssessment }`.
- **Create question** (`multipart/form-data`): `QuestionText`, `QuestionImage` (file), `Type`
  (e.g. `MultiSelect`), `Options[i].OptionText`, `Options[i].OptionImage` (file),
  `Options[i].IsCorrect`, `Options[i].Order`. Response: the parent activity with questions.
- **Question** example: `{ id, questionText, questionImageUrl, type: "SingleChoice", order,
options: [{ id, optionText|null, optionImageUrl, isCorrect, correctOrder|null,
pairKey|null }] }`. Types seen: `SingleChoice`, `MultiSelect`, `Sequence`.
- **Edit option** (`multipart/form-data`): `OptionText`, `OptionImage`, `Order`, `IsCorrect`,
  `CorrectOrder`, `PairKey`.
- Image URLs are server-relative (`/uploads/...`) — need the API origin to render.

## 5. Initial Assessment

| #   | Method | Path                                          | Purpose                              | Auth   | Role (inferred) |
| --- | ------ | --------------------------------------------- | ------------------------------------ | ------ | --------------- |
| 33  | GET    | `/initial-assessment/categories`              | Categories in the initial assessment | bearer | Admin           |
| 34  | POST   | `/initial-assessment/categories/{categoryId}` | Add category to assessment           | bearer | Admin           |
| 35  | DELETE | `/initial-assessment/categories/{categoryId}` | Remove category                      | bearer | Admin           |
| 36  | POST   | `/initial-assessment/questions`               | Add questions `{ questionIds[] }`    | bearer | Admin           |
| 37  | DELETE | `/initial-assessment/questions/{questionId}`  | Remove question                      | bearer | Admin           |
| 38  | POST   | `/initial-assessment/{childId}/start`         | Start assessment for a child         | bearer | Parent          |
| 39  | POST   | `/initial-assessment/{assessmentId}/answer`   | Submit one answer                    | bearer | Parent (child)  |
| 40  | POST   | `/initial-assessment/{assessmentId}/complete` | Complete assessment                  | bearer | Parent (child)  |

- Start response shape **undocumented** (only an Arabic error message example: child not found
  or no assessment available).
- Answer payload: `{ questionId, selectedOptionId }` — a **single option id**. How
  `MultiSelect` / `Sequence` answers are submitted is **TBD**.
- Complete error example: cannot complete until all questions are answered.
- No endpoint to **read results** of an initial assessment is documented — **TBD** (Admin needs
  it to review).
- No timing / response-speed fields — **TBD**.

## 6. Specialist

| #   | Method | Path                         | Purpose                                    | Auth   |
| --- | ------ | ---------------------------- | ------------------------------------------ | ------ |
| 41  | GET    | `/specialist/dashboard`      | Specialist dashboard                       | bearer |
| 42  | GET    | `/specialist/children`       | Assigned children                          | bearer |
| 43  | POST   | `/specialist/assign-teacher` | Assign teacher `{ teacherId, childIds[] }` | bearer |

How a specialist finds a teacher's id (teacher list endpoint) is **not documented**.

## 7. Report

| #   | Method | Path                           | Purpose                                | Auth   | Role (inferred)   |
| --- | ------ | ------------------------------ | -------------------------------------- | ------ | ----------------- |
| 44  | GET    | `/specialist/Reports`          | All reports (specialist's)             | bearer | Specialist        |
| 45  | GET    | `/Reports/child/{childId}`     | Reports for a child (duplicate of #11) | bearer | Parent/Specialist |
| 46  | POST   | `/specialist/CreateReport`     | Create report                          | bearer | Specialist        |
| 47  | PUT    | `/specialist/{reportId}`       | Edit report (`multipart/form-data`)    | bearer | Specialist        |
| 48  | DELETE | `/specialist/{reportId}`       | Delete report                          | bearer | Specialist        |
| 49  | GET    | `/Reports/{reportId}/download` | Download report as **PDF**             | bearer | TBD               |

Report fields: `childId`, `title`, `weaknesses`, `recommendations` (JSON on create; multipart
on edit). Response shapes undocumented. PDF is generated **server-side**.

## 8. Teacher

| #   | Method | Path                                | Purpose                       | Auth   |
| --- | ------ | ----------------------------------- | ----------------------------- | ------ |
| 50  | GET    | `/Teacher/dashboard`                | Teacher dashboard             | bearer |
| 51  | GET    | `/Teacher/children`                 | Assigned children             | bearer |
| 52  | GET    | `/Teacher/notes/{noteId}`           | Get feedback note             | bearer |
| 53  | POST   | `/Teacher/children/{childId}/notes` | Create feedback `{ content }` | bearer |
| 54  | PUT    | `/Teacher/notes/{noteId}`           | Edit feedback `{ content }`   | bearer |
| 55  | DELETE | `/Teacher/notes/{noteId}`           | Delete feedback               | bearer |

"Feedback" = **notes** on a child (plain text `content`). Listing a child's notes is **not
documented** (may be part of `/Teacher/children` — TBD). How Specialists read teacher notes is
**TBD**.

## 9. Super Admin

| #   | Method | Path                              | Purpose               | Auth   |
| --- | ------ | --------------------------------- | --------------------- | ------ |
| 56  | GET    | `/SuperAdmin/dashboard`           | Super Admin dashboard | bearer |
| 57  | GET    | `/SuperAdmin/users?Search=&Role=` | Users list            | bearer |
| 58  | GET    | `/SuperAdmin/children?Name=`      | Children list         | bearer |

Children item example: `{ id, fullName, birthDate, gender, parentId, parentName }`.
No create/update/delete user endpoints are documented for either Admin or Super Admin —
**user management is read-only** in the documented API (**TBD**).

## 10. Chat

| #   | Method | Path                                                  | Purpose                                        | Auth                      |
| --- | ------ | ----------------------------------------------------- | ---------------------------------------------- | ------------------------- |
| 59  | WS     | `wss://localhost:7256/chatHub` ("Hub / Chat1")        | Real-time hub (SignalR hub naming)             | TBD                       |
| 60  | POST   | `/api/Chats/send`                                     | Send message `{ conversationId                 | null, receiverId, text }` | bearer |
| 61  | GET    | `/api/Chats/conversations`                            | List conversations                             | bearer                    |
| 62  | GET    | `/Chats?conversationId=&receiverId=&take=`            | Open a conversation (by id or by receiver)     | bearer                    |
| 63  | GET    | `/api/Chats/unread-count`                             | Unread count                                   | bearer                    |
| 64  | GET    | `/Chats/messages/old?conversationId=&beforeId=&take=` | Older messages (cursor)                        | bearer                    |
| 65  | GET    | `/Chats/messages/new?conversationId=&afterId=&take=`  | Newer messages (cursor)                        | bearer                    |
| 66  | POST   | `/api/Chats/mark-conversation-seen?conversationId=`   | Mark seen                                      | bearer                    |
| 67  | GET    | `/Chats/users`                                        | Users you can chat with `[{ id, name, role }]` | bearer                    |

`conversationId: null` + `receiverId` starts a new conversation. Hub method/event names are
**not documented** — TBD. Search is client-side over `/Chats/users` (no search param).

## 11. Training Plan

| #   | Method | Path                                                                         | Purpose                                  | Auth   | Role (inferred)       |
| --- | ------ | ---------------------------------------------------------------------------- | ---------------------------------------- | ------ | --------------------- |
| 68  | GET    | `/TrainingPlan/specialist/children/{childId}`                                | Child's training plan                    | bearer | Specialist            |
| 69  | GET    | `/TrainingPlan/specialist/children/{childId}/available-activities?type=test` | Activities that can be assigned          | bearer | Specialist            |
| 70  | POST   | `/TrainingPlan/specialist/children/{childId}/activities`                     | Add activity `{ activityId }`            | bearer | Specialist            |
| 71  | DELETE | `/TrainingPlan/specialist/children/{childId}/activities/{activityId}`        | Remove activity                          | bearer | Specialist            |
| 72  | GET    | `/TrainingPlan/children/{childId}/activities/summary`                        | `{ gamesCount, testsCount, totalCount }` | bearer | TBD                   |
| 73  | GET    | `/TrainingPlan/children/{childId}/activities?type=test`                      | Child's plan activities                  | bearer | TBD (Parent/Teacher?) |
| 74  | GET    | `/TrainingPlan/children/{childId}/activities/{activityId}`                   | One plan activity                        | bearer | TBD                   |

- Available activity item: `{ id, title, description, iconUrl|null, type: "اختبارات", categoryId,
categoryName, isAssigned, questionCount }`.
- Plan activity (from add response): `{ id, activityId, title, description, iconUrl, type,
order, assignedAt, score|null, correctAnswers|null, wrongAnswers|null, isCompleted,
completedAt|null }`.
- **No endpoint to submit answers / complete a training-plan activity is documented** — TBD
  (critical for child play).
- "No training plan for this child" is returned as a message — whether a plan is created
  implicitly on first activity assignment is **TBD**.

## Endpoints the frontend will likely need but are not documented

| Need                                                                           | Status                                                              |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Current user / session info (`me`)                                             | Missing                                                             |
| Logout / token revoke / refresh                                                | Missing                                                             |
| Initial assessment result read (Admin / Parent)                                | Missing                                                             |
| Submit answers for training-plan activities                                    | Missing                                                             |
| Games: create/list (`/Admin/activities/game`?)                                 | Missing / TBD                                                       |
| List teachers (for Specialist assignment) / specialists (for Admin assignment) | Covered only by `/Admin/users?Role=` for Admin; none for Specialist |
| List teacher notes for a child (Specialist view)                               | Missing                                                             |
| Specialist review of assessment results                                        | Missing                                                             |
| User create/edit/delete/activate (Admin, SuperAdmin)                           | Missing                                                             |
| Categories for non-admin roles                                                 | Missing                                                             |
| Hub protocol (events/methods)                                                  | Missing                                                             |
