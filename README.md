# Early Step

An Arabic (RTL) web platform for children aged approximately 4–10 who may experience
learning difficulties, and for the parents, teachers, specialists, and administrators who
support them.

> **Status:** Foundation phase. The project architecture, tooling, and documentation are in
> place. No product features are implemented yet.

## Requirements

- Node.js **>= 20.17** (see `.nvmrc`)
- npm (the only package manager used in this repo)

## Installation

```bash
npm install
```

## Environment setup

```bash
cp .env.example .env
```

Then set the values in `.env`:

| Variable            | Description                                |
| ------------------- | ------------------------------------------ |
| `VITE_API_BASE_URL` | Absolute base URL of the backend API (TBD) |

`.env` is gitignored. Never commit real values or credentials.

The app shell runs without `VITE_API_BASE_URL`; it is validated the first time an API
request is made.

## Available scripts

| Script                 | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start the Vite dev server                |
| `npm run build`        | Type-check and create a production build |
| `npm run preview`      | Preview the production build locally     |
| `npm run typecheck`    | Run `tsc --noEmit`                       |
| `npm run lint`         | Run ESLint (zero warnings allowed)       |
| `npm run lint:fix`     | Run ESLint with auto-fix                 |
| `npm run format`       | Format all files with Prettier           |
| `npm run format:check` | Check formatting                         |
| `npm run test`         | Run tests once (Vitest)                  |
| `npm run test:watch`   | Run tests in watch mode                  |
| `npm run validate`     | Typecheck + lint + test + build          |

## Folder structure

```text
src/
├── app/            # composition root: App, providers, router, app-level pages
├── components/
│   ├── layout/     # structural layouts (root, auth, dashboard, child activity)
│   └── shared/     # cross-feature components (error boundary, loading/empty/error states)
├── config/         # typed, validated environment config
├── constants/      # app-wide constants (e.g. Arabic role labels)
├── features/       # one folder per business domain (created as features are built)
├── services/
│   └── http/       # Axios client, interceptors, error normalization
├── styles/         # design tokens + global/RTL base styles
├── test/           # test setup
└── types/          # cross-feature domain types (e.g. UserRole)
```

Details: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Development workflow

Every feature follows [`docs/DEVELOPMENT_WORKFLOW.md`](docs/DEVELOPMENT_WORKFLOW.md):
read requirements → inspect the API → inspect the Replit UI → plan → implement → validate →
verify manually → update docs → commit.

## Documentation

| File                                                             | Purpose                           |
| ---------------------------------------------------------------- | --------------------------------- |
| [`CLAUDE.md`](CLAUDE.md)                                         | Rules for AI-assisted development |
| [`docs/PROJECT_CONTEXT.md`](docs/PROJECT_CONTEXT.md)             | What Early Step is                |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)                   | Structure and dependency rules    |
| [`docs/PRODUCT_REQUIREMENTS.md`](docs/PRODUCT_REQUIREMENTS.md)   | Known requirements                |
| [`docs/ROLES_AND_PERMISSIONS.md`](docs/ROLES_AND_PERMISSIONS.md) | Role matrix (preliminary)         |
| [`docs/API_INTEGRATION.md`](docs/API_INTEGRATION.md)             | HTTP + TanStack Query conventions |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)                 | Visual reference (Replit, TBD)    |
| [`docs/ROUTING.md`](docs/ROUTING.md)                             | Routing strategy                  |
| [`docs/STATE_MANAGEMENT.md`](docs/STATE_MANAGEMENT.md)           | State rules                       |
| [`docs/SECURITY.md`](docs/SECURITY.md)                           | Security policy                   |
| [`docs/TESTING.md`](docs/TESTING.md)                             | Testing strategy                  |
| [`docs/DEVELOPMENT_WORKFLOW.md`](docs/DEVELOPMENT_WORKFLOW.md)   | Per-feature workflow              |
| [`docs/DECISIONS.md`](docs/DECISIONS.md)                         | Architecture decision log         |

## Current project status

- [x] Project initialized (React + TypeScript + Vite)
- [x] Tooling: ESLint, Prettier, Vitest, strict TypeScript, `@/` alias
- [x] Global RTL / Arabic setup
- [x] HTTP layer, error normalization, query client, router, layouts
- [x] Documentation
- [ ] API documentation integrated (pending)
- [ ] Design reference (Replit) inspected (pending)
- [ ] Authentication
- [ ] Product features
