# Roles and Permissions

> **Preliminary.** Derived only from the high-level workflow. To be replaced with facts from
> the backend API documentation. Frontend checks are UX only; the backend enforces access.

## Roles

```ts
type UserRole = 'Parent' | 'Teacher' | 'Specialist' | 'Admin' | 'SuperAdmin';
```

Defined in `src/types/roles.ts`; Arabic labels in `src/constants/roleLabels.ts`.
Exact backend values/casing: **TBD** (confirm from API docs).

## Preliminary matrix

Legend: ✅ indicated by the known workflow · ❓ TBD · — not indicated

| Capability                        | Parent | Teacher | Specialist | Admin | SuperAdmin |
| --------------------------------- | :----: | :-----: | :--------: | :---: | :--------: |
| Self-register                     |   ✅   |   ❓    |     ❓     |  ❓   |     ❓     |
| Add / edit own children           |   ✅   |    —    |     —      |  ❓   |     ❓     |
| Child takes initial assessment    |   ❓   |    —    |     —      |   —   |     —      |
| Review initial assessment results |   ❓   |    —    |     ❓     |  ✅   |     ❓     |
| Assign Specialist to child        |   —    |    —    |     —      |  ✅   |     ❓     |
| Create / edit training plan       |   —    |    —    |     ✅     |  ❓   |     ❓     |
| Assign Teacher                    |   —    |    —    |     ✅     |  ❓   |     ❓     |
| Follow child progress             |   ❓   |   ✅    |     ✅     |  ❓   |     ❓     |
| Give feedback                     |   —    |   ✅    |     ❓     |   —   |     —      |
| Activities CRUD                   |   —    |    —    |     ❓     |  ✅   |     ❓     |
| Categories CRUD                   |   —    |    —    |     ❓     |  ✅   |     ❓     |
| View reports                      |   ❓   |   ❓    |     ❓     |  ❓   |     ❓     |
| Chat                              |   ❓   |   ❓    |     ❓     |  ❓   |     ❓     |
| User management                   |   —    |    —    |     —      |  ❓   |     ❓     |

## Planned authorization architecture (not yet implemented)

- **Single permission model** in one module (e.g. `src/lib/permissions.ts` or
  `features/auth/permissions.ts`, decided when auth is implemented): a typed map of
  `Permission → UserRole[]` (or derived from backend-provided permissions, if the API
  returns them — TBD).
- `can(user, permission)` pure function used everywhere; **no inline `role === 'Admin'`
  checks scattered across components.**
- `ProtectedRoute`: requires an authenticated session, else redirect to `/login`.
- `RoleGuard`: requires a role/permission, else render/redirect to `/unauthorized`.
- Optional `<Can permission="...">` component for conditional rendering.
- Unit tests for the permission map.

No fake auth, mock users, or invented permissions will be added.
