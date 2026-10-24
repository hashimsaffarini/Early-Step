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
    expect(await screen.findByText('تم تفعيل حساب معلم موقوف بنجاح')).toBeInTheDocument();
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

    expect(await screen.findByText('تم إنشاء حساب أ. هدى بنجاح')).toBeInTheDocument();
    expect(body).toEqual({
      fullName: 'أ. هدى',
      email: 'huda@demo.test',
      password: 'Strong#Pass1',
      role: 'معلم/ة',
    });
    server.events.removeAllListeners();
  });

  it('edits an employee: prefilled values, PUT with the changes, list refreshed, toast', async () => {
    let body: unknown;
    server.events.on('request:start', ({ request }) => {
      if (request.method === 'PUT' && request.url.includes('SuperAdmin/users/u-teacher')) {
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
    const list = await screen.findByRole('list', { name: 'المستخدمون' });
    expect(within(list).queryByRole('button', { name: /تعديل بيانات عبدالله/ })).toBeNull();
    await userEvent.click(within(list).getByRole('button', { name: 'تعديل بيانات أ. سارة خالد' }));

    const dialog = screen.getByRole('dialog', { name: 'تعديل بيانات الموظف' });
    const name = within(dialog).getByLabelText(/الاسم الكامل/);
    expect(name).toHaveValue('أ. سارة خالد');
    expect(within(dialog).getByLabelText(/البريد الإلكتروني/)).toHaveValue('teacher@demo.test');
    expect(within(dialog).getByLabelText(/الدور/)).toHaveValue('معلم/ة');
    expect(within(dialog).getByRole('checkbox', { name: /الحساب مفعّل/ })).toBeChecked();

    await userEvent.clear(name);
    await userEvent.type(name, 'أ. سارة خالد العلي');
    await userEvent.selectOptions(within(dialog).getByLabelText(/الدور/), 'أخصائي/ة');
    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ التعديلات' }));

    expect(await screen.findByText('تم تحديث بيانات أ. سارة خالد العلي بنجاح')).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'تعديل بيانات الموظف' })).not.toBeInTheDocument();
    expect(body).toEqual({
      fullName: 'أ. سارة خالد العلي',
      email: 'teacher@demo.test',
      role: 'أخصائي/ة',
      isActive: true,
    });
    await waitFor(() => {
      expect(within(list).getByText('أ. سارة خالد العلي')).toBeInTheDocument();
    });
    server.events.removeAllListeners();
  });

  it('edits a parent account and sends its role back unchanged', async () => {
    let body: unknown;
    server.events.on('request:start', ({ request }) => {
      if (request.method === 'PUT') {
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
    const list = await screen.findByRole('list', { name: 'المستخدمون' });
    await userEvent.click(within(list).getByRole('button', { name: 'تعديل بيانات محمد أحمد' }));
    const dialog = screen.getByRole('dialog', { name: 'تعديل بيانات الموظف' });

    expect(within(dialog).getByLabelText(/الدور/)).toHaveAttribute('readonly');
    const name = within(dialog).getByLabelText(/الاسم الكامل/);
    await userEvent.clear(name);
    await userEvent.type(name, 'محمد أحمد علي');
    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ التعديلات' }));

    expect(await screen.findByText('تم تحديث بيانات محمد أحمد علي بنجاح')).toBeInTheDocument();
    expect(body).toMatchObject({ fullName: 'محمد أحمد علي', role: 'ولي أمر', isActive: true });
    server.events.removeAllListeners();
  });

  it('keeps the edit dialog open with the server error and validates the fields', async () => {
    server.use(
      http.put(apiUrl('SuperAdmin/users/:id'), () =>
        HttpResponse.json({ message: 'البريد الإلكتروني مستخدم بالفعل.' }, { status: 400 }),
      ),
    );
    renderPanel();
    await userEvent.click(screen.getByRole('tab', { name: /المستخدمون/ }));
    const list = await screen.findByRole('list', { name: 'المستخدمون' });
    await userEvent.click(within(list).getByRole('button', { name: 'تعديل بيانات أ. سارة خالد' }));
    const dialog = screen.getByRole('dialog', { name: 'تعديل بيانات الموظف' });

    const email = within(dialog).getByLabelText(/البريد الإلكتروني/);
    await userEvent.clear(email);
    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ التعديلات' }));
    expect(within(dialog).getByText('البريد الإلكتروني مطلوب')).toBeInTheDocument();

    await userEvent.type(email, 'taken@demo.test');
    await userEvent.click(within(dialog).getByRole('button', { name: 'حفظ التعديلات' }));
    expect(await within(dialog).findByText('البريد الإلكتروني مستخدم بالفعل.')).toBeInTheDocument();
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

    expect(await screen.findByText('تم إيقاف حساب أ. سارة خالد بنجاح')).toBeInTheDocument();
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
