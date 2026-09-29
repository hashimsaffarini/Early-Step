import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ROUTE_PATHS } from '@/constants/routes';
import { renderWithRouter } from '@/test/renderWithRouter';

import { RegisterPage } from './RegisterPage';

function renderRegister() {
  return renderWithRouter(
    [
      { path: ROUTE_PATHS.register, element: <RegisterPage /> },
      { path: ROUTE_PATHS.login, element: <h1>صفحة الدخول</h1> },
    ],
    ROUTE_PATHS.register,
  );
}

const STRONG_PASSWORD = 'Abcdefg1!';
const submit = () => userEvent.click(screen.getByRole('button', { name: 'إنشاء حساب' }));

describe('RegisterPage', () => {
  it('renders the parent-only account type and the expected fields', () => {
    renderRegister();

    expect(screen.getByText('ولي الأمر')).toBeInTheDocument();
    expect(screen.queryByText('المعلم')).not.toBeInTheDocument();
    expect(screen.queryByText('الأخصائي')).not.toBeInTheDocument();
    for (const label of ['الاسم الكامل', 'البريد الإلكتروني', 'كلمة المرور', 'تأكيد كلمة المرور']) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
  });

  it('shows required errors when submitted empty', async () => {
    renderRegister();

    await submit();

    expect(screen.getByText('الاسم الكامل مطلوب')).toBeInTheDocument();
    expect(screen.getByText('البريد الإلكتروني مطلوب')).toBeInTheDocument();
    expect(screen.getByText('يرجى تأكيد كلمة المرور')).toBeInTheDocument();
  });

  it('validates the email format', async () => {
    renderRegister();

    await userEvent.type(screen.getByLabelText('البريد الإلكتروني'), 'parent@');
    await submit();

    expect(screen.getByText('البريد الإلكتروني غير صالح')).toBeInTheDocument();
  });

  it('shows password strength as text and updates it', async () => {
    renderRegister();
    const password = screen.getByLabelText('كلمة المرور');

    await userEvent.type(password, 'abc');
    expect(screen.getByText('قوة كلمة المرور: ضعيفة')).toBeInTheDocument();

    await userEvent.clear(password);
    await userEvent.type(password, STRONG_PASSWORD);
    expect(screen.getByText('قوة كلمة المرور: قوية')).toBeInTheDocument();
  });

  it('reports mismatched password confirmation', async () => {
    renderRegister();

    await userEvent.type(screen.getByLabelText('كلمة المرور'), STRONG_PASSWORD);
    await userEvent.type(screen.getByLabelText('تأكيد كلمة المرور'), `${STRONG_PASSWORD}x`);
    await submit();

    expect(screen.getByText('كلمتا المرور غير متطابقتين')).toBeInTheDocument();
  });

  it('shows the UI-only notice after a valid submission', async () => {
    renderRegister();

    await userEvent.type(screen.getByLabelText('الاسم الكامل'), 'سارة أحمد');
    await userEvent.type(screen.getByLabelText('البريد الإلكتروني'), 'parent@example.com');
    await userEvent.type(screen.getByLabelText('كلمة المرور'), STRONG_PASSWORD);
    await userEvent.type(screen.getByLabelText('تأكيد كلمة المرور'), STRONG_PASSWORD);
    await submit();

    expect(screen.getByText(/لم يتم إنشاء أي حساب/)).toBeInTheDocument();
  });
});
