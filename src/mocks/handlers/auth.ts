import { http, HttpResponse } from 'msw';

import { MOCK_PASSWORD, MOCK_USERS } from '../db';
import { apiUrl, badRequest, currentUser, MOCK_TOKEN_PREFIX, unauthorized } from '../http';

function field(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value : '';
}

/** Auth endpoints, live shapes (login verified 2026-10-06, `Auth/me` 2026-10-14). */
export const authHandlers = [
  http.post(apiUrl('Auth/login'), async ({ request }) => {
    const form = await request.formData();
    const email = field(form, 'Email').toLowerCase();
    const password = field(form, 'Password');
    if (!email || !password) {
      return HttpResponse.json(
        {
          title: 'One or more validation errors occurred.',
          status: 400,
          errors: {
            ...(email ? {} : { Email: ['The Email field is required.'] }),
            ...(password ? {} : { Password: ['The Password field is required.'] }),
          },
        },
        { status: 400 },
      );
    }
    const user = MOCK_USERS.find((candidate) => candidate.email === email);
    if (!user || password !== MOCK_PASSWORD) {
      return HttpResponse.json({ title: 'Unauthorized', status: 401 }, { status: 401 });
    }
    return HttpResponse.json({
      id: user.id,
      fullName: user.fullName,
      accessToken: `${MOCK_TOKEN_PREFIX}${user.id}`,
      role: user.roleValue,
    });
  }),

  http.get(apiUrl('Auth/me'), ({ request }) => {
    const user = currentUser(request);
    if (!user) return unauthorized();
    return HttpResponse.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      roles: [user.roleValue],
    });
  }),

  http.post(apiUrl('Auth/register'), async ({ request }) => {
    const form = await request.formData();
    const email = field(form, 'Email').toLowerCase();
    if (MOCK_USERS.some((user) => user.email === email)) {
      return badRequest('البريد الإلكتروني مستخدم بالفعل.');
    }
    if (field(form, 'Password') !== field(form, 'ConfirmPassword')) {
      return badRequest('كلمتا المرور غير متطابقتين.');
    }
    return HttpResponse.json({ message: 'تم إنشاء الحساب بنجاح.' });
  }),

  // Live (2026-10-14): the same neutral 200 for known and unknown emails.
  http.post(apiUrl('Auth/ForgotPassword'), () =>
    HttpResponse.json({
      message: 'إذا كان البريد الإلكتروني مسجلاً، سيتم إرسال تعليمات استعادة كلمة المرور.',
    }),
  ),

  http.post(apiUrl('Auth/reset-password'), async ({ request }) => {
    const body = (await request.json()) as { code?: string };
    if (body.code !== '1234')
      return HttpResponse.json(['Invalid or expired code.'], { status: 400 });
    return HttpResponse.json({ message: 'تم تغيير كلمة المرور.' });
  }),

  http.post(apiUrl('Auth/change-password'), () => HttpResponse.json('تم تغيير كلمة المرور بنجاح')),
];
