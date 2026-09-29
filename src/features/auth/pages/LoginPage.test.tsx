import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ROUTE_PATHS } from '@/constants/routes';
import { renderWithRouter } from '@/test/renderWithRouter';

import { LoginPage } from './LoginPage';

function renderLogin() {
  return renderWithRouter(
    [
      { path: ROUTE_PATHS.login, element: <LoginPage /> },
      { path: ROUTE_PATHS.forgotPassword, element: <h1>استعادة كلمة المرور</h1> },
      { path: ROUTE_PATHS.register, element: <h1>صفحة التسجيل</h1> },
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

  it('shows the UI-only notice after a valid submission (no request is sent)', async () => {
    renderLogin();

    await userEvent.type(screen.getByLabelText('البريد الإلكتروني'), 'parent@example.com');
    await userEvent.type(screen.getByLabelText('كلمة المرور'), 'anything');
    await submit();

    expect(screen.getByRole('status')).toHaveTextContent('هذه نسخة للواجهة فقط');
  });

  it('links to forgot password and register', async () => {
    renderLogin();

    await userEvent.click(screen.getByRole('link', { name: 'نسيت كلمة المرور؟' }));

    expect(screen.getByRole('heading', { name: 'استعادة كلمة المرور' })).toBeInTheDocument();
  });
});
