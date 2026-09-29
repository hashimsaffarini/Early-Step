import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ROUTE_PATHS } from '@/constants/routes';
import { renderWithRouter } from '@/test/renderWithRouter';

import { ResetPasswordPage } from './ResetPasswordPage';

function renderReset() {
  return renderWithRouter(
    [
      { path: ROUTE_PATHS.resetPassword, element: <ResetPasswordPage /> },
      { path: ROUTE_PATHS.login, element: <h1>صفحة الدخول</h1> },
    ],
    ROUTE_PATHS.resetPassword,
  );
}

const STRONG_PASSWORD = 'Abcdefg1!';
const submit = () => userEvent.click(screen.getByRole('button', { name: 'تعيين كلمة المرور' }));

describe('ResetPasswordPage', () => {
  it('validates required fields and the code format', async () => {
    renderReset();

    await submit();
    expect(screen.getByText('رمز التحقق مطلوب')).toBeInTheDocument();
    expect(screen.getByText('يرجى تأكيد كلمة المرور')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('رمز التحقق'), '12ab');
    await submit();
    expect(screen.getByText('يجب أن يتكون رمز التحقق من أرقام فقط')).toBeInTheDocument();
  });

  it('rejects a weak password and a mismatched confirmation', async () => {
    renderReset();

    await userEvent.type(screen.getByLabelText('كلمة المرور الجديدة'), 'abc');
    await userEvent.type(screen.getByLabelText('تأكيد كلمة المرور'), 'abd');
    await submit();

    expect(screen.getByText('كلمة المرور لا تستوفي جميع الشروط')).toBeInTheDocument();
    expect(screen.getByText('كلمتا المرور غير متطابقتين')).toBeInTheDocument();
  });

  it('shows a local success state that leads to login', async () => {
    renderReset();

    await userEvent.type(screen.getByLabelText('رمز التحقق'), '123456');
    await userEvent.type(screen.getByLabelText('كلمة المرور الجديدة'), STRONG_PASSWORD);
    await userEvent.type(screen.getByLabelText('تأكيد كلمة المرور'), STRONG_PASSWORD);
    await submit();

    expect(
      screen.getByRole('heading', { name: 'تم التحقق من كلمة المرور الجديدة' }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('link', { name: 'تسجيل الدخول' }));
    expect(screen.getByRole('heading', { name: 'صفحة الدخول' })).toBeInTheDocument();
  });
});
