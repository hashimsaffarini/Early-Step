import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { renderWithRouter } from '@/test/renderWithRouter';
import { signInAs } from '@/test/session';

import { AdminUserDetailPage } from './AdminUserDetailPage';

function renderDetail(userId: string) {
  signInAs('Admin');
  return renderWithRouter(
    [
      { path: '/admin/users/:userId', element: <AdminUserDetailPage /> },
      { path: '/admin/users', element: <h1>قائمة المستخدمين</h1> },
    ],
    `/admin/users/${userId}`,
  );
}

describe('AdminUserDetailPage', () => {
  it("shows a parent's details and children", async () => {
    renderDetail('u-parent');

    expect(await screen.findByRole('heading', { level: 1, name: 'محمد أحمد' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'أطفال ولي الأمر' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'ريم' })).toBeInTheDocument();
  });

  it('validates, confirms and assigns children to a specialist', async () => {
    let body: unknown;
    server.use(
      http.post(apiUrl('Admin/assign-children-to-specialist'), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ message: 'ok' });
      }),
    );
    renderDetail('u-parent');
    await screen.findByRole('heading', { level: 1, name: 'محمد أحمد' });

    await userEvent.click(screen.getByRole('button', { name: 'إسناد' }));
    expect(screen.getByText('يرجى اختيار الأخصائي')).toBeInTheDocument();
    expect(screen.getByText('يرجى اختيار طفل واحد على الأقل')).toBeInTheDocument();

    const select = screen.getByRole('combobox', { name: /الأخصائي/ });
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'أ. ليلى حسن' })).toBeInTheDocument();
    });
    await userEvent.selectOptions(select, 'u-specialist');
    await userEvent.click(screen.getByRole('checkbox', { name: 'ريم' }));
    await userEvent.click(screen.getByRole('button', { name: 'إسناد' }));

    const dialog = screen.getByRole('dialog', { name: 'تأكيد الإسناد' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'تأكيد' }));

    expect(
      await screen.findByText('تم إسناد الأطفال المختارين إلى أ. ليلى حسن.'),
    ).toBeInTheDocument();
    expect(body).toEqual({
      specialistId: 'u-specialist',
      childIds: ['c0000000-0000-4000-8000-000000000003'],
    });
  });

  it('lists specialists from Admin/specialists, disables inactive ones and refreshes the child', async () => {
    let usersCalls = 0;
    server.use(
      http.get(apiUrl('Admin/specialists'), () =>
        HttpResponse.json([
          { id: 'u-specialist', fullName: 'أ. ليلى حسن', email: 's@demo.test', isActive: true },
          { id: 'u-old', fullName: 'أ. سابق', email: 'o@demo.test', isActive: false },
        ]),
      ),
      http.get(apiUrl('Admin/users'), () => {
        usersCalls += 1;
        return HttpResponse.json({ users: [] });
      }),
    );
    renderDetail('u-parent');
    await screen.findByRole('heading', { level: 1, name: 'محمد أحمد' });

    expect(await screen.findByRole('option', { name: 'أ. سابق (غير نشط)' })).toBeDisabled();
    // The generic user list is no longer used to find specialists.
    expect(usersCalls).toBe(0);
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: /الأخصائي/ }),
      'u-specialist',
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'ريم' }));
    await userEvent.click(screen.getByRole('button', { name: 'إسناد' }));
    await userEvent.click(
      within(screen.getByRole('dialog', { name: 'تأكيد الإسناد' })).getByRole('button', {
        name: 'تأكيد',
      }),
    );

    expect(
      await screen.findByRole('checkbox', { name: 'ريم (الأخصائي الحالي: أ. ليلى حسن)' }),
    ).toBeInTheDocument();
  });

  it('shows the backend error when the assignment fails', async () => {
    server.use(
      http.post(apiUrl('Admin/assign-children-to-specialist'), () =>
        HttpResponse.json({ message: 'الأخصائي غير موجود.' }, { status: 404 }),
      ),
    );
    renderDetail('u-parent');
    await screen.findByRole('heading', { level: 1, name: 'محمد أحمد' });

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'أ. ليلى حسن' })).toBeInTheDocument();
    });
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: /الأخصائي/ }),
      'u-specialist',
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'ريم' }));
    await userEvent.click(screen.getByRole('button', { name: 'إسناد' }));
    await userEvent.click(
      within(screen.getByRole('dialog', { name: 'تأكيد الإسناد' })).getByRole('button', {
        name: 'تأكيد',
      }),
    );

    expect(await screen.findByText('الأخصائي غير موجود.')).toBeInTheDocument();
  });

  it('shows not-found for an unknown user', async () => {
    renderDetail('missing');

    expect(await screen.findByText('المستخدم غير موجود')).toBeInTheDocument();
  });
});
