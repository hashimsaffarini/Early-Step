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

## Live backend findings (2026-10-06) — reported to the backend team

Checked with read-only, unauthenticated requests only. **No personal data from these responses
is recorded anywhere in this repository.** Live security probing has stopped until the backend
team confirms remediation (user instruction).

| Severity     | Finding                                                                                                                                                                                                | Evidence (no data recorded)                                                    | Recommendation                                                                                                                                                                                                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Critical** | Every `GET /api/Admin/*` endpoint answers **without authentication** (200): dashboard, the full user list (names + emails of all users), user detail with children, categories, activities, questions. | Unauthenticated GET sweep; only response _keys_ were inspected.                | Add `[Authorize(Roles = "Admin")]` (or a policy) to the whole Admin controller; audit every controller for missing attributes. Assume the Admin **write** endpoints (create/update/delete categories, activities, questions, assign specialist) are also open — they were deliberately **not** tested. |
| High         | Registration accepts `Role` as a free client-supplied string. If not restricted server-side, anyone could self-register as staff/admin.                                                                | Swagger request schema (`Role: string`). Not tested (would create an account). | Ignore client roles on public registration (parents only) or whitelist.                                                                                                                                                                                                                                |
| Medium       | Forgot-password reveals whether an email has an account (`400 "Email not found."`).                                                                                                                    | One request with a fictional `.invalid` email.                                 | Return the same response for known and unknown emails. The UI already shows a neutral message.                                                                                                                                                                                                         |
| Medium       | CORS allows any origin (`Access-Control-Allow-Origin: *`).                                                                                                                                             | Preflight response.                                                            | Restrict to the deployed frontend origin(s).                                                                                                                                                                                                                                                           |
| Low          | Swagger UI and the OpenAPI document are public in production.                                                                                                                                          | `/swagger/v1/swagger.json`.                                                    | Acceptable for a graduation project; disable or protect in production.                                                                                                                                                                                                                                 |
| Info         | Demo accounts provided for verification all returned 401.                                                                                                                                              | One login attempt each; no retries.                                            | Backend team to confirm accounts, passwords, confirmation status and roles.                                                                                                                                                                                                                            |

Frontend route guards (`RequireRole`) are **UX only** and do not mitigate any of the above.

## Demo accounts (local testing)

- Provided by the user, used only for local manual testing and live API inspection.
- Stored only in the gitignored `.env.e2e.local` (pattern `.env.*`, also `*.local`). Scripts read
  it locally; values are never printed. Never in docs, tests, fixtures, screenshots, or
  commit messages. Never echo them in reports.
- Signing in with them through a browser on a remote host is done by the user, not by the
  assistant.

## Environment variables

- `.env` is gitignored; `.env.example` contains placeholders only.
- Everything prefixed `VITE_` is embedded in the public JS bundle. Only put non-secret
  configuration there (e.g. the API base URL).

## Auth tokens and session (implemented, NOT LIVE-VERIFIED)

- Bearer token from `POST /api/Auth/login` (response shape undocumented — parsed leniently by
  `features/auth/api/loginResponse.ts`; JWT payload decoded for display/routing only, never
  trusted for authorization).
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
