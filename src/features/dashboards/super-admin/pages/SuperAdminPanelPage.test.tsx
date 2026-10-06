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
  it('shows server stats and users-by-role counted from the real user list', async () => {
    renderPanel();

    const summary = await screen.findByRole('region', { name: 'ملخص النظام' });
    expect(within(summary).getByText('إجمالي المستخدمين')).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'المستخدمون حسب الدور' }),
    ).toBeInTheDocument();
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

  it('is read-only: no delete or role-change actions', async () => {
    renderPanel();

    await userEvent.click(screen.getByRole('tab', { name: /المستخدمون/ }));
    await screen.findByRole('list', { name: 'المستخدمون' });

    expect(screen.queryByRole('button', { name: /حذف/ })).not.toBeInTheDocument();
    expect(screen.getByText(/لا يوفّر الخادم هذه العمليات بعد/)).toBeInTheDocument();
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
