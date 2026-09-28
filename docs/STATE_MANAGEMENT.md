# State Management

| Kind of state                                  | Tool                                       |
| ---------------------------------------------- | ------------------------------------------ |
| Server data (fetch, cache, mutate, invalidate) | **TanStack Query**                         |
| Local UI state (open/closed, input, step)      | **React state** (`useState`, `useReducer`) |
| Form state                                     | **React Hook Form** (+ Zod)                |
| URL-shareable state (filters, tabs, page)      | **URL search params** (React Router)       |
| Genuinely global client state                  | **Zustand** — only when justified          |

## TanStack Query = server state

- All backend data lives in the query cache. Don't copy it into `useState` or Zustand.
- Access via feature hooks (`useChildren()`, `useCreateChild()`), never raw `useQuery` with
  inline keys in components.
- Keys come from per-feature factories. See `API_INTEGRATION.md`.

## React state = local UI

- Keep state as close as possible to where it's used; lift only when needed.
- Derive values during render instead of syncing them with effects.
- Context only for stable, subtree-scoped values (not as a global store).

## Zustand = justified global client state only

Allowed candidates (decide when implemented, record an ADR):

- Auth session/token, **if** the backend flow requires client-held tokens.
- Cross-page client preferences (e.g. child-activity sound on/off), if required.

Not allowed: server responses, lists of entities, anything TanStack Query can own.
Each store: one small file in the owning feature, typed state + actions, selectors to
avoid unnecessary re-renders. Persist only what must survive reloads, and never persist
sensitive data without an explicit decision.

Currently **no Zustand stores exist**.
