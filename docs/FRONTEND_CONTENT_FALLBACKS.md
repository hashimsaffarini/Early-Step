# Temporary frontend content fallbacks

The client explicitly approved temporary frontend fallbacks on 2026-10-28. These updates supersede
part 4's earlier missing-image-only behavior. Child-directory art was already implemented and retained.

## Uploaded pictures

- New activity icons, question pictures and option pictures keep their original blobs after the API
  acknowledges saving. Update keys use actual entity ids; creation binds the ids from the response
  or a unique before/after readback. Indistinguishable choices whose ordering was discarded are
  never assigned a guessed picture; their individual editor can bind the original to the exact
  option id. No extra records are created to obtain images.
- `ServerImage` first uses the actual remote URL. A 404/failure or missing URL can use the stored
  local blob. Editors also preview local copies. This covers Admin content, plan players, game
  engines, initial-assessment choices and answer displays.
- Tested with actual browser CacheStorage: a 256×256 PNG loaded from a blob URL after reloading the
  page. Unit tests verify the original bytes, image MIME type and restoration after module reload.
- Storage is temporary (seven days, at most 64 entries) and local to this browser and site origin.
  It cannot transfer pictures from one device/origin to another. If storage is denied/full, the
  current visit can still use memory, but persistence is unavailable.
- An already missing file cannot be reconstructed from its URL. Select its original once through
  the existing image editor and save. Never substitute an unrelated picture or placeholder as if it
  were the question's true image. A failed server save retains the previous local file.

## Question text and choices

The exact missing-راء phrase in the reference is repaired by a narrowly scoped text correction in
Admin content, assessment play/results and training-plan play/results. Existing correct prompts and
unrelated text stay unchanged; ids and payloads are untouched.

Actual choices are cached from previously read content with their real ids and display text/images.
No `isCorrect`, scores, child identity or child answers are stored. A question lacking choices can
recover that snapshot only if its id, type and text match. A notice identifies locally recovered
choices. Fresh choices from the server always win; intentional option/question deletions invalidate
local content. An unknown question with no real snapshot remains blocked rather than receiving fake
options that cannot be submitted.

## Assessment composition

Category membership still comes from the server. Within a category, native checkboxes allow selecting
one question or every question of an activity. Batch inclusion uses the documented `questionIds`
payload; removals are acknowledged individually. The local history restores confirmed actions after
reload and uses a mixed state for unknown/partial selections. It does not claim to know changes made
from another device or reconstruct historical membership never supplied by the API.

## Remaining external boundaries

These fallbacks do not broaden Teacher permissions, share local files between devices, manufacture
missing image originals or create official results. Protected child-answer endpoints still require
backend permission. No new production records were written during testing; API-shaped behavior was
verified with MSW, plus browser storage checks in local mock mode.
