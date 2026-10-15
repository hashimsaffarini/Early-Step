# User Flows

> **Update 2026-10-14 (live-verified):** login and reload go through `GET Auth/me`; the initial
> assessment takes real MultiSelect / Sequence answers; the admin picks specialists from
> `GET Admin/specialists`; the specialist sees each activity's score, the plan progress, the
> child's answers (`…/result`) and the teacher's notes (`Teacher/children/{childId}/feedbacks`).
> Business rules (2026-10-14): the parent's assessment flow ends with the submission (the saved
> result is for staff); a child with saved results and a played activity are kept (delete /
> remove are blocked in the app); chat is REST + polling. Remaining blocker: staff created by the
> Super Admin cannot log in. Current list: `BACKEND_REQUESTS.md`.

> **Update 2026-10-10 (live-verified):** the assessment result is saved and readable later
> (`GET initial-assessment/{childId}/result` — assessment page after refresh, child profile for
> parent and staff); a child's plan activity is played and **saved**
> (`POST …/activities/{planActivityId}/submit`, one attempt), and the specialist sees the counts in
> the plan. Still open: Admin reading the assessment composition (403), the plan-result endpoint
> (403 for our roles), multi-option assessment answers, teacher-feedback reading by the specialist.
> Current list: `BACKEND_REQUESTS.md`.

> **Update 2026-10-06:** the flows below are now wired to the backend endpoints with mocked HTTP
> (not live-verified). Differences from the original flows: the parent enters the child's **age**
> (no birth date in the API); assessment results, training-plan result submission, teacher
> listing for specialists and teacher-note history are **blocked by the backend**, so those steps
> end in honest "not available yet" states. See `BACKEND_INTEGRATION_STATUS.md`.

Discovery mapping (2026-09-28). Each step is tagged:

- **API** — supported by a documented endpoint (`docs/API_ENDPOINTS.md`; not yet verified live)
- **Replit** — exists in the Replit prototype UI (different backend)
- **GAP** — neither documents it / contract missing (**TBD**)

Live verification with demo accounts is **pending** (backend base URL not yet provided).

## 1. Parent onboarding

```text
Register → Login → Dashboard → Add Child → Child Profile
```

| Step                    | API                                                                                           | Replit                                              | Notes                                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Register                | `POST /api/Auth/register` (multipart; role `ولي أمر`)                                         | Role cards: Parent / Teacher / Specialist           | Which roles may self-register is **TBD**; Replit logs in automatically after register — API behaviour **TBD** |
| Login                   | `POST /api/Auth/login` (multipart, `rememberMe`)                                              | Email + password, redirect by role                  | Response/token shape **TBD**                                                                                  |
| Forgot / reset password | `POST /Auth/ForgotPassword`, `POST /Auth/reset-password` (email + code)                       | Two screens (code + link token)                     | API uses code only                                                                                            |
| Dashboard               | Parent dashboard endpoint **GAP** (only Admin/Specialist/Teacher/SuperAdmin dashboards exist) | Stats, rewards, charts (partly fabricated)          | Parent landing content **TBD**                                                                                |
| Add child               | `POST /Parent` (FullName, Age, gender)                                                        | Dialog: name, birth date, developmental age, gender | API uses **Age**, Replit uses birth date — **conflict**                                                       |
| Children list           | `GET /Parent/GetMyChildren`                                                                   | Card grid + search                                  |                                                                                                               |
| Child profile           | `GET /Parent/{childId}`                                                                       | Tabs: overview (skills radar), activities, reports  | Response shape **TBD**                                                                                        |
| Edit / delete child     | `PATCH` / `DELETE /Parent/{childId}`                                                          | **No UI**                                           |                                                                                                               |

## 2. Initial assessment

```text
Select child → Intro → Start → Section → Question/Activity → Submit answer → Complete → Results
```

| Step          | API                                                              | Replit                                 | Notes                                                                                             |
| ------------- | ---------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Select child  | from children list                                               | "ابدأ التقييم الأولي" on child profile |                                                                                                   |
| Intro         | —                                                                | Section grid (4 domains), "play all"   | Intro content **TBD**                                                                             |
| Start         | `POST /initial-assessment/{childId}/start`                       | none (client only)                     | Response **TBD**                                                                                  |
| Sections      | by category (_inference_)                                        | 4 hard-coded mini-games                |                                                                                                   |
| Answer        | `POST /initial-assessment/{id}/answer`                           | client-scored                          | Verified 2026-10-14: one option / exact set / exact order per type                                |
| Complete      | `POST /initial-assessment/{id}/complete`                         | `POST` 4 scores                        |                                                                                                   |
| Done (parent) | `complete` response + `GET /initial-assessment/{childId}/result` | Client results screen                  | The parent sees a submission confirmation only; the saved result is staff-only (product decision) |
| Who operates  | **TBD**                                                          | parent's session                       | Child login not supported by either                                                               |

See `docs/ACTIVITY_ENGINE.md`.

### 2b. Child plays a training-plan activity (verified 2026-10-10, re-verified 2026-10-14)

```text
Child profile → Activities → Play → answer every question → Submit (once) → plan refreshed
```

SingleChoice (tap one), MultiSelect (toggle several), Sequence (tap in order) are submitted together
to `POST /TrainingPlan/children/{childId}/activities/{planActivityId}/submit`. Every question must be
answered; a completed activity cannot be submitted again (409). No right/wrong feedback for the
child; the specialist sees the score and the child's answers.

## 3. Admin review and specialist assignment

```text
Assessment completed → Admin sees result → Admin reviews child → Admin assigns Specialist
```

| Step                             | API                                                                      | Replit                                 | Notes                                                   |
| -------------------------------- | ------------------------------------------------------------------------ | -------------------------------------- | ------------------------------------------------------- |
| Admin sees completed assessments | `GET /initial-assessment/{childId}/result` (Admin allowed)               | none                                   | No list of completed assessments; per-child result only |
| Admin browses users/children     | `GET /Admin/users?Role&Search`, `GET /Admin/users/{id}` (with children)  | none for Admin (SuperAdmin panel only) |                                                         |
| Admin finds specialists          | `GET /Admin/specialists` (`isActive` included)                           | —                                      | Verified 2026-10-14; inactive ones cannot be picked     |
| Assign specialist                | `POST /Admin/assign-children-to-specialist { specialistId, childIds[] }` | none in UI                             | Bulk assignment; unassign **GAP**                       |

## 4. Specialist workflow

```text
Assigned child → Review → Training plan → Add activities → Assign teacher
```

| Step                    | API                                                          | Replit                        | Notes                                                                                      |
| ----------------------- | ------------------------------------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------ |
| Dashboard               | `GET /specialist/dashboard`                                  | Purple dashboard, risk badges | Shape **TBD**                                                                              |
| Assigned children       | `GET /specialist/children`                                   | child cards                   |                                                                                            |
| Review assessment       | `GET /initial-assessment/{childId}/result` (child profile)   | AI evaluation / reports       | Verified 2026-10-10                                                                        |
| View plan               | `GET /TrainingPlan/specialist/children/{childId}`            | IEP (free text)               | Concepts differ                                                                            |
| Available activities    | `GET …/available-activities?type=`                           | assign modal                  |                                                                                            |
| Add / remove activity   | `POST` / `DELETE …/activities`                               | assign modal (no remove)      |                                                                                            |
| Assign teacher          | `POST /specialist/assign-teacher { teacherId, childIds[] }`  | none                          | teachers from `GET /specialist/teachers`; needed before the first activity (400 otherwise) |
| Read teacher feedback   | `GET /Teacher/children/{childId}/feedbacks`                  | none                          | Verified 2026-10-14 (Specialist); "ملاحظات المعلم" tab                                     |
| Follow activity results | plan `score`, `progress`; `GET …/{planActivityId}/result`    | charts                        | Verified 2026-10-14 (Specialist only)                                                      |
| Reports                 | `/specialist/CreateReport`, edit, delete, list, PDF download | AI + manual report builder    | See §6                                                                                     |

## 5. Teacher workflow

```text
Assigned child → View plan → Follow child → Submit feedback
```

| Step                 | API                                                                                                  | Replit                       | Notes                                                                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard            | `GET /Teacher/dashboard`                                                                             | Teacher dashboard            |                                                                                                                                          |
| Assigned children    | `GET /Teacher/children`                                                                              | student cards                |                                                                                                                                          |
| View plan            | `GET /TrainingPlan/children/{childId}/activities` (_role TBD_)                                       | child profile activities tab |                                                                                                                                          |
| Follow progress      | plan counts (`correctAnswers`, `wrongAnswers`, `isCompleted`, `completedAt`) after the child submits | charts                       | Teacher unverified (no usable account). The assessment result is staff-only: the Teacher sees a neutral note, the endpoint is not called |
| Feedback list + CRUD | `GET /Teacher/children/{childId}/feedbacks`, `POST …/notes`, `PUT/DELETE /Teacher/notes/{id}`        | none                         | Mock- and browser-tested (mock mode); live Teacher blocked                                                                               |

## 6. Reporting

| Step                   | API                                                                                         | Replit                                                             | Notes             |
| ---------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------- |
| Create                 | Specialist: `POST /specialist/CreateReport { childId, title, weaknesses, recommendations }` | Specialist/Admin/SuperAdmin; AI or manual; strengths + probability | Field sets differ |
| Edit / delete          | `PUT` / `DELETE /specialist/{reportId}`                                                     | none                                                               |                   |
| List (specialist)      | `GET /specialist/Reports`                                                                   | list with risk filters                                             |                   |
| Child reports (parent) | `GET /Reports/child/{childId}`                                                              | list                                                               |                   |
| Download               | `GET /Reports/{reportId}/download` → server PDF                                             | client html2canvas PDF                                             | Use server PDF    |

## 7. Chat

```text
Conversation list → Search/open conversation → Messages → Send → Unread → Seen
```

| Step              | API                                                                        | Replit                    | Notes                               |
| ----------------- | -------------------------------------------------------------------------- | ------------------------- | ----------------------------------- |
| Conversation list | `GET /api/Chats/conversations`                                             | polled every 3 s          | Item shape **TBD**                  |
| Contacts / search | `GET /Chats/users` → `[{ id, name, role }]` (client-side filter)           | modal of all users        | Who can message whom **TBD**        |
| Open conversation | `GET /Chats?conversationId=` or `?receiverId=`                             | open by id                |                                     |
| History           | `GET /Chats/messages/old?beforeId&take`                                    | none (loads all)          | Cursor pagination                   |
| New messages      | Hub `…/chatHub` (SignalR, events TBD) or `GET /Chats/messages/new?afterId` | 3 s polling               | Prefer hub + fallback polling       |
| Send              | `POST /api/Chats/send { conversationId                                     | null, receiverId, text }` | two-step                            | First message creates conversation |
| Unread            | `GET /api/Chats/unread-count`                                              | localStorage heuristic    |                                     |
| Seen              | `POST /api/Chats/mark-conversation-seen?conversationId=`                   | none                      | Read receipts beyond "seen" **TBD** |

## 8. Super Admin

| Step                    | API                                                                                                                            | Replit                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| Dashboard               | `GET /SuperAdmin/dashboard` (totals + `usersByRole` tiles)                                                                     | Dark full-screen panel, overview stats              |
| Users                   | `GET /SuperAdmin/users?Search&Role` (`isActive` → "موقوف"); create staff `POST`, deactivate `DELETE`, re-activate `PUT …/{id}` | list + change role + delete                         |
| Children                | `GET /SuperAdmin/children?Name`                                                                                                | read-only cards                                     |
| Differentiator vs Admin | **TBD** — API shows SuperAdmin as read-only oversight; Admin owns content & assignment                                         | SuperAdmin is the only role with a management panel |
