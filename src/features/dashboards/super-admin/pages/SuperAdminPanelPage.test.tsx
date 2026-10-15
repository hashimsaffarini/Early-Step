import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { renderInRouter } from '@/test/renderWithRouter';
import { signInAs } from '@/test/session';

import { SuperAdminPanelPage } from './SuperAdminPanelPage';

function renderPanel() {
  signInAs('SuperAdmin');
  return renderInRouter(<SuperAdminPanelPage userName="عبدالله منصور" />);
}

describe('SuperAdminPanelPage', () => {
  it("shows server stats and the server's usersByRole counts (not counted on the client)", async () => {
    server.use(
      http.get(apiUrl('SuperAdmin/dashboard'), () =>
        HttpResponse.json({
          totalUsers: 40,
          usersByRole: [
            { role: 'ولي أمر', count: 23 },
            { role: 'معلم/ة', count: 6 },
          ],
        }),
      ),
    );
    renderPanel();

    const summary = await screen.findByRole('region', { name: 'ملخص النظام' });
    expect(within(summary).getByText('إجمالي المستخدمين')).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'المستخدمون حسب الدور' }),
    ).toBeInTheDocument();
    const byRole = screen.getByRole('region', { name: 'المستخدمون حسب الدور' });
    expect(await within(byRole).findByText('23')).toBeInTheDocument();
    expect(within(byRole).getByText('6')).toBeInTheDocument();
    expect(within(byRole).getAllByRole('listitem')).toHaveLength(2);
  });

  it('shows a deactivated account from isActive and re-activates it with PUT', async () => {
    const bodies: unknown[] = [];
    server.use(
      http.get(apiUrl('SuperAdmin/users'), () =>
        HttpResponse.json([
          {
            id: 'u-off',
            fullName: 'معلم موقوف',
            email: 'off@example.com',
            role: 'معلم/ة',
            emailConfirmed: false,
            isActive: false,
          },
        ]),
      ),
      http.put(apiUrl('SuperAdmin/users/u-off'), async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json({ message: 'ok' });
      }),
    );
    renderPanel();

    await userEvent.click(screen.getByRole('tab', { name: /المستخدمون/ }));
    const list = await screen.findByRole('list', { name: 'المستخدمون' });
    expect(within(list).getByText('موقوف')).toBeInTheDocument();
    expect(within(list).queryByRole('button', { name: /إيقاف حساب/ })).toBeNull();

    await userEvent.click(within(list).getByRole('button', { name: 'تفعيل حساب معلم موقوف' }));
    expect(await screen.findByText('تم تفعيل حساب معلم موقوف.')).toBeInTheDocument();
    expect(bodies).toEqual([
      { fullName: 'معلم موقوف', email: 'off@example.com', role: 'معلم/ة', isActive: true },
    ]);
  });

  it('searches users on the server and filters by the backend role value', async () => {
    const requests: URLSearchParams[] = [];
    server.events.on('request:start', ({ request }) => {
      if (request.url.includes('SuperAdmin/users'))
        requests.push(new URL(request.url).searchParams);
    });
    renderPanel();

    await userEvent.click(screen.getByRole('tab', { name: /المستخدمون/ }));
    await userEvent.click(await screen.findByRole('button', { name: 'المعلم' }));

    const list = await screen.findByRole('list', { name: 'المستخدمون' });
    await waitFor(() => {
      expect(within(list).getAllByRole('listitem')).toHaveLength(1);
    });
    expect(requests.some((params) => params.get('Role') === 'معلم/ة')).toBe(true);

    await userEvent.type(screen.getByRole('searchbox', { name: 'ابحث عن مستخدم...' }), 'سارة');
    await waitFor(() => {
      expect(requests.some((params) => params.get('Search') === 'سارة')).toBe(true);
    });
    server.events.removeAllListeners();
  });

  it('creates a teacher account with POST SuperAdmin/users and the backend role value', async () => {
    let body: unknown;
    server.events.on('request:start', ({ request }) => {
      if (request.method === 'POST' && request.url.includes('SuperAdmin/users')) {
        void request
          .clone()
          .json()
          .then((json: unknown) => {
            body = json;
          });
      }
    });
    renderPanel();

    await userEvent.click(screen.getByRole('tab', { name: /المستخدمون/ }));
    await userEvent.click(await screen.findByRole('button', { name: 'إضافة موظف' }));
    const dialog = screen.getByRole('dialog', { name: 'إضافة حساب موظف' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'إنشاء الحساب' }));
    expect(within(dialog).getByText('الاسم مطلوب')).toBeInTheDocument();

    await userEvent.type(within(dialog).getByLabelText(/الاسم الكامل/), 'أ. هدى');
    await userEvent.type(within(dialog).getByLabelText(/البريد الإلكتروني/), 'huda@demo.test');
    await userEvent.type(within(dialog).getByLabelText(/كلمة المرور/), 'weak');
    await userEvent.click(within(dialog).getByRole('button', { name: 'إنشاء الحساب' }));
    expect(within(dialog).getByText(/لا تستوفي الشروط/)).toBeInTheDocument();

    await userEvent.clear(within(dialog).getByLabelText(/كلمة المرور/));
    await userEvent.type(within(dialog).getByLabelText(/كلمة المرور/), 'Strong#Pass1');
    await userEvent.click(within(dialog).getByRole('button', { name: 'إنشاء الحساب' }));

    expect(await screen.findByText('تم إنشاء حساب أ. هدى.')).toBeInTheDocument();
    expect(body).toEqual({
      fullName: 'أ. هدى',
      email: 'huda@demo.test',
      password: 'Strong#Pass1',
      role: 'معلم/ة',
    });
    server.events.removeAllListeners();
  });

  it('deactivates an account after confirmation, never the super admin', async () => {
    const deleted: string[] = [];
    server.events.on('request:start', ({ request }) => {
      if (request.method === 'DELETE') deleted.push(new URL(request.url).pathname);
    });
    renderPanel();

    await userEvent.click(screen.getByRole('tab', { name: /المستخدمون/ }));
    const list = await screen.findByRole('list', { name: 'المستخدمون' });
    expect(within(list).queryByRole('button', { name: /إيقاف حساب عبدالله/ })).toBeNull();

    await userEvent.click(within(list).getByRole('button', { name: 'إيقاف حساب أ. سارة خالد' }));
    const dialog = screen.getByRole('dialog', { name: 'إيقاف الحساب' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'إيقاف' }));

    expect(await screen.findByText('تم إيقاف حساب أ. سارة خالد.')).toBeInTheDocument();
    expect(deleted).toEqual(['/api/SuperAdmin/users/u-teacher']);
    server.events.removeAllListeners();
  });

  it('lists children from the server and searches by name', async () => {
    let lastName: string | null = null;
    server.use(
      http.get(apiUrl('SuperAdmin/children'), ({ request }) => {
        lastName = new URL(request.url).searchParams.get('Name');
        return HttpResponse.json([
          { id: 'c1', fullName: 'ريم', age: 4, gender: 'بنت', parentId: 'p', parentName: 'محمد' },
        ]);
      }),
    );
    renderPanel();

    await userEvent.click(screen.getByRole('tab', { name: /الأطفال/ }));
    expect(await screen.findByRole('heading', { name: 'ريم' })).toBeInTheDocument();

    await userEvent.type(screen.getByRole('searchbox', { name: 'ابحث باسم الطفل...' }), 'ريم');
    await waitFor(() => {
      expect(lastName).toBe('ريم');
    });
  });

  it('marks the reports tab as unavailable (no backend endpoint)', async () => {
    renderPanel();

    await userEvent.click(screen.getByRole('tab', { name: /التقارير/ }));

    expect(screen.getByText('قائمة التقارير غير متاحة')).toBeInTheDocument();
  });
});
