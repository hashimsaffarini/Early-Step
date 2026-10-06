import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { http, HttpResponse } from 'msw';

import { ROUTE_PATHS } from '@/constants/routes';
import { MOCK_PASSWORD } from '@/mocks/db';
import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { useSessionStore } from '@/services/session';
import { renderWithRouter } from '@/test/renderWithRouter';

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

  it('signs in, stores the session and opens the role area', async () => {
    renderLogin();

    await fillAndSubmit('teacher@demo.test', MOCK_PASSWORD);

    expect(await screen.findByRole('heading', { name: 'منطقة المعلم' })).toBeInTheDocument();
    const session = useSessionStore.getState().session;
    expect(session?.user.role).toBe('Teacher');
    expect(session?.user.name).toBe('أ. سارة خالد');
  });

  it('sends multipart form fields with the Swagger names', async () => {
    let received: FormData | undefined;
    server.use(
      http.post(apiUrl('Auth/login'), async ({ request }) => {
        received = await request.formData();
        return HttpResponse.json({ token: 'mock-token-u-parent', role: 'ولي أمر', fullName: 'م' });
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
      http.post(apiUrl('Auth/login'), () => HttpResponse.json({ token: 't', role: 'Owner' })),
    );
    renderLogin();

    await fillAndSubmit('parent@demo.test', 'x');

    expect(await screen.findByText(/لم نتمكن من تحديد صلاحية/)).toBeInTheDocument();
    expect(useSessionStore.getState().session).toBeNull();
  });

  it('links to forgot password and register', async () => {
    renderLogin();

    await userEvent.click(screen.getByRole('link', { name: 'نسيت كلمة المرور؟' }));

    expect(screen.getByRole('heading', { name: 'استعادة كلمة المرور' })).toBeInTheDocument();
  });
});
