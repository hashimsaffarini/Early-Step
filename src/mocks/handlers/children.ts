import { http, HttpResponse, type HttpHandler } from 'msw';

import { mockId } from '../db';
import { findMockChild, mockChildren, type MockChildRow } from '../fixtures/children';
import { apiUrl, badRequest, forbidden, notFound, requireRole } from '../http';

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

interface ChildFields {
  fullName: string;
  age: number;
  gender: MockChildRow['gender'];
}

/** Validates the multipart body like the API's model binding (Swagger: FullName, Age, Gender). */
async function readChildForm(request: Request): Promise<ChildFields | Response> {
  const form = await request.formData();
  const fullName = form.get('FullName');
  const age = Number(form.get('Age'));
  const gender = form.get('Gender');
  if (typeof fullName !== 'string' || !fullName.trim()) return badRequest('اسم الطفل مطلوب.');
  if (!Number.isInteger(age) || age <= 0) return badRequest('العمر غير صحيح.');
  if (gender !== 'ولد' && gender !== 'بنت') return badRequest('الجنس غير صحيح.');
  return { fullName: fullName.trim(), age, gender };
}

/** The parent's own child, or an error response (404 unknown, 403 another parent's child). */
function ownChild(userId: string, childId: string): MockChildRow | Response {
  const child = findMockChild(childId);
  if (!child) return notFound('الطفل غير موجود.');
  if (child.parentId !== userId) return forbidden();
  return child;
}

/** Children endpoints. Response shapes NOT LIVE-VERIFIED (undocumented in Swagger). */
export const childrenHandlers: HttpHandler[] = [
  http.get(apiUrl('Parent/GetMyChildren'), ({ request }) => {
    const user = requireRole(request, ['Parent']);
    if (user instanceof Response) return user;
    return HttpResponse.json(mockChildren.filter((c) => c.parentId === user.id).map(listItem));
  }),
  http.get(apiUrl('Parent/:childId'), ({ request, params }) => {
    const user = requireRole(request, ['Parent']);
    if (user instanceof Response) return user;
    const child = ownChild(user.id, String(params.childId));
    return child instanceof Response ? child : HttpResponse.json(listItem(child));
  }),
  http.post(apiUrl('Parent'), async ({ request }) => {
    const user = requireRole(request, ['Parent']);
    if (user instanceof Response) return user;
    const fields = await readChildForm(request);
    if (fields instanceof Response) return fields;
    const row: MockChildRow = {
      id: mockId(),
      ...fields,
      parentId: user.id,
      parentName: user.fullName,
      specialistId: null,
      specialistName: null,
      teacherId: null,
      teacherName: null,
    };
    mockChildren.push(row);
    return HttpResponse.json(listItem(row));
  }),
  http.patch(apiUrl('Parent/:childId'), async ({ request, params }) => {
    const user = requireRole(request, ['Parent']);
    if (user instanceof Response) return user;
    const child = ownChild(user.id, String(params.childId));
    if (child instanceof Response) return child;
    const fields = await readChildForm(request);
    if (fields instanceof Response) return fields;
    Object.assign(child, fields);
    // Apidog edit example: { id, fullName, age, gender } (gender there is "Female"/"Male").
    return HttpResponse.json({
      id: child.id,
      fullName: child.fullName,
      age: child.age,
      gender: child.gender,
    });
  }),
  http.delete(apiUrl('Parent/:childId'), ({ request, params }) => {
    const user = requireRole(request, ['Parent']);
    if (user instanceof Response) return user;
    const child = ownChild(user.id, String(params.childId));
    if (child instanceof Response) return child;
    mockChildren.splice(mockChildren.indexOf(child), 1);
    return HttpResponse.json('تم حذف الطفل بنجاح');
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
