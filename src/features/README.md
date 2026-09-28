# Features

One folder per business domain. Folders are created **only when a feature is
actually implemented** — no empty scaffolding.

Planned domains (from known requirements; details TBD):

`auth`, `children`, `assessments`, `activities`, `categories`, `games`,
`training-plans`, `reports`, `progress`, `chat`, `feedback`, `users`, `dashboards`.

Each feature contains only the subfolders it needs:

```text
features/<name>/
├── api/         # request functions + query keys + query/mutation hooks
├── components/  # feature-only UI
├── hooks/       # feature-only hooks (non-API)
├── pages/       # route-level components
├── schemas/     # Zod schemas (forms, API parsing)
├── types/       # domain types
├── routes.tsx   # route objects consumed by src/app/router
└── index.ts     # public API — other layers import from here only
```

Rules: see `docs/ARCHITECTURE.md`. Features never import from other features.
