# Player ↔ backend compatibility

Re-verified live 2026-10-14 with disposable `E2E Test …` questions of every type (9 assessment
cases + 2 plan activities), added to the initial assessment and to a training plan, answered,
completed, read back, then deleted (cleanup verified; one child is stuck — `BACKEND_REQUESTS.md` §2).

**Question types:** `SingleChoice`, `MultiSelect`, `Sequence` (`CorrectOrder`). **Matching does not
exist** — absent from the Swagger `QuestionType` enum (re-checked 10-14) and not in the frontend.
Both players build answers with the shared `components/players/choiceAnswer.ts`.

## Initial assessment (`POST initial-assessment/{assessmentId}/answer`)

| Type         | Payload (verified)                        | Case tested → `isCorrect`                                                                             | Status                      |
| ------------ | ----------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------- |
| SingleChoice | `{ questionId, selectedOptionId }`        | correct → true; incorrect → false                                                                     | **FULLY BACKEND-SUPPORTED** |
| MultiSelect  | `{ questionId, selectedOptionIds: [..] }` | exact set → true; reversed order of the exact set → true; partial → false; with a wrong extra → false | **FULLY BACKEND-SUPPORTED** |
| Sequence     | `{ questionId, orderedOptionIds: [..] }`  | exact order → true; reversed → false; partially right (1-3-2) → false                                 | **FULLY BACKEND-SUPPORTED** |

A second answer to a question → `400 "This question has already been answered."`. `complete` needs
every question answered. Scores: category `percentage` = rounded % correct (4 of 9 → 44),
`overallScore` = % over all questions (5 of 12 → 41.67). `GET initial-assessment/{childId}/result`
adds per question: `questionType`, `isCorrect`, `childAnswers` (in the child's order) and
`correctAnswers` (in the right order) — shown to staff in the child profile. The child gets no
right/wrong feedback.

**Player (`AssessmentQuestionRunner`):** SingleChoice = tap one; MultiSelect = toggle several, then
"التالي"; Sequence = tap in order (position badges, "إعادة الترتيب", "التالي" waits for every option).
One answer is sent per question on "التالي".

## Training-plan activities (`POST TrainingPlan/children/{childId}/activities/{planActivityId}/submit`)

| Type         | Payload (verified)                                       | Scoring (verified)                                       | Status                      |
| ------------ | -------------------------------------------------------- | -------------------------------------------------------- | --------------------------- |
| SingleChoice | `{ questionId, selectedOptionId }`                       | correct option → correct; other → wrong                  | **FULLY BACKEND-SUPPORTED** |
| MultiSelect  | `{ questionId, selectedOptionIds: [..] }`                | exact set (any order) → correct; partial / extra → wrong | **FULLY BACKEND-SUPPORTED** |
| Sequence     | `{ questionId, orderedOptionIds: [..] }` (child's order) | right order → correct; reversed / partial → wrong        | **FULLY BACKEND-SUPPORTED** |

Body `{ answers: [...] }` (all answers at once) → `200 { message: "تم إرسال إجابات النشاط بنجاح." }`
(Parent only). **Every question must be answered** (partial → `400 "All activity questions must be
answered."`), `answers: []` → `400 "يجب إرسال إجابة واحدة على الأقل."`, a second submit →
`409 "تم إرسال نتيجة هذا النشاط مسبقًا."`. The plan row then has `score` (rounded % correct: 4 of 9 →
44), `correctAnswers`, `wrongAnswers`, `isCompleted`, `completedAt`; the plan's `progress` = % of
completed activities (50 → 100, status `Completed`). `GET …/{planActivityId}/result` (**Specialist
only**; 404 before the submission) returns the same row plus `questions[{ questionId, questionText,
type, selectedOptions[], isCorrect }]` — no correct answers.

**Player (`PlanActivityPlayerPage`):** the same three answer modes; answers are submitted once at the
end. An activity with a question that has no options (or an unknown type) is not started, because
the server would refuse the submission. Completed activities show "أُنجز هذا النشاط"; 400/409 messages
are shown as sent (no retry button); network / 5xx errors offer "إعادة محاولة الحفظ". The
specialist opens "عرض إجابات الطفل" in the plan to see the child's answers and the verdicts.

## Admin authoring

SingleChoice, MultiSelect, Sequence: create / edit / delete questions and options, delete all options
— **FULLY BACKEND-SUPPORTED**. No "add one option" endpoint.

## Local practice content

| Content                                                                                                                                                                               | Status                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Local tests (6): الحروف، الأعداد، الذاكرة القصيرة، الاستماع، الكتابة، التفكير المنطقي                                                                                                 | **FRONTEND PRACTICE ONLY** |
| Local games (11): مطابقة البطاقات، الكلمات المتقاطعة، الأرقام المفقودة، تشكيل الجمل، المتاهة المنطقية، صواني الألوان، استمع واختر، فقّع البالون، رتّب الحروف، ابحث وجِد!، تسلسل القصة | **FRONTEND PRACTICE ONLY** |
