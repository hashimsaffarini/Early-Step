import { http, HttpResponse, type HttpHandler } from 'msw';

import { MOCK_USERS, mockId, type MockUser } from '../db';
import { findMockChild, mockChildren } from '../fixtures/children';
import { mockNotes } from '../fixtures/notes';
import { mockReports } from '../fixtures/reports';
import { apiUrl, badRequest, forbidden, notFound, requireRole } from '../http';

/**
 * Dashboards, Admin / Super Admin users and teacher notes. Fictional data only.
 * The Admin dashboard keys are the ones observed live; every other dashboard shape is an
 * assumption (NOT LIVE-VERIFIED) — the UI maps any numeric field leniently.
 */

/** Users the Admin list returns (the live list showed parents, teachers and specialists). */
const LISTED_ROLES: readonly MockUser['role'][] = ['Parent', 'Teacher', 'Specialist'];

function childrenOf(user: MockUser) {
  return mockChildren.filter((child) => child.parentId === user.id);
}

function userItem(user: MockUser) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.roleValue,
    emailConfirmed: true,
    childrenCount: childrenOf(user).length,
  };
}

function filterUsers(request: Request, roles: readonly MockUser['role'][]) {
  const params = new URL(request.url).searchParams;
  const role = params.get('Role') ?? params.get('role') ?? '';
  const search = (params.get('Search') ?? params.get('search') ?? '').trim().toLowerCase();
  return MOCK_USERS.filter((user) => roles.includes(user.role))
    .filter((user) => !role || user.roleValue === role)
    .filter(
      (user) =>
        !search ||
        user.fullName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search),
    );
}

function usersResponse(users: readonly MockUser[]) {
  return {
    totalUsers: users.length,
    totalParents: users.filter((user) => user.role === 'Parent').length,
    totalSpecialists: users.filter((user) => user.role === 'Specialist').length,
    totalTeachers: users.filter((user) => user.role === 'Teacher').length,
    users: users.map(userItem),
  };
}

function ownNote(request: Request, noteId: string) {
  const user = requireRole(request, ['Teacher']);
  if (user instanceof Response) return user;
  const note = mockNotes.find((row) => row.id === noteId);
  if (!note) return notFound('الملاحظة غير موجودة.');
  if (note.teacherId !== user.id) return forbidden();
  return note;
}

export const staffHandlers: HttpHandler[] = [
  // ── Dashboards ───────────────────────────────────────────────
  http.get(apiUrl('Admin/dashboard'), ({ request }) => {
    const user = requireRole(request, ['Admin']);
    if (user instanceof Response) return user;
    return HttpResponse.json({
      'إجمالي المستخدمين': MOCK_USERS.filter((u) => LISTED_ROLES.includes(u.role)).length,
      'إجمالي التقارير': mockReports.length,
      'إجمالي الانشطة': 4,
      'إجمالي الفئات': 6,
      'عدد الأطفال': mockChildren.length,
    });
  }),
  http.get(apiUrl('Teacher/dashboard'), ({ request }) => {
    const user = requireRole(request, ['Teacher']);
    if (user instanceof Response) return user;
    return HttpResponse.json({
      totalChildren: mockChildren.filter((child) => child.teacherId === user.id).length,
      totalNotes: mockNotes.filter((note) => note.teacherId === user.id).length,
    });
  }),
  http.get(apiUrl('specialist/dashboard'), ({ request }) => {
    const user = requireRole(request, ['Specialist']);
    if (user instanceof Response) return user;
    return HttpResponse.json({
      totalChildren: mockChildren.filter((child) => child.specialistId === user.id).length,
      totalReports: mockReports.filter((report) => report.specialistId === user.id).length,
    });
  }),
  http.get(apiUrl('SuperAdmin/dashboard'), ({ request }) => {
    const user = requireRole(request, ['SuperAdmin']);
    if (user instanceof Response) return user;
    return HttpResponse.json({
      totalUsers: MOCK_USERS.length,
      totalChildren: mockChildren.length,
      totalReports: mockReports.length,
    });
  }),

  // ── Admin users ──────────────────────────────────────────────
  http.get(apiUrl('Admin/users'), ({ request }) => {
    const user = requireRole(request, ['Admin']);
    if (user instanceof Response) return user;
    return HttpResponse.json(usersResponse(filterUsers(request, LISTED_ROLES)));
  }),
  http.get(apiUrl('Admin/users/:userId'), ({ request, params }) => {
    const admin = requireRole(request, ['Admin']);
    if (admin instanceof Response) return admin;
    const user = MOCK_USERS.find((candidate) => candidate.id === params.userId);
    if (!user) return notFound('المستخدم غير موجود.');
    return HttpResponse.json({
      ...userItem(user),
      phoneNumber: null,
      children: childrenOf(user).map((child) => ({
        id: child.id,
        fullName: child.fullName,
        age: child.age,
        gender: child.gender,
        parentId: child.parentId,
        parentName: child.parentName,
        specialistId: child.specialistId,
        specialistName: child.specialistName,
      })),
    });
  }),
  http.post(apiUrl('Admin/assign-children-to-specialist'), async ({ request }) => {
    const admin = requireRole(request, ['Admin']);
    if (admin instanceof Response) return admin;
    const body = (await request.json()) as { specialistId?: string; childIds?: string[] };
    const specialist = MOCK_USERS.find(
      (user) => user.id === body.specialistId && user.role === 'Specialist',
    );
    if (!specialist) return notFound('الأخصائي غير موجود.');
    const childIds = body.childIds ?? [];
    if (childIds.length === 0) return badRequest('يجب اختيار طفل واحد على الأقل.');
    const rows = childIds.map((id) => findMockChild(id));
    if (rows.some((row) => !row)) return notFound('أحد الأطفال غير موجود.');
    for (const row of rows) {
      if (!row) continue;
      row.specialistId = specialist.id;
      row.specialistName = specialist.fullName;
    }
    return HttpResponse.json({ message: 'تم إسناد الأطفال إلى الأخصائي بنجاح.' });
  }),

  // ── Super Admin ──────────────────────────────────────────────
  http.get(apiUrl('SuperAdmin/users'), ({ request }) => {
    const user = requireRole(request, ['SuperAdmin']);
    if (user instanceof Response) return user;
    return HttpResponse.json(
      usersResponse(
        filterUsers(
          request,
          MOCK_USERS.map((u) => u.role),
        ),
      ),
    );
  }),
  http.get(apiUrl('SuperAdmin/children'), ({ request }) => {
    const user = requireRole(request, ['SuperAdmin']);
    if (user instanceof Response) return user;
    const name = (new URL(request.url).searchParams.get('Name') ?? '').trim();
    return HttpResponse.json(
      mockChildren
        .filter((child) => !name || child.fullName.includes(name))
        .map((child) => ({
          id: child.id,
          fullName: child.fullName,
          age: child.age,
          gender: child.gender,
          parentId: child.parentId,
          parentName: child.parentName,
        })),
    );
  }),

  // ── Teacher notes ────────────────────────────────────────────
  http.post(apiUrl('Teacher/children/:childId/notes'), async ({ request, params }) => {
    const user = requireRole(request, ['Teacher']);
    if (user instanceof Response) return user;
    const child = findMockChild(String(params.childId));
    if (!child) return notFound('الطفل غير موجود.');
    if (child.teacherId !== user.id) return forbidden();
    const body = (await request.json()) as { content?: string };
    if (!body.content?.trim()) return badRequest('نص الملاحظة مطلوب.');
    const note = {
      id: mockId(),
      childId: child.id,
      teacherId: user.id,
      content: body.content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };
    mockNotes.push(note);
    return HttpResponse.json(note);
  }),
  http.get(apiUrl('Teacher/notes/:noteId'), ({ request, params }) => {
    const note = ownNote(request, String(params.noteId));
    return note instanceof Response ? note : HttpResponse.json(note);
  }),
  http.put(apiUrl('Teacher/notes/:noteId'), async ({ request, params }) => {
    const note = ownNote(request, String(params.noteId));
    if (note instanceof Response) return note;
    const body = (await request.json()) as { content?: string };
    if (!body.content?.trim()) return badRequest('نص الملاحظة مطلوب.');
    note.content = body.content.trim();
    note.updatedAt = new Date().toISOString();
    return HttpResponse.json(note);
  }),
  http.delete(apiUrl('Teacher/notes/:noteId'), ({ request, params }) => {
    const note = ownNote(request, String(params.noteId));
    if (note instanceof Response) return note;
    mockNotes.splice(mockNotes.indexOf(note), 1);
    return HttpResponse.json({ message: 'تم حذف الملاحظة.' });
  }),
];
