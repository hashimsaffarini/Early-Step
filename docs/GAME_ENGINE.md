# Game engine — four Early Step games (client revision 2026-10)

Early Step ships four reusable, child-friendly **game engines**. They are frontend product code;
every game the child plays is a **real backend Activity of type `game`**: its title, icon, questions,
options and saved result come from the API. Nothing about a child's game (assignment, answers,
score, completion) is invented or stored only in the browser.

```text
Admin creates a game Activity (template saved in `Slug`) → adds its questions
→ Specialist assigns it to a child (Training Plan)
→ Parent / Teacher press «ابدأ» → the template's engine opens with the activity's real questions
→ answers are sent once through the existing submit endpoint → score / completion stored in backend
```

## 1. Architecture

`src/components/games/` (shared layer — both the Admin content feature and the activities player
use it, and features never import each other):

| File                                                                    | Role                                                                                  |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `types.ts`                                                              | `GameSlug`, `GameTemplate`, `GameQuestion`, `ChallengeProps`                          |
| `registry.ts`                                                           | `GAME_TEMPLATES`, `resolveGameTemplate(slug)`, `buildGameSlug`, `engineFor`           |
| `shared/GameStage.tsx`                                                  | One game look: identity band, progress, the real question (text + image), instruction |
| `shared/GameOptionCard.tsx`                                             | Big colourful option card (native button; server image or text; selected / order)     |
| `shared/GameChallenge.tsx`                                              | Renders one question with the right engine                                            |
| `letter-hunt/`, `number-match/`, `memory-sequence/`, `focus-challenge/` | The four engines (one question each)                                                  |

The registry holds only template metadata (slug, Arabic name, purpose, description, instruction,
compatible question types, icon, tone, engine). No student data, no activities.

The runner is `features/activities/components/PlanGameRun.tsx`; the routing decision is in
`PlanActivityPlayerPage`.

## 2. The four games

| Slug              | Arabic name  | Purpose           | Question type | Interaction                                                                               | Answer sent                    |
| ----------------- | ------------ | ----------------- | ------------- | ----------------------------------------------------------------------------------------- | ------------------------------ |
| `letter-hunt`     | صيد الحروف   | الحروف والقراءة   | SingleChoice  | Big letter cards; tap one (replaces the choice)                                           | `selectedOptionId`             |
| `number-match`    | طابق الرقم   | الأرقام والحساب   | SingleChoice  | Large round number cards (the server's options — nothing counted or invented)             | `selectedOptionId`             |
| `memory-sequence` | تحدي الذاكرة | الذاكرة والتسلسل  | Sequence      | Tap-to-order (no drag needed): numbered badges + «ترتيبك» slots, «تراجع», «إعادة الترتيب» | `orderedOptionIds` (tap order) |
| `focus-challenge` | تحدي التركيز | التركيز والانتباه | MultiSelect   | Grid of cards to select / unselect, counter «اخترت n من m», «مسح الاختيار»                | `selectedOptionIds`            |

Correctness is never decided on the device: the server scores the submission. Option images are
shown when the server sends them; a missing or failing image falls back to the option text (or
«الخيار n») — never a broken image. All cards are native buttons (keyboard, focus ring,
`aria-pressed`, Arabic labels), motion respects `prefers-reduced-motion`, layout uses logical CSS
properties (RTL) and two shrinkable columns on phones.

**Mixed questions.** A question whose type is not the template's own type is played with the engine
made for that type (SingleChoice → letter cards, Sequence → memory, MultiSelect → focus), so every
real question stays answerable (the server saves a result only when every question is answered).
Questions are never rewritten.

## 3. Backend mapping and the `slug` field

- **Persistence (exists):** the Activity `Slug` (`POST/PUT Admin/activities/{type}`, multipart
  `Slug`; returned by `GET Admin/activities/*`). The game template is saved there: the template
  slug itself (`letter-hunt`) or with a suffix (`letter-hunt-2`) so several games can share one
  template. `resolveGameTemplate` accepts exactly `template` or `template-…`; nothing is matched by
  database GUID or by title.
- **Reading it in the player (missing):** the live Training Plan endpoints the Parent / Teacher
  player uses (`GET TrainingPlan/children/{id}/activities[/{activityId}]`, verified 2026-10-15)
  do **not** return `slug`. The app already reads an optional `slug` there; **until the backend
  adds it, game activities open in the generic player** (they keep working). Backend request:
  return the activity `slug` on the Training Plan activity responses (and optionally on
  `available-activities`).
- **Answers:** `toChoiceAnswer` (shared with the generic player and the initial assessment).
- **Submission:** once, at the end: `POST TrainingPlan/children/{childId}/activities/{planActivityId}/submit`
  `{ answers }`. On success the Training Plan queries are invalidated (activity, plan, progress).
  The finish button is disabled while saving; 400 / 409 are final (no retry, «تم إرسال نتيجة هذا
  النشاط مسبقًا.»), network / 5xx errors offer «إعادة محاولة الحفظ».

## 4. Routing and fallback

Same route as before (no new URL, no extra ids exposed):
`/{parent|teacher}/children/:childId/activities/:activityId/play`.

| Activity                             | Player                     |
| ------------------------------------ | -------------------------- |
| type ≠ game                          | generic activity player    |
| game, known slug (`letter-hunt[-…]`) | the template's game engine |
| game, unknown slug or no slug        | generic activity player    |

An activity completed before the page opened shows «أُنجز هذا النشاط» (one attempt). After this
session's submission the completion screen stays and shows the saved result **only with what the
server returns** for the role (score / correct / wrong when present; otherwise «تم حفظ إجاباتك
(n من m أسئلة)»). No stars, points or rewards.

Leaving a game with unsaved answers asks first (in-app navigation: «مغادرة اللعبة؟»; tab close /
reload: the browser's prompt). Temporary per-question state lives in component state only.

## 5. Admin creation

الأنشطة والأسئلة → الألعاب:

- «قوالب الألعاب»: the four templates (name, purpose, question types) with «إنشاء لعبة» — an
  explicit action that opens the normal form with the template chosen. Nothing is created
  automatically and no starter content is injected.
- «إضافة لعبة» / edit: «نوع اللعبة» (or «بدون قالب (المشغّل العام)»); the chosen template shows its
  purpose, description and compatible question types; the slug follows the template (a suffix is
  kept when switching) and a slug that does not start with the template is rejected in Arabic.
- Game detail page: «نوع اللعبة: …» with how many questions fit the template, and guidance when
  some do not; questions, options, images and correct answers are edited as for any activity.

## 6. Specialist assignment

Child page → «إضافة نشاط» → «ألعاب»: the real game activities (`available-activities?type=game`),
with the template name when the server sends the slug; assigned with the existing
`POST TrainingPlan/specialist/children/{id}/activities { activityId }` (no duplication).

## 7. Who plays

Parent and Teacher see «ابدأ» on unfinished plan activities (child page, game card with the game
icon and «لعبة»). The same engine is used for both roles. Live (2026-10-14) the submit endpoint
accepts the Parent only; a Teacher submission shows the server's error.

## 8. Mock mode

Mock mode (development only) gives the child «نور» four game rows (one per template) whose
child-facing detail includes the requested `slug`, so the engines can be reviewed end to end. This
mock field is marked as a requested backend field; production never uses mock data.
