import { http, HttpResponse, type HttpHandler } from 'msw';

import { findMockChild } from '../fixtures/children';
import { mockReports } from '../fixtures/reports';
import { apiUrl, forbidden, notFound, unauthorized, currentUser } from '../http';

/** Reports. Response shapes NOT LIVE-VERIFIED (undocumented in Swagger). */
export const reportsHandlers: HttpHandler[] = [
  http.get(apiUrl('Reports/child/:childId'), ({ request, params }) => {
    const user = currentUser(request);
    if (!user) return unauthorized();
    const child = findMockChild(String(params.childId));
    if (!child) return notFound('الطفل غير موجود.');
    if (user.role === 'Parent' && child.parentId !== user.id) return forbidden();
    return HttpResponse.json(mockReports.filter((report) => report.childId === child.id));
  }),
];
