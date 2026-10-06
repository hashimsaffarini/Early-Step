# UI Component Inventory

> **Update 2026-10-06 (backend integration branch):** the notifications menu was removed — the
> backend has no notifications API, so the bell is disabled ("قريباً"). Several screens now show
> only real API fields (no report strengths/types, no free-text plans, age instead of birth date).
> See `BACKEND_INTEGRATION_STATUS.md`.

Derived from the Replit UI audit (`REPLIT_AUDIT.md`, `DESIGN_SYSTEM.md`). The tables at the top
list what is **implemented**; the sections below are the original plan (kept for reference). Each entry lists where the pattern appears in Replit and the key visual
spec. Placement follows `ARCHITECTURE.md`: primitives in `src/components/ui/`, shared product
components in `src/components/shared/` (or `layout/`), feature components inside their feature.

## Implemented in the UI foundation stage (2026-09-28)

| Area           | Components                                                                                                                                                                                                                      | Location                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| Primitives     | Button (+ `getButtonClassName` for links), IconButton, Input (leading icon / trailing slot), PasswordInput, Textarea, Select, Checkbox, FormField, Card, Badge, Tabs, Modal, ConfirmDialog, Spinner, ProgressBar, Alert, Avatar | `src/components/ui/*`     |
| Shared product | PageHeader, PageBanner (+ overline), StatCard (+ violet tone), SearchField, ChildCard, SectionHeader, ComingSoonButton, EmptyState / ErrorState / LoadingState (restyled)                                                       | `src/components/shared/*` |
| Layout         | DashboardLayout (sidebar, mobile header, RTL drawer, skip link), SidebarContent (brand, user badge, nav with count badge), BrandMark, AuthLayout, ChildActivityLayout (light assessment style)                                  | `src/components/layout/*` |

## Added in the complete UI migration pass (2026-09-29, ADR-019)

| Area             | Components                                                                                                                                                                                             | Location                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| Players (shared) | PlayerShell (top bar + stage), PlayerBanner, StartScreen, AnswerTile, QuestionProgress, FeedbackMessage, ResultPanel, StarRating, StatPill, SoundToggle + `useSoundEffects`, Confetti, `starsForScore` | `src/components/players/`                      |
| Shared product   | CategoryTile + `getCategoryGradientClass` (text-safe category gradients)                                                                                                                               | `src/components/shared/CategoryTile/`          |
| Role shell       | RoleAreaLayout, RoleAreaRoot, `areaNavigation` (per-role nav), NotificationsMenu                                                                                                                       | `src/app/layouts/`, `features/notifications`   |
| Activities       | ActivityCatalog, CategoryFilter, CatalogCard, AssignToChildDialog, QuestionPrompt (LTR fragments), 11 game components + shared game helpers                                                            | `features/activities`                          |
| Assessment       | AssessmentIntro, SectionProgress, AssessmentSectionRunner, SectionComplete, AssessmentResults                                                                                                          | `features/assessments`                         |
| Children / plans | ChildListCard, AssignActivityDialog, StartAssessmentLink; PlanCard, PlanFormDialog                                                                                                                     | `features/children`, `features/training-plans` |
| Reports / chat   | ReportCard, FilterChips; ConversationList, ChatThread, NewConversationDialog                                                                                                                           | `features/reports`, `features/chat`            |
| Dashboards       | DashboardGreetingBanner, DashboardStatsGrid, StaffChildCard, ChildrenDirectory; super-admin OverviewTab, UsersTab, ChildrenTab, ReportsTab                                                             | `features/dashboards`                          |

Not built (by decision): rewards widgets, charts, risk/level badges, difficulty selector, theme and
language toggles (see `UI_COMPLETENESS_AUDIT.md`). Still planned for later stages: admin content
editors, tables, image upload, child edit form. Visual QA: `npm run dev` → `/ui-preview`.

## 1. Primitive / shared UI (`src/components/ui/`)

| Component                              | Variants / props                                                                                                    | Replit source of pattern                           | Notes                                      |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------ |
| Button                                 | primary, accent, gradient (category), outline, soft, ghost, destructive; sizes sm/md/lg/xl; loading; icon start/end | `.btn-primary`, inline buttons everywhere          | a11y: primary-strong fill; press scale     |
| IconButton                             | muted, bordered, glass; requires Arabic `aria-label`                                                                | bell, theme, menu, close, edit/delete rows         | ≥40px; ≥56px in child UI                   |
| Input                                  | default (app), large (auth) with leading icon; error state                                                          | login/register, add child                          | pill; label association                    |
| PasswordInput                          | eye toggle                                                                                                          | login/register/reset                               | toggle has accessible name                 |
| PasswordStrengthMeter                  | 5 segments + requirement list                                                                                       | register, reset                                    | could live in `features/auth` (single use) |
| Textarea                               |                                                                                                                     | IEP, report create                                 | radius 2rem                                |
| Select                                 | native styled                                                                                                       | add child (gender), IEP status                     |                                            |
| DateInput                              | native styled                                                                                                       | add child                                          | RTL display TBD                            |
| Checkbox                               | custom box                                                                                                          | remember me                                        |                                            |
| Radio / RadioCard                      | selectable card with icon, title, sub-label, check badge                                                            | register role picker, report child picker          | generic "choice card"                      |
| Slider                                 | RTL-aware range + value                                                                                             | report probability                                 | only if needed                             |
| FormField                              | label + control + hint + error                                                                                      | all forms                                          | enforces `htmlFor`                         |
| FormErrorAlert                         | block error                                                                                                         | login error                                        | `role="alert"`                             |
| Card                                   | default, interactive (hover lift), tinted                                                                           | `.card-fancy`, many                                |                                            |
| Badge / Pill                           | tone (primary, success, warning, danger, neutral, role colours), dot, size                                          | risk, difficulty, gender, status, role             | ≥12px                                      |
| CountBadge                             |                                                                                                                     | nav messages, bell                                 | positioned on icon                         |
| Tabs (segmented)                       | with count bubble                                                                                                   | profile tabs, super-admin tabs, report mode toggle | roving focus                               |
| Chips / FilterChips                    | with icon + count; active gradient                                                                                  | category chips, risk chips                         | toggle buttons                             |
| Modal / Dialog                         | sizes; header, body, footer; close button (logical)                                                                 | add child, IEP, assign activity, new conversation  | focus trap, Escape closes                  |
| ConfirmDialog                          | tone danger                                                                                                         | super-admin delete user                            |                                            |
| Popover / Dropdown                     | anchored, RTL-aware                                                                                                 | notifications                                      | must stay in viewport                      |
| Drawer                                 | inline-start side                                                                                                   | mobile nav                                         | RTL fix                                    |
| ProgressBar                            | tones, gradient, animated                                                                                           | XP, players, assessment, risk                      | `role="progressbar"`                       |
| SegmentedProgress / StepDots           |                                                                                                                     | assessment dots, story steps, colour levels        |                                            |
| Avatar                                 | initial letter(s); tile / circle; gradient                                                                          | sidebar, cards, chat                               |                                            |
| Spinner                                | sizes                                                                                                               | Loader2 everywhere                                 | exists as LoadingState base                |
| Skeleton                               | card/list                                                                                                           | rewards widget                                     |                                            |
| Toast                                  | success/error                                                                                                       | none used in Replit                                | add only if needed                         |
| Tooltip                                |                                                                                                                     | native `title` only                                | optional                                   |
| Table                                  | responsive (table ≥1024, cards below)                                                                               | **not in Replit**                                  | new design for admin lists                 |
| EmptyState / ErrorState / LoadingState | dashed card variant                                                                                                 | many                                               | **exist** in foundation — restyle          |

## 2. Shared product components (`src/components/shared/` or `layout/`)

| Component                                    | Replit pattern                                                                  | Used by                                   |
| -------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------- |
| AppSidebar (+ NavItem, UserBadge, BrandMark) | desktop sidebar                                                                 | all dashboard layouts                     |
| MobileHeader + MobileNavDrawer               | < 1024 header + drawer                                                          | all dashboard layouts                     |
| PageHeader                                   | title 1.875rem 900 + subtitle + action                                          | children, lists                           |
| PageBanner (gradient hero)                   | dashboards, catalogues, reports, plans, child profile                           | many                                      |
| StatCard (soft / solid icon variants)        | dashboards                                                                      | dashboards, profile                       |
| PastelStatTile                               | profile "ملخص الأنشطة"                                                          | profile, summaries                        |
| SearchField                                  | pill search                                                                     | lists                                     |
| ChildCard                                    | children list, teacher/specialist dashboards (variant with risk pill + actions) | children, dashboards                      |
| RoleBadge                                    | role pills (sidebar, chat, users)                                               | users, chat, header                       |
| RiskBadge / LevelBadge                       | risk chips                                                                      | reports, dashboards (only if data exists) |
| CategoryTile / GradientEmojiTile             | gradient square with emoji                                                      | activities, assessment, lists             |
| ActivityCard                                 | catalogue card (gradient header, emoji, stars, pills, actions)                  | activities catalogue, plan editor         |
| ReportCard                                   | report list card                                                                | reports, profile tab                      |
| GroupedListCard                              | profile activities list                                                         | profile, plans                            |
| SectionCard (icon + coloured title)          | report detail sections                                                          | reports, plans                            |
| NotificationsMenu                            | bell + popover                                                                  | shell (only if notifications exist)       |
| players (`src/components/players`, ADR-019)  | answer tiles, stimulus card, result panel                                       | assessments, training plans               |

## 3. Feature-specific components

| Feature              | Components (pattern source)                                                                                                                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| auth                 | LoginForm, RegisterForm, RoleCardPicker, PasswordStrengthMeter (if not shared), ForgotPasswordForm, ResetCodeForm, AuthCard, AuthBackground                                                                 |
| children             | ChildForm (modal), ChildProfileHeader, ChildProfileTabs, ChildActivitiesList                                                                                                                                |
| assessments          | AssessmentIntro (section grid), SectionTile, AssessmentTopBar (dots + count), StimulusTile, AssessmentAnswerOption, AssessmentFeedback, AssessmentResults (score card, area rows, strengths/support panels) |
| activities / content | ActivityCard (admin), CategoryChips, CategoryForm, ActivityForm (+ icon upload), QuestionEditor, OptionEditor (text/image, correct toggle, order), ContentTable, DeleteContentConfirm                       |
| games / players      | PlayerFrame (header + banner + card), StartScreen, GameBoard variants (card grid, answer grid, chip tray, sequence row), AnswerTile, FeedbackOverlay, ResultPanel (score, stars), useSoundEffects, Confetti |
| training-plans       | TrainingPlanItem, PlanActivityPicker (assign modal pattern), PlanHeader                                                                                                                                     |
| feedback             | NoteCard, NoteForm                                                                                                                                                                                          |
| reports              | ReportForm (mode toggle, child picker, textareas), ReportDetail (RiskHeroCard, StrengthsSection, WeaknessesSection, RecommendationsList), DownloadButton                                                    |
| chat                 | ConversationList, ConversationItem, ChatThread, ChatBubble (own/other), ChatComposer, NewConversationDialog (contact list), UnreadIndicator                                                                 |
| users                | UserRow (avatar, name, email, role pill, actions), UsersByRoleTiles                                                                                                                                         |
| dashboards           | ParentDashboard, TeacherDashboard, SpecialistDashboard, AdminDashboard, SuperAdminDashboard sections (greeting hero, stat rows, student grids)                                                              |

## 4. Not carried over

Rewards widgets (XP, streak, badges, leaderboard), AI insight card, skills radar/line/bar charts,
difficulty selector, language toggle, landing marketing stats — unless explicitly requested and
backed by data.
