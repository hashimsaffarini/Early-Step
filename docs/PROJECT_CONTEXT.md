# Project Context

## What Early Step is

Early Step is a web platform for children aged approximately **2–10** who may experience
**learning difficulties**. It supports early assessment through tests and games, specialist
training plans, and progress follow-up by teachers and specialists, with parents involved
from the start.

It is a graduation project.

## Target users

| Actor      | Backend value | Arabic label | Summary (known)                                                                              |
| ---------- | ------------- | ------------ | -------------------------------------------------------------------------------------------- |
| Parent     | `Parent`      | ولي الأمر    | Registers, adds children                                                                     |
| Teacher    | `Teacher`     | المعلم       | Follows assigned child progress, gives feedback                                              |
| Specialist | `Specialist`  | الأخصائي     | Creates training plans, assigns teachers, monitors progress                                  |
| Admin      | `Admin`       | المدير       | Reviews assessment results, assigns specialists, manages activities/categories               |
| SuperAdmin | `SuperAdmin`  | المدير العام | TBD (likely user/admin management — unconfirmed)                                             |
| Child      | —             | —            | Completes assessments/tests/games. **Whether the child has their own account/login is TBD.** |

Backend role values are TBD until confirmed from the API documentation.

## High-level workflow (known)

1. Parent registers.
2. Parent adds children.
3. Child completes an **initial assessment** made of tests/games.
4. Admin reviews the result.
5. Admin assigns a Specialist.
6. Specialist creates a **training plan** containing tests/games.
7. Specialist assigns a Teacher.
8. Teacher follows the child's progress and provides feedback.
9. Specialist monitors progress.

## Language

- Arabic only, right-to-left.
- No localization system and no language switcher.
- Backend values may remain in English; the frontend maps them to Arabic labels for display.

## Frontend responsibility

- Presentation, navigation, and forms for every role.
- Client-side validation (mirrors, never replaces, backend validation).
- Role-aware routing and rendering (UX only — the backend enforces authorization).
- Child-facing test/game experiences (details TBD).
- Consuming the backend API; the frontend does not own business data.

## Pending external references

| Reference                             | Status                                                                      |
| ------------------------------------- | --------------------------------------------------------------------------- |
| GitHub repository                     | ✅ https://github.com/hashimsaffarini/Early-Step                            |
| Existing Replit project (design ref.) | ✅ https://replit.com/@Zainmoneer04/Earlysteps (audited: `REPLIT_AUDIT.md`) |
| API documentation                     | ✅ https://e3mockwfb7.apidog.io/ (mapped: `API_ENDPOINTS.md`)               |
| Backend base URL                      | TBD                                                                         |
| Demo accounts (one per role)          | TBD — never committed                                                       |
| UI screenshots                        | TBD                                                                         |
| Feature priorities                    | TBD                                                                         |
| Deployment target                     | TBD                                                                         |

## Discovery notes (2026-09-28)

- **Decided:** the product name is **Early Step** (ADR-016). The Replit prototype brands the product **مستكشف القدرات** ("Ability Explorer"). Logo design is still
  **TBD**.
- Child login: neither the API nor Replit has a child account. Children play inside an adult's
  session (operator role TBD).
- Detailed findings: `REPLIT_AUDIT.md`, `API_ENDPOINTS.md`, `GAP_ANALYSIS.md`.
