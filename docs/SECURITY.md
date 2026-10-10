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

## Live backend findings — re-checked 2026-10-08 and 2026-10-10

Checked with **status codes and access behaviour only** (anonymous requests to the formerly open
endpoints, one fictional `.invalid` email for forgot-password, a CORS preflight). No personal data
was downloaded or recorded. Registration role restriction was **not** probed by sending privileged
roles (an account created that way could not be deleted) — it is a confirmation request to the
backend team (`BACKEND_REQUESTS.md` §10).

### Graduation-project scope

| Severity | Finding                                                                                             | Status 2026-10-08                                                                                                                             | Recommendation                       |
| -------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Critical | `GET /api/Admin/*` answered without authentication                                                  | **FIXED** (10-07)                                                                                                                             | Keep `[Authorize]` everywhere        |
| Medium   | `GET Admin/categoriesActivity` answered anonymously                                                 | **FIXED** — 401                                                                                                                               |                                      |
| Medium   | `POST initial-assessment/{id}/answer` processed anonymously                                         | **FIXED** — 401                                                                                                                               |                                      |
| Medium   | Forgot-password revealed whether an email exists                                                    | **FIXED** — neutral 200 on both routes                                                                                                        |                                      |
| High     | Registration accepted a client-supplied `Role`                                                      | **RESOLVED (contract, 10-10)** — Swagger `Auth/register` has no `Role` field; not exercised live (no user delete, no privileged-role probing) | Keep public registration parent-only |
| Medium   | `GET Chats/users` gave any user every user's name and role                                          | **RESOLVED (10-10)** — parent and specialist receive only related users                                                                       | Keep                                 |
| Low      | Some `SuperAdmin/children` `parentName` values are email addresses                                  | **NOT RETESTED**                                                                                                                              | Store display names                  |
| Info     | Plan-activity submit: Parent only (Specialist 403, anonymous 401); assessment result: anonymous 401 | **VERIFIED** (good, 10-10)                                                                                                                    | Keep                                 |
| Info     | Child-facing plan activities hide answers; cross-role calls 403; chat outsider 404                  | **VERIFIED** (good)                                                                                                                           | Keep                                 |

### Production hardening (not graduation blockers)

| Item                                         | Status                                                               | Recommendation                                |
| -------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------- |
| CORS `Access-Control-Allow-Origin: *`        | Present — intentional for development (Replit, several environments) | Restrict to the deployed frontend origin(s)   |
| Swagger UI / OpenAPI public                  | Present                                                              | Protect or disable in production              |
| No refresh token / server logout (120 h JWT) | Backend decision — out of scope                                      | Shorter-lived tokens + refresh for production |
| Notifications                                | Out of scope                                                         | —                                             |

### Test hygiene note (2026-10-08)

A failing live test printed the full Axios error, including the demo Parent account's bearer
token, to the **local terminal only** (nothing was committed or written to docs). The live suites
now strip `config`, `request` and `response` from errors before Vitest reports them
(`src/test/live/liveSession.ts`). The backend has no logout/revocation endpoint, so that token stays
valid until it expires (120 h); changing the demo Parent password does not revoke it either.

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
