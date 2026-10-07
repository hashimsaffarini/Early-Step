# Player ↔ backend compatibility

Verified live 2026-10-07 with disposable `E2E Test …` activities and questions (all four question
types), created, added to a plan, read as the parent, then removed and deleted (cleanup verified).

**Facts that decide every row**

- Admin can author all four question types (`SingleChoice`, `MultiSelect`, `Sequence`, `Matching`)
  with `IsCorrect`, `CorrectOrder` and `PairKey`.
- The **child-facing** plan-activity detail returns questions as `{ planQuestionId, questionId,
questionText, questionImageUrl, type, order, options: [{ id, optionText, optionImageUrl, order,
correctOrder: null, pairKey: null }] }` — answers are hidden (no `isCorrect`; `correctOrder` and
  `pairKey` are always `null`).
- There is **no endpoint to submit plan-activity answers or results**; plan `score`,
  `correctAnswers`, `wrongAnswers`, `isCompleted` cannot be set by the child.
- The initial assessment accepts **one** `selectedOptionId` per answer, returns
  `{ questionId, isCorrect }`, and `complete` returns `{ overallScore, categories[] }`.

| Player / type                                                                                        | Where                              | Classification                  | What works                                                                     | What is missing                                                                                |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Initial assessment — `SingleChoice`                                                                  | `AssessmentQuestionRunner`         | **FULLY BACKEND-SUPPORTED**     | Questions from `start`, each answer saved, result from `complete` shown        | A GET results endpoint to show the result again later                                          |
| Initial assessment — `MultiSelect`                                                                   | `AssessmentQuestionRunner`         | **PARTIALLY BACKEND-SUPPORTED** | Server accepts one option id                                                   | Multi-option answer payload; the app skips these questions honestly                            |
| Initial assessment — `Sequence`                                                                      | `AssessmentQuestionRunner`         | **PARTIALLY BACKEND-SUPPORTED** | Questions are served                                                           | Ordered answer payload; skipped                                                                |
| Initial assessment — `Matching`                                                                      | `AssessmentQuestionRunner`         | **PARTIALLY BACKEND-SUPPORTED** | Questions are served                                                           | Pairs answer payload; skipped                                                                  |
| Plan activity — `SingleChoice` (test or game)                                                        | `PlanActivityPlayerPage`           | **PARTIALLY BACKEND-SUPPORTED** | Questions load from the plan; child can play; "results not saved" notice shown | Answer/result submission; correctness (answers hidden, so no right/wrong feedback)             |
| Plan activity — `MultiSelect`                                                                        | `PlanActivityPlayerPage`           | **PARTIALLY BACKEND-SUPPORTED** | Served; shown as "not supported yet — skip"                                    | Answer submission; correctness                                                                 |
| Plan activity — `Sequence`                                                                           | `PlanActivityPlayerPage`           | **PARTIALLY BACKEND-SUPPORTED** | Served (options with `order`); skip                                            | `correctOrder` is nulled; answer submission                                                    |
| Plan activity — `Matching`                                                                           | `PlanActivityPlayerPage`           | **PARTIALLY BACKEND-SUPPORTED** | Served; skip                                                                   | `pairKey` is nulled, so the two sides cannot even be grouped; answer submission                |
| Admin authoring — all 4 types                                                                        | Content admin                      | **FULLY BACKEND-SUPPORTED**     | Create / edit / delete question and options                                    | "Delete all options" is a no-op (backend bug); no "add one option" endpoint                    |
| Local tests: الحروف، الأعداد، الذاكرة القصيرة، الاستماع، الكتابة، التفكير المنطقي (6)                | `TestPlayerPage` (`data/tests.ts`) | **FRONTEND PRACTICE ONLY**      | Played locally, labelled as practice                                           | No backend catalogue for parents/children; nothing saved                                       |
| Local games: مطابقة البطاقات، الكلمات المتقاطعة، الأرقام المفقودة، تشكيل الجمل، المتاهة المنطقية (5) | `GamePlayerPage` (`games/*`)       | **FRONTEND PRACTICE ONLY**      | Played locally, labelled as practice                                           | Custom game logic has no backend representation (no template/engine field)                     |
| Local games: صواني الألوان، استمع واختر، فقّع البالون، رتّب الحروف، ابحث وجِد!، تسلسل القصة (6)      | `GamePlayerPage` (`games/*`)       | **FRONTEND PRACTICE ONLY**      | Played locally, labelled as practice                                           | Same; timing/procedural games (colour memory, spot-it) cannot be expressed as questions at all |

## Changes made in this round

- **Bug fixed:** the plan player required `questions[].id`, which the live API never sends — every
  activity with questions showed "النشاط غير موجود في الخطة التدريبية". It now reads `questionId`
  (`features/activities/api/planActivityApi.ts`); the mock serves the live shape; tests cover the
  live shape, unsupported types and the correctness-only-if-exposed path.

## What the backend would need for full support

See `BACKEND_REQUESTS.md` items 3–5 (plan-activity answer/result submission, multi-option answer
payloads, assessment results endpoint).
