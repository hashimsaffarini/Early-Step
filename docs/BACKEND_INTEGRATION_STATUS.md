# Backend integration status

Branch `feature/backend-integration` · updated 2026-10-06 · backend
`https://earlystep22.runasp.net/api/` · contract: `docs/api/swagger.json` (live Swagger snapshot).

## Read this first

- **Nothing is VERIFIED WORKING.** None of the provided demo accounts could sign in (all `401`),
  so no authenticated request has succeeded against the live backend. Every integrated feature
  is tested against mocked HTTP (MSW) built from the Swagger contracts.
- Live testing is **paused** (user instruction) until the backend team fixes the open Admin
  endpoints and provides working accounts — see `SECURITY.md`.
- Swagger documents request bodies for every endpoint but **response schemas only for chat**.
  All other responses are parsed leniently with Zod and listed under "Assumptions to verify".

Status values: **VERIFIED WORKING** · **IMPLEMENTED, NOT LIVE-VERIFIED** · **PARTIALLY WORKING** ·
**BLOCKED BY BACKEND** · **NOT STARTED**.

## Overview

Rows counted from the matrices (each row = one capability):

| Area                            | Implemented, not live-verified | Partially | Blocked by backend | Not started |                                  Other | Verified working |
| ------------------------------- | -----------------------------: | --------: | -----------------: | ----------: | -------------------------------------: | ---------------: |
| Core & authentication (below)   |                              7 |         0 |                  1 |           2 |                                      0 |                2 |
| Parent & children               |                              9 |         1 |                  4 |           0 |                                      0 |                0 |
| Initial assessment & activities |                              4 |         0 |                  4 |           0 | 2 (local practice; staff out of scope) |                0 |
| Admin content management        |                             15 |         0 |                  2 |           0 |                                      0 |                0 |
| Training plans & reports        |                             12 |         0 |                  4 |           0 |                                      0 |                0 |
| Dashboards, users, notes        |                             12 |         0 |                  6 |           0 |                                      0 |                0 |
| Chat & notifications            |                              8 |         0 |                  2 |           0 |                                      0 |                0 |
| **Total**                       |                         **67** |     **1** |             **23** |       **2** |                                  **2** |            **2** |

"Verified working" = only the error formats and CORS, observed live without signing in.

Detailed per-feature matrices (API, UI, integration, tests, status, assumptions):
[children](integration/children.md) · [assessment & activities](integration/assessments-activities.md) ·
[content](integration/content.md) · [plans & reports](integration/plans-reports.md) ·
[dashboards, users, notes](integration/dashboards-users-notes.md) · [chat](integration/chat.md).

## Core and authentication

| Feature                              | API                                                       | UI                                            | Integration                                                 | Tests                                     | Status                                                  |
| ------------------------------------ | --------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------- |
| Base URL / paths                     | `/api/` base, relative paths                              | —                                             | `getEnv()` requires `/api/` suffix                          | env via test config                       | IMPLEMENTED, NOT LIVE-VERIFIED (reachability verified)  |
| Error normalization                  | ProblemDetails, `{ message }`, string, string[]           | `ApiErrorAlert`                               | `extractBackendDetails`                                     | `apiError.test.ts`                        | **VERIFIED WORKING** (formats observed live)            |
| CORS                                 | `*`                                                       | —                                             | direct calls from the dev origin                            | —                                         | **VERIFIED WORKING** (preflight observed)               |
| Login                                | `POST Auth/login` multipart `Email, Password, RememberMe` | login form, errors, remember me               | `parseLoginResponse` (token + role from body or JWT claims) | `LoginPage`, `loginResponse.test.ts`      | IMPLEMENTED, NOT LIVE-VERIFIED (response shape unknown) |
| Parent registration                  | `POST Auth/register` multipart incl. `Role=ولي أمر`       | register form                                 | `registerParent`                                            | `RegisterPage`                            | IMPLEMENTED, NOT LIVE-VERIFIED                          |
| Forgot / reset password              | `POST Auth/ForgotPassword`, `POST Auth/reset-password`    | neutral confirmation; reset with email + code | mutations                                                   | `ForgotPasswordPage`, `ResetPasswordPage` | IMPLEMENTED, NOT LIVE-VERIFIED                          |
| Change password                      | `POST Auth/change-password`                               | — (no account screen yet)                     | —                                                           | —                                         | NOT STARTED                                             |
| Email confirmation                   | `GET Auth/confirmEmail?userId&token`                      | — (link handled by the backend/email)         | —                                                           | —                                         | NOT STARTED                                             |
| Session & logout                     | no `me`, refresh or logout endpoint                       | logout button                                 | session store, local logout, clear cache on 401             | `areaRoutes.test.tsx`                     | IMPLEMENTED, NOT LIVE-VERIFIED                          |
| Role normalization                   | Arabic role values (3 observed)                           | —                                             | `normalizeRole`, fail-closed                                | `backendRoles.test.ts`                    | IMPLEMENTED (Admin/SuperAdmin values unknown)           |
| Route guards                         | —                                                         | `RequireRole`, `PublicOnly`, `/unauthorized`  | per role area                                               | `areaRoutes.test.tsx`                     | IMPLEMENTED (UX only)                                   |
| Refresh token / `me` / server logout | none                                                      | —                                             | —                                                           | —                                         | BLOCKED BY BACKEND                                      |

## Blocked by backend (consolidated)

| Missing capability                                                      | Effect in the app                                                |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Working accounts for all five roles                                     | No live verification at all                                      |
| Authorization on `/api/Admin/*` (critical)                              | Reported; frontend guards don't fix it                           |
| Login response contract, `me`, refresh, logout                          | Lenient login parsing; local logout; re-login on expiry          |
| Assessment status/results read                                          | Profile and assessment show only a neutral completion; no scores |
| Answer payload for MultiSelect / Sequence / Matching                    | Those assessment questions are shown as "غير مدعوم بعد"          |
| Submitting training-plan activity results                               | Player shows "لن تُحفظ النتيجة"                                  |
| Activities list for non-admin roles                                     | Tests/games catalogues are labelled local practice               |
| Admin children list / child detail; staff child detail                  | Admin uses the users page; staff profiles use list fields        |
| Teacher list for specialists (assign teacher)                           | No picker; assignment not offered                                |
| Listing a child's teacher notes; specialist reading notes               | Only notes created in the current session are shown              |
| User create/edit/delete/role change (Admin, Super Admin)                | Not offered                                                      |
| Reports for Admin / Super Admin; report by id                           | Blocked states; detail resolved from the role's list             |
| Plans for Admin                                                         | Blocked state                                                    |
| Adding one option to an existing question; listing assessment questions | Not offered; info notices                                        |
| Activity feeds / recent events                                          | Removed from dashboards and profiles                             |
| Real-time chat hub (only `wss://localhost` documented)                  | Polling                                                          |
| Notifications API                                                       | Bell disabled ("قريباً")                                         |

## Assumptions to verify when live testing resumes

1. Login response: token field name, user fields, role value for Admin/SuperAdmin, JWT `exp`.
2. Whether accounts need email confirmation before login.
3. Response shapes of every non-chat endpoint (children lists, child detail, reports, plans,
   dashboards, users, notes, content, assessment start/answer/complete).
4. Whether answer/complete failures return HTTP 200 with `{ message }` (Apidog) or an error status.
5. Whether `{activityId}` in plan routes is the plan row id or the catalogue activity id.
6. Which roles may call `TrainingPlan/children/*` and `Reports/child/*`.
7. Chat: `receiverId` semantics in conversations; message `status` values.
8. PDF download `Content-Disposition` filename.

## Testing summary

- `npm run validate`: typecheck, lint (0 warnings), **302 tests in 61 files**, production build.
- Every request in tests goes through MSW; unhandled requests fail the test. No test touches the
  live backend.
- End-to-end browser checks were run in development mock mode (see `TESTING.md`). Playwright
  live E2E is deferred until working accounts exist (it would only exercise mocks otherwise).
