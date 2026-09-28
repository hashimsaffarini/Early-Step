# Implementation Plan

Derived from dependency analysis of the discovery docs (2026-09-28). Each stage follows
`DEVELOPMENT_WORKFLOW.md` and the Definition of Done in `CLAUDE.md`. Stages marked **BLOCKED**
cannot start until the listed backend/product questions are answered.

```text
0 Foundation ✅
1 Live API verification ──┐
2 Design system migration ┤
                          ▼
3 Authentication ─► 4 Authorization & shells ─┬─► 5 Parent + Children ─► 7 Initial assessment (runner)
                                              ├─► 6 Admin content (categories/activities/questions/composition) ─┘
                                              ├─► 8 Admin users + specialist assignment
                                              │      └─► 9 Specialist: children, training plans, assign teacher
                                              │             └─► 10 Teacher + feedback
                                              │             └─► 11 Reports
                                              ├─► 12 Dashboards (per role)
                                              ├─► 13 Chat
                                              └─► 14 Super Admin
15 Child activity play + games (BLOCKED on API)
16 Responsive / accessibility hardening (continuous, final pass)
17 QA / production audit
```

---

## Stage 0 — Foundation ✅

Done: tooling, architecture, HTTP layer, providers, router shell, docs. Commit `10c12f9`.

## Stage 1 — Live API verification (spike, no UI)

- **Objective:** turn documented-but-unverified contracts into verified facts.
- **Needs from user:** backend base URL, CORS for localhost, demo accounts (local only).
- **Work:** call login per role; record token format/expiry, user/role payload, role enum values
  (all five), gender/type enums, error body + status codes (400/401/403/404/422), 401 vs 403
  behaviour; confirm `/api` prefix rules; check each GET's response shape. Update
  `API_ENDPOINTS.md`, `ROLES_AND_PERMISSIONS.md` (PARTIAL → VERIFIED), `API_INTEGRATION.md`.
- **Acceptance:** Stage 2–4 blockers resolved or explicitly escalated.
- **Tests:** none (research). **Risk:** backend unavailable / unstable.

## Stage 2 — Design system migration

- **Objective:** apply the Replit visual language (`DESIGN_SYSTEM.md`) to tokens and primitives.
- **Screens:** none (primitives + layouts), a temporary internal preview page is optional.
- **Components:** tokens (colors incl. accessible `primary-strong`, fonts, radius, shadows),
  Button, IconButton, Input, PasswordInput, Textarea, Select, Checkbox, FormField, Card, Badge,
  Tabs, Modal, ConfirmDialog, Spinner, Skeleton, EmptyState/ErrorState/LoadingState restyle,
  PageHeader, PageBanner, StatCard, AppSidebar + MobileDrawer + NavItem, UserBadge.
- **Decisions first:** icon library (lucide-react ADR), fonts (Google vs self-host), dark mode
  (**out of scope**, ADR-016), animation approach (CSS vs framer-motion ADR), logo (name = Early Step).
- **Acceptance:** primitives match Replit screenshots; WCAG AA contrast; RTL; 400–1440 px.
- **Tests:** component tests for interactive primitives (Modal focus trap/escape, ConfirmDialog,
  PasswordInput toggle, FormField label association).
- **Risk:** Replit's inconsistent dialects — follow the token-based dialect.

## Stage 3 — Authentication

- **Screens:** login, register (role cards if multiple roles allowed), forgot password, reset
  password, change password.
- **Endpoints:** `/api/Auth/login`, `/api/Auth/register`, `/Auth/ForgotPassword`,
  `/Auth/reset-password`, `/Auth/change-password`.
- **Components:** LoginForm, RegisterForm, RoleCardPicker, PasswordStrengthMeter, ResetCodeForm.
- **Depends on:** 1 (login response, role values), 2.
- **Acceptance:** login for each role lands on its namespace; errors in Arabic; session survives
  reload (strategy per Stage 1); logout clears cache.
- **Tests:** schemas, forms, MSW flows, session parsing, 401 handling.
- **Risks:** no `me`/refresh endpoints; multipart login; Arabic role values.

## Stage 4 — Authorization & role shells

- **Objective:** `ProtectedRoute`, `RoleGuard`, permission map, per-role DashboardLayout nav,
  `/` redirect, unauthorized page.
- **Depends on:** 3.
- **Acceptance:** each role sees only its nav; cross-role URLs → `/unauthorized`.
- **Tests:** route/guard tests for all five roles + anonymous; permission unit tests.

## Stage 5 — Parent + Children

- **Screens:** parent home, children list, add/edit child, child profile (info + reports list +
  plan summary if allowed), delete confirm.
- **Endpoints:** `/Parent` (POST/PATCH/DELETE/GET), `/Parent/GetMyChildren`,
  `/Reports/child/{id}`, `/TrainingPlan/children/{id}/activities/summary` (if allowed).
- **Components:** ChildCard, ChildForm, ChildProfileHeader.
- **Depends on:** 4. **Decision:** Age vs birth date; gender values.
- **Tests:** child schema, form, CRUD invalidation, delete confirm.

## Stage 6 — Admin content (categories, activities, questions, options, assessment composition)

- **Screens:** categories CRUD, activities list/filter, activity editor with question/option
  editors (image uploads), initial-assessment composition.
- **Endpoints:** `/Admin/categories*`, `/Admin/categoriesActivity`, `/Admin/activities/test*`,
  `/Admin/activities/{id}/questions`, `/Admin/questions*`, `/Admin/question-options*`,
  `/initial-assessment/categories*`, `/initial-assessment/questions*`.
- **Depends on:** 4. **Blocked parts:** game type endpoints; add-option-to-existing-question.
- **Tests:** multipart builders, editor forms, destructive confirms, invalidation.
- **Risks:** multipart indexed keys; image URLs need API origin; question-type semantics.

## Stage 7 — Initial assessment (runner)

- **Screens:** intro, runner (question per screen, progress), completion; results (**BLOCKED**:
  no results endpoint).
- **Endpoints:** `start`, `answer`, `complete`.
- **Components:** `components/question-players` (choice first), AssessmentProgress.
- **Depends on:** 5 (child), 6 (content exists). **BLOCKED on:** start response, `{id}`
  semantics, non-single-choice payloads, operator (parent vs child), timing requirements.
- **Tests:** runner state machine, renderers, full MSW run.
- **Risks:** child UX (4–10), audio for pre-readers, focus/timing requirements.

## Stage 8 — Admin users + specialist assignment

- **Screens:** users list (role filter, search), user detail with children, assign specialist.
- **Endpoints:** `/Admin/users`, `/Admin/users/{id}`, `/Admin/assign-children-to-specialist`.
- **Depends on:** 4. **Gaps:** unassign; assessment results for review.
- **Tests:** filters, assignment dialog, invalidation.

## Stage 9 — Specialist: children, training plans, assign teacher

- **Screens:** dashboard (or in 12), assigned children, child page, training-plan editor,
  assign teacher.
- **Endpoints:** `/specialist/children`, `/TrainingPlan/specialist/*`, `/specialist/assign-teacher`.
- **Depends on:** 6 (activities exist), 8 (children assigned). **Gap:** teacher list endpoint.
- **Tests:** add/remove activity, assign teacher.

## Stage 10 — Teacher + feedback

- **Screens:** assigned children, child page (plan view + notes), note create/edit/delete.
- **Endpoints:** `/Teacher/children`, `/Teacher/children/{id}/notes`, `/Teacher/notes/{id}`,
  plan activities (role TBD).
- **Depends on:** 9. **Gap:** list notes per child; specialist view of notes.

## Stage 11 — Reports

- **Screens:** specialist list/create/edit/delete, parent child reports, PDF download.
- **Endpoints:** `/specialist/Reports`, `/specialist/CreateReport`, `/specialist/{id}`,
  `/Reports/child/{id}`, `/Reports/{id}/download`.
- **Depends on:** 9. **Tests:** form, blob download, destructive confirm.

## Stage 12 — Dashboards

- **Screens:** Admin, Specialist, Teacher, SuperAdmin dashboards; Parent home.
- **Endpoints:** role dashboard endpoints (shapes from Stage 1).
- **Rule:** display only real data — no fabricated stats (Replit's "85%").

## Stage 13 — Chat

- **Screens:** conversation list, thread, contact picker, unread badge in nav.
- **Endpoints:** `/api/Chats/*`, `/Chats*`, hub.
- **Decisions:** SignalR client (ADR) vs polling `/Chats/messages/new`; hub protocol (**BLOCKED**
  until documented; polling fallback possible).
- **Tests:** cursor merging, send, seen, unread.

## Stage 14 — Super Admin

- **Screens:** dashboard, users, children overview.
- **Endpoints:** `/SuperAdmin/*`. **BLOCKED on:** SuperAdmin vs Admin differentiation.

## Stage 15 — Child activity play + games (BLOCKED)

- **Blocked on:** submit endpoint for training-plan activities; game endpoints; game scope
  decision (content vs custom logic); answer payloads; audio.
- **Scope when unblocked:** order and match players, activity player shell, results.

## Stage 16 — Responsive & accessibility hardening

Continuous per stage; final pass at 360/400/768/1024/1440 px, keyboard-only run, screen reader
spot checks (Arabic), contrast audit, reduced motion.

## Stage 17 — QA / production audit

Full role walkthroughs against staging, security review, bundle size, error states, `npm audit`,
docs consistency, deployment config (TBD target).
