import { http, HttpResponse, type HttpHandler } from 'msw';

import { mockId } from '../db';
import { findMockChild } from '../fixtures/children';
import { mockReports, type MockReportRow } from '../fixtures/reports';
import {
  apiUrl,
  badRequest,
  currentUser,
  forbidden,
  notFound,
  requireRole,
  unauthorized,
} from '../http';

/** Response item (undocumented in Swagger — NOT LIVE-VERIFIED). */
function toDto(row: MockReportRow) {
  return {
    id: row.id,
    childId: row.childId,
    childName: row.childName,
    title: row.title,
    weaknesses: row.weaknesses,
    recommendations: row.recommendations,
    createdAt: row.createdAt,
    specialistName: row.specialistName,
  };
}

function formText(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value : '';
}

/** Minimal valid-looking PDF bytes for the download mock. */
const FAKE_PDF = '%PDF-1.4\n% Early Step mock report\n%%EOF\n';

/** Reports. Response shapes NOT LIVE-VERIFIED (undocumented in Swagger). */
export const reportsHandlers: HttpHandler[] = [
  http.get(apiUrl('Reports/child/:childId'), ({ request, params }) => {
    const user = currentUser(request);
    if (!user) return unauthorized();
    const child = findMockChild(String(params.childId));
    if (!child) return notFound('الطفل غير موجود.');
    if (user.role === 'Parent' && child.parentId !== user.id) return forbidden();
    if (user.role === 'Teacher' && child.teacherId !== user.id) return forbidden();
    const reports = mockReports.filter((report) => report.childId === child.id);
    // Live: no reports → 404 with this message (not an empty array).
    if (reports.length === 0) return notFound(' لا يوجد تقرير .');
    // Live (verified 2026-10-07): a single report object (the first one), not an array.
    const [first] = reports;
    return HttpResponse.json(first ? toDto(first) : null);
  }),

  http.get(apiUrl('Reports/:reportId/download'), ({ request, params }) => {
    const user = currentUser(request);
    if (!user) return unauthorized();
    const report = mockReports.find((row) => row.id === params.reportId);
    if (!report) return notFound('التقرير غير موجود.');
    const child = findMockChild(report.childId);
    if (user.role === 'Parent' && child?.parentId !== user.id) return forbidden();
    return new HttpResponse(FAKE_PDF, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="report-${report.id}.pdf"`,
      },
    });
  }),

  http.get(apiUrl('specialist/Reports'), ({ request }) => {
    const user = requireRole(request, ['Specialist']);
    if (user instanceof Response) return user;
    return HttpResponse.json(
      mockReports.filter((report) => report.specialistId === user.id).map(toDto),
    );
  }),

  http.post(apiUrl('specialist/CreateReport'), async ({ request }) => {
    const user = requireRole(request, ['Specialist']);
    if (user instanceof Response) return user;
    const body = (await request.json()) as Partial<
      Record<'childId' | 'title' | 'weaknesses' | 'recommendations', string>
    >;
    const child = findMockChild(body.childId ?? '');
    if (!child) return notFound('الطفل غير موجود.');
    if (child.specialistId !== user.id) return forbidden();
    if (!body.title?.trim()) return badRequest('عنوان التقرير مطلوب.');
    const row: MockReportRow = {
      id: mockId(),
      childId: child.id,
      childName: child.fullName,
      title: body.title.trim(),
      weaknesses: body.weaknesses ?? '',
      recommendations: body.recommendations ?? '',
      createdAt: new Date().toISOString(),
      specialistId: user.id,
      specialistName: user.fullName,
    };
    mockReports.unshift(row);
    return HttpResponse.json({ message: 'تم إنشاء التقرير بنجاح.', report: toDto(row) });
  }),

  http.put(apiUrl('specialist/:reportId'), async ({ request, params }) => {
    const user = requireRole(request, ['Specialist']);
    if (user instanceof Response) return user;
    const row = mockReports.find((report) => report.id === params.reportId);
    if (!row) return notFound('التقرير غير موجود.');
    if (row.specialistId !== user.id) return forbidden();
    const form = await request.formData();
    row.title = formText(form, 'Title') || row.title;
    row.weaknesses = formText(form, 'Weaknesses');
    row.recommendations = formText(form, 'Recommendations');
    return HttpResponse.json({ message: 'تم تعديل التقرير بنجاح.', report: toDto(row) });
  }),

  http.delete(apiUrl('specialist/:reportId'), ({ request, params }) => {
    const user = requireRole(request, ['Specialist']);
    if (user instanceof Response) return user;
    const index = mockReports.findIndex((report) => report.id === params.reportId);
    const row = mockReports[index];
    if (!row) return notFound('التقرير غير موجود.');
    if (row.specialistId !== user.id) return forbidden();
    mockReports.splice(index, 1);
    return HttpResponse.json({ message: 'تم حذف التقرير بنجاح.' });
  }),
];
