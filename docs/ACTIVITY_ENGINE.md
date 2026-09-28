# Activity Engine — Tests, Games, Initial Assessment

Discovery analysis (2026-09-28). Sources: Apidog API (`docs/API_ENDPOINTS.md`) and the Replit
prototype source. **Nothing here is implemented.** Items marked _inference_ or **TBD** need
confirmation from the backend team / product owner before implementation.

## 1. Summary

| Question             | Real API (source of truth for contracts)                                                                                                                              | Replit prototype                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| What is an Activity? | Admin-managed content item: `title`, `description`, `slug`, `categoryId`, `Icon`, `type`, plus **Questions → Options**.                                               | Two separate tables: `games` (metadata only) and `tests` (metadata + questions JSON blob).                            |
| Activity types       | `test` (path segment / `?type=test`; Arabic display `اختبارات`). `game` is implied by `gamesCount` in the summary endpoint but **has no documented endpoints** — TBD. | `game` and `test` as separate entities.                                                                               |
| Category             | Admin CRUD, `{ id, name, count, isDeleted, isInInitialAssessment }`. Example names: الحروف والقراءة، الأرقام والحساب، الذاكرة والتسلسل، التذكير والانتباه.            | Free-text `skillType` (Memory, Reading, Math, Writing, Logic, Listening).                                             |
| Question             | `{ id, questionText, questionImageUrl, type, order, options[] }`; types seen: `SingleChoice`, `MultiSelect`, `Sequence`.                                              | JSON `{ question, options: string[], correct: index, timeLimit? }` — single choice only.                              |
| Option               | `{ id, optionText?, optionImageUrl?, isCorrect, order, correctOrder?, pairKey? }` — image-only options allowed.                                                       | plain strings.                                                                                                        |
| Game logic           | No engine/template field anywhere.                                                                                                                                    | 11 **hard-coded React game components**, each with its own hard-coded content; DB row only picks the component by id. |
| Initial assessment   | Server session: admin composes it from categories + questions; child answers one question at a time; complete requires all answered.                                  | 4 hard-coded mini-games (reading, math, memory, attention); client computes 4 scores; one POST.                       |
| Scoring              | Server-side (inference from `score`, `correctAnswers`, `wrongAnswers`).                                                                                               | Client-side.                                                                                                          |
| Training plan        | Specialist-owned list of activities per child with `order`, `isCompleted`, results.                                                                                   | Ad-hoc `child_activities` rows (= play log); separate free-text IEP.                                                  |

## 2. Entity relationships (real API)

```text
Category 1 ──* Activity (type: test | game?) 1 ──* Question 1 ──* Option
    │                         │                     │
    │ isInInitialAssessment   │                     └── used by InitialAssessment (questionIds)
    └── InitialAssessment.categories                │
                                                    │
Child 1 ──1 TrainingPlan? 1 ──* PlanActivity (activityId, order, score, correctAnswers,
                                              wrongAnswers, isCompleted, completedAt)
Child 1 ──* InitialAssessmentSession (start → answer* → complete)
```

Whether `TrainingPlan` is an explicit entity or implicit (created on first activity assignment)
is **TBD**.

## 3. Question types and answer payloads

| Type                     | Seen in API | Meaning (inference)                    | Answer payload                                                             |
| ------------------------ | ----------- | -------------------------------------- | -------------------------------------------------------------------------- |
| `SingleChoice`           | ✅          | One correct option                     | `{ questionId, selectedOptionId }` ✅ documented (initial assessment only) |
| `MultiSelect`            | ✅          | Several options with `isCorrect: true` | **TBD** — single `selectedOptionId` can't express it                       |
| `Sequence`               | ✅          | Options ordered by `correctOrder`      | **TBD**                                                                    |
| Matching (via `pairKey`) | field only  | Options paired by `pairKey`            | **TBD** — type name unknown                                                |

`CorrectOrder` and `PairKey` can only be set through **Edit Option**, not Create Question —
TBD whether create accepts them.

## 4. "Creating a game" — scope decision

These are completely different scopes:

- **A. Configure game content** — admin creates an activity (type game) with questions/options;
  the frontend renders it with a _generic player per question type_ (tap-choice, multi-select,
  drag-to-order, matching). Fits the real API.
- **B. Create arbitrary new game logic** — each game is custom code (Replit approach). The real
  API has **no field** to select a game engine/template, no config, no difficulty, no timing.

**Evidence strongly favours A for the real product** (_inference_). Replit's procedural /
timing-based games (Simon colour memory, spot-it grid search, random math generation, odd-one-out
grids) **cannot be represented** by the current API. **Decision needed from the product owner.**

### Replit game → API question-type mapping

| Replit game / mini-game                                                                                                       | Maps to                                | Fit                       |
| ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------- |
| Test player (4-option quiz), ReadingGame, BalloonPop, MathSequence, PatternLogic (grid as image), AudioQuiz (needs audio/TTS) | `SingleChoice` (text or image options) | Good                      |
| SentenceBuilder, StorySequence, WordScramble                                                                                  | `Sequence`                             | Good once payload defined |
| MemoryGame (word ↔ emoji pairs), letter → picture                                                                             | Matching / `pairKey`                   | Plausible (TBD)           |
| "Select all X"                                                                                                                | `MultiSelect`                          | Partial                   |
| ColorMemory (Simon), SpotIt, Attention odd-one-out, MathGame (random)                                                         | —                                      | **Not representable**     |

If games are "templates" (option A), the frontend needs these presentation engines, each
driven by question data:

1. **Choice player** — SingleChoice/MultiSelect with large text/image option tiles.
2. **Order player** — Sequence with tap-to-place (drag optional) for motor accessibility.
3. **Match player** — pairKey matching (tap-tap pairing, not drag-only).
4. Optional presentation skins (balloons, cards) over the same data — **TBD**, not required.

## 5. Initial assessment lifecycle

| Step                     | Real API                                                                                                                | Status                                                                        |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Compose                  | Admin adds categories (`POST /initial-assessment/categories/{id}`) and questions (`POST /initial-assessment/questions`) | Documented                                                                    |
| Read composition         | `GET /initial-assessment/categories` → `{ categories }`                                                                 | Documented (item shape TBD)                                                   |
| Start                    | `POST /initial-assessment/{childId}/start`                                                                              | Response (session id? questions?) **TBD**                                     |
| Sections                 | Presumably grouped by category                                                                                          | **TBD**                                                                       |
| Answer                   | `POST /initial-assessment/{id}/answer { questionId, selectedOptionId }`                                                 | `{id}` = session id or child id **TBD**; MultiSelect/Sequence payload **TBD** |
| Navigation / back / skip | —                                                                                                                       | **TBD** (all questions required to complete)                                  |
| Timing                   | —                                                                                                                       | **Not supported** by API                                                      |
| Retry / resume / retake  | —                                                                                                                       | **TBD**                                                                       |
| Complete                 | `POST /initial-assessment/{id}/complete`                                                                                | Documented (error if unanswered)                                              |
| Result                   | —                                                                                                                       | **No read endpoint** — TBD (critical for Admin review)                        |
| Report                   | Specialist creates manual reports separately                                                                            | —                                                                             |

### What the frontend tracks vs. what the backend calculates

| Concern                                              | Owner                                                                                                                                                               |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current question index, selected option, UI progress | Frontend (local state; not persisted server-side beyond submitted answers)                                                                                          |
| Correctness, scores, correct/wrong counts            | Backend (_inference_) — frontend must not compute official scores                                                                                                   |
| Response speed / time per question                   | **Not supported by API.** Requirement exists in product vision ("response speed"); backend must add fields before frontend tracks it                                |
| Errors / repeated errors / attempts                  | Not supported (one answer per question)                                                                                                                             |
| Focus / attention time                               | **Not supported.** The browser cannot reliably infer "focus"; `visibilitychange`/`blur` only detect tab/window switches. Must be defined by product + backend first |
| Progress                                             | Derivable from answered count (frontend)                                                                                                                            |

## 6. Training-plan activity lifecycle

| Step                                   | Endpoint                                                                                                           | Status                                                      |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| Specialist lists assignable activities | `GET /TrainingPlan/specialist/children/{childId}/available-activities?type=`                                       | Documented                                                  |
| Add / remove                           | `POST` / `DELETE …/activities[/{activityId}]`                                                                      | Documented                                                  |
| View plan                              | `GET /TrainingPlan/specialist/children/{childId}` (specialist) / `GET /TrainingPlan/children/{childId}/activities` | Documented; which roles may call the second is TBD          |
| Child plays activity                   | —                                                                                                                  | **No endpoint to submit answers / complete** — blocking gap |
| Results                                | `score`, `correctAnswers`, `wrongAnswers`, `isCompleted`, `completedAt` on plan activity                           | Read-only fields                                            |
| Teacher feedback                       | `POST /Teacher/children/{childId}/notes { content }`                                                               | Documented (per child, not per activity)                    |

## 7. Replit features with no API support

Gamification (XP, levels, streaks, badges, leaderboard), difficulty levels, per-game audio
(Web Audio tones), TTS (`speechSynthesis` ar-SA), AI risk evaluation, rule-based risk
probability, skill analysis charts, IEP free-text plans. **Out of scope unless the backend adds
support** — see `docs/GAP_ANALYSIS.md`.

## 8. Replit defects not to carry over

- Results attributed to the first child in the list; test results posted with the wrong id.
- `timeTaken` hard-coded; 3 of 11 games never submit a result; one crashes on finish.
- Difficulty context never applied.
- Game/test CRUD open to every role on the Replit server.
- Assessment content errors and reshuffling options on re-render.

## 9. Open questions (blocking for Stage "Initial Assessment" / "Games")

1. Is a game content configured on a generic player (A) or custom logic (B)?
2. Exact `type` enum values and game endpoints (`/Admin/activities/game`?).
3. Full question-type list; matching type name; can create accept `CorrectOrder`/`PairKey`?
4. Answer payloads for MultiSelect / Sequence / Matching.
5. `start` response shape; meaning of `{id}` in answer/complete; resume/retake rules.
6. How to read initial-assessment results (who, which endpoint, per-category scores?).
7. Endpoint for a child to play/submit a training-plan activity.
8. Timing / response-speed / focus requirements — are they in scope and who computes them?
9. Audio/TTS for pre-readers (4–6)? Stored audio or client TTS?
10. Who operates the device during child play (parent session? child login?).
