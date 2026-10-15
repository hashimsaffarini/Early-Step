# Deployment — GitHub Pages

## Repository

<https://github.com/hashimsaffarini/Early-Step>

## Production URL

<https://hashimsaffarini.github.io/Early-Step/>

Routes use a hash: `…/Early-Step/#/login`, `…/Early-Step/#/parent/dashboard`,
`…/Early-Step/#/specialist/children`.

## Hosting

GitHub Pages, deployed by GitHub Actions (`.github/workflows/deploy-pages.yml`), using the
official `actions/configure-pages`, `actions/upload-pages-artifact` and `actions/deploy-pages`
actions (no `gh-pages` branch). GitHub Pages only hosts the static frontend; all data
comes from the backend.

## Backend

<https://earlystep22.runasp.net/api/> — CORS allows the Pages origin (`Access-Control-Allow-Origin: *`,
checked 2026-10-15). Authentication stays the real flow: Pages frontend → `POST Auth/login` →
JWT → `GET Auth/me` → role routing.

## Deploy flow

```text
push to main
→ GitHub Actions (deploy-pages.yml)
→ npm ci
→ npm run validate   (typecheck + lint + unit tests + vite build → dist/)
→ upload dist/ as the Pages artifact
→ deploy to GitHub Pages
```

The workflow also runs on demand (**Actions → Deploy to GitHub Pages → Run workflow**). A failing
check stops the deployment. Build-time values set in the workflow (public, not secrets):

| Variable            | Value                                        |
| ------------------- | -------------------------------------------- |
| `VITE_API_BASE_URL` | `https://earlystep22.runasp.net/api/`        |
| `VITE_USE_MOCKS`    | `false` (production builds ignore it anyway) |

No credentials or tokens are used by the workflow. Live contract tests (`test:live:*`) are not
run in CI — they need the private demo accounts in `.env.e2e.local`, which never leaves the
developer's machine.

## GitHub setup (one time)

1. Open <https://github.com/hashimsaffarini/Early-Step>.
2. **Settings** (top tab bar of the repository).
3. In the left sidebar, under **Code and automation**, click **Pages**.
4. Under **Build and deployment → Source**, choose **GitHub Actions** (not "Deploy from a branch").
5. Open the **Actions** tab → **Deploy to GitHub Pages** → **Run workflow** (branch `main`), or
   push to `main`. When the run is green, the site is at the production URL above (the URL is also
   shown on the run summary and on the Pages settings page).

If the deploy job fails with "Get Pages site failed" or a 404 from `configure-pages`, step 4 has
not been done yet.

## How the app is built for Pages

| Concern          | Solution                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sub-path hosting | `vite.config.ts`: `base` is `/Early-Step/` for `vite build` and `vite preview`, `/` for `npm run dev` and tests (`BASE_PATH=/` overrides it for a root host). All assets — JS chunks, CSS, self-hosted fonts, logo, hero image, favicons — are emitted under `/Early-Step/`.                                                                                                           |
| SPA routing      | Production uses React Router's **hash router** (`createHashRouter`); development keeps browser URLs. GitHub Pages has no SPA rewrites, so `/Early-Step/parent/dashboard` would 404 on refresh; with `/Early-Step/#/parent/dashboard` the server always serves `index.html` and the router reads the hash. Direct links, refreshes, guards and role redirects work unchanged. (ADR-024) |
| In-page anchors  | The skip link and the landing scroll hint move focus/scroll in JavaScript (`utils/inPageLink.ts`) so they never change the hash (which is the route).                                                                                                                                                                                                                                  |
| Backend images   | `/uploads/...` paths resolve against the API origin (`resolveMediaUrl`), never against GitHub Pages.                                                                                                                                                                                                                                                                                   |
| Mock data        | None: production builds ignore `VITE_USE_MOCKS`, ship no MSW worker and no practice content (`PRODUCTION_DATA_AUDIT.md`).                                                                                                                                                                                                                                                              |

## Verify a build locally

```bash
npm run build
npm run preview        # http://localhost:4173/Early-Step/
```

Checked 2026-10-15: assets under `/Early-Step/assets/` with correct content types; a refreshed
`#/parent/dashboard` redirects to `#/login`; the landing scroll hint keeps the route; the login
form posts to `https://earlystep22.runasp.net/api/Auth/login`.

## Known backend issue

SuperAdmin-created accounts currently cannot log in (`Auth/login` → empty 500). This is a backend
issue and must not be worked around in the frontend. The Teacher area is therefore integrated but
not verified live (`BACKEND_REQUESTS.md`).
