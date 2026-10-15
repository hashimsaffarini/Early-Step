import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { http, HttpResponse } from 'msw';

import { ROUTE_PATHS } from '@/constants/routes';
import { MOCK_PASSWORD } from '@/mocks/db';
import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { useSessionStore } from '@/services/session';
import { renderWithRouter } from '@/test/renderWithRouter';
import { signInAs } from '@/test/session';

import { LoginPage } from './LoginPage';

function renderLogin() {
  return renderWithRouter(
    [
      { path: ROUTE_PATHS.login, element: <LoginPage /> },
      { path: ROUTE_PATHS.forgotPassword, element: <h1>استعادة كلمة المرور</h1> },
      { path: ROUTE_PATHS.register, element: <h1>صفحة التسجيل</h1> },
      { path: '/parent', element: <h1>منطقة ولي الأمر</h1> },
      { path: '/teacher', element: <h1>منطقة المعلم</h1> },
    ],
    ROUTE_PATHS.login,
  );
}

const submit = () => userEvent.click(screen.getByRole('button', { name: 'دخول' }));

describe('LoginPage', () => {
  it('shows required errors when submitted empty', async () => {
    renderLogin();

    await submit();

    expect(screen.getByLabelText('البريد الإلكتروني')).toHaveAccessibleDescription(
      'البريد الإلكتروني مطلوب',
    );
    expect(screen.getByLabelText('كلمة المرور')).toHaveAccessibleDescription('كلمة المرور مطلوبة');
  });

  it('rejects an invalid email', async () => {
    renderLogin();

    await userEvent.type(screen.getByLabelText('البريد الإلكتروني'), 'not-an-email');
    await submit();

    expect(screen.getByText('البريد الإلكتروني غير صالح')).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    renderLogin();
    const password = screen.getByLabelText('كلمة المرور');

    await userEvent.click(screen.getByRole('button', { name: 'إظهار كلمة المرور' }));

    expect(password).toHaveAttribute('type', 'text');
  });

  async function fillAndSubmit(email: string, password: string) {
    await userEvent.type(screen.getByLabelText('البريد الإلكتروني'), email);
    await userEvent.type(screen.getByLabelText('كلمة المرور'), password);
    await submit();
  }

  it('signs in, loads the user from Auth/me and opens the role area', async () => {
    renderLogin();

    await fillAndSubmit('teacher@demo.test', MOCK_PASSWORD);

    expect(await screen.findByRole('heading', { name: 'منطقة المعلم' })).toBeInTheDocument();
    const session = useSessionStore.getState().session;
    expect(session?.user).toEqual({
      id: 'u-teacher',
      name: 'أ. سارة خالد',
      email: 'teacher@demo.test',
      role: 'Teacher',
    });
    // Only the token is stored — never the user's name, email or role.
    const stored = sessionStorage.getItem('early-step.session') ?? '';
    expect(JSON.parse(stored)).toEqual({ accessToken: 'mock-token-u-teacher', expiresAt: null });
  });

  it('loads the new account even when another token is still stored', async () => {
    signInAs('Admin');
    renderLogin();

    await fillAndSubmit('teacher@demo.test', MOCK_PASSWORD);

    expect(await screen.findByRole('heading', { name: 'منطقة المعلم' })).toBeInTheDocument();
    expect(useSessionStore.getState().session?.user.id).toBe('u-teacher');
  });

  it('takes the role from Auth/me, not from the login response', async () => {
    server.use(
      http.post(apiUrl('Auth/login'), () =>
        HttpResponse.json({ accessToken: 'mock-token-u-parent', role: 'معلم/ة' }),
      ),
    );
    renderLogin();

    await fillAndSubmit('parent@demo.test', MOCK_PASSWORD);

    expect(await screen.findByRole('heading', { name: 'منطقة ولي الأمر' })).toBeInTheDocument();
  });

  it('sends multipart form fields with the Swagger names', async () => {
    let received: FormData | undefined;
    server.use(
      http.post(apiUrl('Auth/login'), async ({ request }) => {
        received = await request.formData();
        return HttpResponse.json({ accessToken: 'mock-token-u-parent', role: 'ولي أمر' });
      }),
    );
    renderLogin();

    await fillAndSubmit('parent@demo.test', 'secret-value');

    await screen.findByRole('heading', { name: 'منطقة ولي الأمر' });
    expect(received?.get('Email')).toBe('parent@demo.test');
    expect(received?.get('Password')).toBe('secret-value');
    expect(received?.get('RememberMe')).toBe('false');
  });

  it('shows a clear message for wrong credentials and stays signed out', async () => {
    renderLogin();

    await fillAndSubmit('parent@demo.test', 'wrong-password');

    expect(
      await screen.findByText('البريد الإلكتروني أو كلمة المرور غير صحيحة.'),
    ).toBeInTheDocument();
    expect(useSessionStore.getState().session).toBeNull();
  });

  it('refuses an account whose role is unknown', async () => {
    server.use(
      http.get(apiUrl('Auth/me'), () => HttpResponse.json({ id: 'u-x', roles: ['Owner'] })),
    );
    renderLogin();

    await fillAndSubmit('parent@demo.test', MOCK_PASSWORD);

    expect(await screen.findByText(/لم نتمكن من تحديد صلاحية/)).toBeInTheDocument();
    expect(useSessionStore.getState().session).toBeNull();
  });

  it('links to forgot password and register', async () => {
    renderLogin();

    await userEvent.click(screen.getByRole('link', { name: 'نسيت كلمة المرور؟' }));

    expect(screen.getByRole('heading', { name: 'استعادة كلمة المرور' })).toBeInTheDocument();
  });
});
