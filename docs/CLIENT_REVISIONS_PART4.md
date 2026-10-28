> **Subsequent client request 2026-10-28:** temporary frontend image copies, recovery of actual
> locally observed question choices, the narrow typo correction and batch question selection are
> now implemented. `FRONTEND_CONTENT_FALLBACKS.md` supersedes the earlier limitations below where
> a real local original/snapshot exists. Cross-device files and protected results still require
> backend support.

# Client revisions part 4

Source: «تعديلات بارت 4.docx», its ten screenshots and embedded 31-second video. Reviewed
2026-10-28. The video shows the visual-search game «ابحث وجِد!» (repeated target pictures in a grid).

## Implemented frontend behavior

- Specialist child file: compact brand header; full-width initial-assessment / training-plan tabs.
  The initial tab shows the server's category results and answer details, followed by an inline
  report editor. The plan tab retains assignment, activity management, results and teacher feedback.
  The report draft stays mounted when changing tabs. No fabricated photos, activity-level initial
  results or assessment dates: the result API groups by category and does not return dates.
- The user explicitly confirmed: child-data editing remains Parent-only; Specialist gets the new
  design, not unsupported editing permissions.
- Teacher child file: soft header with actual progress, compact figures, filterable activity table,
  completion dates and saved scores when supplied. Notes and a selectable child-answer panel sit
  below the history. A 403 on answers explains that the Specialist has access, without offering
  a retry that cannot succeed.
- Initial assessment: category cards are informational. The orange button is the only start action
  and always plays all categories. Returning to the intro preserves answers during this visit.
  An incomplete question set is blocked before answering, rather than skipping questions and
  reaching a completion request the server must reject.
- Admin initial-assessment editor: selected hierarchy retained, with an expandable category browser,
  real test/game counts, category checkboxes and expand/collapse controls. Membership changes save
  through existing endpoints immediately. Question membership is still known only for actions in
  this visit, because the backend has no read endpoint for it.
- Children directory: brand banner with a decorative illustration of two children, then the
  searchable child files. There is one page h1. Existing local art and tokens remain the visual basis.
- Images: a failing image URL no longer permanently hides replacement images in the same component.
- Games: new `spot-it` engine, editable level drafts for each template, and an admin preview of saved
  game content. The Admin reviews a draft and presses save; no records are created automatically.
  Games with an absent/unknown slug use visual search (or the sequence engine for ordered levels),
  keeping real option ids and existing answer payloads. Tests retain their generic player.
- Child age: 2–10 remains the accepted form range. Unsupported legacy ages from the API are treated
  as unknown instead of displaying “less than a year” or fabricating a replacement age.

## Live evidence and external limits

Read-only authenticated inspection on 2026-10-28: the Admin API returned four tests, two games,
and five questions across their detail responses. All five questions had options. Seven question /
option image URLs returned HTTP 404. No production content or child records were modified.

1. Missing uploaded files need backend static-file/storage repair. Frontend URL handling cannot
   recover a file the server does not serve. See `BACKEND_REQUESTS.md` #2.
2. The screenshot's «رتّب» typo and missing-option question were not reproduced in the currently
   inspected Admin content. No invented text/choices were substituted in the child player. If the
   assessment contains a stale question, the backend must return its options / remove the stale
   reference. The Admin can edit a question's actual text through its existing editor.
3. Teacher access to saved answers remains server-controlled. Existing contracts permit Specialist
   access; teacher screens explain unavailable answers rather than bypassing roles.
4. Initial-assessment question membership still cannot be restored from the API after reload.
   The UI must not present unknown membership as a confirmed checked/unchecked state.
5. Initial-assessment rows are categories, because the API does not send the activity grouping or
   last-assessment dates drawn in the reference. No fictitious rows/dates are added.

## Validation

Run `npm run validate` (strict typecheck, ESLint, unit/integration tests using MSW, production build).
Browser checks use development mock mode for Parent, Teacher, Specialist and Admin, including mobile
and desktop layouts. They do not assert that unavailable backend permissions or missing files work.
