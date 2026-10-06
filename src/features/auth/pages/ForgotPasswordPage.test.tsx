import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { http, HttpResponse } from 'msw';

import { ROUTE_PATHS } from '@/constants/routes';
import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { renderWithRouter } from '@/test/renderWithRouter';

import { ForgotPasswordPage } from './ForgotPasswordPage';
import { ResetPasswordPage } from './ResetPasswordPage';

function renderForgot() {
  return renderWithRouter(
    [
      { path: ROUTE_PATHS.forgotPassword, element: <ForgotPasswordPage /> },
      { path: ROUTE_PATHS.resetPassword, element: <ResetPasswordPage /> },
      { path: ROUTE_PATHS.login, element: <h1>صفحة الدخول</h1> },
    ],
    ROUTE_PATHS.forgotPassword,
  );
}

const submit = () => userEvent.click(screen.getByRole('button', { name: 'إرسال رمز التحقق' }));

describe('ForgotPasswordPage', () => {
  it('validates the email', async () => {
    renderForgot();

    await submit();
    expect(screen.getByText('البريد الإلكتروني مطلوب')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('البريد الإلكتروني'), 'bad');
    await submit();
    expect(screen.getByText('البريد الإلكتروني غير صالح')).toBeInTheDocument();
  });

  it('shows a neutral local success state and can start over', async () => {
    renderForgot();

    await userEvent.type(screen.getByLabelText('البريد الإلكتروني'), 'parent@example.com');
    await submit();

    expect(await screen.findByRole('heading', { name: 'تم استلام طلبك' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'إذا كان البريد الإلكتروني مسجلاً، فسيتم إرسال تعليمات استعادة كلمة المرور.',
      ),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'تجربة بريد إلكتروني آخر' }));
    expect(screen.getByLabelText('البريد الإلكتروني')).toHaveValue('');
  });

  it('passes the email to the reset screen without putting it in the URL', async () => {
    const { router } = renderForgot();

    await userEvent.type(screen.getByLabelText('البريد الإلكتروني'), 'parent@example.com');
    await submit();
    await userEvent.click(await screen.findByRole('link', { name: 'إدخال رمز التحقق' }));

    expect(router.state.location.pathname).toBe(ROUTE_PATHS.resetPassword);
    expect(router.state.location.search).toBe('');
    expect(screen.getByLabelText('البريد الإلكتروني')).toHaveValue('parent@example.com');
  });

  it('shows the same neutral state for an unknown email (no account enumeration)', async () => {
    renderForgot();

    await userEvent.type(screen.getByLabelText('البريد الإلكتروني'), 'unknown@demo.test');
    await submit();

    expect(await screen.findByRole('heading', { name: 'تم استلام طلبك' })).toBeInTheDocument();
  });

  it('shows an error when the server fails', async () => {
    server.use(
      http.post(apiUrl('Auth/ForgotPassword'), () => new HttpResponse(null, { status: 500 })),
    );
    renderForgot();

    await userEvent.type(screen.getByLabelText('البريد الإلكتروني'), 'parent@demo.test');
    await submit();

    expect(await screen.findByText('حدث خطأ في الخادم. يرجى المحاولة لاحقًا.')).toBeInTheDocument();
  });

  it('links back to login', async () => {
    renderForgot();

    await userEvent.click(screen.getByRole('link', { name: 'العودة لتسجيل الدخول' }));

    expect(screen.getByRole('heading', { name: 'صفحة الدخول' })).toBeInTheDocument();
  });
});
