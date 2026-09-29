# UI Migration Map — Replit → new React app

Maps every Replit screen/component (visual reference) to its planned home in this codebase.
**Plan only — no files are created yet.** Routes follow `ROUTING.md`; features follow
`ARCHITECTURE.md` (ADR-014). "Reuse" = what to carry over: **V** visual design, **L** layout,
**C** Arabic copy, **I** interaction pattern. Never carry over Replit logic, data model or
fabricated numbers.

## 1. Shell & layouts

| Replit screen/component                 | New location                                                                                              | Reuse | Notes                                      |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------ |
| `components/layout.tsx` desktop sidebar | `components/layout/DashboardLayout` + `components/shared/AppSidebar`, `NavItem`, `UserBadge`, `BrandMark` | V L C | nav config per role from `app/router`      |
| Mobile header + drawer                  | `components/shared/MobileHeader`, `MobileNavDrawer`                                                       | V L   | drawer on inline-start (right)             |
| Theme toggle                            | —                                                                                                         | —     | out of scope (ADR-016)                     |
| Notifications bell + dropdown           | `components/shared/NotificationsMenu`                                                                     | V I   | only if notifications become a requirement |
| Auth pages card + background            | `components/layout/AuthLayout` + `features/auth/components/AuthCard`                                      | V L   |                                            |
| Player full-screen frame                | `components/layout/ChildActivityLayout` + `components/question-players/PlayerFrame`                       | V L   | no `blob` bug                              |
| Page fade-up motion                     | CSS transition utility                                                                                    | I     | reduced motion respected                   |
| 404 (English boilerplate)               | `app/pages/NotFoundPage` (exists)                                                                         | —     | restyle with EmptyState                    |

## 2. Public & auth

| Replit                | New route → feature/component                                                                                                                                                  | Reuse                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| Landing `/`           | ✅ `/` → `features/landing` (LandingNavbar, HeroSection, HeroVisual, CallToActionSection, LandingFooter)                                                                       | V L C (no fake stats) |
| Login                 | ✅ `/login` → `features/auth/pages/LoginPage` + `AuthCard`                                                                                                                     | V L C I               |
| Register + role cards | ✅ `/register` → `features/auth/pages/RegisterPage` + `PasswordStrengthMeter`; role cards reduced to a fixed **parent** account-type card (public registration is parent-only) | V L C I               |
| Forgot password       | ✅ `/forgot-password` → `features/auth/pages/ForgotPasswordPage` + `AuthSplitShell` (split layout, brand-gradient panel instead of stone/emerald)                              | L C                   |
| Reset password        | ✅ `/reset-password` → `features/auth/pages/ResetPasswordPage` + `AuthSplitShell`, `PasswordStrengthMeter`                                                                     | L C I                 |

Deviations from Replit (intentional): fabricated/absolute claims on the hero cards replaced by
descriptive text; hero secondary CTA says "تسجيل الدخول" (Replit's "معرفة المزيد" linked to
login); heading spacing/wrap bug fixed; scroll hint is in flow (no overlap); "free" wording kept from
Replit but **unverified** (pricing TBD); success states say nothing was sent (no fake "email
sent"); reset's 15-minute code claim removed.

## 3. Dashboards

| Replit                                         | New route → feature/component                                         | Reuse                                       |
| ---------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------- |
| Parent dashboard (hero + stats + sections)     | `/parent` → `features/dashboards/parent` (`ParentDashboardPage`)      | V L C (only real data; no rewards/charts)   |
| Admin (same page as parent in Replit)          | `/admin` → `features/dashboards/admin`                                | V L (new content per admin needs)           |
| Teacher dashboard                              | `/teacher` → `features/dashboards/teacher`                            | V L C                                       |
| Specialist dashboard                           | `/specialist` → `features/dashboards/specialist`                      | V L C (main dialect colours)                |
| Super Admin panel (dark, tabs)                 | `/super-admin` → `features/dashboards/super-admin` + `features/users` | L C (use main light dialect unless decided) |
| Gradient hero banner                           | `components/shared/PageBanner`                                        | V                                           |
| Stat cards                                     | `components/shared/StatCard`                                          | V                                           |
| Rewards widgets, leaderboard, insights, charts | —                                                                     | not migrated                                |

## 4. Children

| Replit                                                           | New route → feature/component                                                                                | Reuse                               |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| Children list                                                    | `/parent/children`, `/teacher/children`, `/specialist/children` → `features/children/pages/ChildrenListPage` | V L C                               |
| Child card (list)                                                | `components/shared/ChildCard`                                                                                | V                                   |
| Child card (teacher/specialist variant with risk pill + actions) | `ChildCard` variant                                                                                          | V                                   |
| Add child dialog                                                 | `features/children/components/ChildForm` (modal)                                                             | V L C                               |
| Edit / delete child                                              | `ChildForm` (edit) + `ConfirmDialog`                                                                         | new (no Replit UI)                  |
| Child profile header banner                                      | `features/children/components/ChildProfileHeader`                                                            | V L                                 |
| Profile tabs                                                     | `components/ui/Tabs`                                                                                         | V I                                 |
| Profile overview (pastel tiles)                                  | `components/shared/PastelStatTile`                                                                           | V                                   |
| Activities tab (grouped list)                                    | `features/training-plans/components/PlanActivityList`                                                        | V L                                 |
| Reports tab                                                      | `components/shared/ReportCard`                                                                               | V                                   |
| Assign activity modal                                            | `features/training-plans/components/PlanActivityPicker`                                                      | V I                                 |
| IEP page                                                         | `/specialist/children/:childId/plan` → `features/training-plans`                                             | V (plan card style) — model differs |

## 5. Assessment & activities

| Replit                                                    | New route → feature/component                                                                       | Reuse                                                   |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Assessment intro (section grid)                           | `/play/assessment/:childId` → `features/assessments/components/AssessmentIntro`, `SectionTile`      | V L C I                                                 |
| Assessment top bar (dots, count)                          | `features/assessments/components/AssessmentTopBar`                                                  | V                                                       |
| Question card + stimulus tile                             | `components/question-players/StimulusCard`                                                          | V                                                       |
| Answer tiles (2×2 emoji + label)                          | `components/question-players/AnswerTile` → `features/assessments/components/AssessmentAnswerOption` | V I                                                     |
| Correct/wrong feedback                                    | `components/question-players/AnswerFeedback`                                                        | I (+ non-colour cue)                                    |
| Results screen                                            | `features/assessments/components/AssessmentResults`                                                 | V L (data TBD)                                          |
| Tests catalogue                                           | `/admin/activities` (admin) and plan picker → `features/content` / `features/training-plans`        | V (catalogue card, chips)                               |
| Test player (dark)                                        | `components/question-players/ChoicePlayer`                                                          | I (letter badges, overlay) — one child theme            |
| Games catalogue                                           | same as tests (activities with type "game")                                                         | V                                                       |
| Game player frame + start + result panel                  | `components/question-players/PlayerFrame`, `StartScreen`, `ResultPanel`                             | V I                                                     |
| Memory / reading / math / pattern / audio / balloon games | `ChoicePlayer` skins (only if content-driven)                                                       | V I — no custom logic                                   |
| Sentence builder / word scramble / story sequence         | `OrderPlayer` (tap-to-place)                                                                        | V I                                                     |
| Card matching                                             | `MatchPlayer`                                                                                       | V I                                                     |
| Colour memory, spot-it                                    | —                                                                                                   | not representable as content (see `ACTIVITY_ENGINE.md`) |
| `useGameSounds`                                           | `components/question-players/useSoundEffects`                                                       | I (respect mute)                                        |
| Confetti                                                  | optional celebration utility                                                                        | I (reduced motion off)                                  |

## 6. Reports

| Replit                                               | New route → feature/component                                                                                         | Reuse                  |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Reports list (hero, filters, cards)                  | `/specialist/reports`, parent child reports → `features/reports/pages/ReportsListPage` + `ReportCard`                 | V L C                  |
| Report detail                                        | `features/reports/components/ReportDetail` (`RiskHeroCard` only if data exists, `SectionCard`, `RecommendationsList`) | V L C                  |
| Create report (mode toggle, child picker, textareas) | `/specialist/reports/new` → `features/reports/components/ReportForm`                                                  | V L (manual mode only) |
| PDF download button                                  | `features/reports/components/DownloadButton`                                                                          | V (server PDF)         |

## 7. Chat

| Replit                           | New route → feature/component                                         | Reuse                    |
| -------------------------------- | --------------------------------------------------------------------- | ------------------------ |
| Messages page (two panes)        | `/{role}/messages[/:conversationId]` → `features/chat/pages/ChatPage` | V L — responsive rewrite |
| Conversation list + item         | `features/chat/components/ConversationList`, `ConversationItem`       | V                        |
| Thread header, bubbles, composer | `ChatThread`, `ChatBubble`, `ChatComposer`                            | V (logical corners)      |
| New conversation modal           | `NewConversationDialog`                                               | V I                      |
| Empty state "اختر محادثة لتبدأ"  | `EmptyState`                                                          | C                        |
| Unread badge on nav              | `CountBadge` on NavItem                                               | V (fixed position)       |

## 8. Admin & users

| Replit                                                | New route → feature/component                                                               | Reuse                                                 |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Super Admin users list (rows, role pill, edit/delete) | `/admin/users`, `/super-admin/users` → `features/users` (`UserRow`, `UsersTable`)           | V L                                                   |
| Users-by-role tiles                                   | `features/users/components/UsersByRoleTiles`                                                | V                                                     |
| Delete user confirm                                   | `components/ui/ConfirmDialog`                                                               | V C                                                   |
| Categories / activities / questions / options CRUD    | `/admin/categories`, `/admin/activities*`, `/admin/initial-assessment` → `features/content` | **new design** from patterns in `REPLIT_AUDIT.md` §10 |

## 9. Explicitly not migrated

Rewards/XP/badges/leaderboard, AI evaluation UI and "AI" branding, skills charts, difficulty
selector, EN/AR toggle, dark-only admin theme, landing fabricated stats, client-side screenshot
PDF, notification features (unless requested).
