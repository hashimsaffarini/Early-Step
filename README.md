# Early Step

An Arabic (RTL) web platform that helps detect learning difficulties early in children, and
connects the people who support them: parents, teachers, specialists and administrators.

- **Parents** add their children, run the initial assessment, play the training-plan activities
  with the child, read the specialist's report and chat with the child's staff.
- **Specialists** follow their children: assessment results, training plans (activities and the
  child's answers), reports, the teacher's notes and chat.
- **Teachers** follow their class, play plan activities with the child and write notes.
- **Admins** manage content (categories, tests, games, questions, the initial assessment), users
  and specialist assignment. **Super Admins** manage staff accounts.

The app uses live backend data only: no demo or mock data in production
(`docs/PRODUCTION_DATA_AUDIT.md`).

## Production

| Item    | Value                                                                                   |
| ------- | --------------------------------------------------------------------------------------- |
| App     | <https://hashimsaffarini.github.io/Early-Step/> (GitHub Pages)                          |
| Backend | <https://earlystep22.runasp.net/api/> (Swagger: `/swagger/v1/swagger.json`)             |
| Repo    | <https://github.com/hashimsaffarini/Early-Step>                                         |
| Deploy  | GitHub Actions on every push to `main` — see [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) |

Production URLs use a hash route, e.g. `…/Early-Step/#/login`, so refreshing any page works on
GitHub Pages.

## Stack

React 19 · TypeScript (strict) · Vite 6 · React Router 7 · TanStack Query 5 · Axios · Zod 4 ·
Zustand (session) · React Hook Form · CSS Modules · Vitest + Testing Library + MSW 2.

## Local setup

Requirements: Node.js **>= 20.17** (see `.nvmrc`) and npm.

```bash
npm install
cp .env.example .env   # VITE_API_BASE_URL=https://earlystep22.runasp.net/api/
npm run dev            # http://localhost:5173 — live backend
```

| Variable            | Description                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | Backend API base URL, ending in `/api/`                                                       |
| `VITE_USE_MOCKS`    | `true` only for local development against the mock server (MSW); ignored by production builds |

`.env` is gitignored. Never commit credentials or tokens; `VITE_*` values are public (they are
bundled into the browser code). Sign in with your own backend accounts.

## Scripts

| Script                    | Description                                                                |
| ------------------------- | -------------------------------------------------------------------------- |
| `npm run dev`             | Vite dev server (browser URLs, base `/`)                                   |
| `npm run build`           | Type-check and build for GitHub Pages (`dist/`, base `/Early-Step/`)       |
| `npm run preview`         | Serve the production build at `http://localhost:4173/Early-Step/`          |
| `npm run validate`        | Typecheck + lint + unit tests + build (what CI runs)                       |
| `npm run test`            | Unit tests (Vitest, MSW — no network)                                      |
| `npm run test:live:read`  | Read-only contract tests against the live backend (needs `.env.e2e.local`) |
| `npm run test:live:write` | Writes disposable `E2E Test …` records and verifies cleanup                |
| `npm run lint` / `format` | ESLint (zero warnings) / Prettier                                          |

## Deployment (GitHub Pages)

Push to `main` → GitHub Actions (`.github/workflows/deploy-pages.yml`) runs `npm ci` and
`npm run validate` (which builds `dist/`) → deploys `dist/` to GitHub Pages. One-time setup:
**Settings → Pages → Build and deployment → Source: GitHub Actions**. Details:
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Known backend issue

Accounts created by the Super Admin (`POST SuperAdmin/users`, e.g. a new Teacher) **cannot log
in** — the backend answers `Auth/login` with an empty 500. This is a backend bug; the frontend does
not work around it. Until it is fixed, the Teacher area is integrated but not verified live.
Open backend items: [`docs/BACKEND_REQUESTS.md`](docs/BACKEND_REQUESTS.md).

## Folder structure

```text
src/
├── app/            # composition root: App, providers, router, layouts, app-level pages
├── components/     # ui primitives, layout, shared components, activity players
├── config/         # typed environment config (API URL, mock mode)
├── constants/      # routes, role labels, backend role values
├── features/       # one folder per business domain (auth, children, assessments, …)
├── hooks/          # shared hooks (child resources, unread count, …)
├── services/       # HTTP client, API modules, session store
├── styles/         # design tokens, fonts, global RTL styles
├── mocks/          # MSW handlers + fixtures (tests and dev mock mode only)
└── test/           # test setup, helpers, live contract suites
```

## Documentation

| File                                                                       | Purpose                                           |
| -------------------------------------------------------------------------- | ------------------------------------------------- |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)                                 | GitHub Pages hosting and deploy flow              |
| [`docs/PRODUCTION_DATA_AUDIT.md`](docs/PRODUCTION_DATA_AUDIT.md)           | Zero mock data in production; API source of truth |
| [`docs/BACKEND_INTEGRATION_STATUS.md`](docs/BACKEND_INTEGRATION_STATUS.md) | What is verified live, per capability             |
| [`docs/API_VERIFICATION_MATRIX.md`](docs/API_VERIFICATION_MATRIX.md)       | Every Swagger operation, verified live            |
| [`docs/BACKEND_REQUESTS.md`](docs/BACKEND_REQUESTS.md)                     | Open items for the backend                        |
| [`docs/API_INTEGRATION.md`](docs/API_INTEGRATION.md)                       | HTTP + TanStack Query conventions                 |
| [`docs/USER_FLOWS.md`](docs/USER_FLOWS.md)                                 | User journeys per role                            |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)                             | Structure and dependency rules                    |
| [`docs/ROUTING.md`](docs/ROUTING.md)                                       | Routes and navigation                             |
| [`docs/SECURITY.md`](docs/SECURITY.md)                                     | Security policy                                   |
| [`docs/TESTING.md`](docs/TESTING.md)                                       | Testing strategy and results                      |
| [`docs/DECISIONS.md`](docs/DECISIONS.md)                                   | Architecture decision log                         |
| [`CLAUDE.md`](CLAUDE.md)                                                   | Rules for AI-assisted development                 |
