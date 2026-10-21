import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { apiUrl } from '@/mocks/http';
import { server } from '@/mocks/server';
import { renderInRouter } from '@/test/renderWithRouter';
import { signInAs } from '@/test/session';

import { AdminSpecialistsPage } from './AdminSpecialistsPage';

function renderPage() {
  signInAs('Admin');
  return renderInRouter(<AdminSpecialistsPage />);
}

describe('AdminSpecialistsPage (client revision 2026-10)', () => {
  it('lists the specialists from Admin/specialists with their active state', async () => {
    renderPage();

    const list = await screen.findByRole('list', { name: 'الأخصائيون' });
    expect(within(list).getByText('أ. ليلى حسن')).toBeInTheDocument();
    expect(within(list).getByText('نشط')).toBeInTheDocument();
    expect(within(list).getByRole('button', { name: 'إدارة أطفال أ. ليلى حسن' })).toBeEnabled();
  });

  it('shows assigned children, lets the admin pick others, and assigns them in one request', async () => {
    const bodies: unknown[] = [];
    server.events.on('request:start', ({ request }) => {
      if (request.url.includes('assign-children-to-specialist')) {
        void request
          .clone()
          .json()
          .then((body: unknown) => bodies.push(body));
      }
    });
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: 'إدارة أطفال أ. ليلى حسن' }));
    const dialog = screen.getByRole('dialog', { name: 'أطفال أ. ليلى حسن' });
    const assigned = await within(dialog).findByRole('list', { name: 'الأطفال المسندون' });
    expect(within(assigned).getByText('يوسف')).toBeInTheDocument();
    // ريم has no specialist yet: offered, with her real current state.
    const reem = await within(dialog).findByRole('checkbox', { name: /ريم/ });
    expect(reem.closest('label')).toHaveTextContent('بلا أخصائي');
    expect(within(dialog).queryByRole('checkbox', { name: /يوسف/ })).not.toBeInTheDocument();

    await userEvent.click(reem);
    await userEvent.click(within(dialog).getByRole('button', { name: 'إسناد المحددين (1)' }));

    expect(await within(dialog).findByText('تم إسناد 1 طفل إلى أ. ليلى حسن.')).toBeInTheDocument();
    expect(bodies).toEqual([{ specialistId: 'u-specialist', childIds: [expect.any(String)] }]);
    // Refreshed from the server: ريم is now among the assigned children.
    await waitFor(() => {
      expect(
        within(within(dialog).getByRole('list', { name: 'الأطفال المسندون' })).getByText('ريم'),
      ).toBeInTheDocument();
    });
    server.events.removeAllListeners();
  });

  it('does not offer assignment to an inactive specialist', async () => {
    server.use(
      http.get(apiUrl('Admin/specialists'), () =>
        HttpResponse.json([
          { id: 'u-specialist', fullName: 'أ. ليلى حسن', email: 'x@demo.test', isActive: false },
        ]),
      ),
    );
    renderPage();

    expect(await screen.findByText('غير نشط')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'إدارة أطفال أ. ليلى حسن' }));
    const dialog = screen.getByRole('dialog', { name: 'أطفال أ. ليلى حسن' });
    expect(
      within(dialog).getByText('هذا الحساب غير نشط، لذلك لا يمكن إسناد أطفال إليه.'),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'إسناد المحددين' })).toBeDisabled();
  });

  it('shows an empty state when there are no specialists', async () => {
    server.use(http.get(apiUrl('Admin/specialists'), () => HttpResponse.json([])));
    renderPage();
    expect(await screen.findByText('لا يوجد أخصائيون بعد')).toBeInTheDocument();
  });

  it('lists every child with its specialist and assigns one with «+ تعيين أخصائي»', async () => {
    let body: unknown;
    server.events.on('request:start', ({ request }) => {
      if (request.url.includes('assign-children-to-specialist')) {
        void request
          .clone()
          .json()
          .then((json: unknown) => {
            body = json;
          });
      }
    });
    renderPage();
    await screen.findByRole('list', { name: 'الأخصائيون' });

    await userEvent.click(screen.getByRole('tab', { name: /الأطفال/ }));
    const children = await screen.findByRole('list', { name: 'الأطفال' });
    const reem = within(children).getByText('ريم').closest('li');
    if (!reem) throw new Error('child row not found');
    expect(within(reem).getByText('بلا أخصائي')).toBeInTheDocument();
    await userEvent.click(within(reem).getByRole('button', { name: 'تعيين أخصائي لـ ريم' }));

    const dialog = screen.getByRole('dialog', { name: 'تعيين أخصائي لـ ريم' });
    await userEvent.click(await within(dialog).findByRole('radio', { name: /أ. ليلى حسن/ }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'تعيين الأخصائي' }));

    expect(
      await within(dialog).findByText('تم تعيين أ. ليلى حسن أخصائياً لـ ريم.'),
    ).toBeInTheDocument();
    expect(body).toEqual({
      specialistId: 'u-specialist',
      childIds: ['c0000000-0000-4000-8000-000000000003'],
    });
    await userEvent.click(within(dialog).getByRole('button', { name: /إغلاق/ }));
    // The children list re-fetches: the child now shows its new specialist.
    expect(await within(reem).findByText('الأخصائي: أ. ليلى حسن')).toBeInTheDocument();
    expect(within(reem).queryByText('بلا أخصائي')).not.toBeInTheDocument();
    server.events.removeAllListeners();
  });
});
