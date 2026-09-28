# User Flows

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

| Step             | API                                                    | Replit                                 | Notes                               |
| ---------------- | ------------------------------------------------------ | -------------------------------------- | ----------------------------------- |
| Select child     | from children list                                     | "ابدأ التقييم الأولي" on child profile |                                     |
| Intro            | —                                                      | Section grid (4 domains), "play all"   | Intro content **TBD**               |
| Start            | `POST /initial-assessment/{childId}/start`             | none (client only)                     | Response **TBD**                    |
| Sections         | by category (_inference_)                              | 4 hard-coded mini-games                |                                     |
| Answer           | `POST /initial-assessment/{id}/answer` (single option) | client-scored                          | Multi/sequence payload **GAP**      |
| Complete         | `POST /initial-assessment/{id}/complete`               | `POST` 4 scores                        |                                     |
| Results (parent) | **GAP**                                                | Client results screen                  | Whether parent sees results **TBD** |
| Who operates     | **TBD**                                                | parent's session                       | Child login not supported by either |

See `docs/ACTIVITY_ENGINE.md`.

## 3. Admin review and specialist assignment

```text
Assessment completed → Admin sees result → Admin reviews child → Admin assigns Specialist
```

| Step                             | API                                                                      | Replit                                 | Notes                             |
| -------------------------------- | ------------------------------------------------------------------------ | -------------------------------------- | --------------------------------- |
| Admin sees completed assessments | **GAP** (no results endpoint; dashboard shape unknown)                   | none                                   |                                   |
| Admin browses users/children     | `GET /Admin/users?Role&Search`, `GET /Admin/users/{id}` (with children)  | none for Admin (SuperAdmin panel only) |                                   |
| Admin finds specialists          | `GET /Admin/users?Role=<specialist role value>`                          | —                                      | Role filter value **TBD**         |
| Assign specialist                | `POST /Admin/assign-children-to-specialist { specialistId, childIds[] }` | none in UI                             | Bulk assignment; unassign **GAP** |

## 4. Specialist workflow

```text
Assigned child → Review → Training plan → Add activities → Assign teacher
```

| Step                  | API                                                          | Replit                        | Notes                             |
| --------------------- | ------------------------------------------------------------ | ----------------------------- | --------------------------------- |
| Dashboard             | `GET /specialist/dashboard`                                  | Purple dashboard, risk badges | Shape **TBD**                     |
| Assigned children     | `GET /specialist/children`                                   | child cards                   |                                   |
| Review assessment     | **GAP**                                                      | AI evaluation / reports       |                                   |
| View plan             | `GET /TrainingPlan/specialist/children/{childId}`            | IEP (free text)               | Concepts differ                   |
| Available activities  | `GET …/available-activities?type=`                           | assign modal                  |                                   |
| Add / remove activity | `POST` / `DELETE …/activities`                               | assign modal (no remove)      |                                   |
| Assign teacher        | `POST /specialist/assign-teacher { teacherId, childIds[] }`  | none                          | **How to list teachers is a GAP** |
| Read teacher feedback | **GAP**                                                      | none                          |                                   |
| Reports               | `/specialist/CreateReport`, edit, delete, list, PDF download | AI + manual report builder    | See §6                            |

## 5. Teacher workflow

```text
Assigned child → View plan → Follow child → Submit feedback
```

| Step              | API                                                                            | Replit                       | Notes                        |
| ----------------- | ------------------------------------------------------------------------------ | ---------------------------- | ---------------------------- |
| Dashboard         | `GET /Teacher/dashboard`                                                       | Teacher dashboard            |                              |
| Assigned children | `GET /Teacher/children`                                                        | student cards                |                              |
| View plan         | `GET /TrainingPlan/children/{childId}/activities` (_role TBD_)                 | child profile activities tab |                              |
| Follow progress   | plan activity results (`score`, `isCompleted`)                                 | charts                       | No history/progress endpoint |
| Feedback CRUD     | `POST /Teacher/children/{childId}/notes`, `GET/PUT/DELETE /Teacher/notes/{id}` | none                         | List notes **GAP**           |

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

| Step                    | API                                                                                    | Replit                                              |
| ----------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Dashboard               | `GET /SuperAdmin/dashboard`                                                            | Dark full-screen panel, overview stats              |
| Users                   | `GET /SuperAdmin/users?Search&Role` (read-only)                                        | list + change role + delete                         |
| Children                | `GET /SuperAdmin/children?Name`                                                        | read-only cards                                     |
| Differentiator vs Admin | **TBD** — API shows SuperAdmin as read-only oversight; Admin owns content & assignment | SuperAdmin is the only role with a management panel |
