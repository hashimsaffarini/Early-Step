import { http, HttpResponse, type HttpHandler } from 'msw';

import { mockChildren, type MockChildRow } from '../fixtures/children';
import { apiUrl, requireRole } from '../http';

function listItem(row: MockChildRow) {
  return {
    id: row.id,
    fullName: row.fullName,
    age: row.age,
    gender: row.gender,
    parentId: row.parentId,
    parentName: row.parentName,
    specialistId: row.specialistId,
    specialistName: row.specialistName,
  };
}

/** Children lists (shapes NOT LIVE-VERIFIED). Parent CRUD is added during integration. */
export const childrenHandlers: HttpHandler[] = [
  http.get(apiUrl('Parent/GetMyChildren'), ({ request }) => {
    const user = requireRole(request, ['Parent']);
    if (user instanceof Response) return user;
    return HttpResponse.json(mockChildren.filter((c) => c.parentId === user.id).map(listItem));
  }),
  http.get(apiUrl('Teacher/children'), ({ request }) => {
    const user = requireRole(request, ['Teacher']);
    if (user instanceof Response) return user;
    return HttpResponse.json(mockChildren.filter((c) => c.teacherId === user.id).map(listItem));
  }),
  http.get(apiUrl('specialist/children'), ({ request }) => {
    const user = requireRole(request, ['Specialist']);
    if (user instanceof Response) return user;
    return HttpResponse.json(mockChildren.filter((c) => c.specialistId === user.id).map(listItem));
  }),
];
