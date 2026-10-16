import { http, HttpResponse, type HttpHandler } from 'msw';

import { MOCK_USERS, mockId, registerMockTable, type MockUser } from '../db';
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

/** Accounts the Super Admin created in this mock session (soft-deactivated ones stay listed). */
const createdUsers: MockUser[] = [];
/** Soft-deactivated accounts (`DELETE SuperAdmin/users/{id}`); `PUT … isActive` toggles it. */
const deactivatedUserIds = new Set<string>();
registerMockTable(() => {
  createdUsers.splice(0, createdUsers.length);
  deactivatedUserIds.clear();
});

const STAFF_ROLE_BY_WIRE: Record<string, MockUser['role']> = {
  'معلم/ة': 'Teacher',
  'أخصائي/ة': 'Specialist',
};

/** Live (2026-10-16): a parent's detail lists their children; a specialist's, the assigned ones. */
function childrenOf(user: MockUser) {
  return user.role === 'Specialist'
    ? mockChildren.filter((child) => child.specialistId === user.id)
    : mockChildren.filter((child) => child.parentId === user.id);
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
  return [...MOCK_USERS, ...createdUsers]
    .filter((user) => roles.includes(user.role))
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
    // Live shape (2026-10-15): totals + `usersByRole: [{ role, count }]` with backend role values.
    const counts = new Map<string, number>();
    for (const item of MOCK_USERS)
      counts.set(item.roleValue, (counts.get(item.roleValue) ?? 0) + 1);
    return HttpResponse.json({
      totalUsers: MOCK_USERS.length,
      totalReports: mockReports.length,
      totalActivities: 0,
      usersByRole: [...counts].map(([role, count]) => ({ role, count })),
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
  // Live (2026-10-14): Admin only; `[{ id, fullName, email, isActive }]`.
  http.get(apiUrl('Admin/specialists'), ({ request }) => {
    const admin = requireRole(request, ['Admin']);
    if (admin instanceof Response) return admin;
    return HttpResponse.json(
      MOCK_USERS.filter((user) => user.role === 'Specialist').map((user) => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        isActive: true,
      })),
    );
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
  // Live: a plain array of `{ id, fullName, email, role, emailConfirmed }` (no `isActive`).
  http.get(apiUrl('SuperAdmin/users'), ({ request }) => {
    const user = requireRole(request, ['SuperAdmin']);
    if (user instanceof Response) return user;
    return HttpResponse.json(
      filterUsers(
        request,
        MOCK_USERS.map((u) => u.role),
      ).map(({ id, fullName, email, roleValue }) => ({
        id,
        fullName,
        email,
        role: roleValue,
        emailConfirmed: false,
        isActive: !deactivatedUserIds.has(id),
      })),
    );
  }),
  // Live (2026-10-14): 201 `{ message, id, fullName, email, role, isActive }`.
  http.post(apiUrl('SuperAdmin/users'), async ({ request }) => {
    const admin = requireRole(request, ['SuperAdmin']);
    if (admin instanceof Response) return admin;
    const body = (await request.json()) as Record<string, string | undefined>;
    const role = STAFF_ROLE_BY_WIRE[body.role ?? ''];
    const email = body.email?.trim().toLowerCase() ?? '';
    if (!role || !body.fullName || !email || !body.password) {
      return badRequest('One or more validation errors occurred.');
    }
    if ([...MOCK_USERS, ...createdUsers].some((user) => user.email === email)) {
      return badRequest('البريد الإلكتروني مستخدم بالفعل.');
    }
    const user: MockUser = {
      id: mockId(),
      fullName: body.fullName,
      email,
      role,
      roleValue: body.role ?? '',
    };
    createdUsers.push(user);
    return HttpResponse.json(
      {
        message: 'User created successfully.',
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.roleValue,
        isActive: true,
      },
      { status: 201 },
    );
  }),
  // Live (2026-10-14): soft delete — 200 "User deactivated successfully."; 404 when unknown.
  http.delete(apiUrl('SuperAdmin/users/:id'), ({ request, params }) => {
    const admin = requireRole(request, ['SuperAdmin']);
    if (admin instanceof Response) return admin;
    const exists = [...MOCK_USERS, ...createdUsers].some((user) => user.id === params.id);
    if (!exists) {
      return HttpResponse.json(
        { errors: [{ code: 'NotFound', description: 'User not found.' }] },
        { status: 404 },
      );
    }
    deactivatedUserIds.add(String(params.id));
    return HttpResponse.json({ message: 'User deactivated successfully.' });
  }),
  http.put(apiUrl('SuperAdmin/users/:id'), async ({ request, params }) => {
    const admin = requireRole(request, ['SuperAdmin']);
    if (admin instanceof Response) return admin;
    const body = (await request.json()) as {
      fullName?: string;
      email?: string;
      role?: string;
      isActive?: boolean;
    };
    if (!body.fullName || !body.email || !body.role) {
      return badRequest('One or more validation errors occurred.');
    }
    if (body.isActive === true) deactivatedUserIds.delete(String(params.id));
    if (body.isActive === false) deactivatedUserIds.add(String(params.id));
    return HttpResponse.json({ message: 'User updated successfully.' });
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
  // Live (2026-10-14): the child's teacher and specialist read the list; others 403/404.
  http.get(apiUrl('Teacher/children/:childId/feedbacks'), ({ request, params }) => {
    const user = requireRole(request, ['Teacher', 'Specialist']);
    if (user instanceof Response) return user;
    const child = findMockChild(String(params.childId));
    const isOwn =
      user.role === 'Teacher' ? child?.teacherId === user.id : child?.specialistId === user.id;
    if (!child || !isOwn) {
      return notFound('الطفل غير موجود أو ليس لديك صلاحية لعرض ملاحظاته.');
    }
    // Live item shape (2026-10-15): { id, childId, childName, teacherId, teacherName, content, createdAt }.
    const teacher = MOCK_USERS.find((item) => item.id === child.teacherId);
    return HttpResponse.json(
      mockNotes
        .filter((note) => note.childId === child.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((note) => ({
          id: note.id,
          childId: child.id,
          childName: child.fullName,
          teacherId: child.teacherId,
          teacherName: teacher?.fullName ?? null,
          content: note.content,
          createdAt: note.createdAt,
        })),
    );
  }),
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
