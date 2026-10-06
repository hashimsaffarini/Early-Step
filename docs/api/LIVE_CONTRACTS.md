# Live API contracts (verified 2026-10-06)

Observed with read-only Python requests (outside the repo) using the demo accounts, and re-checked
by the app's own fetchers in `npm run test:live`. **Structures and types only — no personal data.**
`guid`, `string`, `int`, `bool`, `datetime`, `url` (`/uploads/...`) describe value types.
Base URL `https://earlystep22.runasp.net/api/`; paths below are relative to it.

## Auth

| Request                                                       | Result                                                                                                                                     |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `POST Auth/login` multipart `Email`, `Password`, `RememberMe` | `200 { id: guid, fullName, accessToken, role }` — no cookie; `RememberMe` changes nothing observable                                       |
| Token                                                         | JWT, issuer `EarlyStepAPI`, audience `EarlyStepClient`, **120 h**; claims: `…/nameidentifier`, `…/name`, `…/emailaddress`, `…/role`, `exp` |
| Wrong credentials                                             | `401` ProblemDetails                                                                                                                       |
| Role values                                                   | `ولي أمر` (Parent), `معلم/ة` (Teacher), `أخصائي/ة` (Specialist; `أخصائي` also appears in stats), `Admin`, `SuperAdmin`                     |
| Cross-role calls (authenticated)                              | `403` (parent→staff dashboards, specialist→admin/teacher, super admin↔admin)                                                               |

## Parent

| Endpoint                                                    | Shape                                                                                                                                                                 |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET Parent/GetMyChildren`                                  | `[{ id, fullName, age: int, gender: "بنت"\|"ولد", parentId }]`                                                                                                        |
| `GET Parent/{childId}`                                      | `{ id, fullName, age, gender, gamesCount, testsCount, reportsCount }`                                                                                                 |
| `GET Reports/child/{childId}`                               | no reports → **`404 { message: " لا يوجد تقرير ." }`** (list shape not yet observed)                                                                                  |
| `GET TrainingPlan/children/{id}/activities`                 | **`type` required** → `400` ProblemDetails without it                                                                                                                 |
| `GET TrainingPlan/children/{id}/activities?type=test\|game` | `[{ planActivityId, activityId, title, iconUrl, type: "اختبارات", isCompleted }]` (case-insensitive `type`)                                                           |
| `GET TrainingPlan/children/{id}/activities/summary`         | `{ gamesCount, testsCount, totalCount }`                                                                                                                              |
| `GET TrainingPlan/children/{id}/activities/{activityId}`    | by **catalogue `activityId`**: `{ planActivityId, activityId, title, description, iconUrl, type, isCompleted, questions[] }` (questions empty in the observed sample) |

## Specialist

| Endpoint                                                               | Shape                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET specialist/dashboard`                                             | `{ "عددالأطفال الكلي": int, "عددالتقارير": int }`                                                                                                                                                                                                                                                                                                   |
| `GET specialist/children`                                              | `[{ id, fullName, parentId, parentName, age, gender, progressPercentage: int }]`                                                                                                                                                                                                                                                                    |
| `GET specialist/Reports`                                               | `[]` observed (item shape not yet observed)                                                                                                                                                                                                                                                                                                         |
| `GET specialist/teachers`                                              | `[{ id, fullName }]` (**new**)                                                                                                                                                                                                                                                                                                                      |
| `GET TrainingPlan/specialist/children/{id}`                            | `{ id, childId, childName, specialistId, specialistName, teacherId, teacherName, status: "Active", activities: [{ trainingPlanActivityId, activityId, title, description, iconUrl, type, order, assignedAt, score, correctAnswers, wrongAnswers, isCompleted, completedAt }] }`; no plan → **`404 { message: "لا توجد خطة تدريبية لهذا الطفل." }`** |
| `GET TrainingPlan/specialist/children/{id}/available-activities?type=` | `[{ id, title, description, iconUrl\|null, type, categoryId, categoryName, isAssigned, questionCount }]`                                                                                                                                                                                                                                            |

## Admin

| Endpoint                             | Shape                                                                                                                                                                                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET Admin/dashboard`                | `{ "إجمالي المستخدمين", "إجمالي التقارير", "إجمالي الانشطة", "إجمالي الفئات", "عدد الأطفال" }` (ints)                                                                                                                                      |
| `GET Admin/users?Role=&Search=`      | `{ totalUsers, totalParents, totalSpecialists, totalTeachers, users: [{ id, fullName, email, role, emailConfirmed, childrenCount }] }` — lists parents, specialists, teachers only; `Role` filters by the Arabic value                     |
| `GET Admin/users/{id}`               | user + `children: [{ id, fullName, age, gender, parentId, parentName, specialistId\|null, specialistName\|null }]`                                                                                                                         |
| `GET Admin/categories`               | `[{ id, name, count, isDeleted, isInInitialAssessment }]`                                                                                                                                                                                  |
| `GET Admin/categoriesActivity?type=` | same item shape; `type` required (400 without)                                                                                                                                                                                             |
| `GET Admin/activities/{test\|game}`  | `[{ id, title, description, slug, type, iconUrl\|null, categoryId, categoryName, questionCount, createdById, createdByName\|null, questions: [] }]`                                                                                        |
| `GET Admin/activities/{type}/{id}`   | same + `questions: [{ id, questionText, questionImageUrl\|null, type, order, options: [{ id, optionText\|null, optionImageUrl\|null, order, isCorrect, correctOrder\|null, pairKey\|null }] }]` — types seen `SingleChoice`, `MultiSelect` |
| `GET Admin/questions/{id}`           | the question object above                                                                                                                                                                                                                  |
| `GET initial-assessment/categories`  | `{ categories: [{ id, name, order }] }` — **did not match** the `isInInitialAssessment` flags (reported)                                                                                                                                   |

## Super Admin

| Endpoint                             | Shape                                                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `GET SuperAdmin/dashboard`           | `{ totalUsers, totalReports, totalActivities, usersByRole: [{ role, count }] }`                              |
| `GET SuperAdmin/users?Search=&Role=` | `[{ id, fullName, email, role, emailConfirmed }]` (all five roles)                                           |
| `GET SuperAdmin/children?Name=`      | `[{ id, fullName, age, gender, parentId, parentName }]` (some `parentName` values are emails — data quality) |

## Chat

| Endpoint                  | Shape                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| `GET Chats/users`         | `[{ id, name, role }]` — a parent receives **every user** (all roles)                    |
| `GET Chats/conversations` | `[]` for the demo parent (item shape = Swagger `ConversationResponse`, not yet observed) |
| `GET Chats/unread-count`  | `int`                                                                                    |

## Not available / not deployed

| Capability                            | Finding                                                              |
| ------------------------------------- | -------------------------------------------------------------------- |
| Initial-assessment results            | No endpoint in Swagger or Apidog — **pending backend clarification** |
| `GET Teacher/feedbacks` (Apidog only) | **404** live — not deployed; Swagger has no notes list               |
| Teacher endpoints                     | not verified — no teacher demo account                               |
| Write endpoints                       | not exercised live — waiting for authorized disposable test records  |
