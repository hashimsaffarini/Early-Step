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

## Demo accounts (local testing)

- Provided by the user, used only for local manual testing and live API inspection.
- Store (if needed at all) in a gitignored file such as `.env.local` or `demo-accounts.local`
  — both patterns are ignored by `.gitignore`. Never in docs, tests, fixtures, screenshots, or
  commit messages. Never echo them in reports.
- Signing in with them through a browser on a remote host is done by the user, not by the
  assistant.

## Environment variables

- `.env` is gitignored; `.env.example` contains placeholders only.
- Everything prefixed `VITE_` is embedded in the public JS bundle. Only put non-secret
  configuration there (e.g. the API base URL).

## Auth tokens

- The API uses **bearer** tokens (Apidog `securitySchemes.bearer`). Token format, lifetime and
  refresh are **undocumented**; `rememberMe` on login suggests ASP.NET Identity — TBD.
- Storage strategy is TBD (depends on the verified login response). Preference order:
  1. httpOnly, Secure, SameSite cookies set by the backend (not readable by JS).
  2. In-memory access token + refresh via httpOnly cookie.
  3. `localStorage` only if the backend requires it — accepting XSS exposure, documented in an ADR.
- Never log tokens. Clear tokens and the query cache on logout.

## API errors

- Show normalized `AppError` messages, not raw backend errors, stack traces, or SQL/server
  details.
- 401 → clear session and redirect to login (via `onUnauthorized`). 403 → show the unauthorized
  state; do not retry. Exact backend behaviour for 401/403 is **TBD** (not documented).
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
