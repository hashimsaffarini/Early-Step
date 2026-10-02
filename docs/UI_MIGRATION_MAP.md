# UI Migration Map — Replit → new React app

Maps every Replit screen/component (visual reference) to its home in this codebase. **Every row
has a status** — ✅ Implemented · ⛔ Excluded (intentional) · — N/A. The per-screen comparison
with routes and differences is in [`UI_COMPLETENESS_AUDIT.md`](UI_COMPLETENESS_AUDIT.md). Routes
follow `ROUTING.md` (`{role}` = parent/teacher/specialist/admin); features follow
`ARCHITECTURE.md` (ADR-014, ADR-019). "Reuse" = what was carried over: **V** visual design,
**L** layout, **C** Arabic copy, **I** interaction pattern. Replit logic, data model and
fabricated numbers were never carried over. All screens use local mock data (`MOCK_DATA.md`).

## 1. Shell & layouts

| Replit screen/component                 | New location                                                                         | Reuse | Status                                             |
| --------------------------------------- | ------------------------------------------------------------------------------------ | ----- | -------------------------------------------------- |
| `components/layout.tsx` desktop sidebar | `components/layout/DashboardLayout` + `SidebarContent`, `app/layouts/RoleAreaLayout` | V L C | ✅ nav per role in `app/layouts/areaNavigation.ts` |
| Mobile header + drawer                  | `DashboardLayout` + `MobileNavDrawer`                                                | V L   | ✅ drawer on the right (RTL fix)                   |
| Theme toggle                            | —                                                                                    | —     | ⛔ out of scope (ADR-016)                          |
| Notifications bell + dropdown           | `features/notifications` `NotificationsMenu` (wired in `RoleAreaLayout`)             | V I   | ✅ in-viewport panel, sheet on mobile              |
| Unread messages badge                   | `NavLinkItem.badgeCount` (count from `features/chat`)                                | V     | ✅ anchored on the icon                            |
| Auth pages card + background            | `components/layout/AuthLayout` + `features/auth/components/AuthCard`                 | V L   | ✅                                                 |
| Player full-screen frame                | `components/players/PlayerShell` (+ `PlayerBanner`, `StartScreen`, `ResultPanel`)    | V L   | ✅ no `blob` bug                                   |
| Page fade-up motion                     | CSS transition utility                                                               | I     | ✅ reduced motion respected                        |
| 404 (English boilerplate)               | `app/pages/NotFoundPage`                                                             | —     | ✅ Arabic EmptyState                               |
| Logout                                  | —                                                                                    | —     | — N/A until real authentication                    |

## 2. Public & auth

| Replit                | New route → feature/component                                                                                  | Reuse                 | Status |
| --------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------- | ------ |
| Landing `/`           | `/` → `features/landing` (LandingNavbar, HeroSection, HeroVisual, CallToActionSection, LandingFooter)          | V L C (no fake stats) | ✅     |
| Login                 | `/login` → `features/auth/pages/LoginPage` + `AuthCard`                                                        | V L C I               | ✅     |
| Register + role cards | `/register` → `features/auth/pages/RegisterPage` + `PasswordStrengthMeter`; fixed **parent** account-type card | V L C I               | ✅     |
| Forgot password       | `/forgot-password` → `features/auth/pages/ForgotPasswordPage` + `AuthSplitShell`                               | L C                   | ✅     |
| Reset password        | `/reset-password` → `features/auth/pages/ResetPasswordPage` + `AuthSplitShell`, `PasswordStrengthMeter`        | L C I                 | ✅     |

Deviations: fabricated hero claims replaced by descriptive text; hero secondary CTA "تسجيل الدخول";
heading wrap and scroll-hint bugs fixed; "free" wording kept but **unverified**; success states
never claim an email was sent; reset's 15-minute claim removed.

## 3. Dashboards

| Replit                                          | New route → feature/component                                                         | Reuse | Status                  |
| ----------------------------------------------- | ------------------------------------------------------------------------------------- | ----- | ----------------------- |
| Parent dashboard (hero + stats + sections)      | `/parent/dashboard` → `features/dashboards/parent` (`ParentDashboardPage`)            | V L C | ✅                      |
| Admin (same page as parent in Replit)           | `/admin/dashboard` → `features/dashboards/admin` (own overview, same visual language) | V L   | ✅                      |
| Teacher dashboard                               | `/teacher/dashboard` → `features/dashboards/teacher`                                  | V L C | ✅                      |
| Specialist dashboard                            | `/specialist/dashboard` → `features/dashboards/specialist`                            | V L C | ✅                      |
| Super Admin panel (dark, tabs)                  | `/super-admin` → `features/dashboards/super-admin` (4 tabs, light style in the shell) | L C   | ✅                      |
| Gradient hero banner                            | `components/shared/PageBanner` (+ `DashboardGreetingBanner`)                          | V     | ✅                      |
| Stat cards                                      | `components/shared/StatCard`                                                          | V     | ✅                      |
| Replit per-child rewards widgets + leaderboard  | parent "أطفالي" preview with shared `ChildCard`                                       | V L   | ⛔ rewards excluded     |
| Replit "نظرة ذكية" insights card                | "نصائح لك" general-advice tiles (`ParentTipsCard`)                                    | V L   | ⛔ AI insights excluded |
| Replit skills chart + "أحدث التقارير" side card | "آخر النشاطات" side card (`RecentActivityCard`)                                       | V L   | ⛔ charts excluded      |

## 4. Children & plans

| Replit                                                 | New route → feature/component                                                                                  | Reuse | Status                                       |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ----- | -------------------------------------------- |
| Children list                                          | `/{role}/children` → `features/children/pages/ChildrenListPage`                                                | V L C | ✅ parent add; staff see parent names        |
| Child card (list)                                      | shared `ChildCard` via `ChildListCard`                                                                         | V     | ✅                                           |
| Child card (teacher/specialist variant with risk pill) | `features/dashboards/components/StaffChildCard`                                                                | V     | ✅ neutral status instead of risk            |
| Add child dialog                                       | `features/children/components/AddChildDialog` (parent only)                                                    | V L C | ✅ local add                                 |
| Child profile header banner                            | `/{role}/children/:childId` → `ChildProfilePage` + `profile/ChildProfileHeader`                                | V L   | ✅                                           |
| Profile tabs                                           | `components/ui/Tabs` (نظرة عامة / التقييمات / الأنشطة / التقارير)                                              | V I   | ✅ + التقييمات tab                           |
| Profile overview (pastel tiles)                        | `profile/OverviewTab` + `ProfileSummaryTiles`                                                                  | V     | ✅ skills radar → summary cards              |
| Activities tab (grouped list)                          | `profile/ActivitiesTab` ("العب ‹" / "ابدأ ‹" links to the players)                                             | V L   | ✅                                           |
| Reports tab                                            | `profile/ReportsTab` (links to report detail)                                                                  | V     | ✅                                           |
| Assign activity modal                                  | `features/children/components/AssignActivityDialog` (staff only)                                               | V I   | ✅ local add                                 |
| Education plans (IEP) page + plan modal                | `/{role}/children/:childId/plans` → `features/training-plans` (`ChildPlansPage`, `PlanCard`, `PlanFormDialog`) | V L C | ✅ create (Specialist/Admin), no edit/delete |
| "إنشاء تقرير AI" button                                | —                                                                                                              | —     | ⛔ AI excluded                               |

Children deviations: title "أطفالي" for the parent, "الأطفال" for staff; **developmental age
omitted** (clinical estimate, absent from the API); staff cannot add children (API: parents
create children); birth date kept although the API docs use "Age" (TBD).

## 5. Assessment & activities

| Replit                                   | New route → feature/component                                                                  | Reuse   | Status                           |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------- | ------- | -------------------------------- |
| Assessment intro (section grid)          | `/{role}/assessment/:childId` → `features/assessments` (`AssessmentIntro`)                     | V L C I | ✅                               |
| Assessment top bar (dots, count)         | `PlayerShell` top bar + `SectionProgress`                                                      | V       | ✅                               |
| Question card + stimulus tile            | `AssessmentSectionRunner`                                                                      | V       | ✅                               |
| Answer tiles (2×2 emoji + label)         | `components/players/AnswerTile`                                                                | V I     | ✅ + non-colour cues             |
| Correct/wrong feedback                   | `components/players/FeedbackMessage` + tile states                                             | I       | ✅ icon + words                  |
| Results screen                           | `AssessmentResults` (neutral completion)                                                       | V L     | ✅ no %/scores/risk              |
| Tests catalogue                          | `/{role}/tests` → `features/activities` (`TestsCatalogPage`, `ActivityCatalog`, `CatalogCard`) | V       | ✅                               |
| Test player (dark)                       | `/{role}/tests/:testId/play` → `TestPlayerPage` (light)                                        | I       | ✅ one light visual language     |
| Games catalogue                          | `/{role}/games` → `GamesCatalogPage`                                                           | V       | ✅                               |
| Game player frame + start + result panel | `/{role}/games/:gameId/play` → `GamePlayerPage` + `components/players`                         | V I     | ✅                               |
| 11 games                                 | `features/activities/games/*` (registry in `games/registry.ts`)                                | V I     | ✅ all 11 (fixes in the audit)   |
| Category filter chips                    | `features/activities/components/CategoryFilter`                                                | V I     | ✅                               |
| Assign-to-child modal                    | `features/activities/components/AssignToChildDialog`                                           | V I     | ✅                               |
| `useGameSounds`                          | `components/players/useSoundEffects` + `SoundToggle`                                           | I       | ✅ mute toggle                   |
| Confetti                                 | `components/players/Confetti`                                                                  | I       | ✅ hidden under reduced motion   |
| Difficulty selector                      | —                                                                                              | —       | ⛔ prototype setting             |
| Timers (test 30s, assessment 10s)        | —                                                                                              | —       | ⛔ no time pressure for children |

The admin content model in `ACTIVITY_ENGINE.md` still applies when the API is integrated; the
current games and tests are UI demo content.

## 6. Reports

| Replit                                               | New route → feature/component                                             | Reuse | Status                                |
| ---------------------------------------------------- | ------------------------------------------------------------------------- | ----- | ------------------------------------- |
| Reports list (hero, filters, cards)                  | `/{role}/reports` → `features/reports` (`ReportsListPage`, `ReportCard`)  | V L C | ✅ type filter instead of risk filter |
| Report detail                                        | `/{role}/reports/:reportId` → `ReportDetailPage` (summary card, sections) | V L C | ✅ no risk hero card                  |
| Create report (mode toggle, child picker, textareas) | `/specialist/reports/new`, `/admin/reports/new` → `CreateReportPage`      | V L   | ✅ manual only (RHF + Zod)            |
| PDF download button                                  | disabled "تحميل PDF (قريباً)"                                             | V     | ✅ no generation                      |
| AI mode, probability slider, AI pill                 | —                                                                         | —     | ⛔ excluded                           |

## 7. Chat

| Replit                           | New route → feature/component                           | Reuse | Status                       |
| -------------------------------- | ------------------------------------------------------- | ----- | ---------------------------- |
| Messages page (two panes)        | `/{role}/messages` → `features/chat/pages/MessagesPage` | V L   | ✅ responsive rewrite        |
| Conversation list + item         | `features/chat/components/ConversationList`             | V     | ✅ + per-conversation unread |
| Thread header, bubbles, composer | `features/chat/components/ChatThread`                   | V     | ✅ logical corners           |
| New conversation modal           | `features/chat/components/NewConversationDialog`        | V I   | ✅ Escape closes             |
| Empty state "اختر محادثة لتبدأ"  | `EmptyState`                                            | C     | ✅                           |
| Mobile layout (broken in Replit) | list ↔ thread stacked navigation with a back button     | —     | ✅ fixed                     |

## 8. Admin & users

| Replit                                                | New route → feature/component                                         | Reuse | Status                                                   |
| ----------------------------------------------------- | --------------------------------------------------------------------- | ----- | -------------------------------------------------------- |
| Super Admin users list (rows, role pill, edit/delete) | `/super-admin` → "المستخدمون" tab (`super-admin/components/UsersTab`) | V L   | ✅ delete local only; edit disabled "قريباً"             |
| Users-by-role tiles                                   | "نظرة عامة" tab (`OverviewTab`)                                       | V     | ✅                                                       |
| Delete user confirm                                   | `components/ui/ConfirmDialog`                                         | V C   | ✅                                                       |
| Categories / activities / questions / options CRUD    | —                                                                     | —     | — N/A: not in Replit; designed later (not invented here) |

## 9. Explicitly not migrated

Rewards/XP/badges/leaderboard, AI evaluation UI and "AI" branding, skills charts, risk levels and
probabilities, percentage scores, difficulty selector, EN/AR toggle, dark theme and dark-only admin
theme, landing fabricated stats, client-side screenshot PDF, countdown timers for children.
Reasons: `UI_COMPLETENESS_AUDIT.md` → "Intentionally excluded".
