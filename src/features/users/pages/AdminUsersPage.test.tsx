import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { renderInRouter } from '@/test/renderWithRouter';
import { signInAs } from '@/test/session';

import { AdminUsersPage } from './AdminUsersPage';

function render() {
  signInAs('Admin');
  return renderInRouter(<AdminUsersPage />);
}

describe('AdminUsersPage', () => {
  it('lists users with server totals and links to each user', async () => {
    render();

    const list = await screen.findByRole('list', { name: 'المستخدمون' });
    expect(within(list).getByRole('link', { name: 'محمد أحمد' })).toHaveAttribute(
      'href',
      '/admin/users/u-parent',
    );
    const totals = screen.getByRole('list', { name: 'إحصائيات المستخدمين' });
    expect(within(totals).getByText('أولياء الأمور')).toBeInTheDocument();
  });

  it('sends the backend role value and the search text as query params', async () => {
    const seen: URLSearchParams[] = [];
    server.use(
      http.get(apiUrl('Admin/users'), ({ request }) => {
        seen.push(new URL(request.url).searchParams);
        return HttpResponse.json({
          totalUsers: 0,
          totalParents: 0,
          totalSpecialists: 0,
          totalTeachers: 0,
          users: [],
        });
      }),
    );
    render();

    await userEvent.click(await screen.findByRole('button', { name: 'الأخصائي' }));
    await userEvent.type(
      screen.getByRole('searchbox', { name: 'ابحث بالاسم أو البريد...' }),
      'ليلى',
    );

    await waitFor(() => {
      expect(
        seen.some((params) => params.get('Role') === 'أخصائي/ة' && params.get('Search') === 'ليلى'),
      ).toBe(true);
    });
    expect(await screen.findByText('لا يوجد مستخدمون مطابقون')).toBeInTheDocument();
  });

  it('shows an error state when the request fails', async () => {
    server.use(http.get(apiUrl('Admin/users'), () => new HttpResponse(null, { status: 500 })));
    render();

    expect(await screen.findByText('تعذّر تحميل المستخدمين')).toBeInTheDocument();
  });

  it('offers no create, edit or delete actions (not supported by the API)', async () => {
    render();
    await screen.findByRole('list', { name: 'المستخدمون' });

    expect(screen.queryByRole('button', { name: /حذف|تعديل|إضافة/ })).not.toBeInTheDocument();
  });
});
