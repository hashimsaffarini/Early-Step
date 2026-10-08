# Player ↔ backend compatibility

Re-verified live 2026-10-08 with disposable `E2E Test …` questions of every type, added to the
initial assessment and to a training plan, answered, then removed and deleted (cleanup verified).

**Live facts behind every row**

- Question types: `SingleChoice`, `MultiSelect`, `Sequence` (`CorrectOrder`). **`Matching` was
  removed** from the backend: creating one → `400 "The value 'Matching' is not valid for Type."`,
  and `PairKey` is gone from the contract.
- Initial-assessment answer: **one** `{ questionId, selectedOptionId }` per question, for every
  type. A second answer to the same question → `400 "تمت الإجابة على هذا السؤال مسبقًا"`; array
  fields (`selectedOptionIds`, `orderedOptionIds`) are ignored (→ 404 "option not found").
  Response `{ questionId, isCorrect }` = the chosen option's `IsCorrect`.
- `complete` requires every question answered and returns the result (overall + per category).
- Child-facing plan activities hide answers (`isCorrect` absent, `correctOrder` null) and there is
  **no endpoint to submit plan-activity answers**.

| Player / type                                                                                                                                                                         | Where                      | Classification                  | Live request / behaviour                                                                   | Gap                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Initial assessment — `SingleChoice`                                                                                                                                                   | `AssessmentQuestionRunner` | **FULLY BACKEND-SUPPORTED**     | `{ questionId, selectedOptionId }` → 200 `{ isCorrect }`                                   | Result readable only from `complete` (no GET)                     |
| Initial assessment — `MultiSelect`                                                                                                                                                    | `AssessmentQuestionRunner` | **PARTIALLY BACKEND-SUPPORTED** | One option (hint "اختر إجابة واحدة."); correct if it is a correct option                   | No multi-option answer                                            |
| Initial assessment — `Sequence`                                                                                                                                                       | `AssessmentQuestionRunner` | **PARTIALLY BACKEND-SUPPORTED** | One option (hint "اختر إجابة واحدة."); accepted, **always scored incorrect**               | No ordered answer; scoring rule needed (`BACKEND_REQUESTS.md` §4) |
| Initial assessment — question without options                                                                                                                                         | `AssessmentQuestionRunner` | —                               | Shown as "cannot be answered" and skippable; `complete` then fails with the server message | Backend content issue (`BACKEND_REQUESTS.md` §1)                  |
| Plan activity — `SingleChoice` (test or game)                                                                                                                                         | `PlanActivityPlayerPage`   | **PARTIALLY BACKEND-SUPPORTED** | Questions load; child plays; "results not saved" notice                                    | No answer/result submission; no correctness exposed               |
| Plan activity — `MultiSelect` / `Sequence`                                                                                                                                            | `PlanActivityPlayerPage`   | **PARTIALLY BACKEND-SUPPORTED** | Served; shown as "not supported yet — skip"                                                | Nothing to submit to, so no single-option adapter is used here    |
| Admin authoring — SingleChoice, MultiSelect, Sequence                                                                                                                                 | Content admin              | **FULLY BACKEND-SUPPORTED**     | Create / edit / delete question and options; delete-all-options works                      | No "add one option" endpoint                                      |
| Matching                                                                                                                                                                              | —                          | **REMOVED BY BACKEND**          | Removed from the admin editor                                                              | —                                                                 |
| Local tests (6): الحروف، الأعداد، الذاكرة القصيرة، الاستماع، الكتابة، التفكير المنطقي                                                                                                 | `TestPlayerPage`           | **FRONTEND PRACTICE ONLY**      | Played locally, labelled as practice                                                       | No backend catalogue for parents/children; nothing saved          |
| Local games (11): مطابقة البطاقات، الكلمات المتقاطعة، الأرقام المفقودة، تشكيل الجمل، المتاهة المنطقية، صواني الألوان، استمع واختر، فقّع البالون، رتّب الحروف، ابحث وجِد!، تسلسل القصة | `GamePlayerPage`           | **FRONTEND PRACTICE ONLY**      | Played locally, labelled as practice                                                       | Custom game logic has no backend representation                   |

## Frontend changes in this round

- The assessment runner answers `MultiSelect` and `Sequence` with one option (it used to skip
  them, which made `complete` fail whenever the assessment contained them).
- `Matching` / `PairKey` removed from the admin question editor, option editor and mocks; the mock
  returns the live 400 for `Matching`.
