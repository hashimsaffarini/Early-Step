# CLAUDE.md — Early Step

Primary instructions for Claude Code in this repository. Read this first, every session.

## 1. Project overview

**Early Step** is an Arabic-only, RTL React web app for children aged ~4–10 who may have
learning difficulties, and for the adults supporting them. Graduation project.

Actors: **Parent, Teacher, Specialist, Admin, SuperAdmin**.

High-level flow: Parent registers → adds children → child completes initial assessment
(tests/games) → Admin reviews → Admin assigns Specialist → Specialist creates training
plan → Specialist assigns Teacher → Teacher follows progress and gives feedback →
Specialist monitors progress.

Current status: foundation, discovery, UI foundation and the **public landing + auth UI** are
implemented (`/`, `/login`, `/register`, `/forgot-password`, `/reset-password`). **Backend
authentication is not implemented** (forms validate locally, nothing is sent). **The logged-in
product (dashboards, roles, guards) has not started.**
Next steps: `docs/IMPLEMENTATION_PLAN.md`.

## External references

| Reference        | Location                                                 | Role                                                                    |
| ---------------- | -------------------------------------------------------- | ----------------------------------------------------------------------- |
| GitHub           | <https://github.com/hashimsaffarini/Early-Step> (`main`) | Official repo                                                           |
| Backend API docs | <https://e3mockwfb7.apidog.io/> (index: `/llms.txt`)     | **Source of truth for contracts**                                       |
| Replit prototype | <https://replit.com/@Zainmoneer04/Earlysteps> (private)  | **Visual/UX reference only** — it has its own unrelated Express backend |
| Backend base URL | not yet provided (TBD)                                   | `VITE_API_BASE_URL`                                                     |

## Source-of-truth hierarchy

1. **Backend API** → contracts, data models, server-enforced permissions, capabilities.
2. **Replit** → visual design, layout, UX patterns, existing screens.
3. **Written requirements** → intended business workflow.

If they disagree, **do not silently pick one** — document the conflict in
`docs/GAP_ANALYSIS.md` and ask.

## 2. Product purpose

This repo is the **frontend only**. The backend is external and is the source of truth for
data, contracts, and authorization. Details: `docs/PROJECT_CONTEXT.md`,
`docs/PRODUCT_REQUIREMENTS.md`.

## 3. Tech stack

React 19 · TypeScript (strict) · Vite 6 · React Router 7 (data router) · TanStack Query 5 ·
Axios · React Hook Form + Zod 4 · Zustand (only when justified) · Vitest + Testing Library ·
ESLint (typescript-eslint strict type-checked) · Prettier · npm.

Do **not** add libraries without a concrete need; record new ones in `docs/DECISIONS.md`.
Never add: Next.js, Redux, i18n libraries, UI kits (until the design reference is inspected).

## 4. Architecture rules

- Feature-oriented: `src/features/<domain>/` holds each domain's api, components, pages,
  schemas, types. Create subfolders **only when needed**.
- Dependency direction: `app → features → shared (components, services, hooks, lib, config,
constants, types, utils, styles)`. Shared code **never** imports from `features/` or `app/`.
- **Features never import from other features.** If two features need something, move it to
  a shared layer, or compose them in `app/` / a page.
- Other layers import a feature only through its `index.ts`.
- Use the `@/` alias; deep relative imports (`../../`) are lint errors.
- No generic `helpers/` or `misc/` dumping grounds; no giant utility files.
- Full rules: `docs/ARCHITECTURE.md`.

## 5. Arabic & RTL (mandatory)

- `<html lang="ar" dir="rtl">` is set globally. Every screen is RTL.
- Use CSS logical properties (`margin-inline-start`, `padding-inline-end`,
  `inset-inline-start`, `text-align: start`) — not `left`/`right`.
- Direction-sensitive icons (arrows, chevrons, "back") must be mirrored for RTL.
- Use `dir="ltr"` only on inherently LTR fragments (emails, URLs, code, Latin brand text).

## 6. No localization

Arabic only. **No i18n library, no language switcher, no translation files.** UI text is
written in Arabic directly. Backend enum values are kept exactly as the API sends them and
mapped to Arabic labels for display (e.g. `ROLE_LABELS` in `src/constants/roleLabels.ts`).
Never rename or translate values sent to/received from the API.

⚠️ The API docs show **Arabic enum values on the wire** for some fields (role `ولي أمر`, gender
`بنت`/`ولد`, activity type `اختبارات`) and English for others (question types, `type=test`).
`src/types/roles.ts` assumes English keys — **verify live before building auth** (see
`docs/ROLES_AND_PERMISSIONS.md`).

## 7. API integration rules

- All HTTP goes through `httpClient` (`src/services/http/httpClient.ts`).
- Request functions live in `features/<x>/api/`. **Components never call Axios directly.**
- Errors are normalized to `AppError` (`src/services/http/apiError.ts`). UI never reads raw
  Axios/backend errors.
- Base URL comes only from `VITE_API_BASE_URL` via `src/config/env.ts`. Never hardcode URLs.
- **Never invent endpoints, payloads, response shapes, or error formats.** If the API docs
  don't say it, it's TBD — ask.
- Known API traits: bearer auth; GUID ids; mixed `multipart/form-data` and JSON bodies (send
  `FormData` where documented); inconsistent `/api` prefix and casing (use documented paths
  verbatim); relative media URLs (`/uploads/...`); Arabic message strings; response schemas
  mostly undocumented — verify live.
- Details: `docs/API_INTEGRATION.md`, catalogue: `docs/API_ENDPOINTS.md`.

## 8. State management rules

- **TanStack Query** = server state (fetching, caching, mutations, invalidation).
- **React state** = local UI state.
- **Zustand** = only genuinely global client state (e.g. session token, if needed). Never put
  server responses in Zustand.
- Query keys are typed factories per feature. Details: `docs/STATE_MANAGEMENT.md`.

## 9. Code quality rules

- Strict TypeScript. No `any`, no `@ts-ignore`/`@ts-expect-error` to silence real errors,
  no non-null assertions to paper over logic.
- Small, focused components; composition over large components; no business logic in JSX
  where avoidable; no nested ternaries.
- No magic strings/numbers: use constants, `as const` objects, unions, `ROUTE_PATHS`.
- Forms: React Hook Form + Zod, schemas colocated in `features/<x>/schemas/`.
- Styling: CSS Modules per component + tokens from `src/styles/tokens.css` only — no hardcoded
  colors/sizes, logical properties only (ADR-017). Reuse `src/components/ui/*` primitives
  (Button, FormField, Modal, …) before writing new markup; check `/ui-preview` (dev) visually.
- Dialogs/drawers use the native `<dialog>` wrappers (`Modal`, `ConfirmDialog`); icons come from
  `lucide-react`; icon-only buttons need an Arabic `label`.
- Semantic HTML and accessibility by default (labels, roles, focus, keyboard, contrast).
- No premature abstractions: extract on the second real use, not the first imagined one.

## 10. Security rules

- **Never commit secrets**: passwords, tokens, API keys, demo account credentials, real
  `.env` files. Not in code, not in docs, not in this file, not in commit messages.
- Demo accounts provided by the user are for local manual testing only; keep them out of
  the repo (e.g. a gitignored `*.local` file or just the conversation).
- `.env` is gitignored; `.env.example` holds placeholders only.
- Frontend authorization is UX only — the backend enforces security.
- No `dangerouslySetInnerHTML` with untrusted content. Details: `docs/SECURITY.md`.

## 11. Git workflow

- Never commit or push unless the user asks. Never rewrite history, never force-push.
- Commit only after `npm run validate` passes. Small, focused commits, imperative messages.
- Before committing: review the diff and confirm no secrets are staged.

## 12. Testing expectations

- Vitest + Testing Library. Test behavior, not implementation.
- Add tests with real logic: schemas, permission checks, error normalization, query hooks,
  critical flows. Don't write tests for empty scaffolding. Details: `docs/TESTING.md`.

## 13. Design source of truth

The **existing Early Step Replit application** is the visual source of truth (colors,
typography, spacing, radius, components, navigation, dashboards, child UI). Its extracted values
are in `docs/DESIGN_SYSTEM.md` (sky-blue primary `#0DA2E7`, amber accent, warm cream background,
Cairo/Tajawal fonts, large soft radii, sidebar 18rem). Tokens in `src/styles/tokens.css` are
still placeholders until Stage 2. **Do not invent a design system or branding.** Approved (ADR-016): product name **Early Step**;
**light theme only** (no dark mode); child UI follows the **light assessment style** (not the dark
test player); `#0DA2E7` brand/decorative, `#0A7AAE` for buttons and important text, dark text on amber. Deviate only for
documented accessibility/RTL/responsive fixes (e.g. white-on-primary fails contrast).

## 14. Using the Replit project

- Treat Replit as a **visual reference**, not a code base to copy wholesale.
- Replit runs its **own prototype backend** (Express + Postgres, session cookies, integer ids,
  English enums, OpenAI). Its data flows, permissions, and extra features (rewards, AI risk,
  notifications, IEP, difficulty, dark mode, EN toggle) are **not** product requirements.
- Reproduce its visual language with this repo's architecture and tokens.
- Replit behavior does not override the backend API docs for data/contracts.
- If Replit and the API docs disagree, flag it to the user — don't guess.
- Do not carry over its known bugs or fabricated statistics (see `docs/REPLIT_AUDIT.md`).
- Never copy credentials or secrets found in Replit into this repo.
- Source can be read from the running dev server (Vite serves modules with source maps) — read
  only; keep any local copies outside the repo.

## 15. Backend / API fidelity

- The API documentation is the source of truth for endpoints, fields, enums, roles,
  validation, errors, pagination, and auth flow.
- Keep backend field names and enum values as-is in types; map to Arabic only at display.
- Validate uncertain responses with Zod at the API boundary when shapes are unreliable.
- When behavior is unclear, test against the real API (with user-provided demo accounts,
  locally) rather than assuming.

## 16. Definition of done

A change is done when:

1. It meets the stated requirement — nothing invented.
2. `npm run validate` passes (typecheck, lint with zero warnings, tests, build).
3. It works in the browser: RTL correct, responsive (mobile → desktop), keyboard accessible,
   loading/empty/error states handled.
4. Changed files were reviewed; no secrets; no dead code or stray debug logs.
5. Relevant docs are updated (`docs/*`, `DECISIONS.md` for architectural choices).

## 17. Do not invent features

Implement only what the user has requested or what the provided requirements/API docs
specify. Unknowns are marked **TBD** and raised as questions. Don't add placeholder screens,
fake data, mock backends, or speculative permissions.

## 18. Read the docs before each major feature

Before starting a feature, read: `docs/IMPLEMENTATION_PLAN.md` (the stage),
`docs/PRODUCT_REQUIREMENTS.md`, `docs/ROLES_AND_PERMISSIONS.md`, `docs/API_ENDPOINTS.md`,
`docs/API_INTEGRATION.md`, `docs/USER_FLOWS.md`, `docs/ARCHITECTURE.md`,
`docs/DESIGN_SYSTEM.md`, `docs/UI_COMPONENT_INVENTORY.md`, `docs/UI_MIGRATION_MAP.md`,
`docs/REPLIT_AUDIT.md`, `docs/GAP_ANALYSIS.md`, and (for assessments/activities/games)
`docs/ACTIVITY_ENGINE.md`. Follow `docs/DEVELOPMENT_WORKFLOW.md`. Inspect the real API and
Replit UI for that feature first. Don't start a stage marked BLOCKED.

## 19. Keep docs current

When an architectural decision changes or is made: add/update an ADR in `docs/DECISIONS.md`
and update the affected doc(s) and this file in the same change. Replace **TBD** markers as
facts are confirmed from the API docs, Replit, or the user.

## Commands

```bash
npm run dev          # start dev server
npm run typecheck    # tsc --noEmit (app + node configs)
npm run lint         # eslint, zero warnings allowed
npm run test         # vitest run
npm run build        # typecheck + production build
npm run validate     # typecheck + lint + test + build
npm run format       # prettier --write
```

Node: `>=20.17` (see `.nvmrc`). Tool versions are pinned to Node-20.17-compatible majors —
see ADR-010 before upgrading.
