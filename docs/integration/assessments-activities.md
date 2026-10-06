# Integration status — initial assessment & activity play

Fork I-C, 2026-10-06. Nothing here was verified against the live backend (no working demo
account; no live requests were made). All behaviour is tested with MSW mocks.

| Feature                                   | API                                                                                | UI                                                                                                                   | Integration                                                     | Tests                                             | Status                                         |
| ----------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------- |
| Start initial assessment (Parent)         | `POST initial-assessment/{childId}/start`                                          | intro + start button (`/parent/assessment/:childId`)                                                                 | mutation, lenient start parser                                  | page + parser unit tests                          | IMPLEMENTED, NOT LIVE-VERIFIED                 |
| Answer a question                         | `POST initial-assessment/{assessmentId}/answer` `{ questionId, selectedOptionId }` | answer tiles + "التالي" (sent before advancing)                                                                      | mutation, documented 200-`{message}` failures treated as errors | request bodies asserted                           | IMPLEMENTED, NOT LIVE-VERIFIED                 |
| Complete assessment                       | `POST initial-assessment/{assessmentId}/complete`                                  | neutral "تم إرسال التقييم" only after success; retry on failure                                                      | mutation                                                        | happy path + failure                              | IMPLEMENTED, NOT LIVE-VERIFIED                 |
| MultiSelect / Sequence / Matching answers | none (contract takes one option id)                                                | shown as "غير مدعوم بعد", skippable                                                                                  | —                                                               | skip test                                         | BLOCKED BY BACKEND                             |
| Assessment results / scores               | none                                                                               | no score shown; note that results are not available                                                                  | —                                                               | asserted no %/score                               | BLOCKED BY BACKEND                             |
| Staff starting an assessment              | —                                                                                  | neutral message, no request                                                                                          | —                                                               | test                                              | Not in scope (Parent only, plan decision)      |
| Plan activity detail + play               | `GET TrainingPlan/children/{childId}/activities/{activityId}`                      | `/{role}/children/:childId/activities/:activityId/play`                                                              | query (`queryKeys.trainingPlans.childActivity`), lenient parser | play / empty / not-in-plan / no-correctness tests | IMPLEMENTED, NOT LIVE-VERIFIED                 |
| Save training-plan activity results       | none                                                                               | "لن تُحفظ النتيجة — الخادم لا يدعم حفظ نتائج الأنشطة بعد"                                                            | —                                                               | asserted                                          | BLOCKED BY BACKEND                             |
| Tests / games catalogues (non-admin)      | none (activities endpoints are Admin-only)                                         | local practice content labelled "تدريب — لا تُحفظ النتائج"; fake assign dialog removed; staff pointed to child plans | —                                                               | catalogue tests                                   | BLOCKED BY BACKEND (kept as labelled practice) |
| 11 games + practice test player           | none                                                                               | unchanged play; practice notice on result screens                                                                    | local only                                                      | existing tests                                    | Local practice only                            |

## Assumptions (to verify with a working account)

- **Start response** is undocumented. Accepted: `assessmentId` | `id` with `questions[]`, or
  `categories[{ name, questions }]`, optionally under `data`. Questions follow the admin model
  (`questionText`, `questionImageUrl`, `type`, `options[{ id, optionText, optionImageUrl }]`).
  A body with only `{ message }` is a failure (Apidog shows "الطفل غير موجود أو لا يوجد تقييم
  أولي متاح." as a 200 response).
- **Answer / complete** return 200 with `{ message }` both on success and (per Apidog) on
  failure. Only the documented failure strings ("لا يمكن إرسال الإجابة.", "لا يمكن إنهاء التقييم.
  تأكد من الإجابة على جميع الأسئلة.") are treated as errors — other wording would be read as
  success. **High priority to verify live; ideally the backend should return 4xx for failures.**
- **Plan activity detail**: whether `{activityId}` is the plan-row id or the activity id is
  unknown (mock accepts both); whether `questions[]` and `isCorrect` are included is unknown.
- Question images use `resolveMediaUrl` (server-relative `/uploads/...`).

## Gaps / backend requests

1. Results endpoint for the initial assessment (Admin/Specialist review, Parent summary).
2. Answer payloads for MultiSelect, Sequence, Matching.
3. Endpoint to submit training-plan activity answers/results.
4. Activities read endpoint for non-admin roles (catalogues).
5. Return 4xx (not 200 + message) for failures on start/answer/complete/activity detail.
