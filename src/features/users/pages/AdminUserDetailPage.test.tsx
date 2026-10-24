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

  it("shows each child's real initial-assessment result, or that it is not completed", async () => {
    renderDetail('u-parent');
    const list = await screen.findByRole('list', { name: 'أطفال ولي الأمر' });

    const card = (name: string) => {
      const item = within(list).getByRole('heading', { name }).closest('li');
      if (!item) throw new Error('child card not found');
      return item;
    };
    // Mock: يوسف completed the assessment (1 of 2 correct → 50 %); ريم has not.
    await waitFor(() => {
      expect(card('يوسف')).toHaveTextContent('نتيجة التقييم الأولي: 50%');
    });
    expect(await within(card('ريم')).findByText('لم يكتمل التقييم الأولي')).toBeInTheDocument();
  });

  it('assigns a specialist to one child with the + action (one-child request)', async () => {
    let body: unknown;
    server.use(
      http.post(apiUrl('Admin/assign-children-to-specialist'), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ message: 'ok' });
      }),
    );
    renderDetail('u-parent');
    await screen.findByRole('heading', { level: 1, name: 'محمد أحمد' });

    await userEvent.click(screen.getByRole('button', { name: 'تعيين أخصائي لـ ريم' }));
    const dialog = screen.getByRole('dialog', { name: 'تعيين أخصائي لـ ريم' });
    expect(within(dialog).getByText('لم يُعيَّن أخصائي لهذا الطفل بعد.')).toBeInTheDocument();
    const save = within(dialog).getByRole('button', { name: 'تعيين الأخصائي' });
    expect(save).toBeDisabled();
    await userEvent.click(await within(dialog).findByRole('radio', { name: /أ. ليلى حسن/ }));
    await userEvent.click(save);

    // Success: a temporary toast, the dialog closes.
    expect(
      await screen.findByText('تم تعيين أ. ليلى حسن أخصائياً لـ ريم بنجاح'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'تعيين أخصائي لـ ريم' })).not.toBeInTheDocument();
    expect(body).toEqual({
      specialistId: 'u-specialist',
      childIds: ['c0000000-0000-4000-8000-000000000003'],
    });
  });

  it('lists specialists from Admin/specialists, blocks inactive ones and refreshes the child', async () => {
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

    await userEvent.click(screen.getByRole('button', { name: 'تعيين أخصائي لـ ريم' }));
    const dialog = screen.getByRole('dialog', { name: 'تعيين أخصائي لـ ريم' });
    const inactive = await within(dialog).findByRole('radio', { name: /أ. سابق/ });
    expect(inactive).toBeDisabled();
    expect(within(dialog).getByText('غير نشط')).toBeInTheDocument();
    // The generic user list is not used to find specialists.
    expect(usersCalls).toBe(0);
    await userEvent.click(within(dialog).getByRole('radio', { name: /أ. ليلى حسن/ }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'تعيين الأخصائي' }));
    await screen.findByText('تم تعيين أ. ليلى حسن أخصائياً لـ ريم بنجاح');

    const list = screen.getByRole('list', { name: 'أطفال ولي الأمر' });
    const reem = within(list).getByRole('heading', { name: 'ريم' }).closest('li');
    if (!reem) throw new Error('child card not found');
    expect(await within(reem).findByText('الأخصائي: أ. ليلى حسن')).toBeInTheDocument();
  });

  it('marks the current specialist and keeps the dialog open with the backend error', async () => {
    server.use(
      http.post(apiUrl('Admin/assign-children-to-specialist'), () =>
        HttpResponse.json({ message: 'الأخصائي غير موجود.' }, { status: 404 }),
      ),
    );
    renderDetail('u-parent');
    await screen.findByRole('heading', { level: 1, name: 'محمد أحمد' });

    await userEvent.click(screen.getByRole('button', { name: 'تعيين أخصائي لـ يوسف' }));
    const dialog = screen.getByRole('dialog', { name: 'تعيين أخصائي لـ يوسف' });
    const current = await within(dialog).findByRole('radio', { name: /أ. ليلى حسن/ });
    expect(within(current.closest('label') ?? dialog).getByText('الحالي')).toBeInTheDocument();
    // Re-assigning the current specialist is not offered.
    await userEvent.click(current);
    expect(within(dialog).getByRole('button', { name: 'تعيين الأخصائي' })).toBeDisabled();

    server.use(
      http.get(apiUrl('Admin/specialists'), () =>
        HttpResponse.json([
          { id: 'u-specialist', fullName: 'أ. ليلى حسن', isActive: true },
          { id: 'u-other', fullName: 'أ. أخرى', isActive: true },
        ]),
      ),
    );
    await userEvent.click(within(dialog).getByRole('button', { name: /إغلاق/ }));
    await userEvent.click(screen.getByRole('button', { name: 'تعيين أخصائي لـ يوسف' }));
    const reopened = screen.getByRole('dialog', { name: 'تعيين أخصائي لـ يوسف' });
    await userEvent.click(await within(reopened).findByRole('radio', { name: /أ. أخرى/ }));
    await userEvent.click(within(reopened).getByRole('button', { name: 'تعيين الأخصائي' }));

    expect(await within(reopened).findByText('الأخصائي غير موجود.')).toBeInTheDocument();
  });

  it('shows not-found for an unknown user', async () => {
    renderDetail('missing');

    expect(await screen.findByText('المستخدم غير موجود')).toBeInTheDocument();
  });
});
