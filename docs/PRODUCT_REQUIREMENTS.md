# Product Requirements

Only **known** requirements are listed. Everything not yet verified against the API
documentation, the Replit application, or the user is marked **TBD**. Do not implement TBD
items without confirmation.

## Global requirements (confirmed)

- Arabic-only UI, RTL layout. No localization or language switcher.
- Responsive: desktop, laptop, tablet, mobile.
- Five roles: Parent, Teacher, Specialist, Admin, SuperAdmin.
- Role-based dashboards.
- Part of the app is used directly by young children (4–10).
- Visual design follows the existing Early Step Replit app.

## Modules

| Module             | Known scope                                                                                                             | Status                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Authentication     | Login; Parent registration                                                                                              | Details TBD (flow, fields, token type, password reset?) |
| Parent             | Registers, adds children                                                                                                | Other capabilities TBD                                  |
| Teacher            | Follows child progress, gives feedback                                                                                  | TBD                                                     |
| Specialist         | Creates training plans (tests/games), assigns Teacher, monitors progress                                                | TBD                                                     |
| Admin              | Reviews initial assessment results, assigns Specialist, CRUD for activities and categories, user management (scope TBD) | TBD                                                     |
| Super Admin        | TBD                                                                                                                     | TBD                                                     |
| Children           | Parent adds children (add/edit mentioned)                                                                               | Fields TBD                                              |
| Initial Assessment | Contains tests/games; completed by child; reviewed by Admin                                                             | Structure, scoring TBD                                  |
| Activities         | Admin CRUD                                                                                                              | Relationship to tests/games TBD                         |
| Tests              | Part of assessments and training plans                                                                                  | Types, format TBD                                       |
| Games              | Part of assessments and training plans                                                                                  | Types, mechanics TBD                                    |
| Categories         | Admin CRUD                                                                                                              | What they categorize TBD                                |
| Training Plans     | Created by Specialist; contain tests/games                                                                              | Structure, scheduling TBD                               |
| Feedback           | Teacher provides feedback on child progress                                                                             | Format TBD                                              |
| Reports            | Exist                                                                                                                   | Content, audience TBD                                   |
| Progress           | Tracked for children; viewed by Teacher, Specialist                                                                     | Metrics TBD; parent visibility TBD                      |
| Chat               | Exists                                                                                                                  | Participants, real-time transport TBD                   |
| User management    | Exists                                                                                                                  | Which roles manage whom TBD                             |

## Open questions (TBD)

- Does the child log in separately, or play within a parent/teacher session?
- Who can see assessment results and reports (parent included?)
- Is chat real-time (WebSocket/SignalR/etc.) or polling?
- Are games built in the frontend, embedded, or served by the backend?
- Is there media (audio/images) in tests/games? Where is it hosted?
- Notifications?
- Feature priority order.

## Discovery update (2026-09-28)

Answers found during discovery (see `GAP_ANALYSIS.md` for the full matrix):

- **Chat:** API has REST + a SignalR-style hub (`/chatHub`), unread count and "seen".
- **Games:** Replit implements games as hard-coded frontend components; the API models activities
  as question/option content with no game-engine field. Scope decision pending
  (`ACTIVITY_ENGINE.md` §4).
- **Media:** API supports images on activities (icon), questions and options (`/uploads/...`).
  No audio.
- **Child login:** not supported by either system.
- **Notifications:** Replit only; no API — out of scope unless requested.
- **Reports:** manual, specialist-authored (`title`, `weaknesses`, `recommendations`), server PDF.
- **Feedback:** teacher "notes" (free text) per child.
- **Progress:** only training-plan activity results (`score`, `correctAnswers`, `wrongAnswers`,
  `isCompleted`) and counts summary.

Still open: which roles self-register; parent visibility of results/progress; Super Admin scope;
timing/response-speed/focus metrics; feature priority order.
