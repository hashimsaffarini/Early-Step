# Security

## Credentials policy

- **Never commit** passwords, tokens, API keys, demo account credentials, or real `.env`
  files — in code, docs, `CLAUDE.md`, tests, fixtures, or commit messages.
- Demo accounts are used only for local manual testing. Keep them outside the repo or in a
  gitignored file (`*.local`, `credentials*` are gitignored).
- Before committing, review `git diff --staged` for secrets.
- If a secret is committed by mistake: rotate it first, then remove it. Do not rewrite shared
  history without the owner's approval.

## Environment variables

- `.env` is gitignored; `.env.example` contains placeholders only.
- Everything prefixed `VITE_` is embedded in the public JS bundle. Only put non-secret
  configuration there (e.g. the API base URL).

## Auth tokens

- Storage strategy is TBD (depends on backend auth design). Preference order:
  1. httpOnly, Secure, SameSite cookies set by the backend (not readable by JS).
  2. In-memory access token + refresh via httpOnly cookie.
  3. `localStorage` only if the backend requires it — accepting XSS exposure, documented in an ADR.
- Never log tokens. Clear tokens and the query cache on logout.

## API errors

- Show normalized `AppError` messages, not raw backend errors, stack traces, or SQL/server
  details.
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
