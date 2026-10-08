# Gap Analysis — Requirements vs Replit vs Backend API

Discovery audit, 2026-09-28. Sources: written requirements (user brief), Replit prototype source

- running app (public screens), Apidog API docs. Live API behaviour **not yet verified**.

## Classification legend

- **Fully Supported** — required, API documented, Replit UI exists
- **Backend Exists / UI Missing** — API documented, no Replit UI
- **UI Exists / Backend Missing** — Replit UI exists, no documented API
- **Partially Supported** — some parts documented/present, key parts missing
- **TBD** — cannot classify without clarification
- **Out of Scope** — not required and no API support (default for Replit-only extras unless the
  product owner decides otherwise)

## Critical architectural finding

The Replit project is a **full-stack prototype with its own backend** (Express 5 + PostgreSQL +
Drizzle, session cookies, integer IDs, English enum values, OpenAI evaluation). **It never calls
the real Early Step API.** Replit is therefore a **visual/UX reference only**; its data flows,
permissions and business rules are not evidence of real backend behaviour.

## Feature matrix

| Feature                                         | Requirements                            | Replit                                                     | API                                                                | Classification                                |
| ----------------------------------------------- | --------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------- |
| Registration                                    | Parent registers                        | Parent/Teacher/Specialist self-register                    | `register` with role string                                        | Partially Supported — allowed roles TBD       |
| Login / logout                                  | Yes                                     | Session login/logout                                       | Login only; no logout / me / refresh                               | Partially Supported                           |
| Forgot / reset / change password                | —                                       | Forgot + reset (token + code)                              | Forgot, reset (code), change                                       | Backend Exists / UI Missing (change password) |
| Add child                                       | Yes                                     | Name, birth date, dev. age, gender                         | FullName, **Age**, gender                                          | Partially Supported — field conflict          |
| Edit / delete child                             | Yes                                     | **No UI**                                                  | PATCH / DELETE                                                     | Backend Exists / UI Missing                   |
| Initial assessment (compose)                    | Admin-configured (implied)              | Hard-coded 4 games                                         | Categories + questions composition                                 | Backend Exists / UI Missing                   |
| Initial assessment (take)                       | Tests and/or games                      | 4 client-scored mini-games                                 | start / answer / complete                                          | Partially Supported — payloads, results TBD   |
| Assessment results to Admin                     | Yes                                     | No                                                         | **No endpoint**                                                    | TBD (blocking)                                |
| Admin assigns specialist                        | Yes                                     | No UI                                                      | `assign-children-to-specialist`                                    | Backend Exists / UI Missing                   |
| Categories CRUD                                 | Yes                                     | No (free-text skillType)                                   | Documented                                                         | Backend Exists / UI Missing                   |
| Activities CRUD (tests)                         | Yes                                     | No admin UI (API open to all)                              | Documented                                                         | Backend Exists / UI Missing                   |
| Activities CRUD (games)                         | Yes                                     | Hard-coded components                                      | Not documented                                                     | TBD — scope decision (see ACTIVITY_ENGINE)    |
| Questions / options                             | Implied                                 | JSON blob                                                  | Documented (no add-option)                                         | Backend Exists / UI Missing                   |
| Training plan                                   | Specialist creates, contains activities | IEP (free text) + ad-hoc assignments                       | Documented (add/remove/list)                                       | Partially Supported — concepts differ         |
| Child plays plan activity                       | Yes                                     | Test/game players (buggy)                                  | **No submit endpoint**                                             | TBD (blocking)                                |
| Specialist assigns teacher                      | Yes                                     | No UI                                                      | `assign-teacher`; no teacher list                                  | Partially Supported                           |
| Teacher feedback                                | Initial/ongoing feedback                | None                                                       | Notes CRUD (no list)                                               | Backend Exists / UI Missing                   |
| Specialist monitors progress                    | Yes                                     | Charts (partly fabricated)                                 | Plan results + summary only                                        | Partially Supported                           |
| Reports                                         | Yes                                     | AI + manual, client PDF                                    | Manual CRUD + server PDF                                           | Partially Supported — field sets differ       |
| Chat                                            | Yes                                     | Polling, no seen state                                     | REST + SignalR hub + unread/seen + cursor pages                    | Backend Exists / UI Partially exists          |
| Role dashboards                                 | Yes                                     | Parent/Admin shared, Specialist, Teacher, SuperAdmin panel | Admin, Specialist, Teacher, SuperAdmin (shapes TBD); **no Parent** | Partially Supported                           |
| User management                                 | Yes                                     | SuperAdmin: role change + delete                           | Read-only lists                                                    | UI Exists / Backend Missing (mutations)       |
| Super Admin role                                | Yes                                     | Management panel                                           | Dashboard + read-only lists                                        | TBD — differentiator unclear                  |
| Notifications                                   | —                                       | Bell + list                                                | None                                                               | Out of Scope (unless requested)               |
| Gamification (XP, badges, streaks, leaderboard) | —                                       | Yes                                                        | None                                                               | Out of Scope                                  |
| AI evaluation / risk probability                | —                                       | Yes (OpenAI)                                               | None                                                               | Out of Scope                                  |
| Skills analysis / radar charts                  | —                                       | Yes                                                        | None                                                               | Out of Scope                                  |
| IEP plans                                       | —                                       | Yes                                                        | None (Training Plan instead)                                       | Out of Scope — superseded by Training Plan    |
| Difficulty levels                               | —                                       | Dead code                                                  | None                                                               | Out of Scope                                  |
| Dark mode                                       | —                                       | Yes (follows OS)                                           | n/a                                                                | Out of Scope (ADR-016)                        |
| English language toggle                         | **Excluded** (Arabic only)              | Code exists, toggle never rendered                         | n/a                                                                | Out of Scope                                  |
| Landing page                                    | —                                       | Yes (fabricated stats)                                     | n/a                                                                | TBD — keep design, drop claims                |
| Timing / response speed / focus                 | Mentioned in product vision             | Only per-question countdown                                | None                                                               | TBD                                           |

## Contradictions (not resolved — need decisions)

1. **Role values.** API uses Arabic (`ولي أمر`); Replit + foundation use English keys.
2. **Child age.** API `Age` (number as string) vs Replit/API responses `birthDate`.
3. **Gender values.** Request `بنت`/`ولد` vs edit response `Female`.
4. **Activity type value.** Arabic `اختبارات` in responses vs `type=test` query.
5. **Product name.** _Resolved: **Early Step** (ADR-016)._ Replit UI brand is **مستكشف القدرات** ("Ability Explorer"); project name is
   **Early Step**. Logo still TBD.
6. **Games.** Requirements say admin creates games; Replit games are code; API has no game endpoints.
7. **Training plan vs IEP.** Replit's IEP (free-text goals) vs API's activity-list plan.
8. **Reports.** Replit: strengths + AI probability; API: title + weaknesses + recommendations.
9. **Who creates reports.** Replit allows Admin/SuperAdmin; API only under `/specialist`.
10. **SuperAdmin powers.** Replit: role change/delete; API: read-only.
11. **Registration roles.** Replit UI: Parent/Teacher/Specialist; requirements: Parent registers;
    API: role field present, allowed values unknown.
12. **Replit uses mock/fabricated data** (85% progress, landing stats) although real metrics are
    not available from either backend.

## Missing backend capabilities (to raise with backend team)

- Base URL / environments; CORS for the frontend origin
- Login response shape, token type/lifetime, refresh, logout, `me`
- Role enum values (all five), gender enum, activity type enum
- Error response format and status codes
- Initial assessment: start response, answer payloads for non-single-choice, results read
- Training plan: activity play/submit endpoint
- Games endpoints (if games are content)
- Lists: teachers (for specialist), notes per child, add option to existing question
- Unassign specialist/teacher
- User management mutations (if required)
- Chat hub protocol (methods/events, auth)
- Parent dashboard data

## Backend integration findings (2026-10-06)

Confirmed while integrating against the live Swagger (details and status per capability in
`BACKEND_INTEGRATION_STATUS.md`; security issues in `SECURITY.md`):

- **Resolved:** base URL, `/api` prefix (all paths), error formats, child model (age, not birth
  date), gender values, three role values.
- **Still missing on the backend:** login response contract and `me`/refresh/logout; assessment
  results; non-single-choice answer payloads; training-plan result submission; activities list
  for non-admin roles; admin children list and staff child detail; teacher list for specialists;
  teacher-note listing; user management; admin/super-admin reports; report by id; adding one
  option to a question; listing initial-assessment questions; activity feeds; real-time hub;
  notifications.
- **Product decisions taken (documented, reversible):** report authors = Specialists; only parents
  start the initial assessment; tests/games catalogues for non-admin roles are local practice;
  Replit's free-text plans and report "strengths" removed (no API fields).

### Live verification round (2026-10-06)

- **Resolved:** login contract and role values; teacher listing for specialists
  (`GET specialist/teachers`, assignment UI added); assessment categories now return ids.
- **Still missing:** assessment results endpoint (backend says it exists — not in Swagger/Apidog,
  pending clarification); teacher notes list (`Teacher/feedbacks` in Apidog but 404 live); Teacher
  demo account; authorization to run write flows on disposable records.
- **Inconsistencies reported:** `initial-assessment/categories` vs `isInInitialAssessment` flags;
  `parentName` containing emails; `Chats/users` exposing all users.

### Re-verification after the backend update (2026-10-08)

Current list: `BACKEND_REQUESTS.md`. Earlier "missing" items above are superseded by it.

- **Resolved:** anonymous access on the last two endpoints; delete-all-options; forgot-password
  enumeration; `Teacher/feedbacks` deployed (Teacher-only, shape unverified — no Teacher account);
  first plan activity creates the plan once a teacher is assigned.
- **Decided by the backend team:** one initial-assessment report per child (frontend now models a
  single report); assessment results are returned by `complete` (no GET); `Matching` removed;
  refresh token and notifications out of scope; broad CORS kept for development.
- **Still open:** two option-less assessment questions block every completion; `Chats/users` 500
  for Parent/Specialist; result not readable after the session; MultiSelect/Sequence answered with
  one option (Sequence never scored correct); no plan-activity result submission; no deployed
  SignalR hub; registration role rule to confirm; Teacher demo account.
- **Product conflict to note:** the written flow has the specialist monitoring progress and
  reading teacher feedback, but `Teacher/feedbacks` is Teacher-only and plan results cannot be
  submitted — raised as questions, not assumed.
