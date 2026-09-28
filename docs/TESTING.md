# Testing

## Tooling

- **Vitest** (jsdom environment, globals enabled) — config in `vite.config.ts`.
- **React Testing Library** + `@testing-library/jest-dom` matchers (`src/test/setup.ts`).
- `npm run test` (CI/once), `npm run test:watch` (development).

## What to test

| Level       | Target                                                                                                       | When                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Unit        | Zod schemas, permission model, `normalizeError`/`extractBackendDetails`, pure utils, role/enum label mapping | As soon as the logic exists                                  |
| Component   | Components with behavior: forms (validation, error display), guards, conditional rendering                   | With the feature                                             |
| Integration | Feature flows: page + hooks + router with the API mocked at the network layer                                | For critical flows (login, add child, assessment submission) |
| End-to-end  | Full browser flows against a real/staging backend                                                            | Only if justified later (e.g. Playwright) — ADR required     |

## Conventions

- Colocate tests: `Thing.test.tsx` next to `Thing.tsx`.
- Query by role/label/text (as users do), not by class names or test IDs, unless necessary.
- Test behavior and outcomes, not implementation details.
- Arabic text in assertions is fine and expected.
- When API mocking is needed, add **MSW** (record an ADR) and build handlers from the
  **documented** API contracts only — never invented shapes.
- Create a shared `renderWithProviders` helper in `src/test/` when the first test needs
  providers beyond `<App />`.

## Don't

- Don't write tests for empty scaffolding or trivial markup.
- Don't snapshot whole pages.
- Don't commit real credentials or real children's data as fixtures.

## Current tests

- `src/app/App.test.tsx` — smoke test: app boots with providers + router and renders the home
  route.
