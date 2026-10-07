# Security

## Credentials policy

- **Never commit** passwords, tokens, API keys, demo account credentials, or real `.env`
  files — in code, docs, `CLAUDE.md`, tests, fixtures, or commit messages.
- Demo accounts are used only for local manual testing. Keep them outside the repo or in a
  gitignored file (`*.local`, `credentials*` are gitignored).
- Before committing, review `git diff --staged` for secrets.
- If a secret is committed by mistake: rotate it first, then remove it. Do not rewrite shared
  history without the owner's approval.

## Discovery findings (2026-09-28)

- **The public Apidog documentation contains real-looking example emails and passwords**,
  including an admin login example, and one password reused across several accounts. They are
  deliberately **not** copied into this repo. **Recommendation to the backend owner:** rotate
  those passwords and replace the examples with placeholders.
- The Replit workspace notes (`replit.md`) also contain a demo account password — not copied.
- Replit's prototype backend has many access-control holes (IDOR on children/users/IEP, open
  CRUD). It is **not** a model for authorization; the real backend must enforce access.
- Replit loads a third-party script (ResponsiveVoice) with a public key and never uses it — do
  not carry over.

## Live backend findings — re-checked 2026-10-07

Re-checked with **status codes and access behaviour only** (anonymous sweep of all 75 Swagger
operations; one fictional `.invalid` email for forgot-password; a CORS preflight). No personal data
was downloaded or recorded; nothing was exploited beyond confirming whether access is protected.
Registration role restriction was **not** probed — it is a question for the backend team
(`BACKEND_REQUESTS.md` §5).

| Severity | Finding                                                                                                 | Status 2026-10-07                                        | Recommendation                                                 |
| -------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------- |
| Critical | `GET /api/Admin/*` answered without authentication (users, emails, children)                            | **FIXED** — 67 of 69 protected operations now return 401 | Keep `[Authorize]` on every controller                         |
| Medium   | `GET Admin/categoriesActivity?type=` answers anonymously (category names/counts, no personal data)      | **STILL PRESENT**                                        | `[Authorize(Roles = "Admin")]`                                 |
| Medium   | `POST initial-assessment/{id}/answer` is processed without authentication (404 for unknown id, not 401) | **STILL PRESENT**                                        | `[Authorize]` + check the assessment's child belongs to caller |
| High     | Registration accepts a client-supplied `Role`                                                           | **NOT RETESTED** — open question to the backend team     | Public registration = Parent only                              |
| Medium   | Forgot-password reveals whether an email exists (`400 "Email not found."`)                              | **STILL PRESENT**                                        | Same response for known/unknown emails (UI is already neutral) |
| Medium   | CORS `Access-Control-Allow-Origin: *`                                                                   | **STILL PRESENT** (no credentials header)                | Restrict to the frontend origin(s)                             |
| Medium   | `GET Chats/users` gives any signed-in user (including parents) every user's name and role               | **STILL PRESENT**                                        | Limit to related staff/parents                                 |
| Low      | Swagger UI and OpenAPI public in production                                                             | **STILL PRESENT**                                        | Protect/disable in production                                  |
| Low      | Some `SuperAdmin/children` `parentName` values are email addresses                                      | **NOT RETESTED**                                         | Store display names                                            |
| Info     | Child-facing plan activities hide answers (`isCorrect` absent, `correctOrder`/`pairKey` null)           | **VERIFIED** (good)                                      | Keep                                                           |
| Info     | Authenticated cross-role calls return 403; outsider reading a chat conversation gets 404                | **VERIFIED** (good)                                      | Keep                                                           |

Frontend route guards (`RequireRole`) are **UX only** and do not mitigate any of the above.

## Demo accounts (local testing)

- Provided by the user, used only for local manual testing and live API inspection.
- Stored only in the gitignored `.env.e2e.local` (pattern `.env.*`, also `*.local`). Scripts read
  it locally; values are never printed. Never in docs, tests, fixtures, screenshots, or
  commit messages. Never echo them in reports.
- Signing in with them through a browser on a remote host is done by the user, not by the
  assistant.
- Live test suites (`npm run test:live:read` / `test:live:write`) read them from
  `.env.e2e.local` at run time and never print them; the write suite only creates clearly named
  `E2E Test …` records and fails if its cleanup leaves anything behind.

## Environment variables

- `.env` is gitignored; `.env.example` contains placeholders only.
- Everything prefixed `VITE_` is embedded in the public JS bundle. Only put non-secret
  configuration there (e.g. the API base URL).

## Auth tokens and session (verified live 2026-10-07)

- Bearer token from `POST /api/Auth/login` → `{ id, fullName, accessToken, role }` (JWT, 120 h;
  parsed by `features/auth/api/loginResponse.ts`; the payload is decoded for display/routing only,
  never trusted for authorization).
- Storage: `sessionStorage` by default, `localStorage` when "تذكّرني" is checked
  (`services/session/sessionStore.ts`). Web storage is readable by scripts on this origin, so XSS
  prevention is essential. The backend offers no httpOnly cookie, refresh or logout endpoint.
- Expired tokens (JWT `exp`) are treated as signed out. A 401 from any request signs out and
  clears the TanStack Query cache; logout does the same locally. No data from one account
  survives for the next.
- Tokens are never logged or written to docs/tests.

## API errors

- Show normalized `AppError` messages, not raw backend errors, stack traces, or SQL/server
  details.
- 401 → clear session + cache, guards redirect to login (`AuthHttpBridge`). 403/404 on a child or
  report → not-found state; never retried. Verified live: 401 is an ASP.NET ProblemDetails body.
- Uploaded media (`/uploads/...`) is served by the API; render only as `<img src>`, never as HTML.
- Detailed error logging only in development (`import.meta.env.DEV`).

## XSS awareness

- Rely on React's escaping. Avoid `dangerouslySetInnerHTML`; if unavoidable (e.g. rich text),
  sanitize with a vetted sanitizer and record an ADR.
- Never build URLs/`href`s from untrusted input without validation (`javascript:` URLs).
- Chat messages and user-generated content are untrusted.

## Role protection

- Route guards and conditional rendering improve UX only.
- **Frontend authorization is not security.** The backend must enforce authorization on every
  endpoint. Never rely on hiding a button to protect data.

## Children's data

The platform handles data about minors and possible learning difficulties. Treat it as
sensitive: minimal display, no logging of personal data, no third-party analytics/trackers
without explicit approval.

## Dependencies

- Add dependencies sparingly; prefer well-maintained packages.
- Run `npm audit` periodically; address real issues.
