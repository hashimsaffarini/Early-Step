# Development Workflow

Follow these steps for every feature.

1. **Read requirements** — the user's request, `PRODUCT_REQUIREMENTS.md`,
   `ROLES_AND_PERMISSIONS.md`. List anything unclear.
2. **Inspect the backend API** — the relevant endpoints, fields, enums, errors, and auth in the
   API docs. Try them with a demo account locally if needed (never commit credentials).
3. **Inspect the Replit UI** — the corresponding screens; record visual details in
   `DESIGN_SYSTEM.md`.
4. **Update docs if necessary** — replace TBDs with confirmed facts; raise conflicts to the
   user instead of guessing.
5. **Plan** — files to add/change, feature boundaries, query keys, invalidations, routes,
   permissions, states (loading/empty/error).
6. **Implement** — following `CLAUDE.md` and `ARCHITECTURE.md`.
7. **Type-check** — `npm run typecheck`.
8. **Lint** — `npm run lint` (zero warnings).
9. **Test** — `npm run test`; add tests for real logic.
10. **Build** — `npm run build`.
11. **Manually verify** — in the browser: RTL, mobile/tablet/desktop widths, keyboard
    navigation, loading/empty/error states, each relevant role.
12. **Review changed files** — `git diff`; remove dead code and debug logs; check for secrets.
13. **Update documentation** — affected docs and `DECISIONS.md`.
14. **Commit only after validation** — and only when the user asks. `npm run validate` runs
    steps 7–10 together.

## Git

- Branch per feature (`feature/<name>`), small commits, imperative messages.
- Never force-push or rewrite history.
- Never commit `.env` or credentials.
