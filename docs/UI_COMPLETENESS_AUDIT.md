# UI completeness audit — Replit → Early Step (2026-09-29)

> **Update 2026-10-06 (backend integration branch):** the notifications menu was removed — the
> backend has no notifications API, so the bell is disabled ("قريباً"). Several screens now show
> only real API fields (no report strengths/types, no free-text plans, age instead of birth date).
> See `BACKEND_INTEGRATION_STATUS.md`.

Final comparison of the Replit screen inventory (`REPLIT_AUDIT.md` §1, 23 screens + sub-views)
against the Early Step React app after the complete UI migration pass (ADR-019).

**Scope reminder:** UI only. Every screen uses local mock data (`docs/MOCK_DATA.md`); nothing
calls the backend, nothing is persisted, and all role areas are temporarily unguarded.

Status legend: **Implemented** · **Excluded** (intentionally not migrated, reason given) ·
**N/A** (no equivalent needed). `{role}` = `parent`, `teacher`, `specialist` or `admin`.

## Result

| Measure                                | Count                     |
| -------------------------------------- | ------------------------- |
| Replit screens (`REPLIT_AUDIT.md` §1)  | 23                        |
| Implemented                            | **23 / 23 (100%)**        |
| Replit games (sub-views of #16)        | 11 / 11 implemented       |
| Assessment sections (sub-views of #17) | 4 / 4 implemented         |
| Replit widgets/features excluded       | 10 (each explained below) |
| Unexplained missing screens            | **0**                     |

## Screens

| #   | Replit screen                               | Early Step equivalent                                                                | Route(s)                                        | Status      | Intentional differences                                                                                                                                                                                               |
| --- | ------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Landing                                     | `features/landing` LandingPage                                                       | `/`                                             | Implemented | No fabricated stats; hero wrap/scroll-hint bugs fixed; Early Step brand.                                                                                                                                              |
| 2   | Login                                       | `features/auth` LoginPage                                                            | `/login`                                        | Implemented | Validates locally only ("UI only" notice); no session.                                                                                                                                                                |
| 3   | Register (role picker)                      | `features/auth` RegisterPage                                                         | `/register`                                     | Implemented | Public registration is parent-only (fixed account-type card instead of 3 role cards).                                                                                                                                 |
| 4   | Forgot password                             | `features/auth` ForgotPasswordPage                                                   | `/forgot-password`                              | Implemented | Brand gradient panel instead of stone/emerald dialect; no fake "email sent".                                                                                                                                          |
| 5   | Reset password                              | `features/auth` ResetPasswordPage                                                    | `/reset-password`                               | Implemented | 15-minute code claim removed.                                                                                                                                                                                         |
| 6   | Parent / Admin dashboard                    | ParentDashboardPage; AdminDashboardPage                                              | `/parent/dashboard`, `/admin/dashboard`         | Implemented | Admin gets its own overview (Replit showed admins the parent page). No "85%", rewards, leaderboard, insights or charts.                                                                                               |
| 7   | Teacher dashboard                           | TeacherDashboardPage                                                                 | `/teacher/dashboard`                            | Implemented | Neutral journey status instead of risk pills; gender as text (Replit emoji was wrong); only real mock counts.                                                                                                         |
| 8   | Specialist dashboard                        | SpecialistDashboardPage                                                              | `/specialist/dashboard`                         | Implemented | "High risk" stat replaced by "بانتظار خطة تدريبية"; child cards keep "تقرير جديد".                                                                                                                                    |
| 9   | Super Admin panel (4 tabs)                  | SuperAdminPanelPage                                                                  | `/super-admin`                                  | Implemented | Light Early Step style inside the shared shell (Replit: separate dark app). Delete user removes from local state only; "تغيير الدور" is a disabled "قريباً" (Replit had no edit form).                                |
| 10  | Children list + add dialog                  | ChildrenListPage + AddChildDialog                                                    | `/{role}/children`                              | Implemented | Parent-only add (API: parents create children); staff cards show the parent name; developmental age omitted.                                                                                                          |
| 11  | Child profile (3 tabs + assign modal)       | ChildProfilePage + AssignActivityDialog                                              | `/{role}/children/:childId`                     | Implemented | Added "التقييمات" tab; skills radar replaced by summary cards; assign activity for staff only; "إنشاء تقرير AI" omitted; header count pills omitted; edit child disabled "قريباً".                                    |
| 12  | Education plans (IEP)                       | `features/training-plans` ChildPlansPage + PlanFormDialog                            | `/{role}/children/:childId/plans`               | Implemented | Create only (no edit/delete) for Specialist/Admin, saved locally; timeline field replaced by start/review dates; status shown with text + icon.                                                                       |
| 13  | Tests catalogue                             | TestsCatalogPage (ActivityCatalog, CategoryFilter, CatalogCard, AssignToChildDialog) | `/{role}/tests`                                 | Implemented | "تقييم ذكي"/AI wording removed; banner counts are real local counts; stars have a text equivalent.                                                                                                                    |
| 14  | Test player                                 | TestPlayerPage                                                                       | `/{role}/tests/:testId/play`                    | Implemented | **Light style** instead of dark teal→violet; no 30s countdown; explicit "التالي" instead of auto-advance; correct answer revealed after a wrong pick; "X من Y" + stars (no % ring); math bidi fixed.                  |
| 15  | Games catalogue                             | GamesCatalogPage                                                                     | `/{role}/games`                                 | Implemented | Same catalogue component as tests; assign-to-child dialog kept.                                                                                                                                                       |
| 16  | Game player (11 games)                      | GamePlayerPage + `games/*`                                                           | `/{role}/games/:gameId/play`                    | Implemented | Shared player shell; no XP/levels/streaks/badges; no timers; result = "X من Y" + stars; see the games table.                                                                                                          |
| 17  | Initial assessment (4 mini-games + results) | AssessmentPage (intro, section runner, section done, results)                        | `/{role}/assessment/:childId`                   | Implemented | No 10s timers; explicit "التالي"; no right/wrong marking; memory reveal is child-paced; results are **completion-only** (no %, scores, strengths/weaknesses or risk) with a note that the specialist reviews answers. |
| 18  | Reports list                                | ReportsListPage + ReportCard                                                         | `/{role}/reports`                               | Implemented | No "AI" pill; risk filter → report-type filter; child name on every card (Replit bug); per-role visibility.                                                                                                           |
| 19  | Report detail                               | ReportDetailPage                                                                     | `/{role}/reports/:reportId`                     | Implemented | Risk hero card (%, stars, scale) → neutral summary card; "نقاط الضعف" → "جوانب تحتاج إلى دعم"; numbered recommendations kept; PDF download disabled "قريباً".                                                         |
| 20  | Create report (AI / manual)                 | CreateReportPage (RHF + Zod)                                                         | `/specialist/reports/new`, `/admin/reports/new` | Implemented | Manual mode only (AI generation excluded); probability slider removed; saved locally with an honest message.                                                                                                          |
| 21  | Messages                                    | MessagesPage (ConversationList, ChatThread, NewConversationDialog)                   | `/{role}/messages`                              | Implemented | **Mobile fixed** (list ↔ thread with back button); per-conversation unread badges; Latin digits; new-conversation dialog closes on Escape; local send only (no sockets).                                              |
| 22  | Notifications dropdown                      | `features/notifications` NotificationsMenu                                           | sidebar + mobile header bell (all roles)        | Implemented | Panel stays inside the viewport and above page content; full-width sheet on small screens; explicit "تعليم الكل كمقروء" (Replit marked all read on open); delete visible on focus.                                    |
| 23  | 404                                         | `app/pages/NotFoundPage`                                                             | `*`                                             | Implemented | Arabic EmptyState instead of Replit's English boilerplate.                                                                                                                                                            |

## Games (Replit #16 sub-views)

| Replit game                 | Early Step id      | Status      | Intentional differences / fixes                                                                            |
| --------------------------- | ------------------ | ----------- | ---------------------------------------------------------------------------------------------------------- |
| مطابقة البطاقات             | `memory-match`     | Implemented | Mirrored-glyph (backface) bug fixed; named card buttons; attempts + pairs counters.                        |
| الكلمات المتقاطعة (reading) | `word-reading`     | Implemented | Feedback in words + icon (Replit: small red icon only).                                                    |
| الأرقام المفقودة            | `missing-numbers`  | Implemented | The rule hint that gave the answer away is removed; number row stays LTR.                                  |
| تشكيل الجمل                 | `sentence-builder` | Implemented | Word chips ≥ 56px, tap to place/remove (no drag); both common word orders accepted.                        |
| المتاهة المنطقية            | `pattern-logic`    | Implemented | Missing cell labelled for screen readers; explanation after answering kept.                                |
| صواني الألوان               | `color-memory`     | Implemented | Pads have names + symbols (not colour-only); playback starts on request; replay any time; retry on miss.   |
| استمع واختر                 | `listen-choose`    | Implemented | Speech only on tap (ar voice via speechSynthesis) with a "show the word" fallback; answers look tappable.  |
| فقّع البالون                | `balloon-pop`      | Implemented | No fast moving targets (gentle float, off under reduced motion); ≥ 5rem balloons, 1.5rem labels; LTR sums. |
| رتّب الحروف                 | `word-scramble`    | Implemented | Now finishes and reports a result (Replit never submitted).                                                |
| ابحث وجِد!                  | `spot-it`          | Implemented | No timer; every picture named; finishes (Replit never submitted).                                          |
| تسلسل القصة                 | `story-sequence`   | Implemented | Move up/down buttons instead of drag-only; no crash on finish; per-position check in words.                |

## Assessment sections (Replit #17 sub-views)

| Replit mini-game | Early Step section | Status      |
| ---------------- | ------------------ | ----------- |
| Reading          | الحروف والقراءة    | Implemented |
| Math             | الأرقام والحساب    | Implemented |
| Memory           | الذاكرة والتسلسل   | Implemented |
| Attention        | التركيز والانتباه  | Implemented |
| Results screen   | Neutral completion | Implemented |

## Shell and shared UI

| Replit element                           | Early Step                                          | Status      | Notes                                                 |
| ---------------------------------------- | --------------------------------------------------- | ----------- | ----------------------------------------------------- |
| Sidebar, user badge, nav                 | DashboardLayout + SidebarContent + `areaNavigation` | Implemented | Unread badge anchored on the icon (Replit: detached). |
| Mobile header + drawer                   | DashboardLayout + MobileNavDrawer                   | Implemented | Drawer opens from the right (Replit: wrong side).     |
| Assign-to-child modal (catalogues)       | AssignToChildDialog                                 | Implemented | Local confirmation only.                              |
| Assign activity (profile "تعيين نشاط")   | AssignActivityDialog                                | Implemented | Staff only; local add.                                |
| Delete user confirm                      | ConfirmDialog in UsersTab                           | Implemented | Local removal only.                                   |
| Player frame, start screen, result panel | `components/players/*`                              | Implemented | Shared by games, tests and assessment.                |
| Confetti, sound effects                  | `Confetti`, `useSoundEffects` + `SoundToggle`       | Implemented | Reduced-motion aware; synthesized tones; mute toggle. |
| Logout button                            | —                                                   | N/A         | No authentication yet; added with real auth.          |

## Intentionally excluded (with reasons)

| Replit feature                                    | Reason                                                                                   |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Rewards: XP, levels, streaks, badges, leaderboard | Not a product requirement; no API support; fabricated-looking progress (ADR-019).        |
| "نظرة ذكية" AI insight card                       | AI claims about children; no API.                                                        |
| Skills charts (line, bar, radar)                  | Would need data that does not exist; replaced by neutral summaries.                      |
| AI report generation + "AI" branding              | Unsupported AI/clinical claims; manual reports only.                                     |
| Risk levels, probabilities, percentage scores     | Clinical-looking claims not provided by the API; neutral wording instead.                |
| Dark mode / theme toggle                          | Out of scope (ADR-016).                                                                  |
| EN/AR language toggle                             | Arabic only (CLAUDE.md §6).                                                              |
| Difficulty selector                               | Replit-only prototype setting; difficulty is shown per activity instead.                 |
| Countdown timers in child activities              | Time pressure is inappropriate for the audience; removed everywhere.                     |
| Client-side screenshot PDF export                 | PDFs come from the server (`/Reports/{id}/download`) later; button is disabled "قريباً". |

## Not in Replit (still to design later, not part of this pass)

Categories/activities/questions/options management, child edit/delete, change password, user
detail, specialist/teacher assignment screens — see `REPLIT_AUDIT.md` §10 and
`IMPLEMENTATION_PLAN.md`. They were **not invented** during this migration.

## Verification

- `npm run validate` passes (typecheck, lint with zero warnings, 224 tests, build).
- Manual check at 1440 / 820 / 500 px of every route in `ROUTING.md`: no horizontal overflow at
  any width; stacked layouts on mobile (chat list ↔ thread, super-admin user rows → cards,
  catalogue chips scroll horizontally).
