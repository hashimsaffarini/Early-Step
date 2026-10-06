import { http, HttpResponse } from 'msw';

import { MOCK_PASSWORD, MOCK_USERS } from '../db';
import { apiUrl, badRequest, MOCK_TOKEN_PREFIX } from '../http';

function field(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value : '';
}

/** Auth endpoints. Login response shape is an assumption (NOT LIVE-VERIFIED). */
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
      token: `${MOCK_TOKEN_PREFIX}${user.id}`,
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.roleValue,
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

  http.post(apiUrl('Auth/ForgotPassword'), async ({ request }) => {
    const body = (await request.json()) as { email?: string };
    // The live backend answers 400 "Email not found." — the UI shows a neutral message either way.
    if (!MOCK_USERS.some((user) => user.email === body.email?.toLowerCase())) {
      return badRequest('Email not found.');
    }
    return HttpResponse.json({ message: 'تم إرسال رمز إعادة التعيين.' });
  }),

  http.post(apiUrl('Auth/reset-password'), async ({ request }) => {
    const body = (await request.json()) as { code?: string };
    if (body.code !== '1234')
      return HttpResponse.json(['Invalid or expired code.'], { status: 400 });
    return HttpResponse.json({ message: 'تم تغيير كلمة المرور.' });
  }),

  http.post(apiUrl('Auth/change-password'), () => HttpResponse.json('تم تغيير كلمة المرور بنجاح')),
];
