import { HttpResponse } from 'msw';

import { getEnv } from '@/config/env';

import { MOCK_USERS, type MockUser } from './db';

/** Absolute URL for a backend path relative to `VITE_API_BASE_URL` (e.g. `Parent/GetMyChildren`). */
export function apiUrl(path: string): string {
  return new URL(path, getEnv().apiBaseUrl).href;
}

export const MOCK_TOKEN_PREFIX = 'mock-token-';

/** The mock user behind the request's bearer token, or null. */
export function currentUser(request: Request): MockUser | null {
  const header = request.headers.get('Authorization') ?? '';
  const token = header.replace(/^Bearer\s+/i, '');
  if (!token.startsWith(MOCK_TOKEN_PREFIX)) return null;
  const id = token.slice(MOCK_TOKEN_PREFIX.length);
  return MOCK_USERS.find((user) => user.id === id) ?? null;
}

/** ASP.NET-style 401 (ProblemDetails), as observed live. */
export function unauthorized() {
  return HttpResponse.json(
    {
      title: 'Unauthorized',
      status: 401,
      type: 'https://tools.ietf.org/html/rfc9110#section-15.5.2',
    },
    { status: 401 },
  );
}

export function forbidden() {
  return new HttpResponse(null, { status: 403 });
}

export function notFound(message: string) {
  return HttpResponse.json({ message }, { status: 404 });
}

export function badRequest(message: string) {
  return HttpResponse.json({ message }, { status: 400 });
}

/** Returns the user if they have one of the roles, otherwise an error response. */
export function requireRole(
  request: Request,
  roles: readonly MockUser['role'][],
): MockUser | Response {
  const user = currentUser(request);
  if (!user) return unauthorized();
  if (!roles.includes(user.role)) return forbidden();
  return user;
}
