# Player ↔ backend compatibility

Re-verified live 2026-10-10 with disposable `E2E Test …` questions of every type, added to the
initial assessment and to a training plan, answered, completed, read back, then deleted
(cleanup verified).

**Question types:** `SingleChoice`, `MultiSelect`, `Sequence` (`CorrectOrder`). **Matching is still
unsupported** — creating one → `400 "The value 'Matching' is not valid for Type."` and it is absent
from the Swagger `QuestionType` enum.

## Initial assessment (`POST initial-assessment/{assessmentId}/answer`)

| Type         | Payload (verified)                       | Scoring (verified)                                                                           | Status                          |
| ------------ | ---------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------- |
| SingleChoice | `{ questionId, selectedOptionId }`       | `isCorrect` of the chosen option                                                             | **FULLY BACKEND-SUPPORTED**     |
| MultiSelect  | `{ questionId, selectedOptionId }` (one) | correct if the one option is a correct one; `selectedOptionIds` ignored (404)                | **PARTIALLY BACKEND-SUPPORTED** |
| Sequence     | `{ questionId, selectedOptionId }` (one) | **always incorrect**, even for the `CorrectOrder` 1 option; `orderedOptionIds` ignored (404) | **PARTIALLY BACKEND-SUPPORTED** |

A second answer to a question → `400 "تمت الإجابة على هذا السؤال مسبقًا"`. `complete` needs every
question answered and returns `{ overallScore, categories: [{ categoryName, percentage }] }`; the same
object is readable later with `GET initial-assessment/{childId}/result`. The app answers MultiSelect
and Sequence with one option ("اختر إجابة واحدة.") until the endpoint accepts arrays
(`BACKEND_REQUESTS.md` §2).

## Training-plan activities (`POST TrainingPlan/children/{childId}/activities/{planActivityId}/submit`)

| Type         | Payload (verified)                                       | Scoring (verified)                                 | Status                      |
| ------------ | -------------------------------------------------------- | -------------------------------------------------- | --------------------------- |
| SingleChoice | `{ questionId, selectedOptionId }`                       | correct option → correct; other → wrong            | **FULLY BACKEND-SUPPORTED** |
| MultiSelect  | `{ questionId, selectedOptionIds: [..] }`                | exactly the correct set → correct; partial → wrong | **FULLY BACKEND-SUPPORTED** |
| Sequence     | `{ questionId, orderedOptionIds: [..] }` (child's order) | right order → correct; wrong order → wrong         | **FULLY BACKEND-SUPPORTED** |

Body `{ answers: [...] }` (all answers at once) → `200 { message: "Activity submitted successfully." }`.
The plan then shows `correctAnswers`, `wrongAnswers`, `isCompleted`, `completedAt` (`score` stays
null); unanswered questions are not counted. **One attempt** — a second submit (or empty answers)
→ empty 500. The result endpoint (`GET …/{planActivityId}/result`) answers 403 to every available
role, so the parent sees "saved" and the specialist sees the counts in the plan.

**Player (`PlanActivityPlayerPage`):** SingleChoice = tap one; MultiSelect = toggle several, then
"التالي"; Sequence = tap options in order (position badges, "إعادة الترتيب"); unknown types or
questions without options can be skipped. Answers are submitted once at the end; completed
activities show "أُنجز هذا النشاط" instead of a second attempt. No right/wrong feedback is shown
because the server hides correct answers from the child.

## Admin authoring

SingleChoice, MultiSelect, Sequence: create / edit / delete questions and options, delete all options
— **FULLY BACKEND-SUPPORTED**. No "add one option" endpoint.

## Local practice content

| Content                                                                                                                                                                               | Status                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Local tests (6): الحروف، الأعداد، الذاكرة القصيرة، الاستماع، الكتابة، التفكير المنطقي                                                                                                 | **FRONTEND PRACTICE ONLY** |
| Local games (11): مطابقة البطاقات، الكلمات المتقاطعة، الأرقام المفقودة، تشكيل الجمل، المتاهة المنطقية، صواني الألوان، استمع واختر، فقّع البالون، رتّب الحروف، ابحث وجِد!، تسلسل القصة | **FRONTEND PRACTICE ONLY** |
