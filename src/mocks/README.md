# Mock API (MSW) — tests and development mock mode only

- **Tests** (`src/test/setup.ts`): every request is answered by these handlers; unhandled requests
  fail the test. The ordinary test suite never calls the live backend.
- **Development mock mode** (`VITE_USE_MOCKS=true` in a local `.env`, dev server only): the browser
  worker answers every API call so the integrated UI can be reviewed without backend accounts. A
  "وضع المحاكاة" banner is always shown. Never active in production builds.

Handlers implement the **Swagger contracts** (`https://earlystep22.runasp.net/swagger/v1/swagger.json`).
Where Swagger has no response schema, responses follow the Apidog examples; every such shape is
listed as NOT LIVE-VERIFIED in `docs/BACKEND_INTEGRATION_STATUS.md`. Mock data is fictional
(`TEMPORARY MOCK DATA`) and follows `docs/MOCK_DATA.md`.

Mock sign-in accounts (fictional, mock mode only): `parent@demo.test`, `teacher@demo.test`,
`specialist@demo.test`, `admin@demo.test`, `superadmin@demo.test`, password `Demo@1234`.
