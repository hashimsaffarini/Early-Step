# Replit Prototype — UI / UX Audit

Project: <https://replit.com/@Zainmoneer04/Earlysteps> (private). **Visual reference only.**

## Method (2026-09-28)

1. Source read from the Replit dev server (Vite serves modules with source maps).
2. The prototype (frontend + its own Express prototype backend) was **reconstructed and run
   locally** (on this machine) on an embedded Postgres with **local-only seed data** and generated
   local test accounts for all five roles. Nothing touched the real Early Step API; AI and email
   integrations were disabled. The local copy lives outside this repo.
3. Every screen was inspected live as Parent, Teacher, Specialist, Admin and SuperAdmin, in light
   and dark themes, at 1440 px (desktop), 820 px (tablet) and 500 px (browser minimum; smaller
   phone widths are **source-inferred**).
4. No Replit code was copied into this repository.

Visual values: [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md). Components:
[`UI_COMPONENT_INVENTORY.md`](UI_COMPONENT_INVENTORY.md). Mapping:
[`UI_MIGRATION_MAP.md`](UI_MIGRATION_MAP.md).

Brand shown in the UI: **مستكشف القدرات** (brain icon in a sky tile) — **not used**; the new app is **Early Step** (ADR-016).

---

## 1. Page inventory

Legend — Layout: **Shell** = sidebar app layout; **Full** = full-screen, own header; **Auth** =
centred card; **Landing** = marketing.

| #   | Page                                        | Route               | Roles                              | Layout       | Verified                            |
| --- | ------------------------------------------- | ------------------- | ---------------------------------- | ------------ | ----------------------------------- |
| 1   | Landing                                     | `/`                 | public                             | Landing      | live                                |
| 2   | Login                                       | `/login`            | public                             | Auth         | live                                |
| 3   | Register (role picker)                      | `/register`         | public                             | Auth         | live                                |
| 4   | Forgot password                             | `/forgot-password`  | public                             | Auth (split) | source                              |
| 5   | Reset password                              | `/reset-password`   | public                             | Auth (split) | source                              |
| 6   | Parent / Admin dashboard                    | `/dashboard`        | Parent, Admin                      | Shell        | live                                |
| 7   | Teacher dashboard                           | `/dashboard`        | Teacher                            | Shell        | live                                |
| 8   | Specialist dashboard                        | `/dashboard`        | Specialist                         | Shell        | live                                |
| 9   | Super Admin panel (4 tabs)                  | `/admin`            | SuperAdmin                         | Full (dark)  | live                                |
| 10  | Children list + add dialog                  | `/children`         | Parent, Teacher, Specialist, Admin | Shell        | live                                |
| 11  | Child profile (3 tabs + assign modal)       | `/children/:id`     | same                               | Shell        | live                                |
| 12  | Education plans (IEP)                       | `/children/:id/iep` | same (edit: Specialist/Admin)      | Shell        | live                                |
| 13  | Tests catalogue                             | `/tests`            | same                               | Shell        | live                                |
| 14  | Test player                                 | `/tests/:id/play`   | same                               | Full (dark)  | live                                |
| 15  | Games catalogue                             | `/games`            | same                               | Shell        | live                                |
| 16  | Game player (11 games)                      | `/games/:id/play`   | same                               | Full         | live                                |
| 17  | Initial assessment (4 mini-games + results) | `/assessment/:id`   | same                               | Full (light) | live                                |
| 18  | Reports list                                | `/reports`          | same                               | Shell        | live                                |
| 19  | Report detail                               | `/reports/:id`      | same                               | Shell        | live                                |
| 20  | Create report (AI / manual)                 | `/reports/create`   | Specialist, Admin, SuperAdmin      | Shell        | live                                |
| 21  | Messages                                    | `/messages`         | Parent, Teacher, Specialist, Admin | Shell        | live                                |
| 22  | Notifications dropdown                      | (sidebar bell)      | all shell roles                    | Popover      | live                                |
| 23  | 404                                         | `*`                 | —                                  | bare         | source (English Replit boilerplate) |

**Not present in Replit (no UI exists):** categories management, activities management,
question/option editors, delete confirmations for content, content tables/filters, specialist and
teacher assignment screens, child edit/delete, change password. These must be **designed new**
from the shared patterns (§10).

---

## 2. Global shell (all Shell pages)

- **Desktop (≥1024):** sidebar on the **right** (inline-start in RTL), 18rem, card background:
  brand tile + name (wraps to two lines), notifications bell with red count, theme toggle; user
  badge (initial tile, name, Arabic role, green dot); section label "القائمة الرئيسية"; nav items
  (icon + label, active = primary/10 pill + primary text); logout at the bottom.
- **Nav items:** لوحة القيادة، الأطفال، الاختبارات، الألعاب، التقارير، الرسائل (SuperAdmin has only its panel).
- **Content:** cream canvas, `p-8`, max-width 80rem, page fade-up.
- **Below 1024:** sticky mobile header (brand + bell + hamburger), drawer.
- **Bugs seen:** unread-messages badge floats detached at the far inline-end of the nav row instead
  of on the icon; mobile drawer slides in from the **left** (wrong side for RTL — desktop sidebar is
  on the right); drawer close button overlaps the theme toggle; notifications popover opens
  **off-screen** to the right and under modals.

---

## 3. Dashboard audit (visual)

| Aspect        | Parent / Admin (shared)                                                                                                                                                                 | Teacher                                                                                                                                                                                 | Specialist                                                                                    | Super Admin                                                                                                                  |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Header        | Big sky-blue gradient hero (radius 40px): date chip, time greeting "مساء الخير", name 3rem 900, subtitle, two pill CTAs (الأبناء / الألعاب)                                             | Compact blue→violet hero: avatar circle, "مساء الخير 👋", "أ. name", "مدرّس · فصلي الدراسي"                                                                                             | Violet gradient hero: greeting, name, subtitle, two glass pill buttons (كل الأطفال / تقاريري) | Separate dark app: top bar (crown tile, title, role pill, "التطبيق", logout), dark rose→purple hero "مرحباً المدير العام 👑" |
| Stat cards    | 4 white cards, **soft tinted icon tiles** (blue/green/orange/indigo): children, activities, reports, overall progress "85%" (**fabricated**)                                            | 4 cards, **solid** coloured icon circles (blue, violet, red, green)                                                                                                                     | 4 cards, soft tiles incl. red "high risk"                                                     | 4 dark glass cards with coloured icon circles + coloured bottom glow                                                         |
| Body          | Rewards cards per child (XP bar, streak, badges grid), leaderboard "لوحة الأبطال", "نظرة ذكية" insight card, skills chart (empty state dashed), recent reports list + "عرض كل التقارير" | Section "طلاب الفصل" + search, student cards: gradient initial avatar, name, age + gender emoji, risk pill, report count, last report date, colored top border, soft "عرض الملف" button | "أطفالي" + search + "عرض الكل", child cards like teacher's plus "تقرير جديد" link             | Tabs: نظرة عامة / المستخدمون / الأطفال / التقارير; "users by role" tile row (coloured per role)                              |
| Charts        | Line + stacked bar (recharts), radar on profile                                                                                                                                         | none                                                                                                                                                                                    | none                                                                                          | none                                                                                                                         |
| Activity feed | recent reports list                                                                                                                                                                     | none                                                                                                                                                                                    | none                                                                                          | none                                                                                                                         |
| Filters       | none                                                                                                                                                                                    | search                                                                                                                                                                                  | search                                                                                        | search (users)                                                                                                               |
| Empty states  | dashed card "لا توجد بيانات كافية للرسم البياني"                                                                                                                                        | "لا يوجد طلاب…"                                                                                                                                                                         | —                                                                                             | —                                                                                                                            |
| Issues        | fabricated 85%; rewards level circles render blank (undefined classes); decorative badge grid of locked slots                                                                           | gender emoji wrong for all                                                                                                                                                              | hard-coded white/stone (no dark mode)                                                         | inconsistent dialect; "التطبيق" button bounces back                                                                          |

**Patterns worth preserving:** gradient hero + stat card row + two-column content; card grids
with search; coloured role/risk pills.

---

## 4. Auth UI audit

| Screen         | Visual                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Login          | Soft cream background with blurred blobs; back link "العودة للرئيسية" (→ arrow) above a white card (max 28rem, radius 48px, shadow): brand tile + name, "أهلاً بعودتك!" 1.875rem 900, muted subtitle, email + password pill inputs with leading icons (mail / lock) and eye toggle, "نسيت كلمة المرور؟" link aligned with the label, remember-me custom checkbox, full-width primary pill button with sparkle icon "دخول", footer "ليس لديك حساب؟ سجل الآن". |
| Register       | Same card, "إنشاء حساب جديد"; **role picker** = 3 selectable cards (icon, Arabic role, sub-label; selected = primary border + primary/10 fill + check badge) — ولي أمر / معلم / أخصائي; name, email, password with **5-segment strength bar** + requirement list, confirm password.                                                                                                                                                                          |
| Forgot / reset | Different dialect: split layout (dark panel only ≥1024), stone text, emerald CTA, cream `#FBF7F0`; success state "تحقق من بريدك!"; 6-digit code field, strength bar.                                                                                                                                                                                                                                                                                         |
| Errors         | Rounded destructive/10 block above the button, bold text; field-level Arabic messages on register.                                                                                                                                                                                                                                                                                                                                                           |
| Buttons        | disabled at 50% opacity; pending = spinner in button.                                                                                                                                                                                                                                                                                                                                                                                                        |
| Mobile         | Card fills width minus 1rem; role grid stays **3 columns** (cramped at ≤400px — fix: stack).                                                                                                                                                                                                                                                                                                                                                                 |

Copy to reuse: "أهلاً بعودتك!", "سجّل دخولك لمتابعة رحلة طفلك", "إنشاء حساب جديد", "انضم إلينا
لمساعدة طفلك في رحلة التعلم", role sub-labels "لمتابعة طفلك / لمتابعة طلابك / لتقديم تقييمات".

---

## 5. Children UI audit

| Element        | Visual                                                                                                                                                                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| List header    | "الأطفال" 1.875rem 900 + subtitle; primary pill "إضافة طفل +" at inline-end                                                                                                                                                         |
| Search         | full-width white pill search                                                                                                                                                                                                        |
| Child card     | white, radius 48px, initial avatar circle (indigo-50 / indigo text), gender pill (ولد / بنت), name 1.25rem 700, divider, meta rows with small coloured icons (birth date, developmental age)                                        |
| Add dialog     | radius 48px modal: name (focused, primary ring), birth date (native, LTR format) + optional developmental age side by side, gender select, full-width primary save                                                                  |
| Profile header | full-width primary→violet gradient banner: 96px glass avatar, name 2.25rem 900, glass pills (birth date, dev. age, gender), counts pills (games, tests, reports), CTA glass buttons "ابدأ التقييم الأولي" / "الخطط التعليمية (IEP)" |
| Profile tabs   | pill segmented: نظرة عامة / الأنشطة (count) / التقارير                                                                                                                                                                              |
| Overview       | "تحليل المهارات" radar card (empty state brain icon + link), "ملخص الأنشطة" 2×2 pastel stat tiles (violet, mint, blue, amber), gradient CTA "تعيين نشاط جديد"                                                                       |
| Activities tab | grouped list card "الألعاب المعيّنة (5)": gradient emoji tile, title, category · date, "العب ‹" link                                                                                                                                |
| Reports tab    | report card: red doc icon, probability pill, title, date, excerpt, "عرض التقرير الكامل ‹"                                                                                                                                           |
| Plans (IEP)    | violet→sky hero with book icon; plan card with top gradient border, status pill "نشط", tinted sections (goals violet, strategies amber), meta chips (duration, review date), notes strip                                            |

Reusable: ChildCard, ProfileHeader banner, pastel StatTile, grouped list card, pill tabs.
Issues: pastel tiles ignore dark mode; radar/skills rely on data that won't exist.

---

## 6. Assessment UI audit

- **Intro:** light mint→blue→lavender full-screen gradient; top bar with back arrow, title
  "التقييم الأولي", child name, progress dots + "0/4" pill, thin emerald progress line; 🎯 emoji,
  "مرحباً يا {name}!", instruction; **2×2 grid of section tiles** (gradient icon circle, title,
  one-line description, round play button); full-width emerald pill "العب الكل دفعة واحدة!".
- **Question:** section header (icon + title + subtitle), white card (max 24rem): counter "1 / 8",
  countdown "10s" with timer icon, green progress bar, 8 dots, instruction, **large stimulus tile**
  (gradient rounded square with a big letter), **2×2 answer tiles** (emoji 2rem + label).
- **Feedback:** selected tile gets emerald border + tint + ✅; others fade.
- **Next/previous:** none — auto-advance; back only exits the section.
- **Completion:** 🏆 emoji, "اكتمل التقييم الأولي بنجاح", overall score card (label + 2.25rem % +
  emerald bar), per-area rows (emoji, label, %, 5 stars, coloured bar), strengths (emerald panel)
  and support areas (amber panel), back to profile.
- **Issues:** fixed `max-w-sm` wastes desktop space and pushes answers below the fold at 712px
  height; colour-coded feedback + small ✅; timers for children; stone dialect.

---

## 7. Games UI audit

Common frame (`/games/:id/play`): sticky 4rem header (exit "خروج →", game emoji + title), category
gradient banner (emoji, title, description, difficulty pill), white card body, start screen with a
full-width gradient "ابدأ اللعبة" button; completion = gradient result panel (radius 48px,
`p-10`): headline, score 1.875rem, 5 ⭐, XP / level / streak glass tiles, new badge callout,
"العب مرة أخرى" / "كل الألعاب". **Layout bug:** undefined `blob` decorations take ~700px, pushing
every game below the fold (verified).

| Game                             | Layout & controls                                                          | Tokens / cards                                  | Feedback                      | Timer / progress / score                | Notes                                            |
| -------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------- | --------------------------------------- | ------------------------------------------------ |
| مطابقة البطاقات (Memory)         | 4-col grid of square cards (≈110px)                                        | pink-bordered cards with red "?"                | rotateY flip; matched state   | moves + mm:ss pills; restart link       | flipped face shows mirrored glyph (backface bug) |
| الكلمات المتقاطعة (Reading)      | stimulus card (emoji + diacritised word) + 2×2 word buttons                | white pill buttons                              | wrong = small red ⊗ icon only | "السؤال 1 من 7", "0 صحيح", progress bar | colour/icon-only feedback                        |
| الأرقام المفقودة (Math sequence) | sequence circles with gap + rule hint + 2×2 number buttons                 | circular number chips                           | correct/wrong tint            | "التسلسل 1 من 6"                        | shows the rule (gives answer away)               |
| تشكيل الجمل (Sentence builder)   | emoji + instruction, dashed drop zone, word chips tray, check button       | small pill chips                                | order check                   | "الجملة 1 من 5"                         | chips too small for children                     |
| المتاهة المنطقية (Pattern logic) | 3×3 emoji matrix with missing cell + 2-col options                         | round emoji cells                               | explanation after answer      | "لغز 1 من 5"                            | —                                                |
| صواني الألوان (Colour memory)    | intro card → 2×2 big colour pads with labels                               | saturated pads, glow when lit                   | sequence playback             | 8 level dots, "المستوى 1 من 8"          | colour-dependent (labels help)                   |
| استمع واختر (Audio quiz)         | big gradient speaker button, hint pill, question card, 2×2 answers         | answer buttons without borders (look like text) | spoken feedback               | "1 / 8" + progress                      | answers don't look tappable                      |
| فقّع البالون (Balloon pop)       | question banner, sky scene with floating SVG balloons                      | coloured balloons with 11px numbers             | wrong = shake                 | "السؤال 1 / 8", points                  | moving targets, tiny labels                      |
| رتّب الحروف (Word scramble)      | hint panel (amber), empty letter slots, purple letter tiles                | 48px round tiles                                | slot fill                     | "الكلمة 1 / 8", points                  | never submits result                             |
| ابحث وجِد! (Spot it)             | mission banner ("ابحث عن كل 🐱", 0/3), emoji grid in tinted cells          | light grey cells                                | found state                   | level 1/6, timer, segmented progress    | dense grid; never submits                        |
| تسلسل القصة (Story sequence)     | numbered draggable rows (emoji + sentence), check / shuffle / hint buttons | white rows with index badges                    | per-position check            | segmented progress "القصة 1 من 4"       | drag-only; crashes on finish                     |

**Reusable visual patterns:** player frame (header + gradient banner + card), start screen,
progress bar + counter row, stimulus card, 2×2 answer tiles, chip tray, result panel with stars,
confetti, sound effects. **Do not reuse** game logic or content.

### Test player (`/tests/:id/play`)

Dark teal→violet full-screen with floating particles; top bar: exit, "السؤال 1 / 3", tri-colour
progress bar, score pill, circular countdown; question pill "السؤال 1"; glass question card
(1.5–1.875rem 900 white); 2×2 glass answer buttons with Arabic letter badges (أ ب ج د); correct =
emerald tint + ✓ and a huge ✅ overlay; auto-advance after 1.6s; result screen with ring, medal,
stars. **Issues:** bidi flips math ("3 + 4 = ؟" rendered as "؟ = 4 + 3" mid-transition), different
dialect from games, timer for every question.

---

## 8. Chat UI audit

- **Desktop:** two white cards: conversation list (fixed 20rem, inline-start/right) with title
  "المحادثات" + "+" button; items = initial circle, name, last message excerpt; selected = solid
  primary fill with white text. Thread card: header (avatar, name, Arabic role), messages, composer
  (pill input "اكتب رسالتك..." + round primary send button with rotated icon).
- **Bubbles:** own = primary blue, white text, on the **left** (inline-end); received = light
  grey, dark text, on the right; radius 24px with one sharpened corner (physical classes);
  timestamps inside bubble in Arabic-Indic digits ("١:٤١ م").
- **Empty state:** chat icon + "اختر محادثة لتبدأ".
- **Unread:** amber count on the sidebar nav (misplaced); no per-conversation unread marker; no
  seen state.
- **New conversation:** modal listing all users (avatar, name, role); Escape doesn't close it.
- **Mobile (500px):** **broken** — both panes stay side by side; the thread shrinks to ~70px.
  Needs list ↔ thread stacked navigation.

---

## 9. Reports UI audit

- **List:** gradient hero "التقارير التحليلية" + "AI" pill; search + risk filter chips (الكل /
  مرتفع / متوسط / منخفض with coloured dots); 2-column report cards: coloured top border by risk,
  risk icon tile, title "تقرير تقييم شامل", date, probability pill, "مستوى الخطورة" bar, strengths
  (emerald tinted panel) and weaknesses (amber panel) excerpts, full-width soft "عرض التقرير الكامل".
- **Detail (max ≈48rem):** back arrow + title + date + download icon; **risk hero card** (red/amber/
  green gradient by level, big %, warning icon circle, stars, scale bar "لا صعوبة ← صعوبة مؤكدة");
  sections as white cards with coloured icon + coloured title: نقاط القوة (emerald), نقاط الضعف
  (amber/orange), التوصيات والخطة (violet) with **numbered pill rows**; primary back button.
- **Create:** header with author "بقلم: د. …"; segmented toggle "تقييم ذكي تلقائي (AI)" / "إدخال
  يدوي" (dark slate active); child picker cards (2-col, selected primary); manual: probability
  slider card, three textarea cards with emoji titles; big gradient submit.
- **PDF:** client screenshot-based export (icon button) — visual only.
- **Issues:** child name missing on cards/detail; AI branding for manual reports; risk thresholds
  inconsistent between screens.

---

## 10. Admin content UI audit

Replit has **no** categories/activities/questions/options management UI. Closest reusable CRUD
patterns found:

| Need                | Replit pattern to reuse                                                                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| List + search       | Super Admin users list: rounded rows, avatar, name/email, role pill, inline actions (edit ✎, delete 🗑 in tinted icon buttons), search pill + refresh button |
| Create/edit form    | Add-child modal (pill inputs, 2-column row, full-width save) and IEP modal (textareas, status select, date)                                                 |
| Delete confirmation | Super Admin confirm: centred modal, warning icon circle, title "حذف المستخدم", irreversible warning text, "إلغاء" (neutral) + "حذف" (red with trash icon)   |
| Filters             | Category chips with counts (tests/games catalogues), risk chips (reports)                                                                                   |
| Tabs                | Pill segmented control (profile, super admin)                                                                                                               |
| Cards               | Catalogue cards (gradient header with emoji, stars, difficulty pill, meta, actions)                                                                         |
| Empty state         | dashed rounded card                                                                                                                                         |
| Tables              | **none** — design needed (recommend responsive table on ≥1024 that collapses to cards)                                                                      |
| Action menus        | **none** — inline icon buttons only                                                                                                                         |
| Image upload        | **none** — design needed (activity icon, question/option images)                                                                                            |

---

## 11. Responsive audit

| Area            | 1440 desktop                       | 1280 laptop _(inferred)_ | 820 tablet                               | ≤500 mobile                              |
| --------------- | ---------------------------------- | ------------------------ | ---------------------------------------- | ---------------------------------------- |
| Sidebar         | fixed 18rem on right               | same                     | hidden → sticky header + hamburger       | drawer (opens from **left** — wrong)     |
| Dashboard grids | 4 stats; 3-col content             | 4 stats                  | 2-col stats                              | 1-col                                    |
| Card grids      | 3 (children), 4 (games ≥1280)      | 3                        | 2                                        | 1                                        |
| Tables          | none                               | —                        | —                                        | —                                        |
| Modals          | 28rem centred                      | same                     | same                                     | near full width                          |
| Forms           | 2-col rows in dialogs              | same                     | same                                     | same (tight)                             |
| Chat            | 2 panes                            | 2 panes                  | 2 panes                                  | **broken** (pane squeezed)               |
| Players         | centred 42rem card                 | same                     | same                                     | full width, tiles shrink                 |
| Assessment      | narrow 24rem column (wasted space) | same                     | same                                     | good                                     |
| Typography      | hero 4.5rem                        | —                        | 3.75rem                                  | 3rem; dashboard greeting 3rem → 1.875rem |
| Landing         | fine                               | —                        | hero words collide ("قدراته" + "بسهولة") | fine                                     |

---

## 12. RTL audit

**Correct (preserve):** `dir="rtl"` + `lang="ar"`; sidebar on the right; mostly logical classes
(`ms/me/ps/pe`, `start/end`, `border-e`, `text-start`); forward = ArrowLeft/ChevronLeft, back =
ArrowRight; range slider fills from the right; own chat bubbles on the inline-end; icons precede
labels on the inline-start.

**Incorrect (fix):**

- Mobile drawer anchored `end-0` but animated with physical `x: 100%` → appears on the left.
- Notifications popover positioned off-screen.
- Dialog close button `right-4`, `text-left`, `space-x` in shadcn primitives.
- Chat bubble corners `rounded-br-sm` / `rounded-bl-sm`; `text-right` in chat/test player.
- Report accent bars `border-r-4`; progress gradients `bg-gradient-to-r`.
- `ChevronRight` used for "forward" on the child profile in places.
- Hover nudges `-translate-x-1` (physical).
- Bidi: math expressions and mixed Latin/Arabic strings reorder ("3 + 4 = ؟") → wrap LTR
  fragments in `<bdi>`/`dir="ltr"`.
- Native date input shows `dd/mm/yyyy` LTR.
- Digits: Latin in most places, Arabic-Indic in chat — choose one.
- No breadcrumbs exist.

---

## 13. Accessibility-related visual issues

- **Contrast:** white on primary (2.86), white on amber (2.13), white on mint (1.92), muted text on
  muted (4.29), 50–60% muted labels (~2.0). See `DESIGN_SYSTEM.md` §9.
- **Font size:** 10–11px chips, XP labels, balloon numbers.
- **Touch targets:** sentence chips (~30px), letter badges, nav dots; most child tiles ≥56px ✔.
- **Focus:** global 2px primary outline ✔, but many `outline-none` inputs with faint rings.
- **Child readability:** text-only instructions (pre-readers), dense emoji grids, moving targets.
- **Button clarity:** audio quiz answers without borders; ghost links look like text.
- **Colour-only feedback:** red/green tints with small icons.
- **Motion:** constant floating loops, confetti, no reduced-motion handling; timers everywhere.
- **Labels:** 0 `htmlFor`; icon buttons unnamed; `maximum-scale=1` blocks zoom.

---

## 14. Preserve vs improve

| Preserve                                                                           | Improve                                                                        |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Warm cream + white cards + sky/amber palette                                       | Contrast of filled buttons and status colours                                  |
| Cairo/Tajawal heavy Arabic typography                                              | Minimum 12px text; one digit system                                            |
| Very soft, large-radius shape language                                             | One consistent radius scale (class names that don't lie)                       |
| Gradient hero banners, category gradients + emoji                                  | Single dialect (drop stone/cream and forced-dark variants unless chosen)       |
| Sidebar + user badge + pill nav                                                    | RTL drawer side, unread badge placement, popover positioning                   |
| Stat card rows, card grids with search, pill tabs/chips                            | Real data only (no fabricated stats)                                           |
| Child-friendly players: big tiles, stars, confetti, sounds                         | Reduced motion, non-colour feedback, tap alternatives to drag, optional timers |
| Role picker cards, password strength meter                                         | Labels, accessible names, zoom                                                 |
| Report detail structure (risk card + coloured sections + numbered recommendations) | Child name on reports, responsive chat, CRUD screens that don't exist yet      |
