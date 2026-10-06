# Temporary mock data (UI migration phase)

> **Update 2026-10-06:** feature-level mock files were removed from production code. Mock data
> now lives only in `src/mocks/fixtures/*` behind the MSW handlers (tests + development mock
> mode). Mock children use **age** (API model) and GUID-like ids; mock sign-in accounts are listed
> in `src/mocks/README.md` (fictional, mock mode only).

The UI is built before the backend is integrated. Every screen uses **local, clearly labelled
mock data** (`TEMPORARY UI MOCK DATA` / `TEMPORARY UI DEMO CONTENT` file headers). There are no
fake API services. When a screen is connected to the API, delete its mock file.

Features never import each other, so each feature keeps its own mock file. To keep the
prototype coherent, all mock files follow **this shared roster** (same ids, names and facts).
Names are fictional; there is no real child data. No mock contains diagnoses, risk levels,
percentages or success claims.

## Users (mock sessions — `src/app/dev/mockSessions.ts`)

| Role       | Name          |
| ---------- | ------------- |
| Parent     | محمد أحمد     |
| Teacher    | أ. سارة خالد  |
| Specialist | أ. ليلى حسن   |
| Admin      | خالد سعيد     |
| SuperAdmin | عبدالله منصور |

Other parents (appear in staff views and chat): خالد يوسف, علي حسن, سامي محمود.

## Children

| id             | Name | Gender | Birth date | Parent     | Status               | Teacher      | Specialist  |
| -------------- | ---- | ------ | ---------- | ---------- | -------------------- | ------------ | ----------- |
| `mock-child-1` | يوسف | ولد    | 2019-03-12 | محمد أحمد  | training-plan-active | أ. سارة خالد | أ. ليلى حسن |
| `mock-child-2` | نور  | بنت    | 2021-07-02 | محمد أحمد  | assessment-completed | أ. سارة خالد | أ. ليلى حسن |
| `mock-child-3` | ريم  | بنت    | 2022-01-20 | محمد أحمد  | assessment-pending   | —            | أ. ليلى حسن |
| `mock-child-4` | عمر  | ولد    | 2018-11-05 | محمد أحمد  | assessment-completed | —            | —           |
| `mock-child-5` | سلمى | بنت    | 2019-09-14 | خالد يوسف  | training-plan-active | أ. سارة خالد | أ. ليلى حسن |
| `mock-child-6` | آدم  | ولد    | 2020-04-03 | علي حسن    | assessment-completed | أ. سارة خالد | أ. ليلى حسن |
| `mock-child-7` | ليان | بنت    | 2018-06-21 | سامي محمود | training-plan-active | —            | أ. ليلى حسن |

Visibility: the parent sees children 1–4; the teacher sees 1, 2, 5, 6; the specialist sees
1, 2, 3, 5, 6, 7; the admin and super admin see all seven.

## Reports

| id         | Child          | Title                 | Date       | Author      |
| ---------- | -------------- | --------------------- | ---------- | ----------- |
| `report-1` | `mock-child-1` | تقرير متابعة          | 2026-09-22 | أ. ليلى حسن |
| `report-2` | `mock-child-1` | تقرير التقييم المبدئي | 2026-09-12 | أ. ليلى حسن |
| `report-3` | `mock-child-2` | تقرير التقييم المبدئي | 2026-09-20 | أ. ليلى حسن |
| `report-4` | `mock-child-5` | تقرير متابعة          | 2026-09-24 | أ. ليلى حسن |
| `report-5` | `mock-child-6` | تقرير التقييم المبدئي | 2026-09-15 | أ. ليلى حسن |
| `report-6` | `mock-child-7` | تقرير متابعة          | 2026-09-08 | أ. ليلى حسن |

Report content is neutral observations (strengths, areas to support, numbered
recommendations) — never a diagnosis, risk level or probability.

## Activities

- **Games** — the 11 Replit games, ids in `src/features/activities/data/games.ts`
  (`memory-match`, `word-reading`, `missing-numbers`, `sentence-builder`, `pattern-logic`,
  `color-memory`, `listen-choose`, `balloon-pop`, `word-scramble`, `spot-it`, `story-sequence`).
- **Tests** — ids `letters-test` (اختبار الحروف), `numbers-test` (اختبار الأعداد),
  `short-memory-test` (اختبار الذاكرة القصيرة), `listening-test` (اختبار الاستماع),
  `writing-test` (اختبار الكتابة), `logic-test` (اختبار التفكير المنطقي).
- **Training plans** — يوسف: "خطة المهارات الأساسية" (8 activities, 3 completed, from
  2026-09-26); سلمى and ليان also have active plans. Plan activities reference the game/test ids
  above so "العب" links open the right player.
